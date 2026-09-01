import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { SafeImage } from '@/components/ui/safe-image';
import { PaymentGatewayPicker } from '@/components/ui/payment-gateway-picker';
import { Colors } from '@/constants/theme';
import { formatGHS } from '@/lib/currency';
import { useToastStore } from '@/stores/toast.store';
import {
  getMyOrderDetail,
  getOrderShippingInfo,
  payExistingOrder,
  OrderApiError,
  type OrderDetail,
  type OrderStatus,
  type PaymentGateway,
} from '@/lib/orders';

const STATUS_STYLES: Record<OrderStatus, { color: string; bg: string }> = {
  PAID: { color: '#059669', bg: '#d1fae5' },
  PENDING: { color: '#d97706', bg: '#fef3c7' },
  FAILED: { color: '#dc2626', bg: '#fee2e2' },
  CANCELLED: { color: '#dc2626', bg: '#fee2e2' },
  REFUNDED: { color: '#6b7280', bg: '#f3f4f6' },
};

/**
 * Mirrors the web's order detail page
 * (~/Desktop/ecommerce-project's src/app/(ecommerce)/account/orders/[id]/page.tsx):
 * GET /api/orders/mine/{id} for the full breakdown (items with product
 * images, shipping info parsed off the payment's metadata), and — for a
 * still-PENDING order — POST /api/orders/mine/{id}/pay to resume payment,
 * reusing the same "open in-app browser, then confirm via checkout/success"
 * flow checkout/index.tsx uses.
 */
export default function OrderDetailScreen() {
  const router = useRouter();
  const theme = Colors.light;
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gateway, setGateway] = useState<PaymentGateway>('paystack');
  const [paying, setPaying] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getMyOrderDetail(id);
      setOrder(result);
    } catch (e) {
      setError(e instanceof OrderApiError ? e.message : 'Could not load this order.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleCompletePayment = async () => {
    if (!order) return;
    setPaying(true);
    try {
      const { authorizationUrl, reference } = await payExistingOrder(order.id, gateway);
      await WebBrowser.openBrowserAsync(authorizationUrl);
      router.replace({ pathname: '/checkout/success', params: { reference } });
    } catch (e) {
      useToastStore
        .getState()
        .show(e instanceof OrderApiError ? e.message : 'Could not start payment. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.stateContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={[styles.stateContainer, { backgroundColor: theme.background }]}>
        <Icon name="close-circle" size={56} color={theme.error} />
        <Text style={[styles.stateTitle, { color: theme.text }]}>Order not found</Text>
        <Text style={[styles.stateSubtitle, { color: theme.textSecondary }]}>
          {error ?? "We couldn't find this order, or it belongs to another account."}
        </Text>
        <TouchableOpacity style={[styles.stateButton, { backgroundColor: theme.primary }]} onPress={loadOrder}>
          <Text style={styles.stateButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const shipping = getOrderShippingInfo(order);
  const { color, bg } = STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING;
  const subtotal = Number(order.subtotal);
  const discountTotal = Number(order.discountTotal);
  const total = Number(order.total);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.orderId, { color: theme.text }]}>
                Order #{order.id.slice(-8).toUpperCase()}
              </Text>
              <Text style={[styles.orderDate, { color: theme.textSecondary }]}>
                Placed{' '}
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            </View>
            <View style={[styles.badge, { backgroundColor: bg }]}>
              <Text style={[styles.badgeText, { color }]}>{order.status}</Text>
            </View>
          </View>
        </View>

        {/* Resume payment — only for PENDING orders */}
        {order.status === 'PENDING' && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.primary }]}>
            <View style={styles.cardTitleRow}>
              <Icon name="card-outline" size={18} color={theme.primary} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Payment Pending</Text>
            </View>
            <Text style={[styles.stateSubtitle, { color: theme.textSecondary, marginBottom: 4 }]}>
              This order hasn't been paid for yet. Complete payment to have it processed.
            </Text>

            <PaymentGatewayPicker value={gateway} onChange={setGateway} disabled={paying} />

            <TouchableOpacity
              style={[styles.payButton, { backgroundColor: theme.primary, opacity: paying ? 0.7 : 1 }]}
              onPress={handleCompletePayment}
              disabled={paying}
            >
              {paying ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Text style={styles.payButtonText}>Pay {formatGHS(total)}</Text>
                  <Icon name="lock-closed-outline" size={16} color="#ffffff" />
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Items */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Items ({order.items.length})
          </Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={[styles.itemImageWrapper, { backgroundColor: theme.backgroundElement }]}>
                <SafeImage
                  source={{ uri: item.variant.product.image ?? item.variant.product.images?.[0]?.url }}
                  name={item.variant.product.name}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              </View>
              <View style={styles.itemDetails}>
                <Text style={[styles.itemName, { color: theme.text }]} numberOfLines={2}>
                  {item.variant.product.name}
                </Text>
                <Text style={[styles.itemVariant, { color: theme.textSecondary }]}>
                  {item.variant.name} • Qty {item.qty}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: theme.text }]}>
                {formatGHS(Number(item.lineTotal), false)}
              </Text>
            </View>
          ))}
        </View>

        {/* Shipping info */}
        {shipping && (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.cardTitleRow}>
              <Icon name="location-outline" size={18} color={theme.primary} />
              <Text style={[styles.cardTitle, { color: theme.text }]}>Shipping Details</Text>
            </View>
            {(shipping.firstName || shipping.lastName) && (
              <Text style={[styles.shippingLine, { color: theme.text }]}>
                {[shipping.firstName, shipping.lastName].filter(Boolean).join(' ')}
              </Text>
            )}
            {shipping.address && (
              <Text style={[styles.shippingLine, { color: theme.textSecondary }]}>
                {[shipping.address, shipping.suburb].filter(Boolean).join(', ')}
              </Text>
            )}
            {(shipping.state || shipping.country) && (
              <Text style={[styles.shippingLine, { color: theme.textSecondary }]}>
                {[shipping.state, shipping.country].filter(Boolean).join(', ')}
                {shipping.postcode ? ` • ${shipping.postcode}` : ''}
              </Text>
            )}
            {shipping.phone && (
              <Text style={[styles.shippingLine, { color: theme.textSecondary }]}>{shipping.phone}</Text>
            )}
            {shipping.email && (
              <Text style={[styles.shippingLine, { color: theme.textSecondary }]}>{shipping.email}</Text>
            )}
          </View>
        )}

        {/* Totals */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryVal, { color: theme.text }]}>{formatGHS(subtotal, false)}</Text>
          </View>
          {discountTotal > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Discount</Text>
              <Text style={[styles.summaryVal, { color: theme.success }]}>
                -{formatGHS(discountTotal, false)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total</Text>
            <Text style={[styles.totalVal, { color: theme.primary }]}>{formatGHS(total, false)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  stateSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  stateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  stateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '800',
  },
  orderDate: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  payButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 46,
    borderRadius: 10,
    gap: 8,
    marginTop: 2,
  },
  payButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  itemImageWrapper: {
    width: 52,
    height: 52,
    borderRadius: 8,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  itemVariant: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
  },
  shippingLine: {
    fontSize: 13,
    lineHeight: 19,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  totalVal: {
    fontSize: 17,
    fontWeight: '800',
  },
});
