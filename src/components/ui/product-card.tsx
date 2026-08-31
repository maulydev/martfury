import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Icon } from './icon';
import { SafeImage } from './safe-image';
import { Colors } from '@/constants/theme';

export interface ProductCardProps {
  id: string;
  name: string;
  price: number | string;
  originalPrice?: number | string;
  category?: string;
  image: string;
  rating?: number;
  reviews?: number;
  inStock?: boolean;
  points?: string[];
  badge?: string;
  layout?: 'grid' | 'list';
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onAddToCart?: () => void;
  onAddToWishlist?: () => void;
}

export function ProductCard({
  id,
  name,
  price,
  originalPrice,
  category,
  image,
  rating = 0,
  reviews = 0,
  inStock = true,
  points,
  badge,
  layout = 'grid',
  style,
  onPress,
  onAddToCart,
  onAddToWishlist,
}: ProductCardProps) {
  const formatPrice = (val: number | string) => {
    if (typeof val === 'number') {
      return `$${val.toFixed(2)}`;
    }
    return val;
  };

  const renderStars = (ratingVal: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name="star"
          size={12}
          color={i <= Math.round(ratingVal) ? '#ff9800' : '#e0e0e0'}
        />
      );
    }
    return stars;
  };

  if (layout === 'list') {
    return (
      <TouchableOpacity
        style={[styles.listCard, style]}
        onPress={onPress}
        activeOpacity={0.88}
      >
        {/* Image Container */}
        <View style={styles.listImageWrapper}>
          <SafeImage source={{ uri: image }} name={name} style={styles.cardImage} resizeMode="cover" />
          {badge ? (
            <View style={styles.badgeTag}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ) : null}
        </View>

        {/* Details Container */}
        <View style={styles.listDetails}>
          {category ? <Text style={styles.categoryText}>{category}</Text> : null}
          <Text style={styles.listTitle} numberOfLines={2}>
            {name}
          </Text>

          <View style={styles.ratingRow}>
            <View style={styles.starsGroup}>{renderStars(rating)}</View>
            <Text style={styles.reviewsText}>
              {rating > 0 ? `${rating.toFixed(1)} ` : ''}({reviews})
            </Text>
          </View>

          {inStock ? (
            <View style={styles.inStockRow}>
              <View style={styles.inStockDot} />
              <Text style={styles.inStockTag}>In Stock</Text>
            </View>
          ) : null}
        </View>

        {/* Actions & Price */}
        <View style={styles.listActionsColumn}>
          <View style={styles.priceContainer}>
            <Text style={styles.mainPrice}>{formatPrice(price)}</Text>
            {originalPrice ? (
              <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
            ) : null}
          </View>

          <View style={styles.listActionButtonsRow}>
            <TouchableOpacity
              style={styles.addCartIconButton}
              onPress={onAddToCart}
              activeOpacity={0.8}
            >
              <Icon name="cart-outline" size={15} color="#ffffff" />
            </TouchableOpacity>

            {onAddToWishlist && (
              <TouchableOpacity
                style={styles.wishlistIconButton}
                onPress={onAddToWishlist}
                activeOpacity={0.8}
              >
                <Icon name="heart-outline" size={15} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // DEFAULT GRID LAYOUT (2-column optimized)
  return (
    <TouchableOpacity
      style={[styles.gridCard, style]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      <View style={styles.gridImageWrapper}>
        <SafeImage source={{ uri: image }} name={name} style={styles.cardImage} resizeMode="cover" />
        {badge ? (
          <View style={styles.badgeTag}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.gridInfo}>
        {category ? <Text style={styles.categoryText}>{category}</Text> : null}
        <Text style={styles.gridTitle} numberOfLines={1}>
          {name}
        </Text>

        <View style={styles.ratingRow}>
          <View style={styles.starsGroup}>{renderStars(rating)}</View>
          <Text style={styles.reviewsText}>({reviews})</Text>
        </View>

        <View style={styles.priceContainerRow}>
          <Text style={styles.mainPrice}>{formatPrice(price)}</Text>
          {originalPrice ? (
            <Text style={styles.originalPrice}>{formatPrice(originalPrice)}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.addCartBlueButton}
          onPress={onAddToCart}
          activeOpacity={0.8}
        >
          <Text style={styles.addCartBlueButtonText}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  /* GRID STYLES */
  gridCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    overflow: 'hidden',
  },
  gridImageWrapper: {
    height: 140,
    backgroundColor: '#f9f9f9',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  badgeTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#ff4d4f',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  gridInfo: {
    padding: 10,
    gap: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#888888',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  gridTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
    lineHeight: 18,
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 2,
  },
  starsGroup: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewsText: {
    fontSize: 11,
    color: '#888888',
  },
  priceContainerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  mainPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222222',
  },
  originalPrice: {
    fontSize: 12,
    color: '#999999',
    textDecorationLine: 'line-through',
  },
  addCartBlueButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 9,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 4,
  },
  addCartBlueButtonRow: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderRadius: 4,
    width: '100%',
  },
  addCartBlueButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 11,
  },

  /* LIST STYLES */
  listCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    overflow: 'hidden',
  },
  listImageWrapper: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    position: 'relative',
  },
  listDetails: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.light.primary,
    lineHeight: 17,
  },
  bulletPoint: {
    fontSize: 11,
    color: '#666666',
  },
  inStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  inStockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00c853',
  },
  inStockTag: {
    fontSize: 11,
    color: '#00c853',
    fontWeight: '600',
  },
  listActionsColumn: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 6,
    paddingLeft: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  listActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  addCartIconButton: {
    backgroundColor: Colors.light.primary,
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistIconButton: {
    borderWidth: 1,
    borderColor: '#e1e4e8',
    backgroundColor: '#ffffff',
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wishlistBorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    width: '100%',
  },
  wishlistBorderText: {
    fontSize: 11,
    color: '#666666',
    fontWeight: '600',
  },
});
