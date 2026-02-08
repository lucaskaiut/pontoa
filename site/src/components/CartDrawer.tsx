import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCartDrawer } from "../contexts/CartDrawerContext";
import { CartService } from "../services/CartService";
import { CartItem } from "./CartItem";
import type { CartItemData } from "./CartItem";

export function CartDrawer() {
  const { isOpen, closeDrawer } = useCartDrawer();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [updating, setUpdating] = useState(false);

  const { data: cartResponse, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: () => CartService.getCart(),
    enabled: isOpen,
  });

  const cart = cartResponse?.data;

  async function handleUpdateQuantity(itemId: number, quantity: number) {
    try {
      setUpdating(true);
      await CartService.updateItem(itemId, { quantity });
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
      toast.error("Erro ao atualizar quantidade. Tente novamente.");
    } finally {
      setUpdating(false);
    }
  }

  async function handleRemove(itemId: number) {
    try {
      setUpdating(true);
      await CartService.removeItem(itemId);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      console.error("Erro ao remover item:", error);
      toast.error("Erro ao remover item. Tente novamente.");
    } finally {
      setUpdating(false);
    }
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  }

  function handleCheckout() {
    if (cart && cart.id) {
      closeDrawer();
      navigate("/checkout");
    }
  }

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
      />
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-surface border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out shadow-xl ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-xl font-bold text-text-primary">Carrinho</h2>
            <button
              onClick={closeDrawer}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Fechar carrinho"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-text-secondary">Carregando carrinho...</p>
                </div>
              </div>
            ) : !cart || !cart.items || cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <svg className="w-16 h-16 mb-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="text-lg font-bold text-text-primary mb-2">Carrinho vazio</h3>
                <p className="text-text-secondary mb-6">Adicione itens ao carrinho para continuar</p>
                <button
                  onClick={closeDrawer}
                  className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-all"
                >
                  Continuar Comprando
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.items.map((item: CartItemData) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                    loading={updating}
                  />
                ))}
              </div>
            )}
          </div>

          {cart && cart.items && cart.items.length > 0 && (
            <div className="border-t border-white/10 p-4 bg-surface">
              <div className="flex items-center justify-between mb-4">
                <span className="text-text-primary font-semibold text-lg">Total</span>
                <span className="text-primary font-bold text-2xl">{formatPrice(cart.total_amount)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={updating || cart.items.length === 0}
                className="w-full py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Finalizar Compra
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

