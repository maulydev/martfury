import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Icon } from '@/components/ui/icon';

import { Colors } from '@/constants/theme';
import { formatGHS } from '@/lib/currency';

export default function AdminOrdersScreen() {
  const theme = Colors.light;

  const orders = [
    {
      id: 'ORD-8921',
      customerName: 'Kofi Mensah',
      phone: '+233 24 123 4567',
      total: 810,
      status: 'delivered',
      date: 'Aug 28, 2026',
    },
    {
      id: 'ORD-8920',
      customerName: 'Abena Osei',
      phone: '+233 20 987 6543',
      total: 180,
      status: 'shipped',
      date: 'Aug 25, 2026',
    },
    {
      id: 'ORD-8919',
      customerName: 'Kwame Asante',
      phone: '+233 55 444 3322',
      total: 1250,
      status: 'processing',
      date: 'Aug 20, 2026',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={styles.header}>
              <Text style={[styles.orderId, { color: theme.text }]}>{item.id}</Text>
              <Text style={[styles.date, { color: theme.textSecondary }]}>{item.date}</Text>
            </View>

            <View style={styles.body}>
              <View style={styles.row}>
                <Icon name="person-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.text, { color: theme.text }]}>{item.customerName}</Text>
              </View>
              <View style={styles.row}>
                <Icon name="call-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.text, { color: theme.textSecondary }]}>{item.phone}</Text>
              </View>
            </View>

            <View style={[styles.footer, { borderTopColor: theme.border }]}>
              <Text style={[styles.total, { color: theme.primary }]}>{formatGHS(item.total)}</Text>
              <TouchableOpacity
                style={[styles.statusBadge, { backgroundColor: theme.primaryLight }]}
              >
                <Text style={[styles.statusText, { color: theme.primary }]}>
                  {item.status.toUpperCase()}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
  },
  date: {
    fontSize: 12,
  },
  body: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
  },
  total: {
    fontSize: 16,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
