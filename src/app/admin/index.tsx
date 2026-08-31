import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';

import { Colors } from '@/constants/theme';
import { formatGHS } from '@/lib/currency';

export default function AdminDashboardScreen() {
  const router = useRouter();
  const theme = Colors.light;

  const metrics = [
    {
      title: 'Total Revenue',
      value: formatGHS(128450),
      icon: 'wallet-outline',
      change: '+14.2%',
      isPositive: true,
    },
    {
      title: 'Total Orders',
      value: '1,420',
      icon: 'receipt-outline',
      change: '+8.5%',
      isPositive: true,
    },
    {
      title: 'Active Products',
      value: '248',
      icon: 'cube-outline',
      change: '+12 new',
      isPositive: true,
    },
    {
      title: 'Customers',
      value: '950',
      icon: 'people-outline',
      change: '+24 this week',
      isPositive: true,
    },
  ];

  const recentOrders = [
    { id: 'ORD-8921', customer: 'Kofi Mensah', amount: 810, status: 'delivered' },
    { id: 'ORD-8920', customer: 'Abena Osei', amount: 180, status: 'shipped' },
    { id: 'ORD-8919', customer: 'Kwame Asante', amount: 1250, status: 'processing' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Overview Metrics</Text>

      {/* Metrics Cards Grid */}
      <View style={styles.metricsGrid}>
        {metrics.map((item, idx) => (
          <View
            key={idx}
            style={[styles.metricCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={styles.cardHeaderRow}>
              <View style={[styles.iconBg, { backgroundColor: theme.primaryLight }]}>
                <Icon name={item.icon as any} size={20} color={theme.primary} />
              </View>
              <Text style={[styles.changeText, { color: theme.success }]}>{item.change}</Text>
            </View>
            <Text style={[styles.metricValue, { color: theme.text }]}>{item.value}</Text>
            <Text style={[styles.metricTitle, { color: theme.textSecondary }]}>{item.title}</Text>
          </View>
        ))}
      </View>

      {/* Quick Action Navigation */}
      <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 12 }]}>
        Quick Management
      </Text>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/admin/products')}
        >
          <Icon name="cube" size={24} color={theme.primary} />
          <Text style={[styles.actionBtnText, { color: theme.text }]}>Products</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => router.push('/admin/orders')}
        >
          <Icon name="receipt" size={24} color={theme.primary} />
          <Text style={[styles.actionBtnText, { color: theme.text }]}>Orders</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Orders List */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Orders</Text>
        <TouchableOpacity onPress={() => router.push('/admin/orders')}>
          <Text style={[styles.seeAllText, { color: theme.primary }]}>Manage All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.ordersList}>
        {recentOrders.map((ord) => (
          <View
            key={ord.id}
            style={[styles.orderRow, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={styles.orderLeft}>
              <Text style={[styles.orderIdText, { color: theme.text }]}>{ord.id}</Text>
              <Text style={[styles.customerText, { color: theme.textSecondary }]}>
                {ord.customer}
              </Text>
            </View>
            <View style={styles.orderRight}>
              <Text style={[styles.amountText, { color: theme.primary }]}>
                {formatGHS(ord.amount)}
              </Text>
              <Text style={[styles.statusText, { color: theme.textSecondary }]}>
                {ord.status}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricTitle: {
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ordersList: {
    gap: 8,
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  orderLeft: {
    gap: 2,
  },
  orderIdText: {
    fontSize: 14,
    fontWeight: '700',
  },
  customerText: {
    fontSize: 12,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  statusText: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
});
