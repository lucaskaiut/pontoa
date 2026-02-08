import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { userService } from "../../../services/userService";
import toast from "react-hot-toast";
import { User } from "../types";
import { PaginationMeta, PaginationLinks } from "../../../components/DataTable";

interface UseUserListReturn {
  users: User[];
  isLoading: boolean;
  pagination?: {
    meta: PaginationMeta;
    links: PaginationLinks;
  };
  handleCreateClick: () => void;
  handleEditClick: (user: User) => void;
  handleDelete: (user: User) => void;
  handlePageChange: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  handleSort: (column: string, direction: "asc" | "desc") => void;
  filters: Record<string, any>;
  handleFilterChange: (key: string, value: any) => void;
  handleClearFilters: () => void;
}

export function useUserList(): UseUserListReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<Record<string, any>>({});

  const { data: usersData, isLoading } = useQuery<{
    data: User[];
    meta?: PaginationMeta;
    links?: PaginationLinks;
  } | User[]>({
    queryKey: [
      "users",
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
      if (filters.is_collaborator !== undefined && filters.is_collaborator !== "") {
        params.isCollaborator = filters.is_collaborator === "true" || filters.is_collaborator === true;
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
      const result = await userService.list(params);
      return result;
    },
  });

  const users = useMemo(() => {
    if (!usersData) return [];
    if (Array.isArray(usersData)) {
      return usersData;
    }
    return usersData.data || [];
  }, [usersData]);

  const pagination = useMemo(() => {
    if (!usersData || Array.isArray(usersData)) return undefined;
    if (usersData.meta && usersData.links) {
      return {
        meta: usersData.meta,
        links: usersData.links,
      };
    }
    return undefined;
  }, [usersData]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await userService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir usuário. Tente novamente.");
    },
  });

  const handleCreateClick = (): void => {
    navigate("/usuarios/criar");
  };

  const handleEditClick = (user: User): void => {
    if (!user.id) return;
    navigate(`/usuarios/${user.id}/editar`);
  };

  const handleDelete = (user: User): void => {
    if (!user.id) return;
    if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}?`)) {
      deleteMutation.mutate(user.id);
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
    users,
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

