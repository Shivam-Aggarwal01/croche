import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const stored = localStorage.getItem('cozycacoon_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cozycacoon_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = (item) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId && i.size === item.size);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  const updateQuantity = (productId, size, quantity) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.productId === productId && i.size === size ? { ...i, quantity } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeItem = (productId, size) => {
    setCartItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  };

  const clearCart = () => setCartItems([]);

  const cartCount = useMemo(() => cartItems.reduce((sum, i) => sum + i.quantity, 0), [cartItems]);
  const cartTotal = useMemo(() => cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0), [cartItems]);

  const value = {
    cartItems,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    cartCount,
    cartTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
