import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { customerService } from "../../../services/customerService";
import toast from "react-hot-toast";
import { Customer, CustomerFormValues, CustomerPayload, CustomerFormField } from "../types";

const defaultValues: CustomerFormValues = {
  name: "",
  email: "",
  phone: "",
  document: "",
};

interface UseCustomerHandlerReturn {
  values: CustomerFormValues;
  fields: CustomerFormField[];
  isEditing: boolean;
  isLoadingCustomer: boolean;
  isSaving: boolean;
  isSavingContext: boolean;
  isDeleting: boolean;
  context: string;
  setContext: (value: string) => void;
  setFieldValue: (field: keyof CustomerFormValues, value: any) => void;
  deleteCustomer: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleSaveContext: () => Promise<void>;
  handleBack: () => void;
}

export function useCustomerHandler(): UseCustomerHandlerReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  const [values, setValues] = useState<CustomerFormValues>(defaultValues);

  const { data: existingCustomer, isLoading: isLoadingCustomer } = useQuery<Customer>({
    queryKey: ["customer", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const result = await customerService.get(id);
      return result as Customer;
    },
    enabled: isEditing && !!id,
  });

  const [context, setContext] = useState<string>("");

  useEffect(() => {
    if (existingCustomer) {
      setValues({
        name: existingCustomer.name || "",
        email: existingCustomer.email || "",
        phone: existingCustomer.phone || "",
        document: existingCustomer.document || "",
      });
      setContext(existingCustomer.context || "");
    }
  }, [existingCustomer]);

  const createMutation = useMutation({
    mutationFn: async (payload: CustomerPayload) => {
      return await customerService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente criado com sucesso!");
      navigate("/clientes");
    },
    onError: () => {
      toast.error("Erro ao criar cliente. Tente novamente.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CustomerPayload }) => {
      return await customerService.update(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente atualizado com sucesso!");
      navigate("/clientes");
    },
    onError: () => {
      toast.error("Erro ao atualizar cliente. Tente novamente.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (customerId: string) => {
      return await customerService.delete(customerId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Cliente apagado com sucesso!");
      navigate("/clientes");
    },
    onError: () => {
      toast.error("Erro ao apagar cliente. Tente novamente.");
    },
  });

  const setFieldValue = useCallback((field: keyof CustomerFormValues, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const deleteCustomer = async (): Promise<void> => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja apagar este cliente?')) {
      return;
    }
    deleteMutation.mutate(id);
  };

  const handleSubmit = async (): Promise<void> => {
    const payload: CustomerPayload = {
      name: values.name,
      email: values.email || undefined,
      phone: values.phone || undefined,
      document: values.document || undefined,
    };

    if (isEditing && id) {
      updateMutation.mutate({ id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      return await customerService.updateNotes(id, notes);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", id] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Contexto atualizado com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao atualizar contexto. Tente novamente.");
    },
  });

  const handleSaveContext = async (): Promise<void> => {
    if (!id || !isEditing) return;
    updateNotesMutation.mutate({ id, notes: context });
  };

  const handleBack = (): void => {
    navigate("/clientes");
  };

  const fields: CustomerFormField[] = [
    { 
      name: "name", 
      type: "text", 
      label: "Nome completo",
      placeholder: "Digite o nome completo",
      required: true,
    },
    { 
      name: "document", 
      type: "text", 
      label: "CPF",
      placeholder: "000.000.000-00",
      mask: "999.999.999-99",
      required: true,
    },
    { 
      name: "email", 
      type: "email", 
      label: "E-Mail",
      placeholder: "Digite o e-mail",
    },
    { 
      name: "phone", 
      type: "text", 
      label: "Telefone",
      placeholder: "(00) 00000-0000",
      mask: "(99) 99999-9999",
    },
  ];

  return {
    values,
    fields,
    isEditing,
    isLoadingCustomer: isLoadingCustomer || false,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isSavingContext: updateNotesMutation.isPending,
    isDeleting: deleteMutation.isPending,
    context,
    setContext,
    setFieldValue,
    deleteCustomer,
    handleSubmit,
    handleSaveContext,
    handleBack,
  };
}

