import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  addItem: (item) => {
    const items = get().items;
    const existing = items.find(i => i.id === item.id);
    if (existing) {
      set({ items: items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i) });
    } else {
      set({ items: [...items, { ...item, quantity: 1 }] });
    }
  },
  removeItem: (id) => {
    set({ items: get().items.filter(i => i.id !== id) });
  },
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((total, item) => total + (item.price * item.quantity), 0),
}));
