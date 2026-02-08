import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/Header";
import { OrderService } from "../services/OrderService";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: orderResponse, isLoading, error } = useQuery({
    queryKey: ["order", id],
    queryFn: () => OrderService.get(Number(id!)),
    enabled: !!id,
  });

  const order = orderResponse?.data;

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

  function formatDateShort(dateStr: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
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
      paid: "bg-green-500/20 text-green-400 border-green-500/30",
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      canceled: "bg-red-500/20 text-red-400 border-red-500/30",
      refunded: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "paid":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "pending":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "canceled":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "refunded":
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return null;
    }
  }

  function handleBack() {
    navigate("/meus-pedidos");
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
        <Header showBackButton onBack={handleBack} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-surface rounded-2xl p-8 text-center border border-white/10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-text-secondary">Carregando detalhes do pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
        <Header showBackButton onBack={handleBack} />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-surface rounded-2xl p-8 text-center border border-white/10">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Erro ao carregar pedido</h2>
            <p className="text-text-secondary mb-6">Não foi possível carregar os detalhes do pedido.</p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-all"
            >
              Voltar para Meus Pedidos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background-dark">
      <Header showBackButton onBack={handleBack} />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-text-primary mb-2">Detalhes do Pedido</h1>
          <p className="text-text-secondary">Visualize todas as informações do seu pedido</p>
        </div>

        <div className="space-y-6">
          <div className="bg-surface rounded-2xl p-6 border border-white/10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Pedido #{order.id}</h2>
                <p className="text-text-secondary text-sm">{formatDateShort(order.created_at)}</p>
              </div>
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                {getStatusIcon(order.status)}
                <span>{getStatusLabel(order.status)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-white/10">
              <div>
                <p className="text-text-secondary text-sm mb-1">Data do Pedido</p>
                <p className="text-text-primary font-medium">{formatDate(order.created_at)}</p>
              </div>
              {order.paid_at && (
                <div>
                  <p className="text-text-secondary text-sm mb-1">Data de Pagamento</p>
                  <p className="text-text-primary font-medium">{formatDate(order.paid_at)}</p>
                </div>
              )}
              {order.payment_method && (
                <div>
                  <p className="text-text-secondary text-sm mb-1">Método de Pagamento</p>
                  <p className="text-text-primary font-medium capitalize">{order.payment_method}</p>
                </div>
              )}
              {order.payment_reference && (
                <div>
                  <p className="text-text-secondary text-sm mb-1">Referência de Pagamento</p>
                  <p className="text-text-primary font-medium font-mono text-sm">{order.payment_reference}</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-surface rounded-2xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Itens do Pedido</h3>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-white/5 rounded-xl border border-white/5 hover:border-primary/20 transition-all"
                  >
                    <div className="flex-1">
                      <p className="text-text-primary font-medium mb-1">{item.description}</p>
                      <div className="flex items-center gap-3 text-sm text-text-secondary">
                        <span>Quantidade: {item.quantity}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Unitário: {formatPrice(item.unit_price)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-text-primary font-bold text-lg">{formatPrice(item.total_price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-text-secondary">Nenhum item encontrado neste pedido</p>
              </div>
            )}
          </div>

          <div className="bg-surface rounded-2xl p-6 border border-white/10">
            <div className="flex items-center justify-between pt-2">
              <span className="text-text-primary font-bold text-lg">Total do Pedido</span>
              <span className="text-primary font-bold text-2xl md:text-3xl">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleBack}
              className="flex-1 py-3 bg-surface hover:bg-white/10 text-text-primary font-semibold rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Voltar para Meus Pedidos
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex-1 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

