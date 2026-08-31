import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Cart state, mirroring the web app's zustand cart store
 * (~/Desktop/ecommerce-project/src/stores/cart.store.ts) so the two clients
 * behave the same way. The only difference is persistence: the web store
 * uses zustand/middleware's `persist` against localStorage, this one uses
 * the same `persist` against AsyncStorage (React Native has no localStorage).
 */

export type CartItem = {
  id: string; // variant id (falls back to product id for products without variants)
  name: string;
  price: number;
  image: string;
  qty: number;
};

type CartState = {
  items: CartItem[];

  addItem: (item: Omit<CartItem, 'qty'>) => void;
  addItemWithQty: (item: Omit<CartItem, 'qty'>, qty: number) => void;

  removeItem: (id: string) => void;
  increaseQty: (id: string) => void;
  decreaseQty: (id: string) => void;
  clearCart: () => void;

  getTotal: () => number;
  getCount: () => number;
  has: (id: string) => boolean;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.id === item.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, qty: i.qty + 1 } : i,
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, qty: 1 }] });
        }
      },

      // Add a specific qty (like on the product detail page).
      addItemWithQty: (item, qty) => {
        const safeQty = Math.max(1, Math.min(99, Math.floor(qty || 1)));
        const existing = get().items.find((i) => i.id === item.id);

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === item.id ? { ...i, qty: i.qty + safeQty } : i,
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, qty: safeQty }] });
        }
      },

      removeItem: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

      increaseQty: (id) =>
        set({
          items: get().items.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)),
        }),

      decreaseQty: (id) =>
        set({
          items: get()
            .items.map((i) => (i.id === id ? { ...i, qty: i.qty - 1 } : i))
            .filter((i) => i.qty > 0),
        }),

      clearCart: () => set({ items: [] }),

      getTotal: () => get().items.reduce((acc, i) => acc + i.price * i.qty, 0),
      getCount: () => get().items.reduce((acc, i) => acc + i.qty, 0),
      has: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
