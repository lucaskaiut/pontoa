'use client';

import { eventService } from '@/services/eventService';
import { Cart } from '../types/cart';
import { Item } from '../types/item';
import { Product } from '../types/product';
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PaymentMethod } from '@/types/company';
import Cookies from 'js-cookie';

type CartContextType = {
  addItem: (product: Product, quantity: number, cartId?: string) => void;
  removeItem: (item: Item, cartId: string) => void;
  changeQuantity: (item: Item, quantity: number, cartId: string) => void;
  getQuantity: () => number;
  addCart: () => Promise<Cart | null>;
  changeCartName: (name: string, cartId: string) => void;
  changeItemCart: (cartId: Cart['Guid'], itemId: Item['Guid']) => void;
  carts: Cart[];
  selectedPaymentMethod: string | null;
  changePaymentMethod: (paymentMethod: PaymentMethod) => void;
};

const CartContext = createContext<CartContextType>({
  addItem: () => Promise.resolve(),
  removeItem: () => Promise.resolve(),
  changeQuantity: () => Promise.resolve(),
  getQuantity: () => 0,
  addCart: () => Promise.resolve(null),
  changeCartName: () => Promise.resolve(),
  changeItemCart: () => Promise.resolve(),
  carts: [],
  selectedPaymentMethod: null,
  changePaymentMethod: () => Promise.resolve(),
});

const DEFAULT_CART_NAME = 'Carrinho padrão';
const DEFAULT_CODE = 1;
const DELAY_MS = 1000;

const generateRandomGuid = () => crypto.randomUUID();

const createNewItem = (product: Product, quantity: number): Item => ({
  Code: DEFAULT_CODE,
  Product: product,
  Quantity: quantity,
  Guid: generateRandomGuid(),
});

const createNewCart = (items: Item[] = []): Cart => ({
  Guid: generateRandomGuid(),
  Name: DEFAULT_CART_NAME,
  Code: DEFAULT_CODE,
  Items: items,
});

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  const changePaymentMethod = useCallback((paymentMethod: PaymentMethod) => {
    setSelectedPaymentMethod(paymentMethod.Guid);
    Cookies.set('selectedPaymentMethod', paymentMethod.Guid, { path: '/', expires: 7 });
    localStorage.setItem('selectedPaymentMethod', paymentMethod.Guid);
  }, []);

  const simulateAsyncOperation = async () =>
    new Promise((resolve) => setTimeout(resolve, DELAY_MS));

  const addItem = useCallback(async (product: Product, quantity: number, cartId?: string) => {
    await simulateAsyncOperation();

    let manipulatedCart = '';

    setCarts((prevCarts) => {
      if (prevCarts.length === 0) {
        const newCart = createNewCart([createNewItem(product, quantity)]);
        manipulatedCart = newCart.Guid;
        return [newCart];
      }

      if (cartId) {
        const cartExists = prevCarts.some((cart) => cart.Guid === cartId);

        if (!cartExists) {
          return [];
        }

        manipulatedCart = cartId;

        return prevCarts.map((cart) =>
          cart.Guid === cartId
            ? {
                ...cart,
                Items: [...cart.Items, createNewItem(product, quantity)],
              }
            : cart
        );
      }

      const [firstCart, ...restCarts] = prevCarts;

      manipulatedCart = firstCart.Guid;
      return [
        {
          ...firstCart,
          Items: [...firstCart.Items, createNewItem(product, quantity)],
        },
        ...restCarts,
      ];
    });
    console.log(manipulatedCart);
    eventService.dispatch('item-added', { cartId: manipulatedCart });
  }, []);

  const removeItem = useCallback(async (item: Item, cartId: string) => {
    await simulateAsyncOperation();

    setCarts((prevCarts) =>
      prevCarts.map((cart) =>
        cart.Guid === cartId
          ? {
              ...cart,
              Items: cart.Items.filter((i: Item) => i.Guid !== item.Guid),
            }
          : cart
      )
    );
  }, []);

  const changeQuantity = useCallback(
    async (item: Item, quantity: number, cartId: string) => {
      if (quantity === 0) {
        await removeItem(item, cartId);
        return;
      }

      await simulateAsyncOperation();

      setCarts((prevCarts) =>
        prevCarts.map((cart) =>
          cart.Guid === cartId
            ? {
                ...cart,
                Items: cart.Items.map((i) =>
                  i.Guid === item.Guid ? { ...i, Quantity: quantity } : i
                ),
              }
            : cart
        )
      );
    },
    [removeItem]
  );

  const getQuantity = useCallback(
    () =>
      carts.reduce(
        (total, cart) =>
          total + cart.Items.reduce((sum: number, item: Item) => sum + item.Quantity, 0),
        0
      ),
    [carts]
  );

  const addCart = useCallback(async () => {
    await simulateAsyncOperation();

    const cart = createNewCart();

    setCarts((prevCarts) => {
      return [...prevCarts, cart];
    });

    return cart;
  }, []);

  const changeCartName = useCallback(async (name: string, cartId: string) => {
    setCarts((prev) => {
      const updated = prev.map((cart) => (cart.Guid === cartId ? { ...cart, Name: name } : cart));

      return updated;
    });
  }, []);

  const changeItemCart = useCallback((cartId: Cart['Guid'], itemId: Item['Guid']) => {
    setCarts((prevCarts) => {
      let itemToMove: Item | undefined;

      const updatedCarts = prevCarts.map((cart) => {
        if (cart.Items.some((item) => item.Guid === itemId)) {
          const newItems = cart.Items.filter((item) => {
            if (item.Guid === itemId) {
              itemToMove = item;
              return false;
            }
            return true;
          });
          return { ...cart, Items: newItems };
        }

        return cart;
      });

      if (!itemToMove) {
        return prevCarts;
      }

      const finalCarts = updatedCarts.map((cart) => {
        if (cart.Guid === cartId) {
          return { ...cart, Items: [...cart.Items, itemToMove!] };
        }
        return cart;
      });

      return finalCarts;
    });
  }, []);

  useEffect(() => {
    const paymentMethod = Cookies.get('selectedPaymentMethod');

    if (paymentMethod) {
      setSelectedPaymentMethod(paymentMethod);
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        carts,
        addItem,
        removeItem,
        changeQuantity,
        getQuantity,
        addCart,
        changeCartName,
        changeItemCart,
        selectedPaymentMethod,
        changePaymentMethod,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
