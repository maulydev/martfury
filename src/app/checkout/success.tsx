import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';

import { Colors } from '@/constants/theme';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const theme = Colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: '#d1fae5' }]}>
          <Icon name="checkmark-circle" size={80} color={theme.success} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>Order Confirmed!</Text>
        <Text style={[styles.orderNumber, { color: theme.primary }]}>Order #ORD-8922</Text>

        <Text style={[styles.message, { color: theme.textSecondary }]}>
          Thank you for shopping with Martfury. We have received your order and are processing it for immediate delivery.
        </Text>

        <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Icon name="time-outline" size={24} color={theme.primary} />
          <View style={styles.infoTextGroup}>
            <Text style={[styles.infoTitle, { color: theme.text }]}>Estimated Delivery</Text>
            <Text style={[styles.infoSubtitle, { color: theme.textSecondary }]}>Within 24 - 48 Hours in Accra</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
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
    marginVertical: 12,
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
