import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';

import { Colors } from '@/constants/theme';
import { formatGHS } from '@/lib/currency';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const theme = Colors.light;

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState('Black');

  const product = {
    id: id || 'prod-1',
    name: 'Wireless Noise-Canceling Headphones',
    price: 450,
    originalPrice: 600,
    discountPercent: 25,
    rating: 4.8,
    reviewCount: 142,
    category: 'Electronics',
    inStock: true,
    stockCount: 18,
    colors: ['Black', 'Navy', 'Silver'],
    description:
      'Experience high-fidelity audio with active noise cancellation, ergonomic over-ear design, up to 30 hours of battery life, and crystal-clear voice calls.',
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Image Placeholder */}
        <View style={[styles.imageContainer, { backgroundColor: theme.backgroundElement }]}>
          <Icon name="headset-outline" size={90} color={theme.primary} />
        </View>

        {/* Product Metadata */}
        <View style={styles.contentSection}>
          <View style={styles.badgeRow}>
            <Text style={[styles.categoryBadge, { backgroundColor: theme.primaryLight, color: theme.primary }]}>
              {product.category}
            </Text>
            {product.inStock && (
              <Text style={[styles.stockBadge, { backgroundColor: '#d1fae5', color: theme.success }]}>
                In Stock ({product.stockCount} left)
              </Text>
            )}
          </View>

          <Text style={[styles.productTitle, { color: theme.text }]}>{product.name}</Text>

          <View style={styles.ratingRow}>
            <Icon name="star" size={16} color="#f59e0b" />
            <Text style={[styles.ratingVal, { color: theme.text }]}>{product.rating}</Text>
            <Text style={[styles.ratingCount, { color: theme.textSecondary }]}>
              ({product.reviewCount} customer reviews)
            </Text>
          </View>

          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: theme.primary }]}>
              {formatGHS(product.price)}
            </Text>
            {product.originalPrice ? (
              <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
                {formatGHS(product.originalPrice)}
              </Text>
            ) : null}
            {product.discountPercent ? (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{product.discountPercent}% OFF</Text>
              </View>
            ) : null}
          </View>

          {/* Color Selector */}
          <View style={styles.sectionDivider} />
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Color Option</Text>
          <View style={styles.colorRow}>
            {product.colors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorChip,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.backgroundElement,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  <Text
                    style={[
                      styles.colorChipText,
                      { color: isSelected ? '#ffffff' : theme.text },
                    ]}
                  >
                    {color}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quantity Controls */}
          <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 12 }]}>
            Quantity
          </Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, { borderColor: theme.border }]}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
            >
              <Icon name="remove" size={18} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.qtyVal, { color: theme.text }]}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, { borderColor: theme.border }]}
              onPress={() => setQuantity((q) => q + 1)}
            >
              <Icon name="add" size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.sectionDivider} />
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Product Overview</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {product.description}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.addToCartBtn, { backgroundColor: theme.primary }]}
          onPress={() => router.push('/cart')}
        >
          <Icon name="cart-outline" size={20} color="#ffffff" />
          <Text style={styles.addToCartText}>Add {quantity} to Cart</Text>
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
    paddingBottom: 80,
  },
  imageContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentSection: {
    padding: 16,
    gap: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockBadge: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingVal: {
    fontWeight: '700',
    fontSize: 14,
  },
  ratingCount: {
    fontSize: 13,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '800',
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  discountBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 4,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
  },
  colorChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  colorChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyVal: {
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  addToCartBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderRadius: 12,
    gap: 8,
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
