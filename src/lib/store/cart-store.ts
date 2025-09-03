import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string;
  type: 'template' | 'individual';
  name: string;
  unitPrice: number;
  quantity: number;
  servings?: number;
  panSize?: 'half' | 'full';
  templateId?: string;
  menuItemId?: string;
  includedItems?: Array<{
    name: string;
    quantity: string;
  }>;
  substitutions?: Array<{
    original: string;
    replacement: string;
  }>;
  addOns?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  notes?: string;
  image?: string;
  category?: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Cart actions
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  // Drawer actions
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Computed values
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      
      addItem: (newItem) => {
        set((state) => {
          const existingItem = state.items.find(
            item => 
              item.templateId === newItem.templateId && 
              item.menuItemId === newItem.menuItemId &&
              item.panSize === newItem.panSize
          );
          
          if (existingItem) {
            // Update quantity of existing item
            return {
              items: state.items.map(item =>
                item.id === existingItem.id
                  ? { ...item, quantity: item.quantity + newItem.quantity }
                  : item
              )
            };
          } else {
            // Add new item
            const id = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            return {
              items: [...state.items, { ...newItem, id }]
            };
          }
        });
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== id)
        }));
      },
      
      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        
        set((state) => ({
          items: state.items.map(item =>
            item.id === id ? { ...item, quantity } : item
          )
        }));
      },
      
      clearCart: () => set({ items: [] }),
      
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      
      // Computed values
      get itemCount() {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
      
      get subtotal() {
        const state = get();
        return state.items.reduce((total, item) => {
          const itemTotal = item.unitPrice * item.quantity;
          const addOnsTotal = item.addOns?.reduce((sum, addon) => sum + (addon.price * addon.quantity), 0) || 0;
          return total + itemTotal + addOnsTotal;
        }, 0);
      },
      
      get tax() {
        return get().subtotal * 0.0875; // 8.75% tax rate
      },
      
      get total() {
        return get().subtotal + get().tax;
      },
    }),
    {
      name: 'athletic-labs-cart',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items, not UI state
    }
  )
);