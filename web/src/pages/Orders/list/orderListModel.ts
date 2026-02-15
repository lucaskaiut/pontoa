import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { OrderService } from "../../../services/orderService";
import { Order } from "../types";

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

interface PaginationLinks {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
}

interface UseOrderListReturn {
  orders: Order[];
  isLoading: boolean;
  pagination?: {
    meta: PaginationMeta;
    links: PaginationLinks;
  };
  handlePageChange: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  handleSort: (column: string, direction: "asc" | "desc") => void;
  filters: {
    status?: string;
    customer_id?: number;
  };
  setFilters: (filters: { status?: string; customer_id?: number }) => void;
  formatPrice: (price: number) => string;
  getStatusLabel: (status: string) => string;
  getStatusColor: (status: string) => string;
}

export function useOrderList(): UseOrderListReturn {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<{ status?: string; customer_id?: number }>({});

  const { data: ordersData, isLoading } = useQuery<{
    data: Order[];
    meta?: PaginationMeta;
    links?: PaginationLinks;
  } | Order[]>({
    queryKey: ["orders", { page: currentPage, sort: sortColumn ? `${sortColumn},${sortDirection.toUpperCase()}` : undefined, ...filters }],
    queryFn: async () => {
      const params: any = { page: currentPage, exclude_status: "new" };
      if (sortColumn) {
        params.sort = `${sortColumn},${sortDirection.toUpperCase()}`;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.customer_id) {
        params.customer_id = filters.customer_id;
      }
      const result = await OrderService.list(params);
      return result;
    },
  });

  const orders = useMemo(() => {
    if (!ordersData) return [];
    if (Array.isArray(ordersData)) {
      return ordersData;
    }
    return ordersData.data || [];
  }, [ordersData]);

  const pagination = useMemo(() => {
    if (!ordersData || Array.isArray(ordersData)) return undefined;
    if (ordersData.meta && ordersData.links) {
      return {
        meta: ordersData.meta,
        links: ordersData.links,
      };
    }
    return undefined;
  }, [ordersData]);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleSort = (column: string, direction: "asc" | "desc"): void => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  const getStatusLabel = (status: string): string => {
    const labels: Record<string, string> = {
      paid: "Pago",
      pending: "Aguardando Pagamento",
      canceled: "Cancelado",
      refunded: "Reembolsado",
      new: "Novo",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      canceled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      refunded: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      new: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  };

  return {
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
  };
}

