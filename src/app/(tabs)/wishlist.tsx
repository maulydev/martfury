import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/ui/icon';
import { ProductCard } from '@/components/ui/product-card';
import { Colors } from '@/constants/theme';
import { useCartStore } from '@/stores/cart.store';
import { useWishlistStore } from '@/stores/wishlist.store';
import { useToastStore } from '@/stores/toast.store';
import { parseCurrency } from '@/lib/currency';

export default function WishlistScreen() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const wishlistItems = useWishlistStore((s) => s.items);
  const removeFromWishlist = useWishlistStore((s) => s.removeItem);

  const moveToCart = (id: string) => {
    const item = wishlistItems.find((w) => w.id === id);
    if (item) {
      addItem({
        id: item.id,
        name: item.name,
        // item.price is whatever was stored when it was favorited — for
        // items favorited from Shop/Home that's an already-formatted GHS
        // string (e.g. "₵45.00"), which plain Number()/parseFloat() can't
        // read (the ₵ breaks it, silently yielding 0). parseCurrency strips
        // the currency symbol/code first.
        price: typeof item.price === 'number' ? item.price : parseCurrency(String(item.price)),
        image: item.image,
      });
      useToastStore.getState().show(`${item.name} added to cart`);
    }
    removeFromWishlist(id);
    router.push('/cart');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.bodyWrapper}>
        <View style={styles.mainContentContainer}>
          {/* HEADER BAR */}
          <View style={styles.headerTitleRow}>
            <Text style={styles.pageTitle}>My Wishlist</Text>
            <Text style={styles.pageSubtitle}>
              {wishlistItems.length === 0
                ? 'Save items you love to buy them later'
                : `${wishlistItems.length} ${wishlistItems.length === 1 ? 'item' : 'items'} saved for later`}
            </Text>
          </View>

          {wishlistItems.length === 0 ? (
            /* EMPTY STATE */
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconCircle}>
                <Icon name="heart-outline" size={44} color="#999999" />
              </View>
              <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
              <Text style={styles.emptySubtitle}>
                Tap the heart icon on any product to save it here for later.
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => router.push('/shop')}
                activeOpacity={0.8}
              >
                <Text style={styles.exploreButtonText}>Explore Products</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.wishlistGrid}>
              {wishlistItems.map((item) => (
                <ProductCard
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  price={item.price}
                  originalPrice={item.originalPrice}
                  image={item.image}
                  category={item.category}
                  rating={item.rating}
                  reviews={item.reviews}
                  layout="grid"
                  onPress={() => router.push(`/product/${item.id}`)}
                  onAddToCart={() => moveToCart(item.id)}
                  onRemove={() => removeFromWishlist(item.id)}
                />
              ))}
            </View>
          )}
        </View>
      </View>
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
    gap: 12,
    paddingBottom: 24,
  },

  /* HEADER */
  headerTitleRow: {
    gap: 2,
    marginTop: 4,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#222222',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#666666',
  },

  /* EMPTY STATE */
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e4e8',
    padding: 32,
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#222222',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#666666',
    textAlign: 'center',
    maxWidth: 320,
  },
  exploreButton: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 4,
    marginTop: 6,
  },
  exploreButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },

  /* WISHLIST GRID */
  wishlistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 8,
    marginTop: 4,
  },
});
