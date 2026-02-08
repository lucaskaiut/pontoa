import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { useCompany } from "../../../contexts/CompanyContext";
import toast from "react-hot-toast";

interface Store {
  id: number;
  name: string;
  email?: string;
  domain?: string;
  phone?: string;
  document?: string;
  active?: boolean;
}

interface UseStoreListReturn {
  stores: Store[];
  isLoading: boolean;
  handleEditClick: (store: Store) => void;
  handleCreateClick: () => void;
  handleToggleActive: (store: Store) => void;
  isToggling: boolean;
}

export function useStoreList(): UseStoreListReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userCompanyId, isSuperadmin } = useCompany();
  const [stores, setStores] = useState<Store[]>([]);

  const { isLoading } = useQuery<Store[]>({
    queryKey: ["stores", userCompanyId],
    queryFn: async () => {
      if (!isSuperadmin || !userCompanyId) {
        return [];
      }

      try {
        const response = await api.get("/companies", {
          params: {
            parent_id: userCompanyId,
          },
        });

        const companies = response.data?.data || response.data || [];
        const formattedStores: Store[] = companies.map((c: any) => ({
          id: c.id,
          name: c.name,
          email: c.email,
          domain: c.domain,
          phone: c.phone,
          document: c.document,
          active: c.active,
        }));

        setStores(formattedStores);
        return formattedStores;
      } catch (error: any) {
        console.error("Error fetching stores:", error);
        toast.error("Erro ao carregar lojas.");
        return [];
      }
    },
    enabled: isSuperadmin && !!userCompanyId,
  });

  const handleEditClick = (store: Store) => {
    navigate(`/lojas/${store.id}/editar`);
  };

  const handleCreateClick = () => {
    navigate("/lojas/criar");
  };

  const toggleActiveMutation = useMutation({
    mutationFn: async (store: Store) => {
      const response = await api.put(`/companies/${store.id}`, {
        active: !store.active,
      });
      return response.data?.data || response.data;
    },
    onSuccess: (updatedCompany) => {
      queryClient.invalidateQueries({ queryKey: ["stores", userCompanyId] });
      toast.success(updatedCompany.active ? "Loja ativada com sucesso!" : "Loja desativada com sucesso!");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erro ao alterar status da loja. Tente novamente.";
      toast.error(message);
    },
  });

  const handleToggleActive = (store: Store) => {
    if (confirm(`Tem certeza que deseja ${store.active ? 'desativar' : 'ativar'} a loja ${store.name}?`)) {
      toggleActiveMutation.mutate(store);
    }
  };

  return {
    stores,
    isLoading,
    handleEditClick,
    handleCreateClick,
    handleToggleActive,
    isToggling: toggleActiveMutation.isPending,
  };
}

