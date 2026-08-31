import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { SafeImage } from '@/components/ui/safe-image';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCard } from '@/components/ui/product-card';

import { Colors } from '@/constants/theme';
import { formatGHS, getDiscountPercent } from '@/lib/currency';
import {
  getProduct,
  getProducts,
  getProductCategoryName,
  getProductImage,
  getProductPricing,
  getProductInStock,
  getProductRating,
  getDefaultVariant,
  getCartItemId,
  ApiRequestError,
  type ApiProduct,
  type ApiVariant,
} from '@/lib/catalog';
import { createReview, ReviewApiError } from '@/lib/reviews';
import { useCartStore } from '@/stores/cart.store';
import { useToastStore } from '@/stores/toast.store';
import { useSession } from '@/lib/auth-client';

const theme = Colors.light;

/** A variant's chip label — its name if set, else its option values joined. */
function variantLabel(variant: ApiVariant): string {
  if (variant.name) return variant.name;
  const options = variant.options;
  if (options && Object.keys(options).length) return Object.values(options).join(' / ');
  return 'Default';
}

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams<{ id: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const addItemWithQty = useCartStore((s) => s.addItemWithQty);
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.getCount());
  const { data: session } = useSession();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  const loadProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const result = await getProduct(id);
      setProduct(result);
      setActiveImage(0);
      setQuantity(1);
      const variants = result.variants ?? [];
      const onSale = variants.find((v) => Number(v.salePrice) > 0);
      setSelectedVariantId((onSale ?? variants[0])?.id ?? null);
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 404) {
        setNotFound(true);
      } else {
        setError(
          e instanceof Error && e.name === 'AbortError'
            ? 'The request timed out. Check that the backend is running and reachable.'
            : e instanceof Error
              ? e.message
              : 'Could not load this product right now.',
        );
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Related products — "more from this category", mirroring the web app's
  // right-sidebar.tsx: same category, current product filtered out, capped
  // at 3.
  useEffect(() => {
    const categorySlug = product?.categories?.[0]?.category.slug;
    if (!categorySlug) {
      setRelatedProducts([]);
      return;
    }
    let cancelled = false;
    setRelatedLoading(true);
    getProducts({ category: categorySlug, limit: 4 })
      .then((result) => {
        if (cancelled) return;
        setRelatedProducts(result.products.filter((p) => p.id !== product.id).slice(0, 3));
      })
      .catch(() => {
        if (!cancelled) setRelatedProducts([]);
      })
      .finally(() => {
        if (!cancelled) setRelatedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product?.id, product?.categories]);

  const handleSubmitReview = async () => {
    if (!product || submittingReview) return;
    setSubmittingReview(true);
    setReviewError(null);
    try {
      await createReview({
        productId: product.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewRating(5);
      setReviewComment('');
      useToastStore.getState().show('Thanks for your review!');
      // Refresh just the product data so the new review shows up below,
      // without resetting the shopper's variant/quantity/image selection
      // the way a full loadProduct() would.
      if (id) {
        getProduct(id)
          .then(setProduct)
          .catch(() => {});
      }
    } catch (e) {
      setReviewError(
        e instanceof ReviewApiError ? e.message : 'Could not submit your review right now.',
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const addRelatedToCart = (prod: ApiProduct) => {
    const { price } = getProductPricing(prod);
    const variant = getDefaultVariant(prod);
    addItem({
      id: variant?.id ?? prod.id,
      name: prod.name,
      price,
      image: getProductImage(prod) ?? '',
    });
    useToastStore.getState().show(`${prod.name} added to cart`);
  };

  const gallery = useMemo(() => {
    if (!product) return [];
    if (product.images?.length) return product.images.map((img) => img.url);
    return product.image ? [product.image] : [];
  }, [product]);

  const variants = product?.variants ?? [];
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0] ?? null;

  const price = selectedVariant
    ? Number(selectedVariant.salePrice || selectedVariant.price || 0)
    : 0;
  const oldPrice =
    selectedVariant && Number(selectedVariant.salePrice) > 0
      ? Number(selectedVariant.price || 0)
      : null;
  const discountPercent = oldPrice ? getDiscountPercent(oldPrice, price) : 0;

  const stock = selectedVariant?.inventory?.stock ?? 0;
  const inStock = variants.length === 0 ? true : stock > 0;

  const { rating, reviews: reviewCount } = product
    ? getProductRating(product)
    : { rating: 0, reviews: 0 };

  useEffect(() => {
    // Keep quantity within the newly selected variant's stock.
    if (stock > 0 && quantity > stock) setQuantity(stock);
  }, [stock, quantity]);

  useEffect(() => {
    // Reset the "Added" confirmation whenever the selection changes.
    setJustAdded(false);
  }, [selectedVariantId, quantity]);

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;
    addItemWithQty(
      {
        id: selectedVariant.id,
        name: product.name,
        price,
        image: getProductImage(product) ?? '',
      },
      quantity,
    );
    setJustAdded(true);
    useToastStore.getState().show(`${product.name} added to cart`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Product Image */}
          <View style={[styles.imageContainer, { backgroundColor: theme.backgroundElement }]}>
            <Skeleton width="100%" height={280} borderRadius={0} />
          </View>

          {/* Thumbnail Row */}
          <View style={styles.thumbnailRow}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} width={56} height={56} borderRadius={8} />
            ))}
          </View>

          {/* Product Metadata */}
          <View style={styles.contentSection}>
            <View style={styles.badgeRow}>
              <Skeleton width={70} height={22} borderRadius={6} />
              <Skeleton width={90} height={22} borderRadius={6} />
            </View>

            <Skeleton width="85%" height={22} borderRadius={4} />
            <Skeleton width="40%" height={14} borderRadius={4} />

            <View style={styles.ratingRow}>
              <Skeleton width={110} height={14} borderRadius={4} />
            </View>

            <View style={styles.priceContainer}>
              <Skeleton width={90} height={26} borderRadius={4} />
              <Skeleton width={60} height={18} borderRadius={4} />
            </View>

            <View style={styles.sectionDivider} />
            <Skeleton width={70} height={15} borderRadius={4} />
            <View style={styles.colorRow}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} width={72} height={34} borderRadius={20} />
              ))}
            </View>

            <Skeleton width={80} height={15} borderRadius={4} style={{ marginTop: 12 }} />
            <View style={styles.quantityRow}>
              <Skeleton width={36} height={36} borderRadius={8} />
              <Skeleton width={24} height={16} borderRadius={4} />
              <Skeleton width={36} height={36} borderRadius={8} />
            </View>

            <View style={styles.sectionDivider} />
            <Skeleton width={140} height={15} borderRadius={4} />
            <Skeleton width="100%" height={14} borderRadius={4} />
            <Skeleton width="100%" height={14} borderRadius={4} />
            <Skeleton width="70%" height={14} borderRadius={4} />
          </View>
        </ScrollView>

        {/* Bottom Sticky Action Bar */}
        <View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <View style={styles.bottomBarRow}>
            <Skeleton height={50} borderRadius={12} style={{ flex: 1 }} />
            <Skeleton width={50} height={50} borderRadius={12} />
          </View>
        </View>
      </View>
    );
  }

  if (notFound) {
    return (
      <View style={[styles.stateContainer, { backgroundColor: theme.background }]}>
        <Icon name="close-circle" size={64} color={theme.error} />
        <Text style={styles.stateTitle}>Product not found</Text>
        <Text style={styles.stateSubtitle}>
          This product may have been removed or is no longer available.
        </Text>
        <TouchableOpacity style={styles.stateButton} onPress={() => router.push('/shop')}>
          <Text style={styles.stateButtonText}>Back to Shop</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={[styles.stateContainer, { backgroundColor: theme.background }]}>
        <Icon name="close-circle" size={64} color={theme.error} />
        <Text style={styles.stateTitle}>Couldn't load this product</Text>
        <Text style={styles.stateSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.stateButton} onPress={() => loadProduct()}>
          <Text style={styles.stateButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const categoryName = getProductCategoryName(product);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Product Image */}
        <View style={[styles.imageContainer, { backgroundColor: theme.backgroundElement }]}>
          {gallery.length ? (
            <SafeImage
              source={{ uri: gallery[activeImage] }}
              name={product.name}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <Icon name="cube-outline" size={90} color={theme.primary} />
          )}
        </View>

        {gallery.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            {gallery.map((url, index) => (
              <TouchableOpacity
                key={`${url}-${index}`}
                onPress={() => setActiveImage(index)}
                style={[
                  styles.thumbnailWrapper,
                  {
                    borderColor: index === activeImage ? theme.primary : theme.border,
                  },
                ]}
              >
                <SafeImage
                  source={{ uri: url }}
                  name={product.name}
                  style={styles.thumbnailImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Product Metadata */}
        <View style={styles.contentSection}>
          <View style={styles.badgeRow}>
            {categoryName ? (
              <Text style={[styles.categoryBadge, { backgroundColor: theme.primaryLight, color: theme.primary }]}>
                {categoryName}
              </Text>
            ) : null}
            {variants.length === 0 ? null : inStock ? (
              <Text style={[styles.stockBadge, { backgroundColor: '#d1fae5', color: theme.success }]}>
                In Stock{stock ? ` (${stock} left)` : ''}
              </Text>
            ) : (
              <Text style={[styles.stockBadge, { backgroundColor: '#fee2e2', color: theme.error }]}>
                Out of Stock
              </Text>
            )}
          </View>

          <Text style={[styles.productTitle, { color: theme.text }]}>{product.name}</Text>

          {product.vendor?.name ? (
            <Text style={[styles.vendorText, { color: theme.textSecondary }]}>
              Sold by {product.vendor.name}
            </Text>
          ) : null}

          {reviewCount > 0 && (
            <View style={styles.ratingRow}>
              <Icon name="star" size={16} color="#f59e0b" />
              <Text style={[styles.ratingVal, { color: theme.text }]}>{rating.toFixed(1)}</Text>
              <Text style={[styles.ratingCount, { color: theme.textSecondary }]}>
                ({reviewCount} customer {reviewCount === 1 ? 'review' : 'reviews'})
              </Text>
            </View>
          )}

          <View style={styles.priceContainer}>
            <Text style={[styles.price, { color: theme.primary }]}>{formatGHS(price)}</Text>
            {oldPrice ? (
              <Text style={[styles.originalPrice, { color: theme.textSecondary }]}>
                {formatGHS(oldPrice)}
              </Text>
            ) : null}
            {discountPercent ? (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercent}% OFF</Text>
              </View>
            ) : null}
          </View>

          {/* Variant Selector */}
          {variants.length > 1 && (
            <>
              <View style={styles.sectionDivider} />
              <Text style={[styles.sectionLabel, { color: theme.text }]}>Options</Text>
              <View style={styles.colorRow}>
                {variants.map((variant) => {
                  const isSelected = variant.id === selectedVariant?.id;
                  const outOfStock = (variant.inventory?.stock ?? 0) <= 0;
                  return (
                    <TouchableOpacity
                      key={variant.id}
                      disabled={outOfStock}
                      style={[
                        styles.colorChip,
                        {
                          backgroundColor: isSelected ? theme.primary : theme.backgroundElement,
                          borderColor: isSelected ? theme.primary : theme.border,
                          opacity: outOfStock ? 0.4 : 1,
                        },
                      ]}
                      onPress={() => setSelectedVariantId(variant.id)}
                    >
                      <Text
                        style={[
                          styles.colorChipText,
                          { color: isSelected ? '#ffffff' : theme.text },
                        ]}
                      >
                        {variantLabel(variant)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {/* Quantity Controls */}
          <Text style={[styles.sectionLabel, { color: theme.text, marginTop: 12 }]}>
            Quantity
          </Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, { borderColor: theme.border }]}
              onPress={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={!inStock}
            >
              <Icon name="remove" size={18} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.qtyVal, { color: theme.text }]}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, { borderColor: theme.border }]}
              onPress={() => setQuantity((q) => (stock ? Math.min(stock, q + 1) : q + 1))}
              disabled={!inStock}
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

          {/* Write a Review */}
          <View style={styles.sectionDivider} />
          <Text style={[styles.sectionLabel, { color: theme.text }]}>Write a Review</Text>
          {session ? (
            <View style={[styles.reviewForm, { borderColor: theme.border, backgroundColor: theme.backgroundElement }]}>
              <View style={styles.reviewStarPicker}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setReviewRating(i)}
                    hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
                  >
                    <Icon
                      name="star"
                      size={26}
                      color={i <= reviewRating ? '#f59e0b' : '#e0e0e0'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={[styles.reviewInput, { borderColor: theme.border, color: theme.text }]}
                placeholder="Share your thoughts about this product..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={3}
                value={reviewComment}
                onChangeText={setReviewComment}
              />
              {reviewError ? <Text style={styles.reviewFormError}>{reviewError}</Text> : null}
              <TouchableOpacity
                style={[styles.reviewSubmitBtn, { backgroundColor: theme.primary, opacity: submittingReview ? 0.7 : 1 }]}
                onPress={handleSubmitReview}
                disabled={submittingReview}
              >
                <Text style={styles.reviewSubmitText}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.reviewSignInPrompt, { borderColor: theme.border }]}
              onPress={() => router.push('/auth/sign-in')}
            >
              <Text style={[styles.reviewSignInText, { color: theme.textSecondary }]}>
                Sign in to write a review
              </Text>
            </TouchableOpacity>
          )}

          {/* Reviews */}
          <View style={styles.sectionDivider} />
          <Text style={[styles.sectionLabel, { color: theme.text }]}>
            Customer Reviews ({product.reviews?.length ?? 0})
          </Text>
          {product.reviews && product.reviews.length > 0 ? (
            <View style={styles.reviewsList}>
              {product.reviews.map((review) => (
                <View key={review.id} style={[styles.reviewCard, { borderColor: theme.border }]}>
                  <View style={styles.reviewHeaderRow}>
                    <View style={styles.reviewStars}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Icon
                          key={i}
                          name="star"
                          size={13}
                          color={i <= review.rating ? '#f59e0b' : '#e0e0e0'}
                        />
                      ))}
                    </View>
                    <Text style={[styles.reviewDate, { color: theme.textMuted }]}>
                      {new Date(review.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                  {review.comment ? (
                    <Text style={[styles.reviewComment, { color: theme.textSecondary }]}>
                      {review.comment}
                    </Text>
                  ) : null}
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.noReviewsText, { color: theme.textSecondary }]}>
              No reviews yet. Be the first to share your thoughts!
            </Text>
          )}

          {/* Related Products */}
          {(relatedLoading || relatedProducts.length > 0) && (
            <>
              <View style={styles.sectionDivider} />
              <Text style={[styles.sectionLabel, { color: theme.text }]}>
                {categoryName ? `More from ${categoryName}` : 'Related Products'}
              </Text>
              {relatedLoading ? (
                <View style={styles.relatedRow}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} width={150} height={210} borderRadius={8} />
                  ))}
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.relatedRow}
                >
                  {relatedProducts.map((prod) => {
                    const { price, oldPrice } = getProductPricing(prod);
                    const { rating, reviews } = getProductRating(prod);
                    return (
                      <ProductCard
                        key={prod.id}
                        id={prod.id}
                        cartItemId={getCartItemId(prod)}
                        name={prod.name}
                        price={formatGHS(price, false)}
                        originalPrice={oldPrice ? formatGHS(oldPrice, false) : undefined}
                        image={getProductImage(prod) ?? ''}
                        category={getProductCategoryName(prod) ?? 'Shop'}
                        rating={rating}
                        reviews={reviews}
                        inStock={getProductInStock(prod)}
                        badge={oldPrice ? 'SALE' : undefined}
                        layout="grid"
                        style={styles.relatedCard}
                        onPress={() => router.push(`/product/${prod.id}`)}
                        onAddToCart={() => addRelatedToCart(prod)}
                      />
                    );
                  })}
                </ScrollView>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom Sticky Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View style={styles.bottomBarRow}>
          <TouchableOpacity
            style={[
              styles.addToCartBtn,
              {
                backgroundColor: !inStock
                  ? theme.textMuted
                  : justAdded
                    ? theme.success
                    : theme.primary,
              },
            ]}
            onPress={handleAddToCart}
            disabled={!inStock}
            activeOpacity={0.85}
          >
            <Icon name={justAdded ? 'checkmark-circle' : 'cart-outline'} size={20} color="#ffffff" />
            <Text style={styles.addToCartText}>
              {!inStock ? 'Out of Stock' : justAdded ? 'Added to Cart' : `Add ${quantity} to Cart`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.viewCartBtn, { borderColor: theme.border }]}
            onPress={() => router.push('/cart')}
            activeOpacity={0.85}
          >
            <Icon name="cart-outline" size={20} color={theme.text} />
            {cartCount > 0 && (
              <View style={[styles.cartCountBadge, { backgroundColor: theme.primary }]}>
                <Text style={styles.cartCountBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 24,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.light.text,
    marginTop: 8,
  },
  stateSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: Colors.light.textSecondary,
  },
  stateButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  stateButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 80,
  },
  imageContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailRow: {
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  thumbnailWrapper: {
    width: 56,
    height: 56,
    borderRadius: 8,
    borderWidth: 2,
    overflow: 'hidden',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
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
  vendorText: {
    fontSize: 13,
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
    flexWrap: 'wrap',
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
    flexWrap: 'wrap',
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
  reviewsList: {
    gap: 10,
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 11,
  },
  reviewComment: {
    fontSize: 13,
    lineHeight: 19,
  },
  noReviewsText: {
    fontSize: 13,
    lineHeight: 19,
  },
  reviewForm: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  reviewStarPicker: {
    flexDirection: 'row',
    gap: 8,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    minHeight: 72,
    textAlignVertical: 'top',
  },
  reviewFormError: {
    fontSize: 12,
    color: Colors.light.error,
  },
  reviewSubmitBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  reviewSubmitText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  reviewSignInPrompt: {
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  reviewSignInText: {
    fontSize: 13,
    fontWeight: '600',
  },
  relatedRow: {
    gap: 12,
    paddingVertical: 4,
  },
  relatedCard: {
    width: 150,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  bottomBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addToCartBtn: {
    flex: 1,
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
  viewCartBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartCountBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
});
