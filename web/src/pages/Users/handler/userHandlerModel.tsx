import React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { userService } from "../../../services/userService";
import { roleService } from "../../../services/roleService";
import toast from "react-hot-toast";
import { User, UserFormValues, UserPayload, UserFormField, Service, Day, UserScheduleFormValue, UserServiceFormValue, UserService, Role } from "../types";
import Multiselect from "multiselect-react-dropdown";
import { UserSchedulesField } from "./UserSchedulesField";
import { UserServicesField } from "./UserServicesField";
import { submitFile } from "../../../services/utils";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import FileUpload from "../../../components/FileUpload";
import classNames from "classnames";
import { DescriptionEditor } from "../components/DescriptionEditor";

export const days: Day[] = [
  { id: 0, name: 'Domingo', short: 'Dom' },
  { id: 1, name: 'Segunda-Feira', short: 'Seg' },
  { id: 2, name: 'Terça-Feira', short: 'Ter' },
  { id: 3, name: 'Quarta-Feira', short: 'Qua' },
  { id: 4, name: 'Quinta-Feira', short: 'Qui' },
  { id: 5, name: 'Sexta-Feira', short: 'Sex' },
  { id: 6, name: 'Sábado', short: 'Sáb' },
];

const getMultiselectStyle = (isDark: boolean) => ({
  chips: { background: isDark ? '#3b82f6' : '#7b2cbf' },
  searchBox: { 
    border: isDark ? '1px solid #334155' : '1px solid #d1d5db', 
    borderRadius: '0.375rem',
    padding: '0.75rem 1rem',
    background: isDark ? '#1e293b' : '#f8fafc',
    color: isDark ? '#e2e8f0' : '#6b7280'
  },
  optionContainer: { 
    borderRadius: '0.375rem',
    background: isDark ? '#1e293b' : '#ffffff',
    border: isDark ? '1px solid #334155' : '1px solid #d1d5db'
  },
  option: { 
    color: isDark ? '#e2e8f0' : '#6b7280',
    background: isDark ? '#1e293b' : '#ffffff'
  },
  highlightOption: {
    background: isDark ? '#3b82f6' : '#7b2cbf'
  }
});

const defaultValues: UserFormValues = {
  name: "",
  email: "",
  phone: "",
  document: "",
  password: "",
  is_collaborator: false,
  roles: [],
  services: [],
  schedules: [],
  image: null,
  description: null,
  url: null,
};

interface UseUserHandlerReturn {
  values: UserFormValues;
  fields: UserFormField[];
  additionalFields: UserFormField[];
  isEditing: boolean;
  isLoadingUser: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  formKey: number;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  setFieldValue: (field: keyof UserFormValues, value: any) => void;
  onChangeService: (index: number, field: keyof UserServiceFormValue, value: any) => void;
  addService: () => void;
  removeService: (index: number) => void;
  moveServiceUp: (index: number) => void;
  moveServiceDown: (index: number) => void;
  onChangeSchedule: (index: number, field: keyof UserScheduleFormValue, value: any) => void;
  addSchedule: () => void;
  removeSchedule: (index: number) => void;
  moveScheduleUp: (index: number) => void;
  moveScheduleDown: (index: number) => void;
  deleteUser: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleBack: () => void;
}

export function useUserHandler(): UseUserHandlerReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  const [values, setValues] = useState<UserFormValues>(defaultValues);
  const [formKey, setFormKey] = useState(0);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: existingUser, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ["user", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const result = await userService.get(id);
      return result as User;
    },
    enabled: isEditing && !!id,
  });

  // Query para buscar perfis disponíveis
  const { data: availableRoles = [] } = useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const result = await roleService.list();
      return (result || []) as Role[];
    },
  });

  // Removido: query de services não é mais necessária pois serviços são criados/gerenciados diretamente no formulário

  useEffect(() => {
    if (existingUser) {
      // Processar services do usuário existente
      const serviceFormValues: UserServiceFormValue[] = [];
      if (existingUser.services && existingUser.services.length > 0) {
        existingUser.services.forEach((service) => {
          // Verificar se é um serviço completo (UserService) ou apenas referência (Service)
          // Um serviço completo tem campos como duration, price, etc.
          // Um serviço simples tem apenas id e name
          const isFullService = service && (
            'duration' in service || 
            'price' in service || 
            (service as any).duration !== undefined ||
            (service as any).price !== undefined
          );
          
          // Se for serviço completo, processar todos os campos
          if (isFullService) {
            const fullService = service as UserService;
            serviceFormValues.push({
              id: fullService.id,
              name: fullService.name || "",
              duration: fullService.duration ?? 0,
              price: typeof fullService.price === 'string' ? parseFloat(fullService.price) || 0 : (fullService.price ?? 0),
              cost: typeof fullService.cost === 'string' ? parseFloat(fullService.cost) || 0 : (fullService.cost ?? 0),
              commission: typeof fullService.commission === 'string' ? parseFloat(fullService.commission) || 0 : (fullService.commission ?? 0),
              description: fullService.description || "",
              status: fullService.status ?? true,
              photo: fullService.photo || null,
            });
          } else if (service && service.name) {
            // Se for apenas uma referência simples (id + name), criar estrutura básica
            // Isso pode acontecer em alguns casos específicos da API
            serviceFormValues.push({
              id: service.id,
              name: service.name,
              duration: 0,
              price: 0,
              cost: 0,
              commission: 0,
              description: "",
              status: true,
              photo: null,
            });
          }
        });
      }

      // Processar schedules do usuário existente
      const scheduleFormValues: UserScheduleFormValue[] = [];
      if (existingUser.schedules && existingUser.schedules.length > 0) {
        existingUser.schedules.forEach((schedule) => {
          const scheduleDays: Day[] = [];
          if (schedule.days) {
            schedule.days.split(',').forEach((day: string) => {
              const found = days.find(weekDay => weekDay.id === parseInt(day));
              if (found) scheduleDays.push(found);
            });
          }
          // Normalizar formato de horário para HH:mm (o input type="time" aceita ambos, mas normalizamos para consistência)
          const normalizeTime = (time: string) => {
            if (!time) return "";
            // Se vier no formato HH:mm:ss, retornar apenas HH:mm
            return time.length === 8 ? time.substring(0, 5) : time;
          };

          scheduleFormValues.push({
            id: schedule.id,
            days: scheduleDays,
            start_at: normalizeTime(schedule.start_at || ""),
            end_at: normalizeTime(schedule.end_at || ""),
            services: (schedule.services || []) as Service[],
          });
        });
      }

      // Processar roles do usuário existente
      const userRoles: Role[] = existingUser.roles || [];

      // Garantir que image e description sejam sempre strings ou null
      const normalizeStringValue = (value: any): string | null => {
        if (value === null || value === undefined) return null;
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
          // Se for um objeto, tentar converter para string
          try {
            return JSON.stringify(value);
          } catch {
            return String(value);
          }
        }
        return String(value);
      };

      setValues({
        name: existingUser.name || "",
        email: existingUser.email || "",
        phone: existingUser.phone || "",
        document: existingUser.document || "",
        password: "",
        is_collaborator: existingUser.is_collaborator ?? false,
        roles: userRoles,
        services: serviceFormValues,
        schedules: scheduleFormValues,
        image: normalizeStringValue(existingUser.image),
        description: normalizeStringValue(existingUser.description),
        url: normalizeStringValue(existingUser.url),
      });
      setFormKey(prev => prev + 1);
    }
  }, [existingUser]);

  const createMutation = useMutation({
    mutationFn: async (payload: UserPayload) => {
      return await userService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário criado com sucesso!");
      navigate("/usuarios");
    },
    onError: () => {
      toast.error("Erro ao criar usuário. Tente novamente.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: UserPayload }) => {
      return await userService.update(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário atualizado com sucesso!");
      navigate("/usuarios");
    },
    onError: () => {
      toast.error("Erro ao atualizar usuário. Tente novamente.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await userService.delete(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário apagado com sucesso!");
      navigate("/usuarios");
    },
    onError: () => {
      toast.error("Erro ao apagar usuário. Tente novamente.");
    },
  });

  const setFieldValue = useCallback((field: keyof UserFormValues, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const onChangeService = useCallback((index: number, field: keyof UserServiceFormValue, value: any) => {
    setValues(prev => {
      const newServices = [...prev.services];
      newServices[index] = {
        ...newServices[index],
        [field]: value
      };
      return {
        ...prev,
        services: newServices
      };
    });
  }, []);

  const addService = useCallback(() => {
    setValues(prev => ({
      ...prev,
      services: [
        ...prev.services,
        {
          name: "",
          duration: 0,
          price: 0,
          cost: 0,
          commission: 0,
          description: "",
          status: true,
        }
      ]
    }));
  }, []);

  const removeService = useCallback((index: number) => {
    setValues(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  }, []);

  const moveServiceUp = useCallback((index: number) => {
    if (index === 0) return;
    setValues(prev => {
      const newServices = [...prev.services];
      [newServices[index - 1], newServices[index]] = [newServices[index], newServices[index - 1]];
      return {
        ...prev,
        services: newServices
      };
    });
  }, []);

  const moveServiceDown = useCallback((index: number) => {
    setValues(prev => {
      if (index >= prev.services.length - 1) return prev;
      const newServices = [...prev.services];
      [newServices[index], newServices[index + 1]] = [newServices[index + 1], newServices[index]];
      return {
        ...prev,
        services: newServices
      };
    });
  }, []);

  const onChangeSchedule = useCallback((index: number, field: keyof UserScheduleFormValue, value: any) => {
    setValues(prev => {
      const newSchedules = [...prev.schedules];
      newSchedules[index] = {
        ...newSchedules[index],
        [field]: value
      };
      return {
        ...prev,
        schedules: newSchedules
      };
    });
  }, []);

  const addSchedule = useCallback(() => {
    setValues(prev => ({
      ...prev,
      schedules: [
        ...prev.schedules,
        {
          days: [],
          start_at: "",
          end_at: "",
          services: [],
        }
      ]
    }));
  }, []);

  const removeSchedule = useCallback((index: number) => {
    setValues(prev => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index)
    }));
  }, []);

  const moveScheduleUp = useCallback((index: number) => {
    if (index === 0) return;
    setValues(prev => {
      const newSchedules = [...prev.schedules];
      [newSchedules[index - 1], newSchedules[index]] = [newSchedules[index], newSchedules[index - 1]];
      return {
        ...prev,
        schedules: newSchedules
      };
    });
  }, []);

  const moveScheduleDown = useCallback((index: number) => {
    setValues(prev => {
      if (index >= prev.schedules.length - 1) return prev;
      const newSchedules = [...prev.schedules];
      [newSchedules[index], newSchedules[index + 1]] = [newSchedules[index + 1], newSchedules[index]];
      return {
        ...prev,
        schedules: newSchedules
      };
    });
  }, []);

  const deleteUser = async (): Promise<void> => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja apagar este usuário?')) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const handleSubmit = async (): Promise<void> => {
    // Upload da imagem se houver arquivo novo
    let imagePath = values.image;
    if (imageFile) {
      try {
        const extension = imageFile.name.substring(imageFile.name.lastIndexOf('.') + 1) || 'jpg';
        imagePath = await submitFile(imageFile, `user-image-${Date.now()}.${extension}`);
      } catch (error) {
        toast.error("Erro ao fazer upload da imagem. Tente novamente.");
        return;
      }
    }

    // Processar services para o payload
    const servicePayload = values.services.map(service => ({
      ...(service.id && { id: service.id }),
      name: service.name,
      duration: service.duration,
      price: service.price,
      ...(service.cost !== undefined && service.cost !== null && { cost: service.cost }),
      ...(service.commission !== undefined && service.commission !== null && { commission: service.commission }),
      ...(service.description && { description: service.description }),
      ...(service.photo && { photo: service.photo }),
      status: service.status,
    }));

    // Processar schedules para o payload
    const schedulePayload = values.schedules.map(schedule => ({
      ...(schedule.id && { id: schedule.id }),
      days: schedule.days.map(day => day.id).join(','),
      start_at: schedule.start_at,
      end_at: schedule.end_at,
      services: schedule.services.map(service => service.id),
    }));

    // Processar roles para o payload (array de IDs)
    const rolesPayload = values.roles.map(role => role.id);

    const payload: UserPayload = {
      name: values.name,
      email: values.email,
      phone: values.phone || undefined,
      document: values.document || undefined,
      password: values.password || undefined,
      is_collaborator: values.is_collaborator,
      roles: rolesPayload,
      // Enviar services: array vazio remove todos, array com itens atualiza/cria/remove conforme necessário
      services: values.services.length > 0 ? servicePayload : [],
      // Enviar schedules: array vazio remove todos, array com itens atualiza/cria/remove conforme necessário
      schedules: values.schedules.length > 0 ? schedulePayload : [],
      image: imagePath || undefined,
      description: values.description || undefined,
      url: values.url || undefined,
    };

    if (isEditing && id) {
      // Na atualização, sempre enviamos services, schedules e roles (array vazio remove todos)
      updateMutation.mutate({ id, payload });
    } else {
      // Na criação, só enviamos se houver
      if (values.services.length === 0) {
        delete payload.services;
      }
      if (values.schedules.length === 0) {
        delete payload.schedules;
      }
      if (values.roles.length === 0) {
        delete payload.roles;
      }
      createMutation.mutate(payload);
    }
  };

  const handleBack = (): void => {
    navigate("/usuarios");
  };

  // Campos gerais (primeira aba)
  const fields: UserFormField[] = useMemo(() => [
    { 
      name: "name", 
      type: "text", 
      label: "Nome",
      placeholder: "Nome",
      required: true,
    },
    { 
      name: "email", 
      type: "email", 
      label: "E-Mail",
      placeholder: "E-Mail",
      required: true,
    },
    { 
      name: "phone", 
      type: "text", 
      label: "Telefone",
      placeholder: "Telefone",
      mask: "(99) 99999-9999",
    },
    { 
      name: "document", 
      type: "text", 
      label: "CPF",
      placeholder: "CPF",
      mask: "999.999.999-99",
    },
    { 
      name: "url", 
      type: "text", 
      label: "URL",
      placeholder: "",
    },
    { 
      name: "password", 
      type: "password", 
      label: "Senha",
      placeholder: "Senha",
      required: !isEditing,
      render: ({ field, value, onChange, error }) => {
        if (isEditing) return null;
        return (
          <div className="w-full">
            <label className="block mb-1">
              {field.label}
              {field.required && <span className="text-danger ml-1">*</span>}
            </label>
            <input
              type="password"
              value={value || ""}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={`bg-white dark:bg-dark-surface rounded-md py-4 px-4 w-full border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 ${
                error ? "border-danger" : "border-gray-300 dark:border-dark-border"
              }`}
            />
            {error && <span className="text-danger text-sm mt-1">{error}</span>}
          </div>
        );
      },
    },
    { 
      name: "roles", 
      type: "multiselect", 
      label: "Perfis",
      placeholder: "Selecione os perfis",
      options: availableRoles,
      displayValue: "name",
      emptyMessage: "Não há mais perfis disponíveis",
      colSpan: "full",
    },
    { 
      name: "is_collaborator", 
      type: "checkbox", 
      label: "Colaborador",
      render: ({ field, value, onChange, error }) => (
        <div className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-surface-hover rounded-lg border border-gray-200 dark:border-dark-border">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700 dark:text-dark-text">Colaborador</span>
            <span className="text-xs text-gray-500 dark:text-dark-text-secondary">Marque se este usuário é apenas um colaborador</span>
          </div>
          <button
            type="button"
            onClick={() => onChange(field.name, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value ? 'bg-primary dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition-transform ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          {error && <span className="text-danger text-sm mt-1">{error}</span>}
        </div>
      ),
    },
    {
      name: "services",
      type: "custom" as const,
      label: "Serviços",
      colSpan: "full" as const,
      render: ({ value, onChange, field, error }: { value: any; onChange: any; field: any; error?: string }) => {
        return (
          <UserServicesField
            value={values.services || []}
            onChange={(newServices) => setFieldValue("services", newServices)}
            className={field.className}
            error={error}
            setFieldValue={setFieldValue}
          />
        );
      },
    },
    // Horários só aparecem em modo de edição, pois precisam de serviços já cadastrados
    ...(isEditing ? [{
      name: "schedules",
      type: "custom" as const,
      label: "Horários",
      colSpan: "full" as const,
      render: ({ value, onChange, field, error }: { value: any; onChange: any; field: any; error?: string }) => {
        const currentServices = values.services || [];
        
        const validServices = currentServices.filter(s => {
          return s && 
                 typeof s === 'object' && 
                 s.name && 
                 typeof s.name === 'string' && 
                 s.name.trim() !== '';
        });
        
        const userServices = validServices.map((s, idx) => {
          const serviceId = s.id || `temp-${s.name.trim().toLowerCase().replace(/\s+/g, '-')}-${idx}`;
          return {
            id: serviceId,
            name: s.name.trim()
          };
        });
        
        return (
          <UserSchedulesField
            value={value || []}
            onChange={(newSchedules) => onChange("schedules", newSchedules)}
            className={field.className}
            error={error}
            days={days}
            services={userServices}
          />
        );
      },
    }] : []),
  ], [isEditing, values.services, setFieldValue, availableRoles, values.roles]);

  // Campos adicionais (segunda aba)
  const additionalFields: UserFormField[] = useMemo(() => [
    {
      name: "image",
      type: "custom" as const,
      label: "Imagem",
      colSpan: "full" as const,
      render: ({ field, value, onChange, error }) => {
        // Garantir que value seja sempre string ou null
        const normalizedValue = (() => {
          if (value === null || value === undefined) return '';
          if (typeof value === 'string') return value;
          if (typeof value === 'object') {
            try {
              return JSON.stringify(value);
            } catch {
              return String(value);
            }
          }
          return String(value);
        })();

        return (
          <div className="w-full">
            <FileUpload
              label="Foto do Usuário"
              value={normalizedValue}
              selectedFile={imageFile}
              setSelectedFile={(file) => {
                setImageFile(file);
                // Não atualizar o campo image aqui, será feito no submit após upload
              }}
              onDelete={() => {
                setImageFile(null);
                onChange(field.name, null);
              }}
              onRestore={() => {
                // Não há necessidade de restaurar pois ao deletar removemos completamente
              }}
            />
            {error && <span className="text-danger text-sm mt-1">{error}</span>}
          </div>
        );
      },
    },
    {
      name: "description",
      type: "custom" as const,
      label: "Descrição",
      colSpan: "full" as const,
      render: ({ field, value, onChange, error }) => {
        return (
          <div className={`w-full ${field.className || ""}`}>
            <DescriptionEditor
              value={value}
              onChange={(val) => onChange(field.name, val)}
              error={error}
              label={field.label || ""}
            />
          </div>
        );
      },
    },
  ], [imageFile, setImageFile]);

  return {
    values,
    fields,
    additionalFields,
    isEditing,
    isLoadingUser: isLoadingUser || false,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    formKey,
    imageFile,
    setImageFile,
    setFieldValue,
    onChangeService,
    addService,
    removeService,
    moveServiceUp,
    moveServiceDown,
    onChangeSchedule,
    addSchedule,
    removeSchedule,
    moveScheduleUp,
    moveScheduleDown,
    deleteUser,
    handleSubmit,
    handleBack,
  };
}

