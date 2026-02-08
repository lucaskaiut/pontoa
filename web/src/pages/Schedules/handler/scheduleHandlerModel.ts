import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { scheduleService } from "../../../services/scheduleService";
import { serviceService } from "../../../services/serviceService";
import { userService } from "../../../services/userService";
import toast from "react-hot-toast";
import { Day, Service, User, Schedule, ScheduleFormValues, SchedulePayload, ScheduleFormField } from "../types";

export const days: Day[] = [
  { id: 0, name: 'Domingo', short: 'Dom' },
  { id: 1, name: 'Segunda-Feira', short: 'Seg' },
  { id: 2, name: 'Terça-Feira', short: 'Ter' },
  { id: 3, name: 'Quarta-Feira', short: 'Qua' },
  { id: 4, name: 'Quinta-Feira', short: 'Qui' },
  { id: 5, name: 'Sexta-Feira', short: 'Sex' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
];

const defaultValues: ScheduleFormValues = {
  start_at: "",
  end_at: "",
  days: [],
  services: [],
  users: [],
};

interface UseScheduleHandlerReturn {
  values: ScheduleFormValues;
  fields: ScheduleFormField[];
  isEditing: boolean;
  isLoadingSchedule: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  setFieldValue: (field: keyof ScheduleFormValues, value: any) => void;
  deleteSchedule: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleBack: () => void;
}

export function useScheduleHandler(): UseScheduleHandlerReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  const [values, setValues] = useState<ScheduleFormValues>(defaultValues);

  const { data: existingSchedule, isLoading: isLoadingSchedule } = useQuery<Schedule>({
    queryKey: ["schedule", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const result = await scheduleService.get(id);
      return result as Schedule;
    },
    enabled: isEditing && !!id,
  });

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const result = await serviceService.list();
      return (result || []) as Service[];
    },
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => {
      const result = await userService.list();
      return (result || []) as User[];
    },
  });

  useEffect(() => {
    if (existingSchedule) {
      const scheduleDays: Day[] = [];
      if (existingSchedule.days) {
        existingSchedule.days.split(',').forEach((day: string) => {
          const found = days.find(weekDay => weekDay.id === parseInt(day));
          if (found) scheduleDays.push(found);
        });
      }

      setValues({
        start_at: existingSchedule.start_at || "",
        end_at: existingSchedule.end_at || "",
        days: scheduleDays,
        services: (existingSchedule.services || []) as Service[],
        users: (existingSchedule.users || []) as User[],
      });
    }
  }, [existingSchedule]);

  const createMutation = useMutation({
    mutationFn: async (payload: SchedulePayload) => {
      return await scheduleService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Horário criado com sucesso!");
      navigate("/agenda");
    },
    onError: () => {
      toast.error("Erro ao criar horário. Tente novamente.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: SchedulePayload }) => {
      return await scheduleService.update(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Horário atualizado com sucesso!");
      navigate("/agenda");
    },
    onError: () => {
      toast.error("Erro ao atualizar horário. Tente novamente.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      return await scheduleService.delete(scheduleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Horário apagado com sucesso!");
      navigate("/agenda");
    },
    onError: () => {
      toast.error("Erro ao apagar horário. Tente novamente.");
    },
  });

  const setFieldValue = useCallback((field: keyof ScheduleFormValues, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const deleteSchedule = async (): Promise<void> => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja apagar esse horário?')) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const handleSubmit = async (): Promise<void> => {
    const payload: SchedulePayload = {
      start_at: values.start_at,
      end_at: values.end_at,
      services: values.services.map(service => service.id),
      users: values.users.map(user => user.id),
      days: values.days.map(day => day.id).join(','),
    };

    if (isEditing && id) {
      updateMutation.mutate({ id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleBack = (): void => {
    navigate("/agenda");
  };

  const fields: ScheduleFormField[] = [
    { 
      name: "start_at", 
      type: "time", 
      label: "Horário de Início",
      placeholder: "Início",
    },
    { 
      name: "end_at", 
      type: "time", 
      label: "Horário de Término",
      placeholder: "Fim",
    },
    { 
      name: "days", 
      type: "toggle-group", 
      label: "Dias da Semana",
      options: days,
      displayValue: "name",
      colSpan: "full",
    },
    { 
      name: "services", 
      type: "multiselect", 
      label: "Serviços",
      placeholder: "Selecione os serviços disponíveis neste horário",
      options: services,
      displayValue: "name",
      emptyMessage: "Não há mais serviços",
      colSpan: 2,
    },
    { 
      name: "users", 
      type: "multiselect", 
      label: "Profissionais",
      placeholder: "Selecione os profissionais",
      options: users,
      displayValue: "name",
      emptyMessage: "Não há mais profissionais",
    },
  ];

  return {
    values,
    fields,
    isEditing,
    isLoadingSchedule: isLoadingSchedule || false,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    setFieldValue,
    deleteSchedule,
    handleSubmit,
    handleBack,
  };
}

