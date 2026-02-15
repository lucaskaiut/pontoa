import React from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../../../components/DataTable";
import { Order } from "../types";

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
  pagination?: {
    meta: any;
    links: any;
  };
  handlePageChange?: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  handleSort?: (column: string, direction: "asc" | "desc") => void;
  filters: {
    status?: string;
    customer_id?: number;
  };
  setFilters: (filters: { status?: string; customer_id?: number }) => void;
  formatPrice: (price: number) => string;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
}

export function OrderList({
  orders,
  isLoading,
  pagination,
  handlePageChange,
  sortColumn,
  sortDirection,
  handleSort,
  filters,
  setFilters,
  formatPrice,
  getStatusLabel,
  getStatusColor,
}: OrderListProps) {
  const navigate = useNavigate();

  function handleRowClick(order: Order) {
    if (order.id) {
      navigate(`/pedidos/${order.id}`);
    }
  }

  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <h1 className="mt-4 md:mt-8 ml-4 md:ml-10 text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">Pedidos</h1>
      <div className="bg-white dark:bg-dark-surface m-4 md:m-10 rounded-2xl px-4 md:px-10 flex flex-col gap-3 py-6 md:py-10 border border-gray-100 dark:border-dark-border">
        <div className="flex gap-4 mb-4">
          <select
            value={filters.status || ""}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text"
          >
            <option value="">Todos os status</option>
            <option value="paid">Pago</option>
            <option value="pending">Aguardando Pagamento</option>
            <option value="canceled">Cancelado</option>
            <option value="refunded">Reembolsado</option>
          </select>
        </div>
        <DataTable
          columns={[
            { key: "id", label: "ID", sortable: true },
            { key: "customer", label: "Cliente", render: (item: Order) => item.customer?.name || "-" },
            { key: "total_amount", label: "Total", sortable: true, render: (item: Order) => formatPrice(item.total_amount) },
            { key: "status", label: "Status", sortable: true, render: (item: Order) => (
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                {getStatusLabel(item.status)}
              </span>
            )},
            { key: "payment_method", label: "Método", render: (item: Order) => item.payment_method || "-" },
            { key: "created_at", label: "Data", sortable: true, render: (item: Order) => item.created_at ? moment(item.created_at).format("DD/MM/YYYY HH:mm") : "-" },
          ]}
          data={orders}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={handlePageChange}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          onSort={handleSort}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  );
}

