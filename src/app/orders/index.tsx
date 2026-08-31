import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { Colors } from '@/constants/theme';
import { formatGHS } from '@/lib/currency';
import { useSession } from '@/lib/auth-client';
import { getMyOrders, OrderApiError, type OrderListItem, type OrderStatus } from '@/lib/orders';

/**
 * Mirrors the web's order history
 * (~/Desktop/ecommerce-project's src/components/account/order.tsx):
 * GET /api/orders/mine, signed-in only. The list endpoint only returns item
 * counts (not product names/images — that's only on the detail endpoint),
 * so unlike the old mock this can't show item thumbnails; "View Details"
 * goes to orders/[id].tsx, which fetches the full breakdown.
 *
 * Real order statuses are PENDING/PAID/FAILED/CANCELLED/REFUNDED — the old
 * mock's "processing/shipped/delivered" tabs don't correspond to anything
 * the backend actually tracks, so the filter tabs use the real enum.
 */

const TABS: { id: 'all' | OrderStatus; label: string }[] = [
  { id: 'all', label: 'All Orders' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'PAID', label: 'Paid' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

const STATUS_STYLES: Record<OrderStatus, { color: string; bg: string }> = {
  PAID: { color: '#059669', bg: '#d1fae5' },
  PENDING: { color: '#d97706', bg: '#fef3c7' },
  FAILED: { color: '#dc2626', bg: '#fee2e2' },
  CANCELLED: { color: '#dc2626', bg: '#fee2e2' },
  REFUNDED: { color: '#6b7280', bg: '#f3f4f6' },
};

export default function OrdersScreen() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = useSession();
  const user = session?.user;

  const [activeTab, setActiveTab] = useState<'all' | OrderStatus>('all');
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyOrders();
      setOrders(result);
    } catch (e) {
      setError(e instanceof OrderApiError ? e.message : 'Could not load your orders right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadOrders();
  }, [user, loadOrders]);

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const getStatusBadge = (status: OrderStatus) => {
    const { color, bg } = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color }]}>{status}</Text>
      </View>
    );
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (sessionPending) {
    return (
      <View style={[styles.container, styles.stateContainer]}>
        <ActivityIndicator color={Colors.light.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, styles.stateContainer]}>
        <Icon name="log-in-outline" size={56} color="#999999" />
        <Text style={styles.emptyTitle}>Sign in to see your orders</Text>
        <Text style={styles.emptySubtitle}>
          Your order history is tied to your account. Sign in to view it.
        </Text>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => router.push('/auth/sign-in')}
          activeOpacity={0.8}
        >
          <Text style={styles.exploreButtonText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.bodyWrapper}>
        <View style={styles.mainContentContainer}>
          {/* HEADER BAR */}
          <View style={styles.headerTitleRow}>
            <Text style={styles.pageTitle}>My Orders</Text>
            <Text style={styles.pageSubtitle}>Track and manage your order history</Text>
          </View>

          {/* STATUS FILTER TABS */}
          <View style={styles.filterTabsRow}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {loading ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator color={Colors.light.primary} />
            </View>
          ) : error ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Icon name="close-circle" size={44} color={Colors.light.error} />
              </View>
              <Text style={styles.emptyTitle}>Couldn't load your orders</Text>
              <Text style={styles.emptySubtitle}>{error}</Text>
              <TouchableOpacity style={styles.exploreButton} onPress={loadOrders} activeOpacity={0.8}>
                <Text style={styles.exploreButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : filteredOrders.length === 0 ? (
            /* ORDERS LIST — EMPTY */
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Icon name="receipt-outline" size={44} color="#999999" />
              </View>
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'all'
                  ? "You haven't placed any orders yet. Explore our catalog to place your first order!"
                  : 'There are no orders in this category yet.'}
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push('/shop')}
                activeOpacity={0.8}
              >
                <Text style={styles.exploreButtonText}>Start Shopping</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.ordersListContainer}>
              {filteredOrders.map((order) => {
                const itemCount = order._count?.items ?? order.items.length;
                return (
                  <View key={order.id} style={styles.orderCard}>
                    {/* CARD TOP HEADER */}
                    <View style={styles.cardHeader}>
                      <View style={styles.orderIdRow}>
                        <Icon name="receipt-outline" size={18} color={Colors.light.primary} />
                        <Text style={styles.orderIdText}>
                          #{order.id.slice(-8).toUpperCase()}
                        </Text>
                        <Text style={styles.dotSeparator}>•</Text>
                        <Text style={styles.dateText}>{formatDate(order.createdAt)}</Text>
                      </View>
                      {getStatusBadge(order.status)}
                    </View>

                    {/* ITEM SUMMARY */}
                    <View style={styles.cardBody}>
                      <View style={styles.itemIconWrapper}>
                        <Icon name="cube-outline" size={22} color={Colors.light.primary} />
                      </View>
                      <View style={styles.itemSummaryTextGroup}>
                        <Text style={styles.itemCountText}>
                          {itemCount} {itemCount === 1 ? 'item' : 'items'} in this order
                        </Text>
                      </View>
                    </View>

                    {/* CARD FOOTER */}
                    <View style={styles.cardFooter}>
                      <View style={styles.priceGroup}>
                        <Text style={styles.totalLabel}>Total Price</Text>
                        <Text style={styles.totalAmount}>{formatGHS(Number(order.total))}</Text>
                      </View>

                      <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => router.push(`/orders/${order.id}`)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.detailsButtonText}>View Details</Text>
                        <Icon name="chevron-forward" size={14} color="#555555" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  stateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    padding: 32,
  },
  bodyWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  mainContentContainer: {
    width: '100%',
    maxWidth: 1200,
    gap: 12,
  },

  /* HEADER */
  headerTitleRow: {
    gap: 2,
    marginTop: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222222',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#666666',
  },

  /* FILTER TABS */
  filterTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    padding: 4,
    gap: 4,
    flexWrap: 'wrap',
  },
  tabButton: {
    flex: 1,
    minWidth: 80,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666666',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },

  /* INLINE LOADING */
  inlineLoading: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  /* EMPTY / STATE CARD */
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    padding: 32,
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222222',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    maxWidth: 320,
  },
  exploreButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
    marginTop: 6,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },

  /* ORDERS LIST */
  ordersListContainer: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
    flexWrap: 'wrap',
    gap: 6,
  },
  orderIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#222222',
  },
  dotSeparator: {
    color: '#cccccc',
    fontSize: 12,
  },
  dateText: {
    fontSize: 12,
    color: '#666666',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  /* CARD BODY */
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  itemIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f0f4ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemSummaryTextGroup: {
    flex: 1,
    gap: 2,
  },
  itemCountText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222222',
  },

  /* CARD FOOTER */
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f2f5',
    flexWrap: 'wrap',
    gap: 10,
  },
  priceGroup: {
    gap: 1,
  },
  totalLabel: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 4,
    backgroundColor: '#ffffff',
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
  },
});
