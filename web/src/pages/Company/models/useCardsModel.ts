import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import { useCards } from "../../../hooks/useCards";
import api from "../../../services/api";
import toast from "react-hot-toast";
import { validateData } from "../../../services/formValidation";
import { CardFormValues, Company } from "../types";

export function useCardsModel() {
  const { user, me } = useAuth();
  const company = user?.company as Company | undefined;
  const { data: cards = [], isLoading: cardsLoading, refetch: refetchCards } = useCards();

  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const [card, setCard] = useState<CardFormValues>({
    number: "",
    holder_name: "",
    holder_document: "",
    exp_month: "",
    exp_year: "",
    cvv: "",
  });
  const [cardDue, setCardDue] = useState("");
  const [cardFormErrors, setCardFormErrors] = useState<Record<string, string>>({});

  const handleMaskedInput = (field: keyof CardFormValues, value: string) => {
    setCard({ ...card, [field]: value.replace(/\D/g, "") });
  };

  const handleDueInput = (value: string) => {
    setCardDue(value);
    const numericValue = value.replace(/\D/g, "");
    if (numericValue.length >= 2) {
      const month = numericValue.substring(0, 2);
      const year = numericValue.substring(2);
      if (year.length === 2) {
        const fullYear = `20${year}`;
        setCard({
          ...card,
          exp_month: month,
          exp_year: fullYear,
        });
      } else if (year.length === 4) {
        setCard({
          ...card,
          exp_month: month,
          exp_year: year,
        });
      } else {
        setCard({
          ...card,
          exp_month: month,
          exp_year: "",
        });
      }
    }
  };

  const validateCard = (): boolean => {
    const rules = {
      number: ["required", "length:16"],
      holder_name: ["required"],
      holder_document: ["required", "length:11"],
      exp_month: ["required", "length:2"],
      exp_year: ["required", "length:4"],
      cvv: ["required", "length:3"],
    };

    const validationResult = validateData(card, rules);
    const errorMessages: Record<string, string> = {};
    
    Object.keys(validationResult.errors).forEach((field) => {
      if (validationResult.errors[field] === true) {
        errorMessages[field] = "Campo inválido";
      }
    });
    
    setCardFormErrors(errorMessages);
    return Object.keys(errorMessages).length === 0;
  };

  const addCardMutation = useMutation({
    mutationFn: async (cardData: { credit_card: CardFormValues }) => {
      const response = await api.post("/companies/update-credit-card", cardData);
      return response.data;
    },
    onSuccess: async () => {
      toast.success("Cartão adicionado com sucesso!");
      setShowCreditCardForm(false);
      setCard({
        number: "",
        holder_name: "",
        holder_document: "",
        exp_month: "",
        exp_year: "",
        cvv: "",
      });
      setCardDue("");
      setCardFormErrors({});
      try {
        await me();
        await refetchCards();
      } catch (error) {
        console.error("Erro ao atualizar dados:", error);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erro ao adicionar cartão. Tente novamente.";
      toast.error(message);
    },
  });

  const setActiveCardMutation = useMutation({
    mutationFn: async (cardId: number) => {
      const response = await api.post("/companies/set-active-card", { card_id: cardId });
      return response.data;
    },
    onSuccess: async () => {
      toast.success("Cartão ativo atualizado com sucesso!");
      try {
        await me();
        await refetchCards();
      } catch (error) {
        console.error("Erro ao atualizar dados:", error);
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Erro ao atualizar cartão ativo. Tente novamente.";
      toast.error(message);
    },
  });

  const handleAddCard = () => {
    if (!validateCard()) {
      toast.error("Por favor, preencha todos os dados do cartão corretamente");
      return;
    }

    addCardMutation.mutate({ credit_card: card });
  };

  const handleSetActiveCard = (cardId: number) => {
    if (window.confirm("Deseja definir este cartão como ativo?")) {
      setActiveCardMutation.mutate(cardId);
    }
  };

  const resetCardForm = () => {
    setShowCreditCardForm(false);
    setCard({
      number: "",
      holder_name: "",
      holder_document: "",
      exp_month: "",
      exp_year: "",
      cvv: "",
    });
    setCardDue("");
    setCardFormErrors({});
  };

  return {
    company,
    cards,
    cardsLoading,
    showCreditCardForm,
    setShowCreditCardForm,
    card,
    setCard,
    cardDue,
    handleMaskedInput,
    handleDueInput,
    cardFormErrors,
    handleAddCard,
    handleSetActiveCard,
    resetCardForm,
    isAddingCard: addCardMutation.isPending,
    isSettingActive: setActiveCardMutation.isPending,
  };
}






