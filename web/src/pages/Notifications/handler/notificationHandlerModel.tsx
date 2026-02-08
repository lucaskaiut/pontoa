import React from "react";
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { notificationService } from "../../../services/notificationService";
import toast from "react-hot-toast";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Notification, NotificationFormValues, NotificationPayload, NotificationFormField } from "../types";

const defaultValues: NotificationFormValues = {
  time_before: "",
  time_unit: "days",
  message: "",
  active: true,
  email_enabled: false,
  whatsapp_enabled: false,
  is_confirmation: false,
};

interface UseNotificationHandlerReturn {
  values: NotificationFormValues;
  fields: NotificationFormField[];
  isEditing: boolean;
  isLoadingNotification: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  setFieldValue: (field: keyof NotificationFormValues, value: any) => void;
  deleteNotification: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleBack: () => void;
}

export function useNotificationHandler(): UseNotificationHandlerReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  const [values, setValues] = useState<NotificationFormValues>(defaultValues);

  const { data: existingNotification, isLoading: isLoadingNotification } = useQuery<Notification>({
    queryKey: ["notification", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const result = await notificationService.get(id);
      return result as Notification;
    },
    enabled: isEditing && !!id,
  });

  useEffect(() => {
    if (existingNotification) {
      setValues({
        time_before: existingNotification.time_before !== undefined && existingNotification.time_before !== null
          ? String(existingNotification.time_before)
          : "",
        time_unit: existingNotification.time_unit || "days",
        message: existingNotification.message || "",
        active: existingNotification.active ?? true,
        email_enabled: existingNotification.email_enabled ?? false,
        whatsapp_enabled: existingNotification.whatsapp_enabled ?? false,
        is_confirmation: existingNotification.is_confirmation ?? false,
      });
    }
  }, [existingNotification]);

  const createMutation = useMutation({
    mutationFn: async (payload: NotificationPayload) => {
      return await notificationService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notificação criada com sucesso!");
      navigate("/notificacoes");
    },
    onError: () => {
      toast.error("Erro ao criar notificação. Tente novamente.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: NotificationPayload }) => {
      return await notificationService.update(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notificação atualizada com sucesso!");
      navigate("/notificacoes");
    },
    onError: () => {
      toast.error("Erro ao atualizar notificação. Tente novamente.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return await notificationService.delete(notificationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notificação apagada com sucesso!");
      navigate("/notificacoes");
    },
    onError: () => {
      toast.error("Erro ao apagar notificação. Tente novamente.");
    },
  });

  const setFieldValue = useCallback((field: keyof NotificationFormValues, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const deleteNotification = async (): Promise<void> => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja apagar esta notificação?')) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const handleSubmit = async (): Promise<void> => {
    const payload: NotificationPayload = {
      time_before: values.time_before ? parseInt(values.time_before) : undefined,
      time_unit: values.time_unit,
      message: values.message,
      active: Boolean(values.active),
      email_enabled: Boolean(values.email_enabled),
      whatsapp_enabled: Boolean(values.whatsapp_enabled),
      is_confirmation: Boolean(values.is_confirmation),
    };

    if (isEditing && id) {
      updateMutation.mutate({ id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleBack = (): void => {
    navigate("/notificacoes");
  };

  const fields: NotificationFormField[] = [
    { 
      name: "time_before", 
      type: "number", 
      label: "Tempo antes",
      placeholder: "Tempo antes",
      required: true,
    },
    { 
      name: "time_unit", 
      type: "select", 
      label: "Unidade de tempo",
      options: [
        { value: "days", label: "Dias" },
        { value: "hours", label: "Horas" },
        { value: "minutes", label: "Minutos" },
      ],
    },
    { 
      name: "active", 
      type: "custom",
      label: "Ativo",
      render: ({ field, value, onChange, error }) => (
        <div className="w-full">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-200 dark:border-dark-border">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700 dark:text-dark-text">{field.label}</span>
            </div>
            <button
              type="button"
              onClick={() => onChange(field.name, !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value 
                  ? "bg-primary dark:bg-blue-600" 
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform ${
                  value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {error && <span className="text-danger text-sm mt-1">{error}</span>}
        </div>
      ),
    },
    { 
      name: "email_enabled", 
      type: "custom",
      label: "E-mail habilitado",
      render: ({ field, value, onChange, error }) => (
        <div className="w-full">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-200 dark:border-dark-border">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700 dark:text-dark-text">{field.label}</span>
            </div>
            <button
              type="button"
              onClick={() => onChange(field.name, !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value 
                  ? "bg-primary dark:bg-blue-600" 
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform ${
                  value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {error && <span className="text-danger text-sm mt-1">{error}</span>}
        </div>
      ),
    },
    { 
      name: "whatsapp_enabled", 
      type: "custom",
      label: "WhatsApp habilitado",
      render: ({ field, value, onChange, error }) => (
        <div className="w-full">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-200 dark:border-dark-border">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700 dark:text-dark-text">{field.label}</span>
            </div>
            <button
              type="button"
              onClick={() => onChange(field.name, !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value 
                  ? "bg-primary dark:bg-blue-600" 
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform ${
                  value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {error && <span className="text-danger text-sm mt-1">{error}</span>}
        </div>
      ),
    },
    { 
      name: "is_confirmation", 
      type: "custom",
      label: "Mensagem de confirmação",
      render: ({ field, value, onChange, error }) => (
        <div className="w-full">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-200 dark:border-dark-border">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700 dark:text-dark-text">{field.label}</span>
            </div>
            <button
              type="button"
              onClick={() => onChange(field.name, !value)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                value 
                  ? "bg-primary dark:bg-blue-600" 
                  : "bg-gray-300 dark:bg-gray-600"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform ${
                  value ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
          {error && <span className="text-danger text-sm mt-1">{error}</span>}
        </div>
      ),
    },
    { 
      name: "message", 
      type: "textarea", 
      label: "Mensagem",
      colSpan: "full",
      render: ({ field, value, onChange, error }) => {
        return (
          <div className={`w-full ${field.className || ''}`}>
            <label className="block text-gray-700 font-semibold mb-2">
              {field.label}
            </label>
            <div className="bg-white notification-message-editor">
              <ReactQuill
                theme="snow"
                value={value || ""}
                onChange={(val) => onChange(field.name, val)}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    ['link'],
                    ['clean']
                  ],
                }}
              />
            </div>
            {error && <span className="text-danger text-sm mt-1">{error}</span>}
          </div>
        );
      },
    },
  ];

  return {
    values,
    fields,
    isEditing,
    isLoadingNotification: isLoadingNotification || false,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    setFieldValue,
    deleteNotification,
    handleSubmit,
    handleBack,
  };
}

