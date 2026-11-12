import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem, ProductVariation } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, variation?: ProductVariation, selectedAttributes?: Record<string, string>) => void;
  removeFromCart: (productId: string, variationId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variationId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  subtotal: 0,
  isCartOpen: false,
  setIsCartOpen: () => {},
  isCheckoutOpen: false,
  setIsCheckoutOpen: () => {}
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('samuel_soren_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('samuel_soren_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (
    product: Product,
    quantity = 1,
    variation?: ProductVariation,
    selectedAttributes?: Record<string, string>
  ) => {
    const variationId = variation?.id;
    const effectivePrice = variation
      ? (variation.salePrice && variation.salePrice > 0 ? variation.salePrice : variation.price)
      : (product.discountPrice && product.discountPrice > 0 ? product.discountPrice : product.price);

    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.variationId === variationId
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.variationId === variationId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          variationId,
          selectedAttributes: selectedAttributes || variation?.attributes,
          effectivePrice
        }
      ];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, variationId?: string) => {
    setCart((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && (!variationId || item.variationId === variationId))
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, variationId?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variationId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.variationId === variationId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = cart.reduce((sum, item) => {
    const price = item.effectivePrice !== undefined
      ? item.effectivePrice
      : (item.product.discountPrice !== undefined && item.product.discountPrice > 0
          ? item.product.discountPrice
          : item.product.price);
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
