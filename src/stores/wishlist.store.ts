import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Wishlist state, persisted the same way as the cart store (see
 * cart.store.ts) — AsyncStorage instead of the web app's localStorage.
 * Items are keyed by product id (not variant id like the cart): the
 * wishlist just remembers "I'm interested in this product", independent of
 * which variant a shopper eventually buys.
 */

export type WishlistItem = {
  id: string; // product id
  name: string;
  price: number | string;
  originalPrice?: number | string;
  image: string;
  category?: string;
  rating?: number;
  reviews?: number;
};

type WishlistState = {
  items: WishlistItem[];

  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  /** Adds the item if it isn't saved yet, otherwise removes it. */
  toggle: (item: WishlistItem) => void;
  clearWishlist: () => void;

  has: (id: string) => boolean;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        if (get().items.some((i) => i.id === item.id)) return;
        set({ items: [...get().items, item] });
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      toggle: (item) => {
        if (get().items.some((i) => i.id === item.id)) {
          set({ items: get().items.filter((i) => i.id !== item.id) });
        } else {
          set({ items: [...get().items, item] });
        }
      },

      clearWishlist: () => set({ items: [] }),

      has: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
