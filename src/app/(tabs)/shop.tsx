import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { ProductCard } from '@/components/ui/product-card';
import { MartfuryHeader } from '@/components/ui/martfury-header';
import { MartfuryFooter } from '@/components/ui/martfury-footer';
import { Colors } from '@/constants/theme';

export default function ShopScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sortBy, setSortBy] = useState('Sort by latest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilterDrawer, setShowMobileFilterDrawer] = useState(false);

  const categories = ['Groceries', 'Beauty', 'Home & Garden', 'Fashion', 'Electronics'];

  const allProducts = [
    {
      id: 'sp-1',
      name: 'Quinoa & Grain Bowl Kit',
      category: 'Groceries',
      price: 110.0,
      rating: 0,
      reviews: 0,
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'sp-2',
      name: 'Aged Balsamic Vinegar',
      category: 'Groceries',
      price: 220.0,
      rating: 0,
      reviews: 0,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'sp-3',
      name: 'Himalayan Pink Salt',
      category: 'Groceries',
      price: 45.0,
      rating: 5.0,
      reviews: 3,
      image: 'https://images.unsplash.com/photo-1518110165389-9e8a867c4e51?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'sp-4',
      name: 'Artisan Chocolate Bar Set',
      category: 'Groceries',
      price: 145.0,
      rating: 0,
      reviews: 0,
      image: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'sp-5',
      name: 'Manuka Honey MGO 400+',
      category: 'Groceries',
      price: 380.0,
      rating: 0,
      reviews: 0,
      image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'sp-6',
      name: 'Organic Matcha Powder',
      category: 'Groceries',
      price: 240.0,
      rating: 0,
      reviews: 0,
      image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'sp-7',
      name: 'Extra Virgin Olive Oil',
      category: 'Groceries',
      price: 120.0,
      rating: 0,
      reviews: 0,
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'sp-8',
      name: 'Premium Roast Coffee Beans',
      category: 'Groceries',
      price: 85.0,
      rating: 0,
      reviews: 0,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'sp-9',
      name: 'Organic Beard Oil',
      category: 'Beauty',
      price: 150.0,
      rating: 0,
      reviews: 0,
      image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'sp-10',
      name: 'Vitamin C Brightening Mask',
      category: 'Beauty',
      price: 299.0,
      rating: 0,
      reviews: 0,
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'sp-11',
      name: 'Mineral Sunscreen SPF 50',
      category: 'Beauty',
      price: 180.0,
      rating: 0,
      reviews: 0,
      image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop',
    },
    {
      id: 'sp-12',
      name: 'Matte Lipstick Quad',
      category: 'Beauty',
      price: 480.0,
      rating: 0,
      reviews: 0,
      image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=400&auto=format&fit=crop',
    },
  ];

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedRating(null);
    setMaxPrice(2000);
  };

  // Filtered Products Calculation
  const filteredProducts = allProducts.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 || selectedCategories.includes(prod.category);
    const matchesRating = selectedRating === null || prod.rating >= selectedRating;
    const matchesPrice = prod.price <= maxPrice;
    return matchesSearch && matchesCategory && matchesRating && matchesPrice;
  });

  const renderStars = (ratingCount: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Icon
          key={i}
          name="star"
          size={12}
          color={i <= ratingCount ? '#ff9800' : '#e0e0e0'}
        />
      );
    }
    return stars;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Martfury Top Header */}
      <MartfuryHeader />

      <View style={styles.bodyWrapper}>
        <View style={styles.mainContentContainer}>
          {/* Mobile Filter Toggle Button */}
          {!isDesktop && (
            <TouchableOpacity
              style={styles.mobileFilterToggleButton}
              onPress={() => setShowMobileFilterDrawer(!showMobileFilterDrawer)}
            >
              <Icon name="filter-outline" size={18} color="#ffffff" />
              <Text style={styles.mobileFilterToggleText}>
                {showMobileFilterDrawer ? 'Hide Filters' : 'Show Filters'}
              </Text>
            </TouchableOpacity>
          )}

          <View style={[styles.shopLayoutRow, !isDesktop && styles.shopLayoutMobile]}>
            {/* LEFT FILTER SIDEBAR */}
            {(isDesktop || showMobileFilterDrawer) && (
              <View style={[styles.sidebarContainer, !isDesktop && styles.sidebarMobile]}>
                {/* 1. SEARCH */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>SEARCH</Text>
                  <View style={styles.searchBox}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search products..."
                      placeholderTextColor="#999999"
                      value={searchQuery}
                      onChangeText={setSearchQuery}
                    />
                    <Icon name="search-outline" size={16} color="#999999" />
                  </View>
                </View>

                {/* 2. CATEGORIES */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>CATEGORIES</Text>
                  <View style={styles.checkboxList}>
                    {categories.map((cat) => {
                      const isChecked = selectedCategories.includes(cat);
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={styles.checkboxRow}
                          onPress={() => toggleCategory(cat)}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              isChecked && styles.checkboxSelected,
                            ]}
                          >
                            {isChecked && (
                              <Icon name="checkmark-circle" size={12} color="#ffffff" />
                            )}
                          </View>
                          <Text style={styles.checkboxLabel}>{cat}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 3. BY RATING */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>BY RATING</Text>
                  <View style={styles.ratingFilterList}>
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const isSelected = selectedRating === stars;
                      return (
                        <TouchableOpacity
                          key={stars}
                          style={styles.ratingRowOption}
                          onPress={() =>
                            setSelectedRating(isSelected ? null : stars)
                          }
                        >
                          <View
                            style={[
                              styles.radioCircle,
                              isSelected && styles.radioCircleSelected,
                            ]}
                          />
                          <View style={styles.starsGroup}>{renderStars(stars)}</View>
                          <Text style={styles.ratingTextLabel}>
                            {stars === 5 ? '5 Stars' : '& Up'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 4. BY PRICE */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>BY PRICE</Text>
                  <View style={styles.priceSliderTrack}>
                    <View style={styles.priceSliderFill} />
                    <View style={styles.priceSliderThumbLeft} />
                    <View style={styles.priceSliderThumbRight} />
                  </View>
                  <Text style={styles.priceLabelText}>
                    Price: <Text style={styles.priceBold}>$0 — ${maxPrice}</Text>
                  </Text>
                </View>

                {/* 5. FILTER ACTIONS */}
                <View style={styles.filterActions}>
                  <TouchableOpacity
                    style={styles.applyFiltersButton}
                    onPress={() => setShowMobileFilterDrawer(false)}
                  >
                    <Text style={styles.applyFiltersButtonText}>Apply Filters</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.resetFiltersButton}
                    onPress={handleResetFilters}
                  >
                    <Text style={styles.resetFiltersButtonText}>Reset</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* RIGHT CATALOG CONTENT */}
            <View style={styles.catalogContainer}>
              {/* Top Controls Bar */}
              <View style={styles.catalogTopBar}>
                <Text style={styles.foundCountText}>
                  <Text style={styles.foundCountBold}>
                    {filteredProducts.length}
                  </Text>{' '}
                  products found
                </Text>

                <View style={styles.topBarRightControls}>
                  {/* Sort Dropdown */}
                  <View style={styles.sortDropdown}>
                    <Text style={styles.sortDropdownLabel}>Sort by:</Text>
                    <TouchableOpacity style={styles.sortDropdownSelect}>
                      <Text style={styles.sortDropdownText}>{sortBy}</Text>
                      <Icon name="chevron-down" size={14} color="#666666" />
                    </TouchableOpacity>
                  </View>

                  {/* View Toggles */}
                  <View style={styles.viewToggleGroup}>
                    <TouchableOpacity
                      style={[
                        styles.viewToggleButton,
                        viewMode === 'grid' && styles.viewToggleButtonActive,
                      ]}
                      onPress={() => setViewMode('grid')}
                    >
                      <Icon
                        name="grid-outline"
                        size={16}
                        color={viewMode === 'grid' ? Colors.light.primary : '#666666'}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.viewToggleButton,
                        viewMode === 'list' && styles.viewToggleButtonActive,
                      ]}
                      onPress={() => setViewMode('list')}
                    >
                      <Icon
                        name="list-outline"
                        size={16}
                        color={viewMode === 'list' ? Colors.light.primary : '#666666'}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* PRODUCTS GRID OR LIST */}
              {viewMode === 'grid' ? (
                <View style={styles.productsGrid}>
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      id={prod.id}
                      name={prod.name}
                      price={prod.price}
                      image={prod.image}
                      category={prod.category}
                      rating={prod.rating}
                      reviews={prod.reviews}
                      layout="grid"
                      onPress={() => router.push(`/product/${prod.id}`)}
                      onAddToCart={() => router.push('/cart')}
                    />
                  ))}
                </View>
              ) : (
                /* LIST VIEW MODE */
                <View style={styles.productsList}>
                  {filteredProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      id={prod.id}
                      name={prod.name}
                      price={prod.price}
                      image={prod.image}
                      category={prod.category}
                      rating={prod.rating}
                      reviews={prod.reviews}
                      layout="list"
                      onPress={() => router.push(`/product/${prod.id}`)}
                      onAddToCart={() => router.push('/cart')}
                      onAddToWishlist={() => router.push('/shop')}
                    />
                  ))}
                </View>
              )}

              {/* PAGINATION */}
              <View style={styles.paginationContainer}>
                <TouchableOpacity style={styles.paginationButton}>
                  <Text style={styles.paginationText}>Prev</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.paginationButton, styles.paginationButtonActive]}
                >
                  <Text style={styles.paginationTextActive}>1</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.paginationButton}>
                  <Text style={styles.paginationText}>2</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.paginationButton}>
                  <Text style={styles.paginationText}>3</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.paginationButton}>
                  <Text style={styles.paginationText}>Next</Text>
                </TouchableOpacity>
              </View>
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
    gap: 10,
  },
  mobileFilterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    borderRadius: 4,
    gap: 8,
  },
  mobileFilterToggleText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  shopLayoutRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  shopLayoutMobile: {
    flexDirection: 'column',
    width: '100%',
  },

  /* SIDEBAR STYLES */
  sidebarContainer: {
    width: 250,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    padding: 20,
    gap: 24,
  },
  sidebarMobile: {
    width: '100%',
  },
  filterSection: {
    gap: 12,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111111',
    letterSpacing: 0.5,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 4,
    paddingHorizontal: 10,
    height: 38,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#333333',
  },
  checkboxList: {
    gap: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxSelected: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#444444',
  },
  ratingFilterList: {
    gap: 8,
  },
  ratingRowOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  radioCircleSelected: {
    borderColor: Colors.light.primary,
    borderWidth: 4,
  },
  starsGroup: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingTextLabel: {
    fontSize: 12,
    color: '#666666',
  },
  priceSliderTrack: {
    height: 4,
    backgroundColor: '#e1e4e8',
    borderRadius: 2,
    position: 'relative',
    marginVertical: 10,
  },
  priceSliderFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.light.primary,
  },
  priceSliderThumbLeft: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.light.primary,
    position: 'absolute',
    left: 0,
    top: -5,
  },
  priceSliderThumbRight: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.light.primary,
    position: 'absolute',
    right: 0,
    top: -5,
  },
  priceLabelText: {
    fontSize: 12,
    color: '#666666',
  },
  priceBold: {
    fontWeight: '700',
    color: '#222222',
  },
  filterActions: {
    gap: 10,
    marginTop: 6,
  },
  applyFiltersButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  applyFiltersButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 13,
  },
  resetFiltersButton: {
    borderWidth: 1,
    borderColor: '#e1e4e8',
    paddingVertical: 9,
    borderRadius: 4,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  resetFiltersButtonText: {
    color: '#666666',
    fontWeight: '600',
    fontSize: 13,
  },

  /* CATALOG STYLES */
  catalogContainer: {
    flex: 1,
    gap: 10,
  },
  catalogTopBar: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  foundCountText: {
    fontSize: 13,
    color: '#666666',
  },
  foundCountBold: {
    fontWeight: '800',
    color: '#222222',
  },
  topBarRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortDropdownLabel: {
    fontSize: 13,
    color: '#666666',
  },
  sortDropdownSelect: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
    backgroundColor: '#ffffff',
  },
  sortDropdownText: {
    fontSize: 13,
    color: '#333333',
  },
  viewToggleGroup: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  viewToggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
  },
  viewToggleButtonActive: {
    backgroundColor: '#e8f0fe',
  },

  /* GRID MODE */
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },
  gridProductCard: {
    width: '48.5%',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    overflow: 'hidden',
  },
  cardImageWrapper: {
    height: 140,
    backgroundColor: '#f9f9f9',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardInfo: {
    padding: 10,
    gap: 6,
  },
  gridProductTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.light.primary,
    height: 36,
  },
  cardRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewsCountText: {
    fontSize: 11,
    color: '#888888',
  },
  gridProductPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#222222',
  },
  addCartBlueButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: 9,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 4,
  },
  addCartBlueButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 12,
  },

  /* LIST MODE */
  productsList: {
    gap: 8,
  },
  listProductCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  listCardImage: {
    width: 100,
    height: 100,
    borderRadius: 6,
  },
  listCardDetails: {
    flex: 1,
    gap: 6,
  },
  listAddCartButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 4,
  },

  /* PAGINATION */
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  paginationButton: {
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#ffffff',
  },
  paginationButtonActive: {
    borderColor: Colors.light.primary,
    backgroundColor: '#ffffff',
  },
  paginationText: {
    fontSize: 13,
    color: '#666666',
  },
  paginationTextActive: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '700',
  },
});
