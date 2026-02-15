import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { roleService } from "../../../services/roleService";
import toast from "react-hot-toast";
import { Role, RoleFormValues, RolePayload, RoleFormField, Permission } from "../types";

const defaultValues: RoleFormValues = {
  name: "",
  description: "",
  permissions: [],
};

interface UseRoleHandlerReturn {
  values: RoleFormValues;
  fields: RoleFormField[];
  isEditing: boolean;
  isLoadingRole: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  setFieldValue: (field: keyof RoleFormValues, value: any) => void;
  deleteRole: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleBack: () => void;
}

export function useRoleHandler(): UseRoleHandlerReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;

  const [values, setValues] = useState<RoleFormValues>(defaultValues);

  // Query para buscar permissões disponíveis
  const { data: availablePermissions = [], isLoading: isLoadingPermissions } = useQuery<Permission[]>({
    queryKey: ["permissions"],
    queryFn: async () => {
      const result = await roleService.getPermissions();
      return (result || []) as Permission[];
    },
  });

  // Query para buscar dados existentes (apenas em edição)
  const { data: existingRole, isLoading: isLoadingRole } = useQuery<Role>({
    queryKey: ["role", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");
      const result = await roleService.get(id);
      return result as Role;
    },
    enabled: isEditing && !!id,
  });

  // Effect para preencher formulário quando dados existentes são carregados
  useEffect(() => {
    if (existingRole && availablePermissions.length > 0) {
      // Mapear as permissões do role para objetos Permission
      const selectedPermissions = existingRole.permissions
        ? existingRole.permissions
            .map(permName => availablePermissions.find(p => p.name === permName))
            .filter((p): p is Permission => p !== undefined)
        : [];
      
      setValues({
        name: existingRole.name || "",
        description: existingRole.description || "",
        permissions: selectedPermissions,
      });
    }
  }, [existingRole, availablePermissions]);

  // Mutation para criar
  const createMutation = useMutation({
    mutationFn: async (payload: RolePayload) => {
      return await roleService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Perfil criado com sucesso!");
      navigate("/perfis");
    },
    onError: () => {
      toast.error("Erro ao criar perfil. Tente novamente.");
    },
  });

  // Mutation para atualizar
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: RolePayload }) => {
      return await roleService.update(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Perfil atualizado com sucesso!");
      navigate("/perfis");
    },
    onError: () => {
      toast.error("Erro ao atualizar perfil. Tente novamente.");
    },
  });

  // Mutation para deletar
  const deleteMutation = useMutation({
    mutationFn: async (roleId: string) => {
      return await roleService.delete(roleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Perfil excluído com sucesso!");
      navigate("/perfis");
    },
    onError: () => {
      toast.error("Erro ao excluir perfil. Tente novamente.");
    },
  });

  // Handler para atualizar valores do formulário
  const setFieldValue = useCallback((field: keyof RoleFormValues, value: any) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handler para deletar
  const deleteRole = async (): Promise<void> => {
    if (!id) return;
    if (!confirm('Tem certeza que deseja excluir este perfil?')) {
      return;
    }
    deleteMutation.mutate(id);
  };

  // Handler para submeter formulário
  const handleSubmit = async (): Promise<void> => {
    const payload: RolePayload = {
      name: values.name,
      description: values.description || undefined,
      permissions: values.permissions.length > 0 
        ? values.permissions.map(perm => perm.name)
        : undefined,
    };

    if (isEditing && id) {
      updateMutation.mutate({ id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  // Handler para voltar
  const handleBack = (): void => {
    navigate("/perfis");
  };

  // Configuração dos campos do formulário
  const fields: RoleFormField[] = useMemo(() => [
    { 
      name: "name", 
      type: "text", 
      label: "Nome",
      placeholder: "Digite o nome do perfil",
      required: true,
    },
    { 
      name: "description", 
      type: "textarea", 
      label: "Descrição",
      placeholder: "Digite a descrição do perfil",
      colSpan: "full",
    },
    { 
      name: "permissions", 
      type: "multiselect", 
      label: "Permissões",
      placeholder: "Selecione as permissões",
      options: availablePermissions,
      displayValue: "label",
      emptyMessage: "Não há mais permissões disponíveis",
      colSpan: "full",
    },
  ], [availablePermissions]);

  return {
    values,
    fields,
    isEditing,
    isLoadingRole: isLoadingRole || isLoadingPermissions || false,
    isSaving: createMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    setFieldValue,
    deleteRole,
    handleSubmit,
    handleBack,
  };
}


