import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { OrderService } from "../services/OrderService";
import type { Order } from "../services/OrderService";

export default function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  async function loadOrder() {
    if (!orderId) return;
    try {
      setLoading(true);
      const response = await OrderService.get(Number(orderId));
      setOrder(response.data);
    } catch (error) {
      console.error("Erro ao carregar pedido:", error);
      navigate("/meus-pedidos");
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  }

  function formatDate(dateStr: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
        <Header showBackButton />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-text-secondary">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
      <Header showBackButton />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-surface rounded-2xl p-8 text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Pedido Confirmado!</h1>
          <p className="text-text-secondary">
            Seu pedido foi processado com sucesso
          </p>
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-white/10 mb-6">
          <h2 className="text-lg font-bold text-text-primary mb-4">Detalhes do Pedido</h2>
          
          <div className="space-y-3 mb-4">
            <div className="flex justify-between">
              <span className="text-text-secondary">Pedido #</span>
              <span className="text-text-primary font-semibold">{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-secondary">Data</span>
              <span className="text-text-primary">{formatDate(order.created_at)}</span>
            </div>
            {order.paid_at && (
              <div className="flex justify-between">
                <span className="text-text-secondary">Data de Pagamento</span>
                <span className="text-text-primary">{formatDate(order.paid_at)}</span>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-4 mb-4">
            <h3 className="text-text-primary font-semibold mb-3">Itens</h3>
            {order.items && order.items.length > 0 && (
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-text-primary font-medium">{item.description}</p>
                      <p className="text-text-secondary text-sm">
                        {item.quantity}x {formatPrice(item.unit_price)}
                      </p>
                    </div>
                    <p className="text-text-primary font-semibold">
                      {formatPrice(item.total_price)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t-2 border-primary/20 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-text-primary font-bold text-lg">Total</span>
              <span className="text-primary font-bold text-2xl">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate("/meus-pedidos")}
            className="flex-1 py-3 bg-surface hover:bg-white/10 text-text-primary font-semibold rounded-xl transition-all border border-white/10"
          >
            Ver Meus Pedidos
          </button>
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-all"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
}

