import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { customerService } from "../../../services/customerService";
import toast from "react-hot-toast";
import { Customer } from "../types";
import { PaginationMeta, PaginationLinks } from "../../../components/DataTable";

interface UseCustomerListReturn {
  customers: Customer[];
  isLoading: boolean;
  pagination?: {
    meta: PaginationMeta;
    links: PaginationLinks;
  };
  handleCreateClick: () => void;
  handleEditClick: (customer: Customer) => void;
  handleDelete: (customer: Customer) => void;
  handlePageChange: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  handleSort: (column: string, direction: "asc" | "desc") => void;
  filters: Record<string, any>;
  handleFilterChange: (key: string, value: any) => void;
  handleClearFilters: () => void;
}

export function useCustomerList(): UseCustomerListReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<Record<string, any>>({});

  const { data: customersData, isLoading } = useQuery<{
    data: Customer[];
    meta?: PaginationMeta;
    links?: PaginationLinks;
  } | Customer[]>({
    queryKey: [
      "customers",
      {
        ...filters,
        page: currentPage,
        sort: sortColumn ? `${sortColumn},${sortDirection.toUpperCase()}` : undefined
      },
    ],
    queryFn: async () => {
      const params: any = { page: currentPage };

      if (filters.name) {
        params.name = filters.name;
      }
      if (filters.email) {
        params.email = filters.email;
      }
      if (filters.created_at_from) {
        params.createdAtFrom = filters.created_at_from;
      }
      if (filters.created_at_to) {
        params.createdAtTo = filters.created_at_to;
      }

      if (sortColumn) {
        params.sort = `${sortColumn},${sortDirection.toUpperCase()}`;
      }
      const result = await customerService.list(params);
      return result;
    },
  });

  const customers = useMemo(() => {
    if (!customersData) return [];
    if (Array.isArray(customersData)) {
      return customersData;
    }
    return customersData.data || [];
  }, [customersData]);

  const pagination = useMemo(() => {
    if (!customersData || Array.isArray(customersData)) return undefined;
    if (customersData.meta && customersData.links) {
      return {
        meta: customersData.meta,
        links: customersData.links,
      };
    }
    return undefined;
  }, [customersData]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await customerService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir cliente. Tente novamente.");
    },
  });

  const handleCreateClick = (): void => {
    navigate("/clientes/criar");
  };

  const handleEditClick = (customer: Customer): void => {
    if (!customer.id) return;
    navigate(`/clientes/${customer.id}/editar`);
  };

  const handleDelete = (customer: Customer): void => {
    if (!customer.id) return;
    if (confirm(`Tem certeza que deseja excluir o cliente ${customer.name}?`)) {
      deleteMutation.mutate(customer.id);
    }
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleSort = (column: string, direction: "asc" | "desc"): void => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, value: any): void => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = (): void => {
    setFilters({});
    setCurrentPage(1);
  };

  return {
    customers,
    isLoading,
    pagination,
    handleCreateClick,
    handleEditClick,
    handleDelete,
    handlePageChange,
    sortColumn,
    sortDirection,
    handleSort,
    filters,
    handleFilterChange,
    handleClearFilters,
  };
}

