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
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useToastStore } from '@/stores/toast.store';

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
  /**
   * The id this product is keyed by in the cart store (its default variant
   * id — see getCartItemId in lib/catalog.ts). Falls back to `id` when not
   * given. Once this id is in the cart, the card swaps its "Add to cart"
   * button for a quantity stepper it drives directly against the store.
   */
  cartItemId?: string;
  onPress?: () => void;
  onAddToCart?: () => void;
  /**
   * Extra side effect to run whenever the wishlist heart is toggled (e.g.
   * analytics). The heart button itself is wired straight to the wishlist
   * store — keyed by `id` — so this is optional.
   */
  onAddToWishlist?: () => void;
  onRemove?: () => void;
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
  cartItemId,
  onPress,
  onAddToCart,
  onAddToWishlist,
  onRemove,
}: ProductCardProps) {
  const cartKey = cartItemId ?? id;
  const cartQty = useCartStore((s) => s.items.find((i) => i.id === cartKey)?.qty ?? 0);
  const increaseCartQty = useCartStore((s) => s.increaseQty);
  const decreaseCartQty = useCartStore((s) => s.decreaseQty);
  const inCart = cartQty > 0;

  const inWishlist = useWishlistStore((s) => s.has(id));
  const toggleWishlistItem = useWishlistStore((s) => s.toggle);
  const handleToggleWishlist = () => {
    toggleWishlistItem({ id, name, price, originalPrice, image, category, rating, reviews });
    useToastStore
      .getState()
      .show(inWishlist ? `${name} removed from wishlist` : `${name} added to wishlist`);
    onAddToWishlist?.();
  };

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
          {onRemove && (
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={onRemove}
              activeOpacity={0.8}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <View style={[styles.removeIconLine, styles.removeIconLineFwd]} />
              <View style={[styles.removeIconLine, styles.removeIconLineBack]} />
            </TouchableOpacity>
          )}
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
            {inCart ? (
              <View style={styles.listQtyStepper}>
                <TouchableOpacity
                  style={styles.listQtyButton}
                  onPress={() => decreaseCartQty(cartKey)}
                  activeOpacity={0.8}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Icon name="remove" size={13} color="#333333" />
                </TouchableOpacity>
                <Text style={styles.listQtyValue}>{cartQty}</Text>
                <TouchableOpacity
                  style={styles.listQtyButton}
                  onPress={() => increaseCartQty(cartKey)}
                  activeOpacity={0.8}
                  hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                >
                  <Icon name="add" size={13} color="#333333" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addCartIconButton}
                onPress={onAddToCart}
                activeOpacity={0.8}
              >
                <Icon name="cart-outline" size={15} color="#ffffff" />
              </TouchableOpacity>
            )}

            {!onRemove && (
              <TouchableOpacity
                style={styles.wishlistIconButton}
                onPress={handleToggleWishlist}
                activeOpacity={0.8}
              >
                <Icon
                  name={inWishlist ? 'heart' : 'heart-outline'}
                  size={15}
                  color={inWishlist ? '#ff4d4f' : '#666666'}
                />
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
        {onRemove ? (
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={onRemove}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <View style={[styles.removeIconLine, styles.removeIconLineFwd]} />
            <View style={[styles.removeIconLine, styles.removeIconLineBack]} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.wishlistImageButton}
            onPress={handleToggleWishlist}
            activeOpacity={0.8}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Icon
              name={inWishlist ? 'heart' : 'heart-outline'}
              size={14}
              color={inWishlist ? '#ff4d4f' : '#666666'}
            />
          </TouchableOpacity>
        )}
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

        {inCart ? (
          <View style={styles.gridQtyStepper}>
            <TouchableOpacity
              style={styles.gridQtyButton}
              onPress={() => decreaseCartQty(cartKey)}
              activeOpacity={0.8}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Icon name="remove" size={14} color="#333333" />
            </TouchableOpacity>
            <Text style={styles.gridQtyValue}>{cartQty}</Text>
            <TouchableOpacity
              style={styles.gridQtyButton}
              onPress={() => increaseCartQty(cartKey)}
              activeOpacity={0.8}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Icon name="add" size={14} color="#333333" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addCartBlueButton}
            onPress={onAddToCart}
            activeOpacity={0.8}
          >
            <Text style={styles.addCartBlueButtonText}>Add to cart</Text>
          </TouchableOpacity>
        )}
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
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 12,
    width: 24,
    height: 24,
  },
  wishlistImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Drawn as two crossed lines instead of an icon-font glyph: icon fonts
  // (SF Symbols/Material Symbols, via expo-symbols) render with their own
  // font ascent/descent padding, which visibly throws off the optical
  // center in a badge this small. Lines centered via top/left 50% + a
  // negative half-dimension margin are pixel-exact on every platform.
  removeIconLine: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 12,
    height: 1.5,
    marginTop: -0.75,
    marginLeft: -6,
    borderRadius: 1,
    backgroundColor: '#ffffff',
  },
  removeIconLineFwd: {
    transform: [{ rotate: '45deg' }],
  },
  removeIconLineBack: {
    transform: [{ rotate: '-45deg' }],
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
  gridQtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 4,
    marginTop: 4,
    overflow: 'hidden',
  },
  gridQtyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  gridQtyValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#222222',
    minWidth: 24,
    textAlign: 'center',
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
  listQtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: 6,
    height: 32,
    overflow: 'hidden',
  },
  listQtyButton: {
    width: 26,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listQtyValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#222222',
    minWidth: 18,
    textAlign: 'center',
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
