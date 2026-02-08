import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { serviceService } from "../../../services/serviceService";
import { uuidv4, submitFile } from "../../../services/utils";
import toast from "react-hot-toast";
import { Service, ServiceFormValues, ServicePayload, ServiceFormField } from "../types";
import FileUpload from "../../../components/FileUpload";
import { CurrencyInput } from "../../../components/CurrencyInput";

const defaultValues: ServiceFormValues = {
  name: "",
  description: "",
  price: 0,
  cost: 0,
  duration: 0,
  commission: 0,
  status: 1,
  photo: null,
};

interface UseServiceHandlerReturn {
  values: ServiceFormValues;
  fields: ServiceFormField[];
  isEditing: boolean;
  isLoadingService: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  photoFile: File | null;
  photoRemoved: boolean;
  setFieldValue: (field: keyof ServiceFormValues, value: any) => void;
  setPhotoFile: (file: File | null) => void;
  setPhotoRemoved: (removed: boolean) => void;
  removePhoto: () => void;
  deleteService: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleBack: () => void;
}

export function useServiceHandler(): UseServiceHandlerReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  const [values, setValues] = useState<ServiceFormValues>(defaultValues);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);

  const { data: existingService, isLoading: isLoadingService } = useQuery<Service>({
    queryKey: ["service", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const result = await serviceService.get(id);
      return result as Service;
    },
    enabled: isEditing && !!id,
  });

  useEffect(() => {
    if (existingService) {
      setValues({
        name: existingService.name || "",
        description: existingService.description || "",
        price: existingService.price || 0,
        cost: existingService.cost || 0,
        duration: existingService.duration || 0,
        commission: existingService.commission || 0,
        status: existingService.status ?? 1,
        photo: existingService.photo || null,
      });
    }
  }, [existingService]);

  const createMutation = useMutation({
    mutationFn: async (payload: ServicePayload) => {
      return await serviceService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Serviço criado com sucesso!");
      navigate("/servicos");
    },
    onError: () => {
      toast.error("Houve um problema ao cadastrar o serviço. Por favor, tente novamente mais tarde");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: ServicePayload }) => {
      return await serviceService.update(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Serviço atualizado com sucesso!");
      navigate("/servicos");
    },
    onError: () => {
      toast.error("Houve um problema ao atualizar o serviço. Por favor, tente novamente mais tarde");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      return await serviceService.delete(serviceId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Serviço apagado com sucesso!");
      navigate("/servicos");
    },
    onError: () => {
      toast.error("Erro ao apagar serviço. Tente novamente.");
    },
  });

  const setFieldValue = useCallback((field: keyof ServiceFormValues, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);


  const removePhoto = useCallback(() => {
    setPhotoFile(null);
    setPhotoRemoved(true);
  }, []);

  const deleteService = async (): Promise<void> => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja apagar este serviço?')) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const handleSubmit = async (): Promise<void> => {
    const payload: ServicePayload = {
      name: values.name,
      description: values.description,
      price: values.price,
      cost: values.cost,
      duration: values.duration,
      commission: values.commission,
      status: values.status,
    };

    if (photoFile && !photoRemoved) {
      const photoPath = await submitFile(photoFile, uuidv4());
      payload.photo = photoPath;
    }

    if (photoRemoved) {
      payload.photo = null;
    }

    if (isEditing && id) {
      updateMutation.mutate({ id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleBack = (): void => {
    navigate("/servicos");
  };

  const fields: ServiceFormField[] = [
    { 
      name: "name", 
      type: "text", 
      label: "Nome",
      placeholder: "Nome",
      required: true,
    },
    { 
      name: "description", 
      type: "textarea", 
      label: "Descrição",
      placeholder: "Descrição",
      colSpan: "full",
    },
    { 
      name: "price", 
      type: "text", 
      label: "Preço",
      placeholder: "Preço",
      render: ({ field, value, onChange, error }) => (
        <CurrencyInput
          label={field.label || "Preço"}
          value={value}
          onChange={(val) => onChange(field.name, val)}
          placeholder={field.placeholder}
          required={field.required}
          error={error}
          allowZero={true}
        />
      ),
    },
    { 
      name: "cost", 
      type: "text", 
      label: "Custo",
      placeholder: "Custo",
      render: ({ field, value, onChange, error }) => (
        <CurrencyInput
          label={field.label || "Custo"}
          value={value}
          onChange={(val) => onChange(field.name, val)}
          placeholder={field.placeholder}
          required={field.required}
          error={error}
          allowZero={true}
        />
      ),
    },
    { 
      name: "duration", 
      type: "number", 
      label: "Duração (minutos)",
      placeholder: "Duração",
    },
    { 
      name: "commission", 
      type: "number", 
      label: "Comissão",
      placeholder: "Comissão",
    },
    { 
      name: "status", 
      type: "select", 
      label: "Habilitado",
      options: [
        { value: 1, label: "Sim" },
        { value: 0, label: "Não" },
      ],
    },
    { 
      name: "photo", 
      type: "text", 
      label: "Foto",
      colSpan: "full",
      render: ({ field, value, onChange, error }) => {
        return (
          <div className="w-full">
            <FileUpload
              label={field.label || "Foto"}
              value={value || ""}
              setSelectedFile={setPhotoFile}
              selectedFile={photoFile}
              onDelete={removePhoto}
              fileRemoved={photoRemoved}
              onRestore={() => setPhotoRemoved(false)}
            />
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
    isLoadingService: isLoadingService || false,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    photoFile,
    photoRemoved,
    setFieldValue,
    setPhotoFile,
    setPhotoRemoved,
    removePhoto,
    deleteService,
    handleSubmit,
    handleBack,
  };
}

