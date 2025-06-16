'use client';

import { useCustomerClient } from '@/lib/customer-client';
import { type Cart } from '@commercetools/platform-sdk';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

interface CartContextType {
  cart: Cart | null;
  cartItemsCount: number;
  error: Error | null;
  loading: boolean;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { customerClient } = useCustomerClient();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshCart = useCallback(async (): Promise<void> => {
    if (!customerClient) {
      setCart(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const activeCart = await customerClient.getActiveCart();
      setCart(activeCart);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err);
      if (
        err instanceof Error &&
        (err.message.includes('invalid_scope') ||
          err.message.includes('insufficient_scope') ||
          err.message.includes('Permissions exceeded'))
      ) {
        try {
          const newCart = await customerClient.createCart();
          setCart(newCart);
          setError(null);
        } catch (createErr) {
          console.error('Error creating new cart:', createErr);
          setCart(null);
          setError(createErr instanceof Error ? createErr : new Error('Failed to create cart'));
        }
      } else {
        setError(err instanceof Error ? err : new Error('Failed to fetch cart'));
      }
    } finally {
      setLoading(false);
    }
  }, [customerClient]);

  const cartItemsCount = cart?.lineItems.reduce((total, item) => total + item.quantity, 0) || 0;

  useEffect(() => {
    if (customerClient) {
      refreshCart().catch((err) => {
        console.error('Error refreshing cart in useEffect:', err);
      });
    }
  }, [customerClient, refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItemsCount,
        error,
        loading,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
