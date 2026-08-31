import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { SafeImage } from '@/components/ui/safe-image';
import { Colors } from '@/constants/theme';

export default function OrdersScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [activeTab, setActiveTab] = useState<'all' | 'processing' | 'shipped' | 'delivered'>('all');

  const orders = [
    {
      id: 'ORD-8921',
      date: 'Aug 28, 2026',
      total: 810.0,
      status: 'delivered',
      itemsCount: 3,
      items: [
        {
          name: 'Wireless Noise-Canceling Headphones',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
        },
        {
          name: 'Organic Cold Pressed Extra Virgin Olive Oil',
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop',
        },
      ],
    },
    {
      id: 'ORD-8920',
      date: 'Aug 25, 2026',
      total: 180.0,
      status: 'shipped',
      itemsCount: 1,
      items: [
        {
          name: 'Summer Fashion Casual Shirt',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop',
        },
      ],
    },
    {
      id: 'ORD-8912',
      date: 'Aug 20, 2026',
      total: 1250.0,
      status: 'processing',
      itemsCount: 2,
      items: [
        {
          name: 'Smart Modern Tablet Pad',
          image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop',
        },
      ],
    },
  ];

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    let color: string = Colors.light.primary;
    let bg: string = '#e8f0fe';

    if (status === 'delivered') {
      color = '#059669';
      bg = '#d1fae5';
    } else if (status === 'shipped') {
      color = '#0284c7';
      bg = '#e0f2fe';
    } else if (status === 'processing') {
      color = '#d97706';
      bg = '#fef3c7';
    }

    return (
      <View style={[styles.badge, { backgroundColor: bg }]}>
        <Text style={[styles.badgeText, { color }]}>{status.toUpperCase()}</Text>
      </View>
    );
  };

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
            {[
              { id: 'all', label: 'All Orders' },
              { id: 'processing', label: 'Processing' },
              { id: 'shipped', label: 'Shipped' },
              { id: 'delivered', label: 'Delivered' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabButton, isActive && styles.tabButtonActive]}
                  onPress={() => setActiveTab(tab.id as any)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ORDERS LIST */}
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Icon name="receipt-outline" size={44} color="#999999" />
              </View>
              <Text style={styles.emptyTitle}>No Orders Found</Text>
              <Text style={styles.emptySubtitle}>
                There are no orders in this category yet. Explore our catalog to place your first order!
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
              {filteredOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  {/* CARD TOP HEADER */}
                  <View style={styles.cardHeader}>
                    <View style={styles.orderIdRow}>
                      <Icon name="receipt-outline" size={18} color={Colors.light.primary} />
                      <Text style={styles.orderIdText}>{order.id}</Text>
                      <Text style={styles.dotSeparator}>•</Text>
                      <Text style={styles.dateText}>{order.date}</Text>
                    </View>
                    {getStatusBadge(order.status)}
                  </View>

                  {/* ITEM PREVIEWS */}
                  <View style={styles.cardBody}>
                    <View style={styles.thumbnailsRow}>
                      {order.items.map((item, idx) => (
                        <View key={idx} style={styles.thumbnailWrapper}>
                          <SafeImage
                            source={{ uri: item.image }}
                            name={item.name}
                            style={styles.thumbnailImage}
                            resizeMode="cover"
                          />
                        </View>
                      ))}
                    </View>
                    <View style={styles.itemSummaryTextGroup}>
                      <Text style={styles.primaryItemName} numberOfLines={1}>
                        {order.items[0].name}
                      </Text>
                      <Text style={styles.itemCountText}>
                        {order.itemsCount} {order.itemsCount === 1 ? 'item' : 'items'} in total
                      </Text>
                    </View>
                  </View>

                  {/* CARD FOOTER */}
                  <View style={styles.cardFooter}>
                    <View style={styles.priceGroup}>
                      <Text style={styles.totalLabel}>Total Price</Text>
                      <Text style={styles.totalAmount}>${order.total.toFixed(2)}</Text>
                    </View>

                    <View style={styles.actionButtonsGroup}>
                      <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => router.push('/shop')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.detailsButtonText}>View Details</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.trackButton}
                        onPress={() => router.push('/shop')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.trackButtonText}>Track Order</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
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

  /* EMPTY CARD */
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
  thumbnailsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  thumbnailWrapper: {
    width: 48,
    height: 48,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  itemSummaryTextGroup: {
    flex: 1,
    gap: 2,
  },
  primaryItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222222',
  },
  itemCountText: {
    fontSize: 12,
    color: '#888888',
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
  actionButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailsButton: {
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
  trackButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 4,
  },
  trackButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
