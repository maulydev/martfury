import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { ProductCard } from '@/components/ui/product-card';
import { MartfuryHeader } from '@/components/ui/martfury-header';
import { Skeleton } from '@/components/ui/skeleton';
import { ProductCardSkeleton } from '@/components/ui/product-card-skeleton';
import { Colors } from '@/constants/theme';
import { formatGHS } from '@/lib/currency';
import {
  getCategories,
  getProducts,
  getProductPricing,
  getProductImage,
  getProductCategoryName,
  getProductRating,
  getProductInStock,
  getDefaultVariant,
  getCartItemId,
  type ApiCategory,
  type ApiProduct,
  type ApiPagination,
  type ProductSort,
} from '@/lib/catalog';
import { useCartStore } from '@/stores/cart.store';
import { useToastStore } from '@/stores/toast.store';

const PAGE_SIZE = 12;
const SKELETON_COUNT = 6;

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Sort by latest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'name_asc', label: 'Name: A to Z' },
];


export default function ShopScreen() {
  const router = useRouter();
  const routeParams = useLocalSearchParams<{ category?: string; q?: string }>();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const scrollRef = useRef<ScrollView>(null);
  const hasLoadedOnceRef = useRef(false);
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

  // Sidebar inputs, staged until "Apply Filters" is pressed (mirrors the
  // web shop's ShopSidebar — src/components/shop/shop-sidebar.tsx).
  const [searchInput, setSearchInput] = useState(routeParams.q ?? '');
  const [stagedCategories, setStagedCategories] = useState<string[]>(
    routeParams.category ? [routeParams.category] : [],
  );
  const [stagedRating, setStagedRating] = useState<number | null>(null);

  // Committed filters actually sent to the API.
  const [appliedSearch, setAppliedSearch] = useState(routeParams.q ?? '');
  const [appliedCategories, setAppliedCategories] = useState<string[]>(
    routeParams.category ? [routeParams.category] : [],
  );
  const [appliedRating, setAppliedRating] = useState<number | null>(null);

  const [sortBy, setSortBy] = useState<ProductSort>('newest');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [showMobileFilterDrawer, setShowMobileFilterDrawer] = useState(false);

  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [pagination, setPagination] = useState<ApiPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Category sidebar list — fetched once, independent of product filters.
  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((cats) => {
        if (!cancelled) setCategories(cats);
      })
      .catch(() => {
        // The category list is a nice-to-have filter; don't block the shop for it.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-sync when arriving here with new route params, e.g. tapping a
  // category on the home screen (router.push({ pathname: '/shop', params: { category } })).
  useEffect(() => {
    const cat = routeParams.category;
    const q = routeParams.q ?? '';
    setStagedCategories(cat ? [cat] : []);
    setSearchInput(q);
    setAppliedCategories(cat ? [cat] : []);
    setAppliedSearch(q);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeParams.category, routeParams.q]);

  const loadProducts = useCallback(async () => {
    if (!hasLoadedOnceRef.current) {
      setLoading(true);
    } else {
      setFetchingProducts(true);
    }
    setError(null);
    try {
      const result = await getProducts({
        q: appliedSearch || undefined,
        categories: appliedCategories.length ? appliedCategories : undefined,
        rating: appliedRating ?? undefined,
        sort: sortBy,
        page,
        limit: PAGE_SIZE,
      });
      setProducts(result.products);
      setPagination(result.pagination);
    } catch (e) {
      setError(
        e instanceof Error && e.name === 'AbortError'
          ? 'The request timed out. Check that the backend is running and reachable.'
          : e instanceof Error
            ? e.message
            : 'Could not load products right now.',
      );
    } finally {
      hasLoadedOnceRef.current = true;
      setLoading(false);
      setFetchingProducts(false);
    }
  }, [appliedSearch, appliedCategories, appliedRating, sortBy, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const goToPage = (p: number) => {
    setPage(p);
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const toggleCategory = (slug: string) => {
    setStagedCategories((prev) =>
      prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug],
    );
  };

  const handleApplyFilters = () => {
    setAppliedSearch(searchInput);
    setAppliedCategories(stagedCategories);
    setAppliedRating(stagedRating);
    setPage(1);
    setShowMobileFilterDrawer(false);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setStagedCategories([]);
    setStagedRating(null);
    setAppliedSearch('');
    setAppliedCategories([]);
    setAppliedRating(null);
    setPage(1);
  };

  const handleSelectSort = (value: ProductSort) => {
    setSortBy(value);
    setPage(1);
    setShowSortMenu(false);
  };

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

  const totalProducts = pagination?.total ?? products.length;
  const totalPages = pagination?.totalPages ?? 1;
  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Sort by latest';

  if (loading) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <MartfuryHeader />
        <View style={styles.bodyWrapper}>
          <View style={styles.mainContentContainer}>
            <View style={[styles.shopLayoutRow, !isDesktop && styles.shopLayoutMobile]}>
              {isDesktop && (
                <View style={styles.sidebarContainer}>
                  <View style={styles.filterSection}>
                    <Skeleton width={70} height={12} />
                    <Skeleton height={38} borderRadius={4} />
                  </View>
                  <View style={styles.filterSection}>
                    <Skeleton width={100} height={12} />
                    <View style={styles.checkboxList}>
                      {[70, 55, 65, 45, 60].map((w, i) => (
                        <Skeleton key={i} width={`${w}%`} height={13} />
                      ))}
                    </View>
                  </View>
                  <View style={styles.filterSection}>
                    <Skeleton width={90} height={12} />
                    <View style={styles.ratingFilterList}>
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} width="50%" height={13} />
                      ))}
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.catalogContainer}>
                <View style={styles.catalogTopBar}>
                  <Skeleton width={120} height={13} />
                  <Skeleton width={160} height={30} borderRadius={4} />
                </View>

                <View style={styles.productsGrid}>
                  {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                    <ProductCardSkeleton key={i} layout="grid" />
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (error) {
    return (
      <View style={[styles.stateContainer, { backgroundColor: Colors.light.background }]}>
        <Icon name="close-circle" size={64} color={Colors.light.error} />
        <Text style={styles.stateTitle}>Couldn't load the shop</Text>
        <Text style={styles.stateSubtitle}>{error}</Text>
        <TouchableOpacity style={styles.stateButton} onPress={() => loadProducts()}>
          <Text style={styles.stateButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView ref={scrollRef} style={styles.container} showsVerticalScrollIndicator={false}>
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
                      value={searchInput}
                      onChangeText={setSearchInput}
                      onSubmitEditing={handleApplyFilters}
                      returnKeyType="search"
                    />
                    <Icon name="search-outline" size={16} color="#999999" />
                  </View>
                </View>

                {/* 2. CATEGORIES */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionTitle}>CATEGORIES</Text>
                  <View style={styles.checkboxList}>
                    {categories.map((cat) => {
                      const isChecked = stagedCategories.includes(cat.slug);
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          style={styles.checkboxRow}
                          onPress={() => toggleCategory(cat.slug)}
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
                          <Text style={styles.checkboxLabel}>{cat.name}</Text>
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
                      const isSelected = stagedRating === stars;
                      return (
                        <TouchableOpacity
                          key={stars}
                          style={styles.ratingRowOption}
                          onPress={() =>
                            setStagedRating(isSelected ? null : stars)
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

                {/* 4. FILTER ACTIONS */}
                <View style={styles.filterActions}>
                  <TouchableOpacity
                    style={styles.applyFiltersButton}
                    onPress={handleApplyFilters}
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
                  <Text style={styles.foundCountBold}>{totalProducts}</Text>{' '}
                  products found
                </Text>

                <View style={styles.topBarRightControls}>
                  {/* Sort Dropdown */}
                  <View style={styles.sortDropdown}>
                    <Text style={styles.sortDropdownLabel}>Sort by:</Text>
                    <TouchableOpacity
                      style={styles.sortDropdownSelect}
                      onPress={() => setShowSortMenu(true)}
                    >
                      <Text style={styles.sortDropdownText}>{currentSortLabel}</Text>
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

              {fetchingProducts ? (
                viewMode === 'grid' ? (
                  <View style={styles.productsGrid}>
                    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                      <ProductCardSkeleton key={i} layout="grid" />
                    ))}
                  </View>
                ) : (
                  <View style={styles.productsList}>
                    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                      <ProductCardSkeleton key={i} layout="list" />
                    ))}
                  </View>
                )
              ) : products.length === 0 ? (
                <View style={styles.emptyState}>
                  <Icon name="search-outline" size={40} color="#cccccc" />
                  <Text style={styles.emptyStateTitle}>No products found</Text>
                  <Text style={styles.emptyStateSubtitle}>
                    Try adjusting your search or filters.
                  </Text>
                </View>
              ) : viewMode === 'grid' ? (
                <View style={styles.productsGrid}>
                  {products.map((prod) => {
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
                        onPress={() => router.push(`/product/${prod.id}`)}
                        onAddToCart={() => addProductToCart(prod)}
                      />
                    );
                  })}
                </View>
              ) : (
                /* LIST VIEW MODE */
                <View style={styles.productsList}>
                  {products.map((prod) => {
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
                        layout="list"
                        onPress={() => router.push(`/product/${prod.id}`)}
                        onAddToCart={() => addProductToCart(prod)}
                      />
                    );
                  })}
                </View>
              )}

              {/* PAGINATION */}
              {totalPages > 1 && (
                <View style={styles.paginationContainer}>
                  <TouchableOpacity
                    style={styles.paginationButton}
                    disabled={!pagination?.hasPrev}
                    onPress={() => goToPage(page - 1)}
                  >
                    <Text
                      style={[
                        styles.paginationText,
                        !pagination?.hasPrev && styles.paginationTextDisabled,
                      ]}
                    >
                      Prev
                    </Text>
                  </TouchableOpacity>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.paginationButton,
                        p === page && styles.paginationButtonActive,
                      ]}
                      onPress={() => goToPage(p)}
                    >
                      <Text
                        style={p === page ? styles.paginationTextActive : styles.paginationText}
                      >
                        {p}
                      </Text>
                    </TouchableOpacity>
                  ))}

                  <TouchableOpacity
                    style={styles.paginationButton}
                    disabled={!pagination?.hasNext}
                    onPress={() => goToPage(page + 1)}
                  >
                    <Text
                      style={[
                        styles.paginationText,
                        !pagination?.hasNext && styles.paginationTextDisabled,
                      ]}
                    >
                      Next
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* SORT OPTIONS MODAL */}
      <Modal
        visible={showSortMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSortMenu(false)}
      >
        <TouchableOpacity
          style={styles.sortModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSortMenu(false)}
        >
          <View style={styles.sortModalCard}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={styles.sortModalOption}
                onPress={() => handleSelectSort(opt.value)}
              >
                <Text
                  style={[
                    styles.sortModalOptionText,
                    opt.value === sortBy && styles.sortModalOptionTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
                {opt.value === sortBy && (
                  <Icon name="checkmark-circle" size={16} color={Colors.light.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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

  /* EMPTY STATE */
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 60,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
  },
  emptyStateSubtitle: {
    fontSize: 13,
    color: '#888888',
  },

  /* GRID MODE */
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
  },

  /* LIST MODE */
  productsList: {
    gap: 8,
  },

  /* PAGINATION */
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
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
  paginationTextDisabled: {
    color: '#cccccc',
  },
  paginationTextActive: {
    fontSize: 13,
    color: Colors.light.primary,
    fontWeight: '700',
  },

  /* SORT MODAL */
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sortModalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    paddingVertical: 8,
    overflow: 'hidden',
  },
  sortModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  sortModalOptionText: {
    fontSize: 14,
    color: '#333333',
  },
  sortModalOptionTextActive: {
    color: Colors.light.primary,
    fontWeight: '700',
  },
});
