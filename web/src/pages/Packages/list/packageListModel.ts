import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { PackageService } from "../../../services/packageService";
import toast from "react-hot-toast";
import { Package } from "../types";

interface UsePackageListReturn {
  packages: Package[];
  isLoading: boolean;
  handleCreateClick: () => void;
  handleEditClick: (pkg: Package) => void;
  handleDelete: (pkg: Package) => void;
  handleToggleActive: (pkg: Package) => void;
  formatPrice: (price: number | null | undefined) => string;
}

export function usePackageList(): UsePackageListReturn {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: packages = [], isLoading } = useQuery<Package[]>({
    queryKey: ["packages"],
    queryFn: async () => {
      const result = await PackageService.list();
      return (result || []) as Package[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await PackageService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success("Pacote excluído com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir pacote. Tente novamente.");
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await PackageService.toggleActive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["packages"] });
      toast.success("Status do pacote atualizado!");
    },
    onError: () => {
      toast.error("Erro ao atualizar status. Tente novamente.");
    },
  });

  const handleCreateClick = (): void => {
    navigate("/pacotes/criar");
  };

  const handleEditClick = (pkg: Package): void => {
    if (!pkg.id) return;
    navigate(`/pacotes/${pkg.id}/editar`);
  };

  const handleDelete = (pkg: Package): void => {
    if (!pkg.id) return;
    if (confirm(`Tem certeza que deseja excluir o pacote ${pkg.name}?`)) {
      deleteMutation.mutate(pkg.id);
    }
  };

  const handleToggleActive = (pkg: Package): void => {
    if (!pkg.id) return;
    toggleActiveMutation.mutate(pkg.id);
  };

  const formatPrice = (price: number | null | undefined): string => {
    if (price === null || price === undefined) return "Grátis";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  };

  return {
    packages,
    isLoading,
    handleCreateClick,
    handleEditClick,
    handleDelete,
    handleToggleActive,
    formatPrice,
  };
}

