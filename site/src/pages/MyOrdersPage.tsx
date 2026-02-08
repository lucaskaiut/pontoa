import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/Header";
import { OrderService } from "../services/OrderService";
import type { Order } from "../services/OrderService";

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const response = await OrderService.listMyOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
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

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      paid: "Pago",
      pending: "Aguardando Pagamento",
      canceled: "Cancelado",
      refunded: "Reembolsado",
    };
    return labels[status] || status;
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      paid: "bg-green-500/20 text-green-400",
      pending: "bg-yellow-500/20 text-yellow-400",
      canceled: "bg-red-500/20 text-red-400",
      refunded: "bg-gray-500/20 text-gray-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
        <Header showBackButton />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-text-secondary">Carregando pedidos...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
      <Header showBackButton />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Meus Pedidos</h1>

        {orders.length === 0 ? (
          <div className="bg-surface rounded-2xl p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-xl font-bold text-text-primary mb-2">Nenhum pedido encontrado</h2>
            <p className="text-text-secondary mb-6">Você ainda não realizou nenhuma compra</p>
            <button
              onClick={() => navigate("/pacotes")}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-all"
            >
              Ver Pacotes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-surface rounded-2xl p-6 border border-white/10 hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => navigate(`/pedidos/${order.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary mb-1">
                      Pedido #{order.id}
                    </h3>
                    <p className="text-text-secondary text-sm">{formatDate(order.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="mb-4">
                  {order.items && order.items.length > 0 && (
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm">
                          <span className="text-text-secondary">
                            {item.quantity}x {item.description}
                          </span>
                          <span className="text-text-primary font-medium">
                            {formatPrice(item.total_price)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-text-secondary text-xs">
                          +{order.items.length - 3} {order.items.length - 3 === 1 ? "item" : "itens"}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-text-secondary text-sm">Total</span>
                  <span className="text-primary font-bold text-xl">
                    {formatPrice(order.total_amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

