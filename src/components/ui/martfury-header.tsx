import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from './icon';
import { Colors } from '@/constants/theme';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useSession } from '@/lib/auth-client';

export function MartfuryHeader() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  const cartCount = useCartStore((s) => s.getCount());
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const { data: session } = useSession();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleSearch = () => {
    const q = searchQuery.trim();
    router.push(q ? { pathname: '/shop', params: { q } } : '/shop');
  };

  return (
    <View style={styles.headerContainer}>
      {/* Top Header Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          {/* Top Row: Logo + Actions (Wishlist, Cart, Account) */}
          <View style={styles.brandRow}>
            <TouchableOpacity
              style={styles.logoContainer}
              onPress={() => router.push('/')}
              activeOpacity={0.8}
            >
              <Text style={styles.logoText}>
                mart<Text style={styles.logoAccent}>fury</Text>
              </Text>
              <View style={styles.logoDot} />
            </TouchableOpacity>

            {/* Actions: Wishlist, Cart, Account */}
            <View style={styles.actionsContainer}>
              {/* Wishlist */}
              <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/wishlist')}>
                <View style={styles.iconBadgeWrapper}>
                  <Icon name="heart-outline" size={22} color="#333" />
                  {wishlistCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{wishlistCount > 99 ? '99+' : wishlistCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Cart */}
              <TouchableOpacity style={styles.actionItem} onPress={() => router.push('/cart')}>
                <View style={styles.iconBadgeWrapper}>
                  <Icon name="cart-outline" size={22} color="#333" />
                  {cartCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* Account (signed-out only — signed-in users use the Account tab) */}
              {!session && (
                <TouchableOpacity
                  style={styles.accountItem}
                  onPress={() => router.push('/auth/sign-in')}
                >
                  <Icon name="person-outline" size={24} color="#333" />
                  {isDesktop && (
                    <View style={styles.accountTextContainer}>
                      <Text style={styles.accountSub}>Hello</Text>
                      <Text style={styles.accountMain}>Register / Sign in</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Search Bar */}
          <View style={styles.searchSection}>
            {isDesktop && (
              <TouchableOpacity
                style={styles.categoryDropdown}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={styles.categoryDropdownText} numberOfLines={1}>
                  {selectedCategory}
                </Text>
                <Icon name="chevron-down" size={14} color="#666" />
              </TouchableOpacity>
            )}

            <View style={styles.searchInputContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="I'm shopping for..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </View>

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Icon name="search-outline" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
  },
  topBar: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  topBarContent: {
    width: '100%',
    maxWidth: 1200,
    gap: 12,
  },
  brandRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    position: 'relative',
  },
  logoText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: '#000000',
    fontWeight: '900',
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffaa00',
    marginLeft: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  searchSection: {
    width: '100%',
    flexDirection: 'row',
    height: 42,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
  },
  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRightWidth: 1,
    borderRightColor: '#e1e4e8',
    gap: 6,
    minWidth: 120,
  },
  categoryDropdownText: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
  },
  searchInputContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  searchInput: {
    fontSize: 14,
    color: '#333333',
    padding: 0,
  },
  searchButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  actionItem: {
    padding: 4,
  },
  iconBadgeWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: '#ff4d4f',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountTextContainer: {
    gap: 1,
  },
  accountSub: {
    fontSize: 11,
    color: '#888888',
  },
  accountMain: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333333',
  },
  navBar: {
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
  },
  navBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  navItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  navItemText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
