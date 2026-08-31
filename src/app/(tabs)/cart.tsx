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

export default function CartScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [cartItems, setCartItems] = useState([
    {
      id: 'c1',
      name: 'Wireless Noise-Canceling Headphones',
      price: 180,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=600&auto=format&fit=crop',
      quantity: 1,
      vendor: 'AudioTech Store',
    },
    {
      id: 'c2',
      name: 'Organic Cold Pressed Extra Virgin Olive Oil',
      price: 45,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop',
      quantity: 2,
      vendor: 'Fresh Market',
    },
  ]);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal > 150 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shippingFee;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          !isDesktop && cartItems.length > 0 && { paddingBottom: 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.bodyWrapper}>
          <View style={styles.mainContentContainer}>
            {cartItems.length === 0 ? (
              /* EMPTY CART STATE */
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconCircle}>
                  <Icon name="cart-outline" size={48} color="#999999" />
                </View>
                <Text style={styles.emptyTitle}>Your Shopping Cart is Empty</Text>
                <Text style={styles.emptySubtitle}>
                  Your cart is currently empty. Explore our catalog to find amazing deals!
                </Text>
                <TouchableOpacity
                  style={styles.exploreButton}
                  onPress={() => router.push('/shop')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.exploreButtonText}>Explore Products</Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* CART CONTENT LAYOUT */
              <View style={[styles.cartLayoutRow, !isDesktop && styles.cartLayoutMobile]}>
                {/* LEFT COLUMN: CART ITEMS LIST */}
                <View style={styles.cartItemsCard}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>
                      Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                    </Text>
                    <TouchableOpacity onPress={() => setCartItems([])}>
                      <Text style={styles.clearCartText}>Clear Cart</Text>
                    </TouchableOpacity>
                  </View>

                  {cartItems.map((item) => (
                    <View key={item.id} style={styles.cartItemRow}>
                      {/* Product Image */}
                      <View style={styles.itemImageWrapper}>
                        <SafeImage
                          source={{ uri: item.image }}
                          name={item.name}
                          style={styles.itemImage}
                          resizeMode="cover"
                        />
                      </View>

                      {/* Product Details */}
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemVendor}>{item.vendor}</Text>
                        <Text style={styles.itemName} numberOfLines={2}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemUnitPrice}>${item.price.toFixed(2)}</Text>

                        {/* Quantity Controls */}
                        <View style={styles.qtyContainer}>
                          <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => updateQuantity(item.id, -1)}
                          >
                            <Icon name="remove" size={14} color="#333333" />
                          </TouchableOpacity>
                          <Text style={styles.qtyValue}>{item.quantity}</Text>
                          <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => updateQuantity(item.id, 1)}
                          >
                            <Icon name="add" size={14} color="#333333" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Right Item Actions & Total */}
                      <View style={styles.itemRightActions}>
                        <Text style={styles.itemSubtotalPrice}>
                          ${(item.price * item.quantity).toFixed(2)}
                        </Text>
                        <TouchableOpacity
                          style={styles.removeIconButton}
                          onPress={() => removeItem(item.id)}
                        >
                          <Icon name="trash-outline" size={18} color="#ff4d4f" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}

                  {/* Bottom Links */}
                  <View style={styles.cartFooterLinks}>
                    <TouchableOpacity
                      style={styles.continueShopRow}
                      onPress={() => router.push('/shop')}
                    >
                      <Icon name={"arrow-forward" as any} size={14} color={Colors.light.primary} />
                      <Text style={styles.continueShopText}>Continue Shopping</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* DESKTOP RIGHT COLUMN: ORDER SUMMARY CARD */}
                {isDesktop && (
                  <View style={styles.orderSummaryCard}>
                    <Text style={styles.summaryTitle}>Order Summary</Text>

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Subtotal</Text>
                      <Text style={styles.summaryValue}>${subtotal.toFixed(2)}</Text>
                    </View>

                    <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Shipping Fee</Text>
                      <Text style={styles.summaryValue}>
                        {shippingFee === 0 ? (
                          <Text style={styles.freeShippingText}>FREE</Text>
                        ) : (
                          `$${shippingFee.toFixed(2)}`
                        )}
                      </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                      <Text style={styles.totalLabel}>Total</Text>
                      <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
                    </View>

                    {/* Checkout Button */}
                    <TouchableOpacity
                      style={styles.checkoutButton}
                      onPress={() => router.push('/checkout')}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                      <Icon name="arrow-forward" size={16} color="#ffffff" />
                    </TouchableOpacity>

                    {/* Trust Badges */}
                    <View style={styles.trustBadgesRow}>
                      <View style={styles.trustItem}>
                        <Icon name="shield-checkmark-outline" size={16} color="#00c853" />
                        <Text style={styles.trustText}>Secure Checkout</Text>
                      </View>
                      <View style={styles.trustItem}>
                        <Icon name="refresh-outline" size={16} color="#2962ff" />
                        <Text style={styles.trustText}>Easy Returns</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* MOBILE FIXED BOTTOM SUMMARY BAR */}
      {!isDesktop && cartItems.length > 0 && (
        <View style={styles.mobileFixedBottomBar}>
          <View style={styles.mobileSummaryInfo}>
            <Text style={styles.mobileTotalLabel}>Total Amount</Text>
            <Text style={styles.mobileTotalValue}>${total.toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.mobileCheckoutButton}
            onPress={() => router.push('/checkout')}
            activeOpacity={0.8}
          >
            <Text style={styles.mobileCheckoutButtonText}>Proceed to Checkout</Text>
            <Icon name="arrow-forward" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  bodyWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  mainContentContainer: {
    width: '100%',
    maxWidth: 1200,
  },

  /* EMPTY STATE */
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    padding: 36,
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#222222',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    maxWidth: 340,
  },
  exploreButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
    marginTop: 8,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },

  /* CART LAYOUT */
  cartLayoutRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  cartLayoutMobile: {
    flexDirection: 'column',
    width: '100%',
  },

  /* LEFT COLUMN: ITEMS CARD */
  cartItemsCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    padding: 16,
    gap: 16,
    width: '100%',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222222',
  },
  clearCartText: {
    fontSize: 12,
    color: '#ff4d4f',
    fontWeight: '600',
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
    gap: 12,
  },
  itemImageWrapper: {
    width: 72,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemDetails: {
    flex: 1,
    gap: 4,
  },
  itemVendor: {
    fontSize: 10,
    color: '#888888',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
    lineHeight: 18,
  },
  itemUnitPrice: {
    fontSize: 13,
    color: '#666666',
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  qtyButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f8f9fa',
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222222',
    paddingHorizontal: 10,
  },
  itemRightActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemSubtotalPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.light.primary,
  },
  removeIconButton: {
    padding: 4,
  },
  cartFooterLinks: {
    paddingTop: 8,
  },
  continueShopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  continueShopText: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '600',
  },

  /* DESKTOP RIGHT COLUMN: ORDER SUMMARY */
  orderSummaryCard: {
    width: 320,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    padding: 16,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222222',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f2f5',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
  },
  freeShippingText: {
    color: '#00c853',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f2f5',
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222222',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.light.primary,
  },
  checkoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 12,
    borderRadius: 4,
    gap: 8,
    marginTop: 6,
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  trustBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f2f5',
    marginTop: 4,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
  },

  /* MOBILE FIXED BOTTOM BAR */
  mobileFixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e1e4e8',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  mobileSummaryInfo: {
    gap: 2,
  },
  mobileTotalLabel: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  mobileTotalValue: {
    fontSize: 18,
    fontWeight: '900',
    color: Colors.light.primary,
  },
  mobileCheckoutButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 4,
    gap: 6,
  },
  mobileCheckoutButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});
