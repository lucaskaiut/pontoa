import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { roleService } from "../../../services/roleService";
import toast from "react-hot-toast";
import { Role } from "../types";
import { PaginationMeta, PaginationLinks } from "../../../components/DataTable";

interface UseRoleListReturn {
  roles: Role[];
  isLoading: boolean;
  pagination?: {
    meta: PaginationMeta;
    links: PaginationLinks;
  };
  handleCreateClick: () => void;
  handleEditClick: (role: Role) => void;
  handleDelete: (role: Role) => void;
  handlePageChange: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  handleSort: (column: string, direction: "asc" | "desc") => void;
}

export function useRoleList(): UseRoleListReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { data: rolesData, isLoading } = useQuery<{
    data: Role[];
    meta?: PaginationMeta;
    links?: PaginationLinks;
  } | Role[]>({
    queryKey: ["roles", { page: currentPage, sort: sortColumn ? `${sortColumn},${sortDirection.toUpperCase()}` : undefined }],
    queryFn: async () => {
      const params: any = { page: currentPage };
      if (sortColumn) {
        params.sort = `${sortColumn},${sortDirection.toUpperCase()}`;
      }
      const result = await roleService.list(params);
      return result;
    },
  });

  const roles = useMemo(() => {
    if (!rolesData) return [];
    if (Array.isArray(rolesData)) {
      return rolesData;
    }
    if (rolesData && typeof rolesData === 'object' && 'data' in rolesData) {
      return Array.isArray(rolesData.data) ? rolesData.data : [];
    }
    return [];
  }, [rolesData]);

  const pagination = useMemo(() => {
    if (!rolesData) return undefined;
    
    if (Array.isArray(rolesData)) return undefined;
    
    if (rolesData && typeof rolesData === 'object' && !Array.isArray(rolesData)) {
      const meta = (rolesData as any).meta;
      const links = (rolesData as any).links;
      
      if (meta && links && typeof meta === 'object' && typeof links === 'object') {
        return {
          meta: meta as PaginationMeta,
          links: links as PaginationLinks,
        };
      }
    }
    
    return undefined;
  }, [rolesData]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await roleService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Perfil excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir perfil. Tente novamente.");
    },
  });

  const handleCreateClick = (): void => {
    navigate("/perfis/criar");
  };

  const handleEditClick = (role: Role): void => {
    if (!role.id) return;
    navigate(`/perfis/${role.id}/editar`);
  };

  const handleDelete = (role: Role): void => {
    if (!role.id) return;
    if (confirm(`Tem certeza que deseja excluir o perfil ${role.name}?`)) {
      deleteMutation.mutate(role.id);
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

  return {
    roles,
    isLoading,
    pagination,
    handleCreateClick,
    handleEditClick,
    handleDelete,
    handlePageChange,
    sortColumn,
    sortDirection,
    handleSort,
  };
}


