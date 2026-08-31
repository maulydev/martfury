import { create } from 'zustand';

/**
 * Lightweight global toast queue. There's no cross-platform native toast API
 * in Expo, so this pairs with <Toast /> (mounted once in the root layout) to
 * render a small bottom banner — used for "Added to cart" style feedback
 * anywhere in the app via `useToastStore.getState().show(...)`.
 */

export type ToastMessage = {
  id: number;
  text: string;
  icon?: string;
};

type ToastState = {
  toast: ToastMessage | null;
  show: (text: string) => void;
  hide: () => void;
};

let nextId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toast: null,
  show: (text) => set({ toast: { id: nextId++, text } }),
  hide: () => set({ toast: null }),
}));
