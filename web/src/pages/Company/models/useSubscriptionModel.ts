import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../../services/api";
import toast from "react-hot-toast";
import moment from "moment";
import { Company } from "../types";

export function useSubscriptionModel() {
  const { user, me } = useAuth();
  const company = user?.company as Company | undefined;

  const getFreePlanEndDate = (): string => {
    if (company?.plan_trial_ends_at) {
      return moment(company.plan_trial_ends_at).format("DD/MM/YYYY");
    }

    if ((company as any)?.created_at && (company as any)?.plan?.free != null) {
      const freeDays = Number((company as any).plan.free) || 0;
      return moment((company as any).created_at).add(freeDays, "days").format("DD/MM/YYYY");
    }

    return "";
  };

  const getNextBillingDate = (): string => {
    if (company?.is_free && company?.plan_trial_ends_at && moment(company.plan_trial_ends_at).isAfter(moment())) {
      return moment(company.plan_trial_ends_at).format("DD/MM/YYYY");
    }

    if (company?.last_billed_at) {
      let daysToAdd = 30;

      if (company.plan_recurrence === "yearly") {
        daysToAdd = 365;
      } else if (company.plan_recurrence === "monthly") {
        daysToAdd = 30;
      } else if ((company as any)?.plan?.days) {
        daysToAdd = Number((company as any).plan.days) || 30;
      }

      return moment(company.last_billed_at).add(daysToAdd, "days").format("DD/MM/YYYY");
    }

    if (company?.plan_trial_ends_at) {
      return moment(company.plan_trial_ends_at).format("DD/MM/YYYY");
    }

    return "";
  };

  const getPlanLabel = (): string => {
    if (company?.plan_name && company?.plan_recurrence) {
      const planTypeLabel = company.plan_name === "pro" ? "PRO (com IA)" : "Básico";
      const recurrenceLabel = company.plan_recurrence === "yearly" ? "Anual" : "Mensal";
      return `${planTypeLabel} - ${recurrenceLabel}`;
    }

    if ((company as any)?.plan?.name) {
      return (company as any).plan.name;
    }

    return "Plano";
  };

  const getSubscriptionStatusLabel = (): string | null => {
    if (!company?.subscription_status) {
      return null;
    }

    const status = company.subscription_status;

    if (status === "CANCELED" && !!company?.cancel_at_period_end) {
      if (company?.current_period_end) {
        const endDate = moment(company.current_period_end);
        if (endDate.isAfter(moment())) {
          return `Cancelamento agendado - Ativo até ${endDate.format("DD/MM/YYYY")}`;
        }
      }
      return "Cancelamento agendado";
    }

    if (status === "EXPIRED") {
      return "Plano expirado";
    }

    if (status === "SUSPENDED") {
      return "Plano suspenso";
    }

    if (status === "ACTIVE" && company?.current_period_end) {
      return `Ativo até ${moment(company.current_period_end).format("DD/MM/YYYY")}`;
    }

    return "Ativo";
  };

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/companies/cancel-subscription");
      return response.data;
    },
    onSuccess: async () => {
      toast.success("Assinatura cancelada com sucesso. Você terá acesso até o fim do período pago.");
      try {
        await me();
      } catch (error) {
        console.error("Erro ao atualizar dados do usuário:", error);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erro ao cancelar assinatura. Tente novamente.";
      toast.error(message);
    },
  });

  const reactivateSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post("/companies/reactivate-subscription");
      return response.data;
    },
    onSuccess: async () => {
      toast.success("Assinatura reativada com sucesso!");
      try {
        await me();
      } catch (error) {
        console.error("Erro ao atualizar dados do usuário:", error);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erro ao reativar assinatura. Tente novamente.";
      toast.error(message);
    },
  });

  const handleCancelSubscription = () => {
    if (window.confirm("Tem certeza que deseja cancelar sua assinatura? Você terá acesso até o fim do período pago, mas a assinatura não será renovada.")) {
      cancelSubscriptionMutation.mutate();
    }
  };

  const handleReactivateSubscription = () => {
    if (window.confirm("Deseja reativar sua assinatura? A renovação automática será restaurada.")) {
      reactivateSubscriptionMutation.mutate();
    }
  };

  return {
    company,
    getFreePlanEndDate,
    getNextBillingDate,
    getPlanLabel,
    getSubscriptionStatusLabel,
    handleCancelSubscription,
    handleReactivateSubscription,
    isCanceling: cancelSubscriptionMutation.isPending,
    isReactivating: reactivateSubscriptionMutation.isPending,
  };
}






