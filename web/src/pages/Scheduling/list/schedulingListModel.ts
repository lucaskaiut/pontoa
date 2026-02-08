import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { schedulingService } from "../../../services/schedulingService";
import { serviceService } from "../../../services/serviceService";
import { userService } from "../../../services/userService";
import api from "../../../services/api";
import moment from "moment";
import toast from "react-hot-toast";
import { Scheduling, SchedulingEvent, Service, User } from "../types";
import { PaginationMeta, PaginationLinks } from "../../../components/DataTable";
import { parseUTCDate, toUTCStartOfDay, toUTCEndOfDay, toUTCDate } from "../../../utils/dateUtils";

interface UseSchedulingListReturn {
  schedulings: Scheduling[];
  hours: any[];
  events: SchedulingEvent[];
  services: Service[];
  users: User[];
  isLoading: boolean;
  pagination?: {
    meta: PaginationMeta;
    links: PaginationLinks;
  };
  handleNewSchedulingClick: () => void;
  handleEditSchedulingClick: (id: string | number) => void;
  handleEventDrop: (eventId: string | number, start: Date, end: Date) => void;
  handleSlotClick: (params?: any) => void;
  handleDelete: (scheduling: Scheduling) => void;
  handlePageChange: (page: number) => void;
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  handleSort: (column: string, direction: "asc" | "desc") => void;
  filters: Record<string, any>;
  handleFilterChange: (key: string, value: any) => void;
  handleClearFilters: () => void;
}

export function useSchedulingList(): UseSchedulingListReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<string | undefined>();
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<Record<string, any>>({
    date_from: moment().format("YYYY-MM-DD"),
  });

  const { data: servicesData = [] } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const result = await serviceService.list();
      return Array.isArray(result) ? result : result.data || [];
    },
  });

  const { data: usersData = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await userService.list();
      return Array.isArray(result) ? result : result.data || [];
    },
  });

  const services = useMemo(() => {
    return Array.isArray(servicesData) ? servicesData : [];
  }, [servicesData]);

  const users = useMemo(() => {
    return Array.isArray(usersData) ? usersData : [];
  }, [usersData]);

  const { data: schedulingsData, isLoading: isLoadingSchedulings } = useQuery<{
    data: Scheduling[];
    meta?: PaginationMeta;
    links?: PaginationLinks;
  } | Scheduling[]>({
    queryKey: [
      "schedulings",
      { 
        ...filters,
        page: currentPage,
        sort: sortColumn ? `${sortColumn},${sortDirection.toUpperCase()}` : undefined
      },
    ],
    queryFn: async () => {
      const params: any = {
        page: currentPage,
      };

      if (filters.date_from) {
        params.dateFrom = toUTCStartOfDay(filters.date_from);
      }
      if (filters.date_to) {
        params.dateTo = toUTCEndOfDay(filters.date_to);
      }
      if (filters.service) {
        params.service = filters.service;
      }
      if (filters.user) {
        params.user = filters.user;
      }
      if (filters.status) {
        params.status = filters.status;
      }

      if (sortColumn) {
        params.sort = `${sortColumn},${sortDirection.toUpperCase()}`;
      }

      const result = await schedulingService.list(params);
      return result;
    },
  });

  const schedulings = useMemo(() => {
    if (!schedulingsData) return [];
    if (Array.isArray(schedulingsData)) {
      return schedulingsData;
    }
    return schedulingsData.data || [];
  }, [schedulingsData]);

  const pagination = useMemo(() => {
    if (!schedulingsData || Array.isArray(schedulingsData)) return undefined;
    if (schedulingsData.meta && schedulingsData.links) {
      return {
        meta: schedulingsData.meta,
        links: schedulingsData.links,
      };
    }
    return undefined;
  }, [schedulingsData]);

  const { data: hours = [], isLoading: isLoadingHours } = useQuery({
    queryKey: ["schedules"],
    queryFn: async () => {
      const { data } = await api.get(`/schedules`);
      return data?.data || data || [];
    },
  });

  const isLoading = isLoadingSchedulings || isLoadingHours;

  const events = useMemo(() => {
    if (!schedulings || !Array.isArray(schedulings)) return [];
    
    return schedulings
      .filter((scheduling) => {
        if (!scheduling || !scheduling.date || !scheduling.service || !scheduling.customer) {
          return false;
        }
        try {
          const startDate = parseUTCDate(scheduling.date);
          return startDate && startDate.isValid();
        } catch {
          return false;
        }
      })
      .map((scheduling) => {
        try {
          const startDate = parseUTCDate(scheduling.date);
          if (!startDate || !startDate.isValid()) {
            return null;
          }
          
          const endDate = startDate.clone().add(scheduling.service?.duration || 0, "minutes");
          
          if (!endDate.isValid()) {
            return null;
          }
          
          return {
            id: scheduling.id!,
            title: String(scheduling.customer?.name || "Sem nome"),
            start: startDate.toDate(),
            end: endDate.toDate(),
            price: scheduling.price || 0,
            email: String(scheduling.user?.email || ""),
          };
        } catch {
          return null;
        }
      })
      .filter((event): event is SchedulingEvent => event !== null);
  }, [schedulings]);

  const eventDropMutation = useMutation({
    mutationFn: async ({ eventId, start, end }: { eventId: string | number; start: Date; end: Date }) => {
      const payload = {
        date: toUTCDateTime(moment(start).format("YYYY-MM-DD HH:mm:ss")),
      };
      return await schedulingService.patch(eventId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedulings"] });
    },
  });

  const handleNewSchedulingClick = (): void => {
    navigate("/agendamentos/criar");
  };

  const handleEditSchedulingClick = (id: string | number): void => {
    navigate(`/agendamentos/${id}/editar`);
  };

  const handleEventDrop = (eventId: string | number, start: Date, end: Date): void => {
    eventDropMutation.mutate({ eventId, start, end });
  };

  const handleSlotClick = (params?: any): void => {
    navigate("/agendamentos/criar");
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await schedulingService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedulings"] });
      toast.success("Agendamento excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir agendamento. Tente novamente.");
    },
  });

  const handleDelete = (scheduling: Scheduling): void => {
    if (!scheduling.id) return;
    const customerName = scheduling.customer?.name || "este agendamento";
    if (confirm(`Tem certeza que deseja excluir o agendamento de ${customerName}?`)) {
      deleteMutation.mutate(scheduling.id);
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
    setFilters({
      date_from: moment().format("YYYY-MM-DD"),
    });
    setCurrentPage(1);
  };

  return {
    schedulings,
    hours,
    events,
    services,
    users,
    isLoading,
    pagination,
    handleNewSchedulingClick,
    handleEditSchedulingClick,
    handleEventDrop,
    handleSlotClick,
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

