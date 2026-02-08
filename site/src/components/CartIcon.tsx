import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CartService } from "../services/CartService";
import { useCartDrawer } from "../contexts/CartDrawerContext";

export function CartIcon() {
  const { openDrawer } = useCartDrawer();
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousCount, setPreviousCount] = useState(0);

  const { data: cartResponse } = useQuery({
    queryKey: ["cart"],
    queryFn: () => CartService.getCart(),
    refetchInterval: 3000,
    retry: false,
  });

  const cart = cartResponse?.data;
  const itemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  useEffect(() => {
    if (itemCount > previousCount) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
    setPreviousCount(itemCount);
  }, [itemCount, previousCount]);

  function handleClick() {
    openDrawer();
  }

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-text-secondary hover:text-text-primary transition-colors"
      aria-label="Carrinho de compras"
    >
      <svg
        className={`w-6 h-6 transition-transform duration-300 ${isAnimating ? "scale-125" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
      {itemCount > 0 && (
        <span
          className={`absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-xs font-bold text-white bg-primary rounded-full transition-all duration-300 ${
            isAnimating ? "scale-125 animate-pulse" : ""
          }`}
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}

