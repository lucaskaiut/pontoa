import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

interface CartContextType {
  cartId: number | null;
  setCartId: (id: number | null) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_KEY = "cart_order_id";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartId, setCartIdState] = useState<number | null>(() => {
    const stored = localStorage.getItem(CART_ID_KEY);
    return stored ? Number(stored) : null;
  });

  function setCartId(id: number | null) {
    setCartIdState(id);
    if (id) {
      localStorage.setItem(CART_ID_KEY, id.toString());
    } else {
      localStorage.removeItem(CART_ID_KEY);
    }
  }

  function clearCart() {
    setCartId(null);
    localStorage.removeItem(CART_ID_KEY);
  }

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === CART_ID_KEY) {
        const newId = e.newValue ? Number(e.newValue) : null;
        setCartIdState(newId);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <CartContext.Provider value={{ cartId, setCartId, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

