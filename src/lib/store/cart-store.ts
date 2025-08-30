import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  type: 'template' | 'individual';
  templateId?: string;
  menuItemId?: string;
  name: string;
  quantity: number;
  panSize?: 'half' | 'full';
  unitPrice: number;
  servings?: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => set((state) => {
        const newItem = { ...item, id: crypto.randomUUID() };
        return { items: [...state.items, newItem] };
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      })),
      
      clearCart: () => set({ items: [] }),
      
      get subtotal() {
        return get().items.reduce((sum, item) => 
          sum + (item.unitPrice * item.quantity), 0
        );
      }
    }),
    {
      name: 'athletic-labs-cart',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);