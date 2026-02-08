import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { companyRecurrencyService } from "../../../services/companyRecurrencyService";
import { Payment } from "../types";

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

interface UsePaymentListReturn {
  payments: Payment[];
  isLoading: boolean;
  pagination?: {
    meta: PaginationMeta;
    links: PaginationLinks;
  };
  handlePageChange: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  handleSort: (column: string, direction: "asc" | "desc") => void;
}

export function usePaymentList(): UsePaymentListReturn {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { data: paymentsData, isLoading } = useQuery<{
    data: Payment[];
    meta?: PaginationMeta;
    links?: PaginationLinks;
  } | Payment[]>({
    queryKey: ["payments", { page: currentPage, sort: sortColumn ? `${sortColumn},${sortDirection.toUpperCase()}` : undefined }],
    queryFn: async () => {
      const params: any = { page: currentPage };
      if (sortColumn) {
        params.sort = `${sortColumn},${sortDirection.toUpperCase()}`;
      }
      const result = await companyRecurrencyService.list(params);
      return result;
    },
  });

  const payments = useMemo(() => {
    if (!paymentsData) return [];
    if (Array.isArray(paymentsData)) {
      return paymentsData;
    }
    return paymentsData.data || [];
  }, [paymentsData]);

  const pagination = useMemo(() => {
    if (!paymentsData || Array.isArray(paymentsData)) return undefined;
    if (paymentsData.meta && paymentsData.links) {
      return {
        meta: paymentsData.meta,
        links: paymentsData.links,
      };
    }
    return undefined;
  }, [paymentsData]);

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleSort = (column: string, direction: "asc" | "desc"): void => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  return {
    payments,
    isLoading,
    pagination,
    handlePageChange,
    sortColumn,
    sortDirection,
    handleSort,
  };
}

