import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { ProductCard } from '@/components/ui/product-card';
import { ProductCardSkeleton } from '@/components/ui/product-card-skeleton';
import { SafeImage } from '@/components/ui/safe-image';
import { MartfuryHeader } from '@/components/ui/martfury-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Colors } from '@/constants/theme';
import { formatGHS } from '@/lib/currency';
import {
  getCategories,
  getProducts,
  getProductPricing,
  getProductImage,
  getProductCategoryName,
  getProductRating,
  getDefaultVariant,
  getCartItemId,
  type ApiCategory,
  type ApiProduct,
} from '@/lib/catalog';
import { useCartStore } from '@/stores/cart.store';
import { useToastStore } from '@/stores/toast.store';

const featurePillars = [
  {
    icon: 'truck-outline',
    title: 'Free Delivery',
    subtitle: 'For all orders over ₵400',
  },
  {
    icon: 'refresh-outline',
    title: '90 Days Return',
    subtitle: 'If goods have problems',
  },
  {
    icon: 'shield-checkmark-outline',
    title: 'Secure Payment',
    subtitle: '100% secure payment',
  },
  {
    icon: 'headset-outline',
    title: '24/7 Support',
    subtitle: 'Dedicated support',
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [groceryProducts, setGroceryProducts] = useState<ApiProduct[]>([]);
  const [fashionProducts, setFashionProducts] = useState<ApiProduct[]>([]);
  const [electronicsProducts, setElectronicsProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);

  // Quick "Add to cart" from a product card — uses the same default variant
  // as the price shown on the card (mirrors the web shop's pickDisplayVariant).
  const addProductToCart = useCallback(
    (prod: ApiProduct) => {
      const { price } = getProductPricing(prod);
      const variant = getDefaultVariant(prod);
      addItem({
        id: variant?.id ?? prod.id,
        name: prod.name,
        price,
        image: getProductImage(prod) ?? '',
      });
      useToastStore.getState().show(`${prod.name} added to cart`);
    },
    [addItem],
  );

  const loadHomeData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, groceries, fashion, electronics] = await Promise.all([
        getCategories({ limit: 6 }),
        getProducts({ category: 'groceries', limit: 8 }),
        getProducts({ category: 'fashion', limit: 4 }),
        getProducts({ category: 'electronics', limit: 8 }),
      ]);
      setCategories(cats);
      setGroceryProducts(groceries.products);
      setFashionProducts(fashion.products);
      setElectronicsProducts(electronics.products);
    } catch (e) {
      setError(
        e instanceof Error && e.name === 'AbortError'
          ? 'The request timed out. Check that the backend is running and reachable.'
          : e instanceof Error
            ? e.message
            : 'Could not load the shop right now.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHomeData();
  }, [loadHomeData]);

  if (error) {
    return (
      <View style={[styles.stateContainer, { backgroundColor: Colors.light.background }]}>
        <Icon name="close-circle" size={64} color={Colors.light.error} />
        <Text style={styles.stateTitle}>Couldn't load the shop</Text>
        <Text style={styles.stateSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.stateButton} onPress={loadHomeData}>
          <Text style={styles.stateButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Martfury Top Header */}
      <MartfuryHeader />

      <View style={styles.bodyWrapper}>
        <View style={styles.mainContentContainer}>
          {/* 1. HERO SECTION */}
          <View style={[styles.heroGrid, isDesktop ? styles.heroGridDesktop : styles.heroGridMobile]}>
            {/* Left Big Main Hero Banner */}
            <View style={[styles.heroMainCard, isDesktop && { flex: 2 }]}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?q=80&w=1200&auto=format&fit=crop' }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <View style={styles.heroOverlay}>
                <Text style={styles.heroBadge}>EXCLUSIVE DEALS</Text>
                <Text style={styles.heroTitle}>Smart Modern Gadgets</Text>
                <Text style={styles.heroDiscountTag}>Up to 50% Off</Text>
                <Text style={styles.heroSubtitle}>
                  Experience the real sound with high-res audio selected headphone choices
                </Text>
                <View style={styles.heroButtonRow}>
                  <TouchableOpacity
                    style={styles.heroPrimaryButton}
                    onPress={() => router.push('/shop')}
                  >
                    <Text style={styles.heroPrimaryButtonText}>Shop Now</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push('/shop')}>
                    <Text style={styles.heroLinkText}>View all deals</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Right Column Cards (2-column on mobile, stacked on desktop) */}
            <View style={[styles.heroSideColumn, isDesktop ? styles.heroSideColumnDesktop : styles.heroSideColumnMobile]}>
              {/* Card 1 */}
              <View style={styles.heroSideCard}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=800&auto=format&fit=crop' }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
                <View style={styles.sideCardOverlay}>
                  <Text style={styles.sideCardBadge}>BEST SELLER</Text>
                  <Text style={styles.sideCardTitle}>Accessories Collection</Text>
                  <TouchableOpacity
                    style={styles.sideCardLinkRow}
                    onPress={() => router.push('/shop')}
                  >
                    <Text style={styles.sideCardLink}>Shop Now</Text>
                    <Icon name="arrow-forward" size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Card 2 */}
              <View style={styles.heroSideCard}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop' }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
                <View style={styles.sideCardOverlay}>
                  <Text style={styles.sideCardBadge}>CLEARANCE</Text>
                  <Text style={styles.sideCardTitle}>Premium Audio Experience</Text>
                  <Text style={styles.sideCardSub}>Up to 40% Off</Text>
                  <TouchableOpacity
                    style={styles.sideCardLinkRow}
                    onPress={() => router.push('/shop')}
                  >
                    <Text style={styles.sideCardLink}>Shop Now</Text>
                    <Icon name="arrow-forward" size={14} color="#ffffff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* 2. FEATURE PILLARS BAR */}
          <View style={styles.featuresContainer}>
            {featurePillars.map((item, idx) => {
              // Assumes a fixed 2-column grid (matches the 4 pillars above).
              const isRightColumn = idx % 2 === 1;
              const isBottomRow = idx >= 2;
              return (
                <View
                  key={idx}
                  style={[
                    styles.featureItem,
                    isRightColumn && styles.featureItemRightColumn,
                    isBottomRow && styles.featureItemBottomRow,
                  ]}
                >
                  <Icon name={item.icon as any} size={28} color="#2962ff" />
                  <View style={styles.featureTextWrapper}>
                    <Text style={styles.featureTitle}>{item.title}</Text>
                    <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* 3. TOP CATEGORIES OF THE MONTH */}
          <View style={styles.sectionWrapper}>
            <Text style={styles.sectionHeaderTitle}>Top categories of the month</Text>
            <View style={styles.categoriesRow}>
              {loading
                ? Array.from({ length: 6 }).map((_, i) => (
                    <View key={i} style={styles.categoryBox}>
                      <Skeleton width={72} height={72} borderRadius={36} />
                      <Skeleton width="70%" height={12} />
                    </View>
                  ))
                : categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={styles.categoryBox}
                      onPress={() => router.push({ pathname: '/shop', params: { category: cat.slug } })}
                      activeOpacity={0.85}
                    >
                      <View style={styles.categoryImageWrapper}>
                        {cat.image && (
                          <Image
                            source={{ uri: cat.image }}
                            style={styles.categoryImage}
                            resizeMode="cover"
                          />
                        )}
                      </View>
                      <Text style={styles.categoryBoxName}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
            </View>
          </View>

          {/* 4. MID SPLIT PROMO BANNERS */}
          <View style={[styles.splitPromoGrid, !isDesktop && styles.splitPromoGridMobile]}>
            {/* Banner 1 */}
            <View style={styles.promoBannerCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=800&auto=format&fit=crop' }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <View style={styles.promoBannerOverlay}>
                <Text style={styles.promoBannerSub}>Kindle Paperwhite</Text>
                <Text style={styles.promoBannerTitle}>Kindle Paperwhite Reader</Text>
                <TouchableOpacity
                  style={styles.promoWhiteButton}
                  onPress={() => router.push('/shop')}
                >
                  <Text style={styles.promoWhiteButtonText}>Shop Now</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Banner 2 */}
            <View style={styles.promoBannerCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=800&auto=format&fit=crop' }}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              />
              <View style={styles.promoBannerOverlay}>
                <Text style={styles.promoBannerSub}>Dell XPS 13 Plus</Text>
                <Text style={styles.promoBannerTitle}>Performance Meets Modern Design</Text>
                <TouchableOpacity
                  style={styles.promoBlueButton}
                  onPress={() => router.push('/shop')}
                >
                  <Text style={styles.promoBlueButtonText}>Explore Deals</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* 5. FRESH GROCERIES & DAILY ESSENTIALS */}
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionHeaderTitle}>Fresh Groceries & Daily Essentials</Text>
              <TouchableOpacity onPress={() => router.push('/shop')}>
                <Text style={styles.viewAllLink}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.productsGrid}>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} layout="grid" />)
                : groceryProducts.map((prod) => {
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
                        category={getProductCategoryName(prod) ?? 'Groceries'}
                        rating={rating}
                        reviews={reviews}
                        badge={oldPrice ? 'SALE' : undefined}
                        layout="grid"
                        onPress={() => router.push(`/product/${prod.id}`)}
                        onAddToCart={() => addProductToCart(prod)}
                      />
                    );
                  })}
            </View>
          </View>

          {/* 6. SUMMER FASHION SHOWCASE */}
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionHeaderTitle}>Summer Fashion Showcase</Text>
              <TouchableOpacity onPress={() => router.push('/shop')}>
                <Text style={styles.viewAllLink}>View Collection</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.fashionShowcaseLayout}>
              {/* Full Width Banner */}
              <View style={styles.fashionTallBanner}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop' }}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                />
                <View style={styles.fashionBannerOverlay}>
                  <Text style={styles.fashionBannerBadge}>LIMITED EDITION</Text>
                  <Text style={styles.fashionBannerTitle}>Summer Fashion</Text>
                  <Text style={styles.fashionBannerSub}>Up to 70% off selected items</Text>
                  <TouchableOpacity
                    style={styles.fashionBannerButton}
                    onPress={() => router.push('/shop')}
                  >
                    <Text style={styles.fashionBannerButtonText}>Shop Collection</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 2-Column Product Grid */}
              <View style={styles.productsGrid}>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} layout="grid" />)
                  : fashionProducts.map((prod) => {
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
                          category={getProductCategoryName(prod) ?? 'Fashion'}
                          rating={rating}
                          reviews={reviews}
                          badge={oldPrice ? 'SALE' : undefined}
                          layout="grid"
                          onPress={() => router.push(`/product/${prod.id}`)}
                          onAddToCart={() => addProductToCart(prod)}
                        />
                      );
                    })}
              </View>
            </View>
          </View>

          {/* 7. DIGITAL ELECTRONICS & ACCESSORIES */}
          <View style={styles.sectionWrapper}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionHeaderTitle}>Digital Electronics & Accessories</Text>
              <TouchableOpacity onPress={() => router.push('/shop')}>
                <Text style={styles.viewAllLink}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.electronicsGrid}>
              {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <ProductCardSkeleton key={i} layout="grid" imageHeight={150} />
                  ))
                : electronicsProducts.map((prod) => {
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
                        category={getProductCategoryName(prod) ?? 'Electronics'}
                        rating={rating}
                        reviews={reviews}
                        badge={oldPrice ? 'SALE' : undefined}
                        layout="grid"
                        onPress={() => router.push(`/product/${prod.id}`)}
                        onAddToCart={() => addProductToCart(prod)}
                      />
                    );
                  })}
            </View>
          </View>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  bodyWrapper: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  mainContentContainer: {
    width: '100%',
    maxWidth: 1200,
    gap: 30,
  },

  /* 1. HERO SECTION */
  heroGrid: {
    gap: 20,
  },
  heroGridDesktop: {
    flexDirection: 'row',
    height: 380,
  },
  heroGridMobile: {
    flexDirection: 'column',
  },
  heroMainCard: {
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 280,
    position: 'relative',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: 30,
    justifyContent: 'center',
    gap: 12,
  },
  heroBadge: {
    color: '#00c853',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
  },
  heroDiscountTag: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    maxWidth: 420,
  },
  heroButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 10,
  },
  heroPrimaryButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 4,
  },
  heroPrimaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  heroLinkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  heroSideColumn: {
    gap: 14,
  },
  heroSideColumnMobile: {
    flexDirection: 'row',
  },
  heroSideColumnDesktop: {
    flexDirection: 'column',
    flex: 1,
  },
  heroSideCard: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 160,
    position: 'relative',
  },
  sideCardOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  sideCardBadge: {
    color: '#ffaa00',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sideCardTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 18,
  },
  sideCardSub: {
    color: 'rgba(255, 255, 255, 0.95)',
    fontSize: 12,
    fontWeight: '600',
  },
  sideCardLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  sideCardLink: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },

  /* 2. FEATURE PILLARS */
  featuresContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    overflow: 'hidden',
  },
  featureItem: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
  },
  featureItemRightColumn: {
    borderLeftWidth: 1,
    borderLeftColor: '#e1e4e8',
  },
  featureItemBottomRow: {
    borderTopWidth: 1,
    borderTopColor: '#e1e4e8',
  },
  featureTextWrapper: {
    flex: 1,
    gap: 2,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#222222',
  },
  featureSubtitle: {
    fontSize: 11,
    color: '#777777',
  },

  /* 3. TOP CATEGORIES */
  sectionWrapper: {
    gap: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222222',
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  categoriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  categoryBox: {
    width: '31.8%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    gap: 8,
  },
  categoryImageWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    backgroundColor: '#f8f8f8',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryBoxName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    lineHeight: 16,
  },

  /* 4. MID PROMO GRID */
  splitPromoGrid: {
    flexDirection: 'row',
    gap: 20,
    height: 180,
  },
  splitPromoGridMobile: {
    flexDirection: 'column',
    height: 'auto',
  },
  promoBannerCard: {
    flex: 1,
    minHeight: 180,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  promoBannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 24,
    justifyContent: 'center',
    gap: 8,
  },
  promoBannerSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
  },
  promoBannerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  promoWhiteButton: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  promoWhiteButtonText: {
    color: '#222222',
    fontWeight: '700',
    fontSize: 13,
  },
  promoBlueButton: {
    backgroundColor: Colors.light.primary,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  promoBlueButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },

  /* 5. GROCERIES GRID */
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  groceryCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    overflow: 'hidden',
  },
  groceryImageWrapper: {
    height: 140,
    backgroundColor: '#f9f9f9',
  },
  groceryImage: {
    width: '100%',
    height: '100%',
  },
  groceryInfo: {
    padding: 12,
    gap: 6,
  },
  groceryTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
    height: 36,
  },
  groceryPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#00c853',
  },

  /* 6. SUMMER FASHION */
  fashionShowcaseLayout: {
    gap: 16,
  },
  fashionTallBanner: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  fashionBannerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 20,
    justifyContent: 'center',
    gap: 6,
  },
  fashionBannerBadge: {
    color: '#ff9800',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  fashionBannerTitle: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
  },
  fashionBannerSub: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  fashionBannerButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  fashionBannerButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  fashionGridWrapper: {
    flex: 1,
  },

  /* 7. DIGITAL ELECTRONICS */
  electronicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 14,
  },
  electronicsCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    overflow: 'hidden',
  },
  electronicsImageWrapper: {
    height: 150,
    backgroundColor: '#f9f9f9',
  },
  electronicsImage: {
    width: '100%',
    height: '100%',
  },
  electronicsInfo: {
    padding: 12,
    gap: 6,
  },
  electronicsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222222',
  },
  electronicsPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.primary,
  },
});
