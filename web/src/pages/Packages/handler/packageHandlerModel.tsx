import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { PackageService } from "../../../services/packageService";
import { serviceService } from "../../../services/serviceService";
import toast from "react-hot-toast";
import { Package, PackageFormValues, PackagePayload, PackageFormField } from "../types";
import { FormFieldConfig } from "../../../components/Form/types";

const defaultValues: PackageFormValues = {
  name: "",
  description: "",
  total_sessions: 1,
  bonus_sessions: 0,
  expires_in_days: null,
  is_active: true,
  price: null,
  services: [],
};

interface UsePackageHandlerReturn {
  values: PackageFormValues;
  fields: PackageFormField[];
  isEditing: boolean;
  isLoadingPackage: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  setFieldValue: (field: keyof PackageFormValues, value: any) => void;
  deletePackage: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleBack: () => void;
}

export function usePackageHandler(): UsePackageHandlerReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  const [values, setValues] = useState<PackageFormValues>(defaultValues);
  const [currencyInput, setCurrencyInput] = useState<string | undefined>(undefined);

  const reverseString = (str: string): string => {
    return str.split("").reverse().join("");
  };

  const maskCurrency = (value: string): { amount: number; maskedAmount: string } => {
    const digitsOnly = String(value).replace(/[^\d]+/gi, "");
    
    if (!digitsOnly || digitsOnly === "0") {
      return { amount: 0, maskedAmount: "" };
    }

    const cleanDigits = digitsOnly.replace(/^0+/, "") || "0";
    if (cleanDigits === "0") {
      return { amount: 0, maskedAmount: "" };
    }

    let digitsForMask = cleanDigits;
    if (digitsForMask.length === 1) {
      digitsForMask = "0" + digitsForMask;
    }

    let reversedDigits = reverseString(digitsForMask);
    const mask = reverseString("###.###.###.###.###,##");
    let result = "";

    for (let x = 0, y = 0; x < mask.length && y < reversedDigits.length;) {
      if (mask.charAt(x) !== "#") {
        result += mask.charAt(x);
        x++;
      } else {
        result += reversedDigits.charAt(y);
        y++;
        x++;
      }
    }

    result = reverseString(result);
    const amount = parseFloat(cleanDigits) / 100;

    return {
      amount,
      maskedAmount: result || ""
    };
  };

  const getCurrencyDisplay = (value: number | null | undefined): string => {
    if (value === undefined || value === null) return "";
    if (value === 0) return "";
    
    const cents = Math.round(value * 100);
    const valueStr = cents.toString();
    
    if (!valueStr || valueStr === "0") return "";
    return maskCurrency(valueStr).maskedAmount;
  };

  const handleCurrencyChange = (value: string) => {
    const digitsOnly = value.replace(/[^\d]+/gi, "");
    
    if (!digitsOnly) {
      setCurrencyInput(undefined);
      setFieldValue("price", null);
      return;
    }
    
    setCurrencyInput(digitsOnly);

    if (digitsOnly === "0") {
      setFieldValue("price", 0);
      return;
    }
    
    const amount = parseFloat(digitsOnly) / 100;
    setFieldValue("price", amount);
  };

  const getCurrencyInputValue = (numericValue: number | null | undefined): string => {
    const localValue = currencyInput;
    if (localValue !== undefined && localValue !== null && localValue !== "") {
      const formatted = maskCurrency(localValue).maskedAmount;
      return formatted;
    }
    
    if (localValue === "") {
      return "";
    }
    
    return getCurrencyDisplay(numericValue);
  };

  const { data: existingPackage, isLoading: isLoadingPackage } = useQuery<Package>({
    queryKey: ["package", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const result = await PackageService.get(id);
      return result as Package;
    },
    enabled: isEditing && !!id,
  });

  const { data: servicesData } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const result = await serviceService.list();
      return result;
    },
  });

  const services = Array.isArray(servicesData) ? servicesData : (servicesData?.data || []);

  useEffect(() => {
    if (existingPackage) {
      if (Array.isArray(services) && services.length > 0) {
        const packageServices = existingPackage.services || [];
        const servicesOptions = services.map(s => ({ value: s.id, label: s.name }));
        const selectedServices = packageServices
          .map(ps => {
            const serviceId = typeof ps === 'object' ? ps.id : ps;
            return servicesOptions.find(opt => opt.value === serviceId);
          })
          .filter(Boolean) as Array<{ value: number; label: string }>;

        setValues({
          name: existingPackage.name || "",
          description: existingPackage.description || "",
          total_sessions: existingPackage.total_sessions || 1,
          bonus_sessions: existingPackage.bonus_sessions || 0,
          expires_in_days: existingPackage.expires_in_days ?? null,
          is_active: existingPackage.is_active ?? true,
          price: existingPackage.price ?? null,
          services: selectedServices,
        });
      } else {
        setValues({
          name: existingPackage.name || "",
          description: existingPackage.description || "",
          total_sessions: existingPackage.total_sessions || 1,
          bonus_sessions: existingPackage.bonus_sessions || 0,
          expires_in_days: existingPackage.expires_in_days ?? null,
          is_active: existingPackage.is_active ?? true,
          price: existingPackage.price ?? null,
          services: [],
        });
      }
    }
  }, [existingPackage, services]);

  const createMutation = useMutation({
    mutationFn: async (payload: PackagePayload) => {
      return await PackageService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success("Pacote criado com sucesso!");
      navigate("/pacotes");
    },
    onError: () => {
      toast.error("Houve um problema ao cadastrar o pacote. Por favor, tente novamente mais tarde");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: PackagePayload }) => {
      return await PackageService.update(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success("Pacote atualizado com sucesso!");
      navigate("/pacotes");
    },
    onError: () => {
      toast.error("Houve um problema ao atualizar o pacote. Por favor, tente novamente mais tarde");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (packageId: string) => {
      return await PackageService.delete(packageId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success("Pacote apagado com sucesso!");
      navigate("/pacotes");
    },
    onError: () => {
      toast.error("Erro ao apagar pacote. Tente novamente.");
    },
  });

  const setFieldValue = useCallback((field: keyof PackageFormValues, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const deletePackage = useCallback(async () => {
    if (!id) return;
    if (confirm("Tem certeza que deseja excluir este pacote?")) {
      deleteMutation.mutate(id);
    }
  }, [id, deleteMutation]);

  const handleSubmit = useCallback(async () => {
    const servicesIds = Array.isArray(values.services) 
      ? values.services.map((s: any) => typeof s === 'object' && s.value ? s.value : s)
      : [];

    const payload: PackagePayload = {
      name: values.name,
      description: values.description || undefined,
      total_sessions: values.total_sessions,
      bonus_sessions: values.bonus_sessions || undefined,
      expires_in_days: values.expires_in_days || undefined,
      is_active: values.is_active,
      price: values.price || undefined,
      services: servicesIds.length > 0 ? servicesIds : undefined,
    };

    if (isEditing && id) {
      updateMutation.mutate({ id, payload });
    } else {
      createMutation.mutate(payload);
    }
  }, [values, isEditing, id, createMutation, updateMutation]);

  const handleBack = useCallback(() => {
    navigate("/pacotes");
  }, [navigate]);

  const fields: PackageFormField[] = [
    {
      name: "name",
      label: "Nome do Pacote",
      type: "text",
      placeholder: "Ex: Pacote Mensal, Combo Premium",
      required: true,
    },
    {
      name: "description",
      label: "Descrição",
      type: "textarea",
      placeholder: "Descreva os benefícios e características do pacote",
      colSpan: "full",
    },
    {
      name: "total_sessions",
      label: "Total de Sessões",
      type: "number",
      placeholder: "Ex: 5, 10, 20",
      required: true,
      min: 1,
    },
    {
      name: "bonus_sessions",
      label: "Sessões Bônus",
      type: "number",
      placeholder: "Ex: 0, 1, 2",
      min: 0,
    },
    {
      name: "expires_in_days",
      label: "Validade (dias)",
      type: "number",
      placeholder: "Ex: 30, 60, 90 (deixe vazio para ilimitado)",
      min: 1,
    },
    {
      name: "price",
      type: "text",
      label: "Preço",
      placeholder: "Preço",
      render: ({ field, value, onChange, error }) => (
        <div className="w-full">
          <label className="block mb-1 text-gray-700 dark:text-dark-text">
            {field.label || "Preço"}
            {field.required && <span className="text-danger ml-1">*</span>}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={getCurrencyInputValue(value)}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            onBlur={() => {
              setCurrencyInput(undefined);
            }}
            placeholder="0,00"
            className={`bg-white dark:bg-dark-surface rounded-md py-4 px-4 w-full border text-gray-700 dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500 ${
              error ? "border-danger" : "border-gray-300 dark:border-dark-border"
            }`}
          />
          {error && <span className="text-danger text-sm mt-1">{error}</span>}
        </div>
      ),
    },
    {
      name: "is_active",
      label: "Pacote Ativo",
      type: "checkbox",
    },
    {
      name: "services",
      label: "Serviços Incluídos",
      type: "multiselect",
      placeholder: "Selecione os serviços que fazem parte deste pacote",
      options: Array.isArray(services) ? services.map(s => ({ value: s.id, label: s.name })) : [],
      displayValue: "label",
      colSpan: "full",
    },
  ];

  return {
    values,
    fields,
    isEditing,
    isLoadingPackage,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    setFieldValue,
    deletePackage,
    handleSubmit,
    handleBack,
  };
}

