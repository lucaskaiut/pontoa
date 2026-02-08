import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewService } from "../../../services/reviewService";
import toast from "react-hot-toast";
import { Review } from "../types";
import { useState } from "react";

interface UseReviewListReturn {
  reviews: Review[];
  isLoading: boolean;
  selectedClassification: string | null;
  setSelectedClassification: (classification: string | null) => void;
  handleDelete: (review: Review) => void;
  getClassificationLabel: (classification: string) => string;
  getClassificationColor: (classification: string) => string;
}

export function useReviewList(): UseReviewListReturn {
  const queryClient = useQueryClient();
  const [selectedClassification, setSelectedClassification] = useState<string | null>(null);

  const filters: any = {};
  if (selectedClassification) {
    filters.classification = selectedClassification;
  }

  const { data, isLoading } = useQuery<{ data: Review[]; meta?: any; links?: any } | Review[]>({
    queryKey: ["reviews", selectedClassification],
    queryFn: async () => {
      const result = await reviewService.list(filters);
      return result;
    },
  });

  const reviews = Array.isArray(data) ? data : (data?.data || []);

  const deleteMutation = useMutation({
    mutationFn: async (id: string | number) => {
      return await reviewService.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      toast.success("Avaliação excluída com sucesso!");
    },
    onError: () => {
      toast.error("Erro ao excluir avaliação. Tente novamente.");
    },
  });

  const handleDelete = (review: Review): void => {
    if (!review.id) return;
    if (confirm(`Tem certeza que deseja excluir esta avaliação?`)) {
      deleteMutation.mutate(review.id);
    }
  };

  const getClassificationLabel = (classification: string): string => {
    const labels: Record<string, string> = {
      promoter: "Promotor",
      neutral: "Neutro",
      detractor: "Detrator",
    };
    return labels[classification] || classification;
  };

  const getClassificationColor = (classification: string): string => {
    const colors: Record<string, string> = {
      promoter: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      neutral: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      detractor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    };
    return colors[classification] || "";
  };

  return {
    reviews,
    isLoading,
    selectedClassification,
    setSelectedClassification,
    handleDelete,
    getClassificationLabel,
    getClassificationColor,
  };
}

