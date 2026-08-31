import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';

import { Colors } from '@/constants/theme';
import { formatGHS } from '@/lib/currency';
import { useCartStore } from '@/stores/cart.store';
import { getOrderByReference, OrderApiError, type Order } from '@/lib/orders';

/**
 * Mirrors the web's success page (~/Desktop/ecommerce-project's
 * src/app/checkout/success/page.tsx): fetching the order by the payment
 * `reference` is what actually confirms it — the backend has no payment
 * webhook, so this GET is the only thing that flips a PENDING order to PAID
 * (see lib/orders.ts). The cart is only cleared once that confirmation
 * succeeds, so an abandoned/failed payment leaves the cart intact.
 */
export default function OrderSuccessScreen() {
  const router = useRouter();
  const theme = Colors.light;
  const params = useLocalSearchParams<{ reference?: string | string[] }>();
  const reference = Array.isArray(params.reference) ? params.reference[0] : params.reference;
  const clearCart = useCartStore((s) => s.clearCart);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const confirmOrder = useCallback(async () => {
    if (!reference) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getOrderByReference(reference);
      setOrder(result);
      clearCart();
    } catch (e) {
      setError(
        e instanceof OrderApiError
          ? e.message
          : 'Could not verify your payment right now.',
      );
    } finally {
      setLoading(false);
    }
    // clearCart is stable (zustand action) — omitting it from deps avoids
    // re-running this on every store change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  useEffect(() => {
    confirmOrder();
  }, [confirmOrder]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.verifyingText, { color: theme.textSecondary }]}>
          Verifying your payment…
        </Text>
      </View>
    );
  }

  if (!reference || error || !order) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background, padding: 24 }]}>
        <View style={[styles.iconContainer, { backgroundColor: '#fee2e2' }]}>
          <Icon name="close-circle" size={64} color={theme.error} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Order Not Found</Text>
        <Text style={[styles.message, { color: theme.textSecondary }]}>
          {error ??
            "We couldn't find an order for this payment. If you believe this is an error, please contact support."}
        </Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.btnText}>Return to Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const subtotal = Number(order.subtotal);
  const discountTotal = Number(order.discountTotal);
  const total = Number(order.total);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: '#d1fae5' }]}>
          <Icon name="checkmark-circle" size={80} color={theme.success} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Order Confirmed!</Text>
        <Text style={[styles.orderNumber, { color: theme.primary }]}>
          Order #{order.id.slice(-8).toUpperCase()}
        </Text>

        <Text style={[styles.message, { color: theme.textSecondary }]}>
          Thank you for shopping with Martfury. We've received your order and are processing it
          for delivery.
        </Text>

        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Icon name="time-outline" size={24} color={theme.primary} />
          <View style={styles.infoTextGroup}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Estimated Delivery</Text>
            <Text style={[styles.infoSubtitle, { color: theme.textSecondary }]}>
              Within 24 - 48 Hours in Accra
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.summaryTitle, { color: theme.text }]}>Order Summary</Text>

          {order.items.map((item) => (
            <View key={item.id} style={styles.summaryItemRow}>
              <Text style={[styles.summaryItemName, { color: theme.text }]} numberOfLines={1}>
                {item.variant.product.name}
                {item.qty > 1 ? ` ×${item.qty}` : ''}
              </Text>
              <Text style={[styles.summaryItemPrice, { color: theme.textSecondary }]}>
                {formatGHS(Number(item.lineTotal), false)}
              </Text>
            </View>
          ))}

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: theme.text }]}>{formatGHS(subtotal, false)}</Text>
          </View>
          {discountTotal > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Discount</Text>
              <Text style={[styles.summaryValue, { color: theme.success }]}>
                -{formatGHS(discountTotal, false)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total Paid</Text>
            <Text style={[styles.totalValue, { color: theme.primary }]}>{formatGHS(total, false)}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.btn, { backgroundColor: theme.primary }]}
          onPress={() => router.replace('/orders')}
        >
          <Text style={styles.btnText}>View My Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryBtn, { borderColor: theme.border }]}
          onPress={() => router.replace('/')}
        >
          <Text style={[styles.secondaryBtnText, { color: theme.text }]}>Back to Storefront</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  verifyingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    width: '100%',
    marginVertical: 4,
  },
  infoTextGroup: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoSubtitle: {
    fontSize: 12,
  },
  summaryCard: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  summaryItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  summaryItemName: {
    flex: 1,
    fontSize: 13,
  },
  summaryItemPrice: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
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
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  btn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    width: '100%',
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
