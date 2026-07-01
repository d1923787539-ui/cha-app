import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  storeId: null,
  
  addItem: (product, quantity = 1, customizations = {}) => {
    set(state => {
      // 如果购物车为空，记录门店
      if (state.items.length === 0 && product.storeId) {
        return { storeId: product.storeId };
      }
      
      // 检查是否已存在相同商品+定制
      const existIdx = state.items.findIndex(
        item => item.productId === product.id 
          && item.sugar === customizations.sugar
          && item.ice === customizations.ice
          && item.topping === customizations.topping
      );
      
      let newItems;
      if (existIdx >= 0) {
        newItems = state.items.map((item, i) =>
          i === existIdx ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        newItems = [...state.items, {
          id: Date.now().toString(),
          productId: product.id,
          name: product.name,
          imageUrl: product.imageUrl,
          price: product.price,
          quantity,
          sugar: customizations.sugar || '少糖',
          ice: customizations.ice || '正常冰',
          topping: customizations.topping || '不加料',
          addonPrice: customizations.addonPrice || 0,
          storeId: product.storeId || get().storeId,
        }];
      }
      
      return { items: newItems, storeId: product.storeId || get().storeId };
    });
  },
  
  removeItem: (id) => {
    set(state => ({
      items: state.items.filter(item => item.id !== id),
    }));
  },
  
  updateQuantity: (id, delta) => {
    set(state => ({
      items: state.items
        .map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)
        .filter(item => item.quantity > 0),
    }));
  },
  
  clearCart: () => set({ items: [], storeId: null }),
  
  getTotal: () => {
    return get().items.reduce((sum, item) => {
      return sum + (item.price + item.addonPrice) * item.quantity;
    }, 0);
  },
  
  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

export default useCartStore;
