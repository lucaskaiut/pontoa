import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { notificationService } from "../../../services/notificationService";
import toast from "react-hot-toast";
import { Notification } from "../types";
import { PaginationMeta, PaginationLinks } from "../../../components/DataTable";

interface UseNotificationListReturn {
  notifications: Notification[];
  isLoading: boolean;
  pagination?: {
    meta: PaginationMeta;
    links: PaginationLinks;
  };
  handleCreateClick: () => void;
  handleEditClick: (notification: Notification) => void;
  handleDelete: (notification: Notification) => void;
  formatTimeUnit: (unit: string) => string;
  getTimeDisplay: (notification: Notification) => string;
  stripHtml: (html: string) => string;
  handlePageChange: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  handleSort: (column: string, direction: "asc" | "desc") => void;
}

export function useNotificationList(): UseNotificationListReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { data: notificationsData, isLoading } = useQuery<{
    data: Notification[];
    meta?: PaginationMeta;
    links?: PaginationLinks;
  } | Notification[]>({
    queryKey: ["notifications", { page: currentPage, sort: sortColumn ? `${sortColumn},${sortDirection.toUpperCase()}` : undefined }],
    queryFn: async () => {
      const params: any = { page: currentPage };
      if (sortColumn) {
        params.sort = `${sortColumn},${sortDirection.toUpperCase()}`;
      }
      const result = await notificationService.list(params);
      return result;
    },
  });

  const notifications = useMemo(() => {
    if (!notificationsData) return [];
    if (Array.isArray(notificationsData)) {
      return notificationsData;
    }
    return notificationsData.data || [];
  }, [notificationsData]);

  const pagination = useMemo(() => {
    if (!notificationsData || Array.isArray(notificationsData)) return undefined;
    if (notificationsData.meta && notificationsData.links) {
      return {
        meta: notificationsData.meta,
        links: notificationsData.links,
      };
    }
    return undefined;
  }, [notificationsData]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await notificationService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notificação excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir notificação. Tente novamente.");
    },
  });

  const handleCreateClick = (): void => {
    navigate("/notificacoes/criar");
  };

  const handleEditClick = (notification: Notification): void => {
    if (!notification.id) return;
    navigate(`/notificacoes/${notification.id}/editar`);
  };

  const handleDelete = (notification: Notification): void => {
    if (!notification.id) return;
    if (confirm('Tem certeza que deseja excluir essa notificação?')) {
      deleteMutation.mutate(notification.id);
    }
  };

  const formatTimeUnit = (unit: string): string => {
    const units: Record<string, string> = {
      days: "dias",
      hours: "horas",
      minutes: "minutos",
    };
    return units[unit] || unit;
  };

  const getTimeDisplay = (notification: Notification): string => {
    if (!notification.time_before) return "-";
    return `${notification.time_before} ${formatTimeUnit(notification.time_unit)}`;
  };

  const stripHtml = (html: string): string => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
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
    notifications,
    isLoading,
    pagination,
    handleCreateClick,
    handleEditClick,
    handleDelete,
    formatTimeUnit,
    getTimeDisplay,
    stripHtml,
    handlePageChange,
    sortColumn,
    sortDirection,
    handleSort,
  };
}

