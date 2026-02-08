import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { scheduleService } from "../../../services/scheduleService";
import toast from "react-hot-toast";
import { Schedule } from "../types";

const weekDays: string[] = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

interface UseScheduleListReturn {
  schedules: Schedule[];
  isLoading: boolean;
  handleCreateClick: () => void;
  handleEditClick: (schedule: Schedule) => void;
  handleDelete: (schedule: Schedule) => void;
  formatDays: (days: string) => string;
}

export function useScheduleList(): UseScheduleListReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: schedules = [], isLoading } = useQuery<Schedule[]>({
    queryKey: ["schedules"],
    queryFn: async () => {
      const result = await scheduleService.list();
      return (result || []) as Schedule[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await scheduleService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Horário apagado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao apagar horário. Tente novamente.");
    },
  });

  const handleCreateClick = (): void => {
    navigate("/agenda/criar");
  };

  const handleEditClick = (schedule: Schedule): void => {
    if (!schedule.id) return;
    navigate(`/agenda/${schedule.id}/editar`);
  };

  const handleDelete = (schedule: Schedule): void => {
    if (!schedule.id) return;
    if (confirm(`Tem certeza que deseja excluir esse horário?`)) {
      deleteMutation.mutate(schedule.id);
    }
  };

  const formatDays = (days: string): string => {
    const formattedDays = days.split(',');
    const availableDays: string[] = [];

    formattedDays.forEach((day) => {
      const dayIndex = parseInt(day);
      if (dayIndex >= 0 && dayIndex < weekDays.length) {
        availableDays.push(weekDays[dayIndex]);
      }
    });

    return availableDays.join(', ');
  };

  return {
    schedules,
    isLoading,
    handleCreateClick,
    handleEditClick,
    handleDelete,
    formatDays,
  };
}

