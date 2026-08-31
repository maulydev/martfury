import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';

import { Colors } from '@/constants/theme';
import { formatGHS } from '@/lib/currency';
import { useCartStore } from '@/stores/cart.store';
import { useToastStore } from '@/stores/toast.store';
import { useSession } from '@/lib/auth-client';
import {
  initiateOrderPayment,
  validateCoupon,
  OrderApiError,
  type PaymentGateway,
  type ValidatedCoupon,
} from '@/lib/orders';

// Same fixed option lists as the web checkout's <select> fields
// (~/Desktop/ecommerce-project's src/app/checkout/page.tsx).
const COUNTRIES = ['Ghana', 'Australia', 'United States', 'United Kingdom', 'Canada'];
const REGIONS = ['Greater Accra', 'Ashanti', 'Eastern', 'Central', 'Western'];

/**
 * Mirrors the web checkout (~/Desktop/ecommerce-project's
 * src/app/checkout/page.tsx): collect contact + shipping info, optionally
 * apply a coupon, pick a gateway, then POST /api/order-payment. That creates
 * the real order server-side and returns a hosted payment page
 * (authorizationUrl) — the web redirects the whole tab to it; here we open
 * it in an in-app browser and, once it's dismissed, hand off to
 * checkout/success.tsx with the reference we already have (see lib/orders.ts
 * for why — there's no app-reachable deep link back from the payment
 * provider, and no webhook either).
 *
 * Fields match the web's checkoutSchema one-for-one — email, firstName,
 * lastName, company (optional), address, suburb (optional), country, state,
 * postcode (optional), phone. One deliberate improvement over web: its
 * submit handler collects company/suburb/postcode in the form but never
 * actually includes them in the metadata it sends — here they're carried
 * through, since there's no reason to collect them and then drop them.
 */
export default function CheckoutScreen() {
  const router = useRouter();
  const theme = Colors.light;
  const { data: session } = useSession();
  const user = session?.user;

  const cartItems = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.getTotal());

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  // Prefilled with test values for convenience while testing checkout —
  // remove these defaults before shipping to real users.
  const [address, setAddress] = useState('14 Independence Avenue, Osu');
  const [suburb, setSuburb] = useState('');
  const [country, setCountry] = useState('Ghana');
  const [region, setRegion] = useState('Greater Accra');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('0244123456');

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showRegionPicker, setShowRegionPicker] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [coupon, setCoupon] = useState<ValidatedCoupon | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const [gateway, setGateway] = useState<PaymentGateway>('stripe');
  const [submitting, setSubmitting] = useState(false);

  // Prefill from the signed-in session, same as web's checkout page — never
  // overwrites something the shopper already typed.
  useEffect(() => {
    if (!user) return;
    setEmail((prev) => prev || user.email || '');
    if (user.name) {
      const [first, ...rest] = user.name.split(' ');
      setFirstName((prev) => prev || first || '');
      setLastName((prev) => prev || rest.join(' ') || '');
    }
  }, [user]);

  const discountAmount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.type === 'PERCENT') return (subtotal * coupon.value) / 100;
    return Math.min(subtotal, coupon.value);
  }, [subtotal, coupon]);

  // Shipping is free for now — matches the web checkout's
  // `const shipping = 0; // Demo shipping/tax` (no live shipping
  // calculation exists on the backend yet).
  const shippingFee = 0;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) return;
    setValidatingCoupon(true);
    try {
      const result = await validateCoupon(code, subtotal);
      setCoupon(result);
      useToastStore.getState().show(`Coupon ${result.code} applied`);
    } catch (e) {
      setCoupon(null);
      useToastStore.getState().show(e instanceof OrderApiError ? e.message : 'Invalid coupon');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponInput('');
  };

  const validate = (): string | null => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email address.';
    if (!firstName.trim()) return 'First name is required.';
    if (!lastName.trim()) return 'Last name is required.';
    if (!address.trim()) return 'Delivery address is required.';
    if (!region.trim()) return 'State/territory is required.';
    if (!phone.trim()) return 'Phone number is required.';
    return null;
  };

  const handlePlaceOrder = async () => {
    const validationError = validate();
    if (validationError) {
      useToastStore.getState().show(validationError);
      return;
    }

    setSubmitting(true);
    try {
      const { authorizationUrl, reference } = await initiateOrderPayment({
        email: email.trim(),
        amount: total,
        gateway,
        couponCode: coupon?.code,
        items: cartItems.map((item) => ({ variantId: item.id, quantity: item.qty })),
        metadata: {
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          company: company.trim(),
          address: address.trim(),
          suburb: suburb.trim(),
          country,
          state: region,
          postcode: postcode.trim(),
          phone: phone.trim(),
        },
      });

      await WebBrowser.openBrowserAsync(authorizationUrl);

      // The browser is closed one way or another (paid, cancelled, backed
      // out) — checkout/success.tsx takes it from here: it looks the order
      // up by this same reference and only then treats it as paid.
      router.replace({ pathname: '/checkout/success', params: { reference } });
    } catch (e) {
      useToastStore
        .getState()
        .show(e instanceof OrderApiError ? e.message : 'Could not start checkout. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: theme.background }]}>
        <Icon name="cart-outline" size={56} color={theme.textMuted} />
        <Text style={[styles.emptyTitle, { color: theme.text }]}>Your cart is empty</Text>
        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          Add something to your cart before checking out.
        </Text>
        <TouchableOpacity
          style={[styles.emptyButton, { backgroundColor: theme.primary }]}
          onPress={() => router.replace('/shop')}
        >
          <Text style={styles.emptyButtonText}>Back to Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {submitting && (
          <View style={[styles.processingBanner, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}>
            <ActivityIndicator size="small" color={theme.primary} />
            <Text style={[styles.processingText, { color: theme.primary }]}>
              Connecting to {gateway === 'stripe' ? 'Stripe' : 'Paystack'}…
            </Text>
          </View>
        )}

        {/* Contact + Shipping Information */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardTitleRow}>
            <Icon name="location-outline" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Shipping Address</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. kojo@example.com"
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!submitting}
            />
          </View>

          <View style={styles.inputRow}>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>First Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="e.g. Kojo"
                placeholderTextColor={theme.textMuted}
                editable={!submitting}
              />
            </View>
            <View style={[styles.inputGroup, styles.inputHalf]}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>Last Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
                value={lastName}
                onChangeText={setLastName}
                placeholder="e.g. Mensah"
                placeholderTextColor={theme.textMuted}
                editable={!submitting}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Company (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
              value={company}
              onChangeText={setCompany}
              placeholder="e.g. Acme Ltd"
              placeholderTextColor={theme.textMuted}
              editable={!submitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. 14 Independence Ave, Osu"
              placeholderTextColor={theme.textMuted}
              multiline
              editable={!submitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Suburb (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
              value={suburb}
              onChangeText={setSuburb}
              placeholder="e.g. Osu"
              placeholderTextColor={theme.textMuted}
              editable={!submitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Country/Region</Text>
            <TouchableOpacity
              style={[styles.input, styles.selectInput, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
              onPress={() => setShowCountryPicker(true)}
              disabled={submitting}
            >
              <Text style={{ color: theme.text, fontSize: 14 }}>{country}</Text>
              <Icon name="chevron-down" size={14} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>State/Territory</Text>
            <TouchableOpacity
              style={[styles.input, styles.selectInput, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
              onPress={() => setShowRegionPicker(true)}
              disabled={submitting}
            >
              <Text style={{ color: region ? theme.text : theme.textMuted, fontSize: 14 }}>
                {region || 'e.g. Greater Accra'}
              </Text>
              <Icon name="chevron-down" size={14} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Postcode (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
              value={postcode}
              onChangeText={setPostcode}
              placeholder="e.g. GA-184-9202"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="characters"
              editable={!submitting}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Phone</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="e.g. 024 123 4567"
              placeholderTextColor={theme.textMuted}
              keyboardType="phone-pad"
              editable={!submitting}
            />
          </View>
        </View>

        {/* Coupon */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardTitleRow}>
            <Icon name="wallet-outline" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Discount Code</Text>
          </View>

          {coupon ? (
            <View style={styles.couponAppliedRow}>
              <View style={[styles.couponBadge, { backgroundColor: theme.primaryLight }]}>
                <Text style={[styles.couponBadgeText, { color: theme.primary }]}>{coupon.code}</Text>
              </View>
              <Text style={[styles.couponDiscountText, { color: theme.success }]}>
                -{formatGHS(discountAmount, false)}
              </Text>
              <TouchableOpacity onPress={removeCoupon} disabled={submitting}>
                <Text style={[styles.couponRemoveText, { color: theme.error }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <TextInput
                style={[styles.couponInput, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
                value={couponInput}
                onChangeText={setCouponInput}
                placeholder="e.g. SUMMER10"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="characters"
                editable={!submitting}
              />
              <TouchableOpacity
                style={[styles.couponApplyBtn, { backgroundColor: theme.text, opacity: !couponInput || validatingCoupon || submitting ? 0.5 : 1 }]}
                onPress={handleApplyCoupon}
                disabled={!couponInput || validatingCoupon || submitting}
              >
                {validatingCoupon ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.couponApplyText}>Apply</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Payment Gateway */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardTitleRow}>
            <Icon name="card-outline" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Payment Method</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              {
                backgroundColor: gateway === 'stripe' ? theme.primaryLight : theme.backgroundElement,
                borderColor: gateway === 'stripe' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setGateway('stripe')}
            disabled={submitting}
          >
            <Icon name="card-outline" size={24} color={theme.primary} />
            <View style={styles.optionDetails}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>Stripe</Text>
              <Text style={[styles.optionSub, { color: theme.textSecondary }]}>Pay by card</Text>
            </View>
            {gateway === 'stripe' && <Icon name="checkmark-circle" size={20} color={theme.primary} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              {
                backgroundColor: gateway === 'paystack' ? theme.primaryLight : theme.backgroundElement,
                borderColor: gateway === 'paystack' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setGateway('paystack')}
            disabled={submitting}
          >
            <Icon name="wallet-outline" size={24} color={theme.primary} />
            <View style={styles.optionDetails}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>Paystack</Text>
              <Text style={[styles.optionSub, { color: theme.textSecondary }]}>
                Card, Mobile Money, bank transfer
              </Text>
            </View>
            {gateway === 'paystack' && <Icon name="checkmark-circle" size={20} color={theme.primary} />}
          </TouchableOpacity>

          <View style={styles.gatewayHintRow}>
            <Icon name="lock-closed-outline" size={13} color={theme.textMuted} />
            <Text style={[styles.gatewayHintText, { color: theme.textMuted }]}>
              Payment opens in a secure browser tab. Once you're done — including if it lands on
              a page that won't load — tap ✕ to return here.
            </Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryVal, { color: theme.text }]}>{formatGHS(subtotal)}</Text>
          </View>
          {coupon && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Discount ({coupon.code})</Text>
              <Text style={[styles.summaryVal, { color: theme.success }]}>
                -{formatGHS(discountAmount, false)}
              </Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Standard Shipping</Text>
            <Text style={[styles.summaryVal, { color: theme.success }]}>
              {shippingFee === 0 ? 'Free' : formatGHS(shippingFee)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={[styles.totalLabel, { color: theme.text }]}>Total Payable</Text>
            <Text style={[styles.totalVal, { color: theme.primary }]}>{formatGHS(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Place Order Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.placeOrderBtn, { backgroundColor: theme.primary, opacity: submitting ? 0.7 : 1 }]}
          onPress={handlePlaceOrder}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Pay {formatGHS(total)}</Text>
              <Icon name="lock-closed-outline" size={18} color="#ffffff" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Country picker */}
      <Modal
        visible={showCountryPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowCountryPicker(false)}
        >
          <View style={[styles.pickerCard, { backgroundColor: theme.card }]}>
            {COUNTRIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.pickerOption}
                onPress={() => {
                  setCountry(c);
                  setShowCountryPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    { color: c === country ? theme.primary : theme.text },
                    c === country && styles.pickerOptionTextActive,
                  ]}
                >
                  {c}
                </Text>
                {c === country && <Icon name="checkmark-circle" size={16} color={theme.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* State/Region picker */}
      <Modal
        visible={showRegionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRegionPicker(false)}
      >
        <TouchableOpacity
          style={styles.pickerOverlay}
          activeOpacity={1}
          onPress={() => setShowRegionPicker(false)}
        >
          <View style={[styles.pickerCard, { backgroundColor: theme.card }]}>
            {REGIONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={styles.pickerOption}
                onPress={() => {
                  setRegion(r);
                  setShowRegionPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    { color: r === region ? theme.primary : theme.text },
                    r === region && styles.pickerOptionTextActive,
                  ]}
                >
                  {r}
                </Text>
                {r === region && <Icon name="checkmark-circle" size={16} color={theme.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
    paddingBottom: 90,
  },
  processingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  processingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  couponRow: {
    flexDirection: 'row',
    gap: 10,
  },
  couponInput: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  couponApplyBtn: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  couponApplyText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  couponAppliedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  couponBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  couponBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  couponDiscountText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  couponRemoveText: {
    fontSize: 12,
    fontWeight: '700',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionSub: {
    fontSize: 12,
  },
  gatewayHintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingTop: 2,
  },
  gatewayHintText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryVal: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  placeOrderBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    gap: 8,
  },
  placeOrderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  emptyButton: {
    marginTop: 10,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  emptyButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 12,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  pickerOptionText: {
    fontSize: 14,
  },
  pickerOptionTextActive: {
    fontWeight: '700',
  },
});
