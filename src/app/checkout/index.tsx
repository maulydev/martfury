import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';

import { Colors } from '@/constants/theme';
import { formatGHS } from '@/lib/currency';

export default function CheckoutScreen() {
  const router = useRouter();
  const theme = Colors.light;

  const [fullName, setFullName] = useState('Kofi Mensah');
  const [email, setEmail] = useState('kofi.mensah@example.com');
  const [phone, setPhone] = useState('+233 24 123 4567');
  const [address, setAddress] = useState('14 Independence Avenue, Ridge, Accra');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo');

  const subtotal = 810;
  const shippingFee = 30;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = () => {
    router.replace('/checkout/success');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Shipping Information Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardTitleRow}>
            <Icon name="location-outline" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Shipping Address</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Phone Number (Mobile Money)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textSecondary }]}>Delivery Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.border }]}
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>
        </View>

        {/* Payment Options */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardTitleRow}>
            <Icon name="card-outline" size={20} color={theme.primary} />
            <Text style={[styles.cardTitle, { color: theme.text }]}>Payment Method</Text>
          </View>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'momo' ? theme.primaryLight : theme.backgroundElement,
                borderColor: paymentMethod === 'momo' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setPaymentMethod('momo')}
          >
            <Icon name="phone-portrait-outline" size={24} color={theme.primary} />
            <View style={styles.optionDetails}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>MTN / Telecel / AT Mobile Money</Text>
              <Text style={[styles.optionSub, { color: theme.textSecondary }]}>Instant mobile checkout in GHS</Text>
            </View>
            {paymentMethod === 'momo' && (
              <Icon name="checkmark-circle" size={20} color={theme.primary} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'card' ? theme.primaryLight : theme.backgroundElement,
                borderColor: paymentMethod === 'card' ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setPaymentMethod('card')}
          >
            <Icon name="card-outline" size={24} color={theme.primary} />
            <View style={styles.optionDetails}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>Credit / Debit Card</Text>
              <Text style={[styles.optionSub, { color: theme.textSecondary }]}>Visa, MasterCard</Text>
            </View>
            {paymentMethod === 'card' && (
              <Icon name="checkmark-circle" size={20} color={theme.primary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Order Summary */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.summaryVal, { color: theme.text }]}>{formatGHS(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Standard Shipping</Text>
            <Text style={[styles.summaryVal, { color: theme.text }]}>{formatGHS(shippingFee)}</Text>
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
          style={[styles.placeOrderBtn, { backgroundColor: theme.primary }]}
          onPress={handlePlaceOrder}
        >
          <Text style={styles.placeOrderText}>Pay {formatGHS(total)}</Text>
          <Icon name="lock-closed-outline" size={18} color="#ffffff" />
        </TouchableOpacity>
      </View>
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
});
