import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { serviceService } from "../../../services/serviceService";
import toast from "react-hot-toast";
import { Service } from "../types";

interface UseServiceListReturn {
  services: Service[];
  isLoading: boolean;
  handleCreateClick: () => void;
  handleEditClick: (service: Service) => void;
  handleDelete: (service: Service) => void;
  formatPrice: (price: number) => string;
}

export function useServiceList(): UseServiceListReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: async () => {
      const result = await serviceService.list();
      return (result || []) as Service[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await serviceService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Serviço excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir serviço. Tente novamente.");
    },
  });

  const handleCreateClick = (): void => {
    navigate("/servicos/criar");
  };

  const handleEditClick = (service: Service): void => {
    if (!service.id) return;
    navigate(`/servicos/${service.id}/editar`);
  };

  const handleDelete = (service: Service): void => {
    if (!service.id) return;
    if (confirm(`Tem certeza que deseja excluir o serviço ${service.name}?`)) {
      deleteMutation.mutate(service.id);
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return {
    services,
    isLoading,
    handleCreateClick,
    handleEditClick,
    handleDelete,
    formatPrice,
  };
}

