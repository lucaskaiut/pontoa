import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Header } from "../components/Header";
import { CartItem } from "../components/CartItem";
import type { CartItemData } from "../components/CartItem";
import { LoginForm } from "../components/LoginForm";
import { CartService } from "../services/CartService";
import type { CartResponse } from "../services/CartService";

export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [cart, setCart] = useState<CartResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
    
    if (token) {
      loadCart();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token && isAuthenticated) {
      loadCart();
    }
  }, [isAuthenticated]);

  async function loadCart() {
    try {
      setLoading(true);
      const response = await CartService.getCart();
      setCart(response.data);
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateQuantity(itemId: number, quantity: number) {
    try {
      setUpdating(true);
      const response = await CartService.updateItem(itemId, { quantity });
      setCart(response.data);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
      toast.error("Erro ao atualizar quantidade. Tente novamente.");
      await loadCart();
    } finally {
      setUpdating(false);
    }
  }

  async function handleRemove(itemId: number) {
    try {
      setUpdating(true);
      await CartService.removeItem(itemId);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      await loadCart();
    } catch (error) {
      console.error("Erro ao remover item:", error);
      toast.error("Erro ao remover item. Tente novamente.");
      await loadCart();
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
      navigate("/checkout");
    }
  }

  function handleLoginSuccess() {
    setIsAuthenticated(true);
  }

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
        <Header showBackButton />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-text-secondary">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
        <Header showBackButton />
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Carrinho</h1>
            <p className="text-text-secondary">Faça login para acessar seu carrinho</p>
          </div>
          <LoginForm onLoginSuccess={handleLoginSuccess} compact />
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
        <Header showBackButton />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-surface rounded-2xl p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h2 className="text-xl font-bold text-text-primary mb-2">Carrinho vazio</h2>
            <p className="text-text-secondary mb-6">Adicione itens ao carrinho para continuar</p>
            <button
              onClick={() => navigate("/pacotes")}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-all"
            >
              Ver Pacotes
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
      <Header showBackButton />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Carrinho</h1>

        <div className="space-y-4 mb-6">
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

        <div className="bg-surface rounded-xl p-6 border border-white/10 mb-6">
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
      </div>
    </div>
  );
}

