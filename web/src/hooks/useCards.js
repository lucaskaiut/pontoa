import { useQuery } from "@tanstack/react-query";
import api from "../services/api";

export const useCards = () => {
  const query = useQuery({
    queryKey: ["cards"],
    queryFn: async () => {
      try {
        const response = await api.get("/companies/cards");
        const raw = response.data?.data || response.data || [];
        return Array.isArray(raw) ? raw : [];
      } catch (error) {
        console.error("Error fetching cards:", error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
  });

  return query;
};

