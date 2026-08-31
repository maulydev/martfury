import React from 'react';
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
import { SafeImage } from '@/components/ui/safe-image';
import { MartfuryHeader } from '@/components/ui/martfury-header';
import { MartfuryFooter } from '@/components/ui/martfury-footer';
import { Colors } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const featurePillars = [
    {
      icon: 'truck-outline',
      title: 'Free Delivery',
      subtitle: 'For all orders over $99',
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

  const topCategories = [
    {
      id: 'cat-1',
      name: 'Groceries',
      image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'cat-2',
      name: 'Beauty',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'cat-3',
      name: 'Home & Garden',
      image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'cat-4',
      name: 'Furniture',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'cat-5',
      name: 'Electronics',
      image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=400&auto=format&fit=crop',
    },
  ];

  const groceryProducts = [
    {
      id: 'g-1',
      name: 'Organic Fresh Salad',
      price: '$12.00',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'g-2',
      name: 'Aged Balsamic Vinegar',
      price: '$29.00',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'g-3',
      name: 'Himalayan Pink Salt',
      price: '$15.00',
      image: 'https://images.unsplash.com/photo-1518110165389-9e8a867c4e51?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'g-4',
      name: 'Organic Avocado Oil',
      price: '$49.00',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'g-5',
      name: 'Manuka Honey MGO 400+',
      price: '$199.00',
      image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'g-6',
      name: 'Organic Matcha Powder',
      price: '$25.00',
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'g-7',
      name: 'Extra Virgin Olive Oil',
      price: '$129.00',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'g-8',
      name: 'Premium Roast Coffee Beans',
      price: '$18.00',
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400&auto=format&fit=crop',
    },
  ];

  const summerFashionProducts = [
    {
      id: 'sf-1',
      name: 'Waterproof Wayfarer Sunglasses',
      price: '$199.00',
      rating: '5.0',
      reviews: '12',
      points: [
        'High quality durable lightweight frame',
        'Ergonomic design for maximum comfort',
        '100% UV400 polarization protection',
      ],
      image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'sf-2',
      name: 'Gold Stud Earrings Set',
      price: '$259.00',
      rating: '4.8',
      reviews: '8',
      points: [
        'Pure 14k gold polished finish',
        'Hypoallergenic lightweight design',
        'Includes luxury gift presentation box',
      ],
      image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'sf-3',
      name: 'Summer Linen Trousers',
      price: '$688.00',
      rating: '4.9',
      reviews: '15',
      points: [
        '100% organic breathable linen fabric',
        'Tailored relaxed fit for summer wear',
        'Easy care machine washable material',
      ],
      image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'sf-4',
      name: 'Classic Leather Overcoat',
      price: '$7900.00',
      rating: '5.0',
      reviews: '21',
      points: [
        'Genuine handcrafted premium leather',
        'Soft inner lining with internal pockets',
        'Timeless stylish winter coat silhouette',
      ],
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=400&auto=format&fit=crop',
    },
  ];

  const electronicsProducts = [
    {
      id: 'el-1',
      name: 'Kindle Paperwhite',
      price: '$1499.00',
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'el-2',
      name: 'Dell XPS 13 Plus',
      price: '$1999.00',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'el-3',
      name: 'iPad Air 5',
      price: '$1500.00',
      image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'el-4',
      name: 'Fujifilm X100V',
      price: '$11000.00',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'el-5',
      name: 'Samsung Galaxy Watch 6',
      price: '$2500.00',
      image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'el-6',
      name: 'Wireless Headphones',
      price: '$490.00',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'el-7',
      name: 'iPhone 15 Pro',
      price: '$1299.00',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'el-8',
      name: 'Minimal Desk Setup',
      price: '$1999.00',
      image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=400&auto=format&fit=crop',
    },
  ];

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
            {featurePillars.map((item, idx) => (
              <View key={idx} style={styles.featureItem}>
                <Icon name={item.icon as any} size={28} color="#2962ff" />
                <View style={styles.featureTextWrapper}>
                  <Text style={styles.featureTitle}>{item.title}</Text>
                  <Text style={styles.featureSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* 3. TOP CATEGORIES OF THE MONTH */}
          <View style={styles.sectionWrapper}>
            <Text style={styles.sectionHeaderTitle}>Top categories of the month</Text>
            <View style={styles.categoriesRow}>
              {topCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryBox}
                  onPress={() => router.push('/shop')}
                  activeOpacity={0.85}
                >
                  <View style={styles.categoryImageWrapper}>
                    <Image
                      source={{ uri: cat.image }}
                      style={styles.categoryImage}
                      resizeMode="cover"
                    />
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
              {groceryProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  id={prod.id}
                  name={prod.name}
                  price={prod.price}
                  image={prod.image}
                  category="Groceries"
                  layout="grid"
                  onPress={() => router.push('/shop')}
                  onAddToCart={() => router.push('/cart')}
                />
              ))}
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
                {summerFashionProducts.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    id={prod.id}
                    name={prod.name}
                    price={prod.price}
                    image={prod.image}
                    category="Fashion"
                    rating={parseFloat(prod.rating)}
                    reviews={parseInt(prod.reviews, 10)}
                    badge="SALE"
                    layout="grid"
                    onPress={() => router.push('/shop')}
                    onAddToCart={() => router.push('/cart')}
                  />
                ))}
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
              {electronicsProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  id={prod.id}
                  name={prod.name}
                  price={prod.price}
                  image={prod.image}
                  category="Electronics"
                  layout="grid"
                  onPress={() => router.push('/shop')}
                  onAddToCart={() => router.push('/cart')}
                />
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Martfury Bottom Footer */}
      <MartfuryFooter />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  featureItem: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
