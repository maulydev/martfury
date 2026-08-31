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

export default function AdminProductsScreen() {
  const theme = Colors.light;

  const products = [
    {
      id: 'prod-1',
      name: 'Wireless Noise-Canceling Headphones',
      price: 450,
      stock: 18,
      status: 'active',
    },
    {
      id: 'prod-2',
      name: 'African Print Casual Shirt',
      price: 180,
      stock: 45,
      status: 'active',
    },
    {
      id: 'prod-3',
      name: 'Smart Fitness Watch Series V',
      price: 890,
      stock: 6,
      status: 'low_stock',
    },
    {
      id: 'prod-4',
      name: 'Ergonomic Office Chair',
      price: 1250,
      stock: 0,
      status: 'out_of_stock',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={[styles.productRow, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={[styles.imageThumb, { backgroundColor: theme.backgroundElement }]}>
              <Icon name="cube-outline" size={24} color={theme.primary} />
            </View>

            <View style={styles.details}>
              <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.price, { color: theme.primary }]}>
                {formatGHS(item.price)}
              </Text>
              <Text style={[styles.stock, { color: theme.textSecondary }]}>
                Stock Level: {item.stock} units
              </Text>
            </View>

            <TouchableOpacity style={styles.editBtn}>
              <Icon name="create-outline" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
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
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  imageThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  details: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
  },
  price: {
    fontSize: 14,
    fontWeight: '800',
  },
  stock: {
    fontSize: 12,
  },
  editBtn: {
    padding: 8,
  },
});
