import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const usePlans = () => {
  const query = useQuery({
    queryKey: ["publicPlans"],
    queryFn: async () => {
      try {
        const response = await api.get("/plans");
        const raw = response.data?.data || response.data || [];

        // New format: array of plans with type, recurrence, price, etc.
        if (Array.isArray(raw) && raw.length > 0) {
          return raw;
        }

        // Fallback to legacy format if needed
        if (typeof raw === 'object' && !Array.isArray(raw)) {
          return Object.entries(raw || {}).map(([id, config]) => ({
            id,
            ...(config || {}),
          }));
        }

        // Default fallback
        return [
          { type: "basic", recurrence: "monthly", price: 49.90, trial_days: 7, type_label: "Básico", recurrence_label: "Mensal" },
          { type: "basic", recurrence: "yearly", price: 499.00, trial_days: 30, type_label: "Básico", recurrence_label: "Anual" },
          { type: "pro", recurrence: "monthly", price: 149.90, trial_days: 7, type_label: "PRO (com IA)", recurrence_label: "Mensal" },
          { type: "pro", recurrence: "yearly", price: 999.00, trial_days: 30, type_label: "PRO (com IA)", recurrence_label: "Anual" },
        ];
      } catch (error) {
        console.error("Error fetching plans:", error);
        // Default fallback
        return [
          { type: "basic", recurrence: "monthly", price: 49.90, trial_days: 7, type_label: "Básico", recurrence_label: "Mensal" },
          { type: "basic", recurrence: "yearly", price: 499.00, trial_days: 30, type_label: "Básico", recurrence_label: "Anual" },
          { type: "pro", recurrence: "monthly", price: 149.90, trial_days: 7, type_label: "PRO (com IA)", recurrence_label: "Mensal" },
          { type: "pro", recurrence: "yearly", price: 999.00, trial_days: 30, type_label: "PRO (com IA)", recurrence_label: "Anual" },
        ];
      }
    },
    staleTime: 1000 * 60 * 10,
  });

  return query;
};


