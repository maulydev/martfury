import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Icon, type IconName } from '@/components/ui/icon';
import { Colors } from '@/constants/theme';
import type { PaymentGateway } from '@/lib/orders';

type GatewayOption = {
  value: PaymentGateway;
  label: string;
  sublabel: string;
  icon: IconName;
};

// Single source of truth for gateway copy/icons — was previously duplicated
// (with drifting order, copy, and styling) across checkout/index.tsx and
// orders/[id].tsx.
const GATEWAY_OPTIONS: GatewayOption[] = [
  { value: 'stripe', label: 'Stripe', sublabel: 'Pay by card', icon: 'card-outline' },
  {
    value: 'paystack',
    label: 'Paystack',
    sublabel: 'Card, Mobile Money, bank transfer',
    icon: 'wallet-outline',
  },
  { value: 'crypto', label: 'Crypto', sublabel: 'Pay with crypto', icon: 'logo-bitcoin' },
];

export const GATEWAY_LABELS: Record<PaymentGateway, string> = {
  stripe: 'Stripe',
  paystack: 'Paystack',
  crypto: 'our crypto payment provider',
};

interface PaymentGatewayPickerProps {
  value: PaymentGateway;
  onChange: (gateway: PaymentGateway) => void;
  disabled?: boolean;
}

export function PaymentGatewayPicker({ value, onChange, disabled }: PaymentGatewayPickerProps) {
  const theme = Colors.light;

  return (
    <View style={styles.container}>
      {GATEWAY_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              {
                backgroundColor: selected ? theme.primaryLight : theme.backgroundElement,
                borderColor: selected ? theme.primary : theme.border,
              },
            ]}
            onPress={() => onChange(option.value)}
            disabled={disabled}
          >
            <Icon name={option.icon} size={24} color={theme.primary} />
            <View style={styles.optionDetails}>
              <Text style={[styles.optionTitle, { color: theme.text }]}>{option.label}</Text>
              <Text style={[styles.optionSub, { color: theme.textSecondary }]}>{option.sublabel}</Text>
            </View>
            {selected && <Icon name="checkmark-circle" size={20} color={theme.primary} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  option: {
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
});
