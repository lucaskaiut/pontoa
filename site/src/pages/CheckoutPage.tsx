import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Header } from "../components/Header";
import { OrderCheckout } from "../components/OrderCheckout";
import { LoginForm } from "../components/LoginForm";
import { OrderService } from "../services/OrderService";
import type { Order } from "../services/OrderService";
import { CartService } from "../services/CartService";
import { SettingsService } from "../services/SettingsService";
import type { PaymentData, Settings } from "../types";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthenticated(!!token);
    
    if (token) {
      loadOrder();
      loadSettings();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token && isAuthenticated) {
      loadOrder();
      loadSettings();
    }
  }, [isAuthenticated]);

  async function loadOrder() {
    const cartId = CartService.getCartId();
    if (!cartId) {
      toast.error("Carrinho não encontrado");
      navigate("/carrinho");
      return;
    }
    try {
      setLoading(true);
      const response = await OrderService.get(cartId);
      
      const orderData = 'data' in response ? response.data : response;
      
      if (orderData && orderData.id) {
        setOrder(orderData);
      } else {
        console.error("Resposta da API inválida - orderData:", orderData, "response:", response);
        toast.error("Erro ao carregar pedido. Tente novamente.");
        navigate("/carrinho");
      }
    } catch (error) {
      console.error("Erro ao carregar pedido:", error);
      toast.error("Erro ao carregar pedido. Tente novamente.");
      navigate("/carrinho");
    } finally {
      setLoading(false);
    }
  }

  async function loadSettings() {
    try {
      const settingsData = await SettingsService.getSettings();
      setSettings(settingsData);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  }

  async function handlePaymentComplete(paymentData: PaymentData) {
    if (!order) return;

    try {
      setProcessing(true);
      const response = await CartService.checkout(paymentData);
      
      const orderData = response.data || response;
      
      if (orderData && orderData.status === "pending" && orderData.payment_link) {
        setOrder(orderData);
        return;
      }
      
      navigate(`/pedido-confirmado/${order.id}`);
    } catch (error: any) {
      console.error("Erro ao processar pagamento:", error);
      toast.error(error.response?.data?.message || "Erro ao processar pagamento. Tente novamente.");
    } finally {
      setProcessing(false);
    }
  }

  function handleOrderUpdate(updatedOrder: Order) {
    setOrder(updatedOrder);
  }

  function handleCancel() {
    navigate("/carrinho");
  }

  function handleLoginSuccess() {
    setIsAuthenticated(true);
  }

  if (isAuthenticated === null || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
        <Header showBackButton onBack={handleCancel} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-text-secondary">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
        <Header showBackButton onBack={handleCancel} />
        <div className="max-w-md mx-auto px-4 py-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-text-primary mb-2">Checkout</h1>
            <p className="text-text-secondary">Faça login para finalizar seu pedido</p>
          </div>
          <LoginForm onLoginSuccess={handleLoginSuccess} compact />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
        <Header showBackButton onBack={handleCancel} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-surface rounded-2xl p-8 text-center">
            <p className="text-text-secondary">Pedido não encontrado</p>
            <button
              onClick={handleCancel}
              className="mt-4 px-6 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-all"
            >
              Voltar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activePaymentMethods = settings?.active_payment_methods || ["pagarmeCreditCard"];
  const requireCheckout = settings?.scheduling_require_checkout ?? true;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
      <Header showBackButton onBack={handleCancel} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <OrderCheckout
          order={order}
          activePaymentMethods={activePaymentMethods}
          onPaymentComplete={handlePaymentComplete}
          onCancel={handleCancel}
          loading={processing}
          requireCheckout={requireCheckout}
          onOrderUpdate={handleOrderUpdate}
        />
      </div>
    </div>
  );
}

