import React from "react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { schedulingService } from "../../../services/schedulingService";
import { customerService } from "../../../services/customerService";
import api from "../../../services/api";
import moment from "moment";
import toast from "react-hot-toast";
import { formatDate, toUTCDate, parseUTCDate, isBefore, now, toUTCDateTime } from "../../../utils/dateUtils";
import { Oval } from "react-loader-spinner";
import { 
  Scheduling, 
  SchedulingFormValues, 
  NewSchedulingFormValues, 
  NewSchedulingPayload,
  ScheduleHoursData, 
  Customer, 
  SchedulingFormField,
  SchedulingCreateFormField 
} from "../types";
import { FormFieldRenderProps } from "../../../components/Form/types";

interface UseSchedulingHandlerReturn {
  isEditing: boolean;
  scheduling: Scheduling | null;
  values: SchedulingFormValues | NewSchedulingFormValues;
  fields: SchedulingFormField[] | SchedulingCreateFormField[];
  isLoading: boolean;
  isSaving: boolean;
  isConfirming: boolean;
  isCancelling: boolean;
  customerMode: "select" | "manual";
  selectedCustomerId: string;
  selectedDate: string;
  emailMatch: Customer | null;
  availableDates: string[];
  availableHoursForDate: string[];
  isLoadingAvailableHours: boolean;
  setFieldValue: (field: string, value: any) => void;
  setCustomerMode: (mode: "select" | "manual") => void;
  setSelectedCustomerId: (id: string) => void;
  setSelectedDate: (date: string) => void;
  handleUseExistingCustomer: () => void;
  handleSubmit: () => void;
  handleConfirm: () => void;
  handleCancel: () => void;
  handleBack: () => void;
}

export function useSchedulingHandler(): UseSchedulingHandlerReturn {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = !!id;
  const schedulingId = id || "";

  const [customerMode, setCustomerMode] = useState<"select" | "manual">("select");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [emailMatch, setEmailMatch] = useState<Customer | null>(null);
  
  const [createValues, setCreateValues] = useState<NewSchedulingFormValues>({
    service_id: "",
    user_id: "",
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
  });

  const values = createValues;

  const { data: scheduling = null, isLoading: isLoadingScheduling } = useQuery<Scheduling>({
    queryKey: ["scheduling", schedulingId],
    queryFn: async () => {
      if (!schedulingId) throw new Error("ID is required");
      const result = await schedulingService.get(schedulingId);
      return result as Scheduling;
    },
    enabled: isEditing && !!schedulingId,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await api.get(`/services`);
      return data?.data || data || [];
    },
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get(`/users`);
      return data?.data || data || [];
    },
  });

  const { data: customersData } = useQuery<Customer[] | { data: Customer[]; meta?: any; links?: any }>({
    queryKey: ["customers"],
    queryFn: async () => {
      const result = await customerService.list();
      return result;
    },
  });

  const customers = useMemo(() => {
    if (!customersData) return [];
    if (Array.isArray(customersData)) {
      return customersData;
    }
    if (customersData && typeof customersData === 'object' && 'data' in customersData) {
      return Array.isArray(customersData.data) ? customersData.data : [];
    }
    return [];
  }, [customersData]);

  const { data: scheduleData = null, isLoading: isLoadingAvailableHours } = useQuery<ScheduleHoursData>({
    queryKey: ["available-hours", createValues.service_id],
    queryFn: async () => {
      const nowLocal = moment();
      const year = nowLocal.year();
      const month = String(nowLocal.month() + 1).padStart(2, '0');
      const day = String(nowLocal.date()).padStart(2, '0');
      const hours = String(nowLocal.hours()).padStart(2, '0');
      const minutes = String(nowLocal.minutes()).padStart(2, '0');
      const dateParam = `${year}-${month}-${day} ${hours}:${minutes}`;
      const { data } = await api.get(`/schedules/hours`, {
        params: {
          service_id: createValues.service_id,
          date: dateParam,
        },
      });
      return (data?.data || data || null) as ScheduleHoursData;
    },
    enabled: !!createValues.service_id,
  });

  const availableDates = useMemo(() => {
    if (!scheduleData?.schedule) return [];
    
    const userId = createValues.user_id || (users.length === 1 ? users[0]?.id : null);
    if (!userId) return [];
    
    return Object.keys(scheduleData.schedule)
      .filter(date => {
        const dateSchedule = scheduleData.schedule?.[date];
        if (!dateSchedule) return false;
        const hours = dateSchedule[String(userId)] || [];
        return hours.length > 0;
      })
      .sort();
  }, [scheduleData, createValues.user_id, users]);

  const availableHoursForDate = useMemo(() => {
    if (!scheduleData?.schedule) return [];
    const dateToUse = selectedDate || createValues.date;
    if (!dateToUse) return [];
    const dateSchedule = scheduleData.schedule[dateToUse];
    if (!dateSchedule) return [];
    
    const userId = createValues.user_id || (users.length === 1 ? users[0]?.id : null);
    if (!userId) return [];
    
    return dateSchedule[String(userId)] || [];
  }, [scheduleData, selectedDate, createValues.date, createValues.user_id, users]);

  useEffect(() => {
    if (scheduling && isEditing) {
      const dateTime = parseUTCDate(scheduling.date);
      if (!dateTime || !dateTime.isValid()) return;
      const dateStr = dateTime.format("YYYY-MM-DD");
      const timeStr = dateTime.format("HH:mm");
      
      setCreateValues(prev => ({
        ...prev,
        service_id: String(scheduling.service?.id || ""),
        user_id: String(scheduling.user?.id || ""),
        date: dateStr,
        time: timeStr,
        name: scheduling.customer?.name || "",
        email: scheduling.customer?.email || "",
        phone: scheduling.customer?.phone || "",
      }));
      
      setSelectedDate(dateStr);
      
      if (scheduling.customer?.id) {
        setCustomerMode("select");
        setSelectedCustomerId(String(scheduling.customer.id));
      } else {
        setCustomerMode("manual");
      }
    }
  }, [scheduling, isEditing]);

  useEffect(() => {
    if (!isEditing && users.length === 1 && !createValues.user_id) {
      setCreateValues(prev => ({ ...prev, user_id: String(users[0].id) }));
    }
  }, [users, createValues.user_id, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setCreateValues(prev => ({ ...prev, time: "" }));
    }
  }, [selectedDate, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setSelectedDate("");
      setCreateValues(prev => ({ ...prev, time: "" }));
    }
  }, [createValues.service_id, isEditing]);

  const checkEmailMatch = useCallback((email: string) => {
    if (!email || email.length < 3) {
      setEmailMatch(null);
      return;
    }
    const match = customers.find(
      (c) => c.email?.toLowerCase() === email.toLowerCase()
    );
    setEmailMatch(match || null);
  }, [customers]);

  useEffect(() => {
    if (!isEditing && customerMode === "manual") {
      checkEmailMatch(createValues.email);
    }
  }, [createValues.email, customerMode, checkEmailMatch, isEditing]);

  const createMutation = useMutation({
    mutationFn: async (payload: NewSchedulingPayload) => {
      return await schedulingService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedulings"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Agendamento criado com sucesso!");
      navigate("/agendamentos");
    },
    onError: () => {
      toast.error("Erro ao criar agendamento. Tente novamente.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: { date: string; service_id: number; user_id: number }) => {
      return await schedulingService.update(schedulingId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedulings"] });
      toast.success("Agendamento atualizado com sucesso!");
      navigate("/agendamentos");
    },
    onError: () => {
      toast.error("Erro ao atualizar agendamento. Tente novamente.");
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async () => {
      return await schedulingService.confirm(schedulingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedulings"] });
      toast.success("Agendamento confirmado com sucesso!");
      navigate("/agendamentos");
    },
    onError: () => {
      toast.error("Erro ao confirmar agendamento. Tente novamente.");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return await schedulingService.cancel(schedulingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedulings"] });
      toast.success("Agendamento cancelado com sucesso!");
      navigate("/agendamentos");
    },
    onError: () => {
      toast.error("Erro ao cancelar agendamento. Tente novamente.");
    },
  });

  const noShowMutation = useMutation({
    mutationFn: async () => {
      return await schedulingService.markAsNoShow(schedulingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedulings"] });
      queryClient.invalidateQueries({ queryKey: ["scheduling", schedulingId] });
      toast.success("Agendamento marcado como no-show com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao marcar agendamento como no-show. Tente novamente.");
    },
  });

  const setFieldValue = (field: string, value: any): void => {
    setCreateValues(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUseExistingCustomer = (): void => {
    if (emailMatch) {
      setCustomerMode("select");
      setSelectedCustomerId(String(emailMatch.id));
      setCreateValues(prev => ({
        ...prev,
        name: "",
        email: "",
        phone: "",
      }));
      setEmailMatch(null);
    }
  };

  const handleSubmit = (): void => {
    if (isEditing) {
      if (!createValues.date || !createValues.time) {
        toast.error("Selecione uma data e horário");
        return;
      }

      const dateTime = `${createValues.date} ${createValues.time}`;
      const payload = {
        date: toUTCDateTime(dateTime),
        service_id: parseInt(createValues.service_id),
        user_id: parseInt(createValues.user_id),
      };
      updateMutation.mutate(payload);
    } else {
      if (!selectedDate || !createValues.time) {
        toast.error("Selecione uma data e horário");
        return;
      }

      if (customerMode === "select" && !selectedCustomerId) {
        toast.error("Selecione um cliente");
        return;
      }

      if (customerMode === "manual" && (!createValues.name || !createValues.email)) {
        toast.error("Preencha nome e e-mail do cliente");
        return;
      }

      const dateTime = `${selectedDate} ${createValues.time}`;
      
      let payload: NewSchedulingPayload = {
        service_id: parseInt(createValues.service_id),
        user_id: parseInt(createValues.user_id),
        date: toUTCDateTime(dateTime) || dateTime,
        name: "",
        email: "",
      };

      if (customerMode === "select") {
        const customer = customers.find(c => c.id === parseInt(selectedCustomerId));
        if (customer) {
          payload.name = customer.name;
          payload.email = customer.email || "";
          payload.phone = customer.phone || "";
        }
      } else {
        payload.name = createValues.name;
        payload.email = createValues.email;
        payload.phone = createValues.phone || "";
      }

      createMutation.mutate(payload);
    }
  };

  const handleBack = (): void => {
    navigate("/agendamentos");
  };

  const handleConfirm = (): void => {
    if (scheduling?.id && window.confirm("Tem certeza que deseja confirmar este agendamento?")) {
      confirmMutation.mutate();
    }
  };

  const handleCancel = (): void => {
    if (scheduling?.id && window.confirm("Tem certeza que deseja cancelar este agendamento?")) {
      cancelMutation.mutate();
    }
  };

  const handleNoShow = (): void => {
    if (scheduling?.id && window.confirm("Tem certeza que deseja marcar este agendamento como no-show?")) {
      noShowMutation.mutate();
    }
  };

  const isConfirming = confirmMutation.isPending;
  const isCancelling = cancelMutation.isPending;
  const isMarkingAsNoShow = noShowMutation.isPending;

  const getStatusBadge = (status?: string): JSX.Element => {
    const statusBadges: Record<string, { label: string; bgColor: string; textColor: string; borderColor: string; dotColor: string }> = {
      pending: {
        label: "Pendente",
        bgColor: "bg-purple-50 dark:bg-purple-900/30",
        textColor: "text-purple-700 dark:text-purple-300",
        borderColor: "border-purple-200 dark:border-purple-700",
        dotColor: "bg-primary",
      },
      confirmed: {
        label: "Confirmado",
        bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
        textColor: "text-emerald-700 dark:text-emerald-300",
        borderColor: "border-emerald-200 dark:border-emerald-700",
        dotColor: "bg-emerald-500",
      },
      cancelled: {
        label: "Cancelado",
        bgColor: "bg-gray-50 dark:bg-gray-800/50",
        textColor: "text-gray-700 dark:text-gray-300",
        borderColor: "border-gray-200 dark:border-gray-700",
        dotColor: "bg-gray-500",
      },
      no_show: {
        label: "Não compareceu",
        bgColor: "bg-orange-50 dark:bg-orange-900/30",
        textColor: "text-orange-700 dark:text-orange-300",
        borderColor: "border-orange-200 dark:border-orange-700",
        dotColor: "bg-orange-500",
      },
    };

    const badge = statusBadges[status || "pending"] || statusBadges.pending;

    return (
      <div
        className={`${badge.bgColor} ${badge.borderColor} border py-2.5 px-4 rounded-lg flex items-center justify-center gap-2`}
      >
        <span className={`w-2 h-2 rounded-full ${badge.dotColor}`}></span>
        <span className={`text-sm font-medium ${badge.textColor}`}>{badge.label}</span>
      </div>
    );
  };

  const baseFields: SchedulingCreateFormField[] = [
    { 
      name: "service_id", 
      type: "select" as const, 
      label: "Serviço",
      placeholder: "Selecione um serviço",
      options: services.map(s => ({ value: s.id, label: s.name })),
      required: true,
    },
    ...(users.length > 1 ? [{
      name: "user_id", 
      type: "select" as const, 
      label: "Profissional",
      placeholder: "Selecione um profissional",
      options: users.map(u => ({ value: u.id, label: u.name })),
      required: true,
    }] : []),
    {
      name: "date",
      type: "text" as const,
      label: "Data",
      colSpan: "full" as const,
      render: (props: FormFieldRenderProps) => {
        const { field, value, onChange, error } = props;
        
        if (isEditing) {
          const dateTimeValue = createValues.date && createValues.time 
            ? `${createValues.date}T${createValues.time}`
            : "";
          
          return (
            <div className={`w-full ${field.className || ""}`}>
              <label className="block mb-1 text-gray-700 dark:text-dark-text">
                Data e Hora
                {field.required && <span className="text-danger ml-1">*</span>}
              </label>
              <input
                type="datetime-local"
                value={dateTimeValue}
                onChange={(e) => {
                  const dateTime = e.target.value;
                  if (dateTime) {
                    const [date, time] = dateTime.split("T");
                    setCreateValues(prev => ({
                      ...prev,
                      date: date || "",
                      time: time || "",
                    }));
                    onChange(field.name, date || "");
                    setSelectedDate(date || "");
                  }
                }}
                className={`bg-white dark:bg-dark-surface rounded-md py-4 px-4 w-full border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-dark-text-secondary ${
                  error ? "border-danger" : "border-gray-300 dark:border-dark-border"
                }`}
              />
              {error && <span className="text-danger text-sm mt-1">{error}</span>}
            </div>
          );
        }
        
        return (
        <div className={`w-full ${field.className || ""}`}>
          <label className="block mb-1 text-gray-700 dark:text-dark-text">
            {field.label}
            {field.required && <span className="text-danger ml-1">*</span>}
          </label>
          {isLoadingAvailableHours ? (
            <div className="flex items-center gap-2 py-2">
              <Oval height={20} width={20} color="#7b2cbf" secondaryColor="#7b2cbf" strokeWidth={4} />
              <span className="text-sm text-gray-500 dark:text-dark-text-secondary">Carregando datas disponíveis...</span>
            </div>
          ) : !createValues.service_id ? (
            <span className="text-sm text-gray-500 dark:text-dark-text-secondary py-2">Selecione um serviço primeiro</span>
          ) : availableDates.length === 0 ? (
            <span className="text-sm text-amber-600 dark:text-amber-400 py-2">Nenhuma data disponível</span>
          ) : (
            <div className="flex gap-2 overflow-x-auto p-1" style={{ scrollbarWidth: 'thin' }}>
              {availableDates.map((date) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => {
                    setSelectedDate(date);
                    onChange(field.name, date);
                  }}
                  className={`shrink-0 w-20 min-h-[80px] py-4 px-2 rounded-lg text-sm font-medium transition-all flex flex-col items-center justify-center gap-1 ${
                    selectedDate === date || createValues.date === date
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-dark-surface-hover text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border"
                  }`}
                >
                  <span className="text-xs opacity-75">
                    {moment(date).format("ddd")}
                  </span>
                  <span className="text-base font-semibold">{moment(date).format("DD/MM")}</span>
                </button>
              ))}
            </div>
          )}
          {error && <span className="text-danger text-sm mt-1">{error}</span>}
        </div>
        );
      },
    },
    ...(isEditing ? [] : [{
      name: "time",
      type: "text" as const,
      label: "Horário",
      colSpan: "full" as const,
      render: (props: FormFieldRenderProps) => {
        const { field, value, onChange, error } = props;
        return (
        <div className={`w-full ${field.className || ""}`}>
          <label className="block mb-1 text-gray-700 dark:text-dark-text">
            {field.label}
            {field.required && <span className="text-danger ml-1">*</span>}
          </label>
          {!selectedDate && !createValues.date ? (
            <span className="text-sm text-gray-500 dark:text-dark-text-secondary py-2">Selecione uma data primeiro</span>
          ) : availableHoursForDate.length === 0 ? (
            <span className="text-sm text-amber-600 dark:text-amber-400 py-2">Nenhum horário disponível para esta data</span>
          ) : (
            <div className="flex gap-2 overflow-x-auto p-1" style={{ scrollbarWidth: 'thin' }}>
              {availableHoursForDate.map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => onChange(field.name, hour)}
                  className={`shrink-0 py-2 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                    value === hour || createValues.time === hour
                      ? "bg-primary text-white"
                      : "bg-gray-100 dark:bg-dark-surface-hover text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border"
                  }`}
                >
                  {hour}
                </button>
              ))}
            </div>
          )}
          {error && <span className="text-danger text-sm mt-1">{error}</span>}
        </div>
        );
      },
    }]),
    {
      name: "customer_mode",
      type: "text" as const,
      label: "Tipo de Cliente",
      colSpan: "full" as const,
      render: (props: FormFieldRenderProps) => {
        const { field } = props;
        return (
        <div className="w-full">
          <label className="block mb-1 text-gray-700 dark:text-dark-text">{field.label}</label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCustomerMode("select")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                customerMode === "select"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-dark-surface-hover text-gray-600 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border"
              }`}
            >
              Cliente Cadastrado
            </button>
            <button
              type="button"
              onClick={() => setCustomerMode("manual")}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
                customerMode === "manual"
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-dark-surface-hover text-gray-600 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-border"
              }`}
            >
              Novo Cliente
            </button>
          </div>
        </div>
        );
      },
    },
    ...(customerMode === "select" ? [{
      name: "customer_id",
      type: "select" as const,
      label: "Selecionar Cliente",
      placeholder: "Selecione um cliente",
      options: customers.map(c => ({ value: c.id, label: `${c.name} - ${c.email}` })),
      required: true,
      colSpan: "full" as const,
      render: (props: FormFieldRenderProps) => {
        const { field, value, onChange, error } = props;
        return (
          <div className="w-full">
            <label className="block mb-1 text-gray-700 dark:text-dark-text">
              {field.label}
              {field.required && <span className="text-danger ml-1">*</span>}
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => {
                const newValue = e.target.value;
                setSelectedCustomerId(newValue);
                onChange(field.name, newValue);
              }}
              className={`bg-white dark:bg-dark-surface rounded-md py-4 px-4 w-full border text-gray-700 dark:text-dark-text ${
                error ? "border-danger" : "border-gray-300 dark:border-dark-border"
              }`}
            >
              <option value="" className="bg-white dark:bg-dark-surface">{field.placeholder}</option>
              {field.options?.map((option: any) => (
                <option key={option.value} value={option.value} className="bg-white dark:bg-dark-surface">
                  {option.label}
                </option>
              ))}
            </select>
            {error && <span className="text-danger text-sm mt-1">{error}</span>}
          </div>
        );
      },
    }] : [
      {
        name: "name",
        type: "text" as const,
        label: "Nome",
        placeholder: "Nome do cliente",
        required: true,
      },
      {
        name: "email",
        type: "email" as const,
        label: "E-mail",
        placeholder: "email@exemplo.com",
        required: true,
        render: (props: FormFieldRenderProps) => {
          const { field, value, onChange, error } = props;
          return (
          <div className="w-full">
            <label className="block mb-1 text-gray-700 dark:text-dark-text">
              {field.label}
              {field.required && <span className="text-danger ml-1">*</span>}
            </label>
            <input
              type="email"
              value={value || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={`bg-white dark:bg-dark-surface rounded-md py-4 px-4 w-full border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-dark-text-secondary ${
                error ? "border-danger" : emailMatch ? "border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-gray-300 dark:border-dark-border"
              }`}
            />
            {emailMatch && (
              <div className="mt-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
                  ⚠️ Este e-mail já está cadastrado para <strong>{emailMatch.name}</strong>
                </p>
                <button
                  type="button"
                  onClick={handleUseExistingCustomer}
                  className="text-sm bg-amber-500 dark:bg-amber-600 hover:bg-amber-600 dark:hover:bg-amber-700 text-white py-1 px-3 rounded-md transition-all"
                >
                  Usar cliente existente
                </button>
              </div>
            )}
            {error && <span className="text-danger text-sm mt-1">{error}</span>}
          </div>
          );
        },
      },
      {
        name: "phone",
        type: "text" as const,
        label: "Telefone",
        placeholder: "(00) 00000-0000",
        mask: "(99) 99999-9999",
      },
    ]),
  ];

  const editOnlyFields: SchedulingFormField[] = isEditing ? [
    {
      name: "service_details",
      type: "text" as const,
      label: "Detalhes do Serviço",
      colSpan: "full" as const,
      render: (props: FormFieldRenderProps) => {
        const { field } = props;
        return (
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide">
                  Duração
                </span>
                <span className="text-base text-gray-800 dark:text-dark-text font-medium">
                  {scheduling?.service?.duration || "—"} minutos
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide">
                  Preço
                </span>
                <span className="text-base text-gray-800 dark:text-dark-text font-medium">
                  {scheduling?.price
                    ? new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(scheduling.price)
                    : "—"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide">
                  Custo
                </span>
                <span className="text-base text-gray-800 dark:text-dark-text font-medium">
                  {scheduling?.cost
                    ? new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(scheduling.cost)
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      name: "created_at",
      type: "text" as const,
      label: "Data da Compra",
      render: (props: FormFieldRenderProps) => {
        const { field } = props;
        return (
          <div className="w-full">
            <span className="text-base text-gray-800 dark:text-dark-text font-medium">
              {scheduling?.created_at
                ? formatDate(scheduling.created_at, "DD/MM/YYYY HH:mm")
                : "—"}
            </span>
          </div>
        );
      },
    },
    {
      name: "status",
      type: "text" as const,
      label: "Status",
      render: (props: FormFieldRenderProps) => {
        const { field } = props;
        return (
          <div className="w-full">
            {getStatusBadge(scheduling?.status)}
          </div>
        );
      },
    },
    {
      name: "customer_details",
      type: "text" as const,
      label: "Detalhes do Cliente",
      colSpan: "full" as const,
      render: (props: FormFieldRenderProps) => {
        const { field } = props;
        return (
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide">
                  Nome
                </span>
                <span className="text-base text-gray-800 dark:text-dark-text font-medium">
                  {scheduling?.customer?.name || "—"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide">
                  E-mail
                </span>
                <span className="text-base text-gray-800 dark:text-dark-text font-medium">
                  {scheduling?.customer?.email || "—"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide">
                  Telefone
                </span>
                <span className="text-base text-gray-800 dark:text-dark-text font-medium">
                  {scheduling?.customer?.phone || "—"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide">
                  Documento
                </span>
                <span className="text-base text-gray-800 dark:text-dark-text font-medium">
                  {scheduling?.customer?.document || "—"}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      name: "user_details",
      type: "text" as const,
      label: "Detalhes do Profissional",
      colSpan: "full" as const,
      render: (props: FormFieldRenderProps) => {
        const { field } = props;
        return (
          <div className="w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide">
                  E-mail
                </span>
                <span className="text-base text-gray-800 dark:text-dark-text font-medium">
                  {scheduling?.user?.email || "—"}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-gray-500 dark:text-dark-text-secondary uppercase tracking-wide">
                  Telefone
                </span>
                <span className="text-base text-gray-800 dark:text-dark-text font-medium">
                  {scheduling?.user?.phone || "—"}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      name: "actions",
      type: "text" as const,
      label: "Ações",
      colSpan: "full" as const,
      render: (props: FormFieldRenderProps) => {
        const { field } = props;
        const schedulingDate = scheduling?.date ? parseUTCDate(scheduling.date) : null;
        const isPast = schedulingDate ? isBefore(scheduling.date, now().toISOString()) : false;
        const showNoShowButton = isPast && scheduling?.status !== "cancelled" && scheduling?.status !== "no_show";
        
        return (
          <div className="w-full">
            {scheduling?.status !== "cancelled" && (
              <div className="flex gap-2">
                {scheduling?.status === "pending" && (
                  <button
                    onClick={handleConfirm}
                    disabled={isConfirming}
                    className="flex-1 bg-primary hover:opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-all text-sm"
                  >
                    {isConfirming ? "Confirmando agendamento..." : "Confirmar agendamento"}
                  </button>
                )}
                <button
                  onClick={handleCancel}
                  disabled={isCancelling}
                  className="flex-1 bg-red-500 dark:bg-red-600 hover:bg-red-600 dark:hover:bg-red-700 disabled:bg-red-300 dark:disabled:bg-red-800 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-all text-sm"
                >
                  {isCancelling ? "Cancelando agendamento..." : "Cancelar agendamento"}
                </button>
                {showNoShowButton && (
                  <button
                    onClick={handleNoShow}
                    disabled={isMarkingAsNoShow}
                    className="flex-1 bg-orange-500 dark:bg-orange-600 hover:bg-orange-600 dark:hover:bg-orange-700 disabled:bg-orange-300 dark:disabled:bg-orange-800 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-all text-sm"
                  >
                    {isMarkingAsNoShow ? "Marcando..." : "Marcar como no-show"}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      },
    },
  ] : [];

  const fields = [...baseFields, ...editOnlyFields];

  return {
    isEditing,
    scheduling,
    values,
    fields,
    isLoading: isLoadingScheduling,
    isSaving: isEditing ? updateMutation.isPending : createMutation.isPending,
    isConfirming,
    isCancelling,
    customerMode,
    selectedCustomerId,
    selectedDate,
    emailMatch,
    availableDates,
    availableHoursForDate,
    isLoadingAvailableHours,
    setFieldValue,
    setCustomerMode,
    setSelectedCustomerId,
    setSelectedDate,
    handleUseExistingCustomer,
    handleSubmit,
    handleConfirm,
    handleCancel,
    handleBack,
  };
}

