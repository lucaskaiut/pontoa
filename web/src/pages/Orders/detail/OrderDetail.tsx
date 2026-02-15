import React from "react";
import moment from "moment";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Icon } from "@mdi/react";
import { mdiArrowLeft } from "@mdi/js";
import { OrderService } from "../../../services/orderService";
import { Order } from "../types";

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () => OrderService.get(Number(id!)),
    enabled: !!id,
  });

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  }

  function formatDate(dateStr: string | null | undefined): string {
    if (!dateStr) return "-";
    return moment(dateStr).format("DD/MM/YYYY HH:mm");
  }

  function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      paid: "Pago",
      pending: "Aguardando Pagamento",
      canceled: "Cancelado",
      refunded: "Reembolsado",
      new: "Novo",
    };
    return labels[status] || status;
  }

  function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      canceled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }

  function handleBack() {
    navigate("/pedidos");
  }

  if (isLoading) {
    return (
      <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 dark:text-dark-text">Carregando detalhes do pedido...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
        <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl px-4 md:px-10 py-6 md:py-10 border border-gray-100 dark:border-dark-border">
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">Erro ao carregar pedido</p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-primary dark:bg-blue-600 text-white rounded-lg hover:opacity-90 transition-all"
            >
              Voltar para Lista
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <div className="mt-4 md:mt-8 ml-4 md:ml-10 mb-4">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-gray-600 dark:text-dark-text hover:text-primary dark:hover:text-blue-400 transition-colors mb-4"
        >
          <Icon path={mdiArrowLeft} size={1} />
          <span>Voltar</span>
        </button>
        <h1 className="text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">
          Detalhes do Pedido #{order.id}
        </h1>
      </div>

      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl px-4 md:px-10 py-6 md:py-10 border border-gray-100 dark:border-dark-border">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-gray-200 dark:border-dark-border">
            <div>
              <h2 className="text-lg font-semibold text-navy-900 dark:text-dark-text mb-2">
                Informações do Pedido
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Criado em {formatDate(order.created_at)}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">ID do Pedido</p>
              <p className="text-navy-900 dark:text-dark-text font-medium">#{order.id}</p>
            </div>
            {order.customer && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Cliente</p>
                <p className="text-navy-900 dark:text-dark-text font-medium">{order.customer.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{order.customer.email}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data de Criação</p>
              <p className="text-navy-900 dark:text-dark-text font-medium">{formatDate(order.created_at)}</p>
            </div>
            {order.paid_at && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Data de Pagamento</p>
                <p className="text-navy-900 dark:text-dark-text font-medium">{formatDate(order.paid_at)}</p>
              </div>
            )}
            {order.payment_method && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Método de Pagamento</p>
                <p className="text-navy-900 dark:text-dark-text font-medium capitalize">{order.payment_method}</p>
              </div>
            )}
            {order.payment_reference && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Referência de Pagamento</p>
                <p className="text-navy-900 dark:text-dark-text font-medium font-mono text-sm">
                  {order.payment_reference}
                </p>
              </div>
            )}
          </div>

          {order.items && order.items.length > 0 && (
            <div className="pt-6 border-t border-gray-200 dark:border-dark-border">
              <h3 className="text-lg font-semibold text-navy-900 dark:text-dark-text mb-4">Itens do Pedido</h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border"
                  >
                    <div className="flex-1">
                      <p className="text-navy-900 dark:text-dark-text font-medium mb-1">{item.description}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span>Quantidade: {item.quantity}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Unitário: {formatPrice(item.unit_price)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-navy-900 dark:text-dark-text font-bold text-lg">
                        {formatPrice(item.total_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6 border-t-2 border-primary dark:border-blue-600">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-navy-900 dark:text-dark-text">Total do Pedido</span>
              <span className="text-2xl md:text-3xl font-bold text-primary dark:text-blue-400">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

