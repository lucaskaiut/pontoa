import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { usePlans } from "../hooks/usePlans";
import { useCards } from "../hooks/useCards";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";
import toast from "react-hot-toast";
import classNames from "classnames";
import moment from "moment";
import "moment/locale/pt-br";
import InputMask from "react-input-mask";
import { validateData } from "../services/formValidation";

export function UpgradePlan() {
  const navigate = useNavigate();
  const { user, me } = useAuth();
  const { data: plans = [], isLoading: plansLoading } = usePlans();
  const { data: cards = [], isLoading: cardsLoading } = useCards();
  
  const [selectedPlanType, setSelectedPlanType] = useState("pro");
  const [selectedRecurrence, setSelectedRecurrence] = useState("monthly");
  const [calculation, setCalculation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showCreditCardForm, setShowCreditCardForm] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [card, setCard] = useState({
    number: "",
    holder_name: "",
    holder_document: "",
    exp_month: "",
    exp_year: "",
    cvv: "",
  });
  const [cardDue, setCardDue] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const company = user?.company;

  const plansByType = useMemo(() => {
    const grouped = {
      basic: {
        monthly: null,
        yearly: null,
      },
      pro: {
        monthly: null,
        yearly: null,
      },
    };

    plans.forEach((plan) => {
      if (plan.type && plan.recurrence) {
        if (grouped[plan.type] && grouped[plan.type][plan.recurrence] === null) {
          grouped[plan.type][plan.recurrence] = plan;
        }
      }
    });

    return grouped;
  }, [plans]);

  const currentPlan = useMemo(() => {
    return plansByType[selectedPlanType]?.[selectedRecurrence] || null;
  }, [plansByType, selectedPlanType, selectedRecurrence]);

  useEffect(() => {
    if (!company?.plan_name || !company?.plan_recurrence) {
      toast.error("Não foi possível identificar seu plano atual");
      navigate("/configuracoes");
      return;
    }

    if (company?.cancel_at_period_end) {
      toast.error("Não é possível alterar o plano enquanto houver cancelamento agendado. Reative a assinatura primeiro.");
      navigate("/configuracoes");
      return;
    }

    if (selectedPlanType === company.plan_name && selectedRecurrence === company.plan_recurrence) {
      if (company.plan_name === "basic") {
        setSelectedPlanType("pro");
      } else {
        setSelectedPlanType("basic");
      }
    }
  }, [company, navigate]);

  useEffect(() => {
    if (selectedPlanType && selectedRecurrence && company) {
      calculatePlanChange();
    }
  }, [selectedPlanType, selectedRecurrence]);

  useEffect(() => {
    if (cards.length > 0) {
      if (company?.card_id) {
        const currentCard = cards.find(c => c.id === company.card_id);
        if (currentCard) {
          setSelectedCardId(currentCard.id);
        } else if (cards.length === 1) {
          setSelectedCardId(cards[0].id);
        }
      } else if (cards.length === 1) {
        setSelectedCardId(cards[0].id);
      }
    }
  }, [cards, company?.card_id]);

  const calculatePlanChange = async () => {
    if (!selectedPlanType || !selectedRecurrence) return;

    if (selectedPlanType === company?.plan_name && selectedRecurrence === company?.plan_recurrence) {
      setCalculation(null);
      return;
    }

    setIsCalculating(true);
    try {
      const response = await api.post("/companies/calculate-plan-change", {
        plan_type: selectedPlanType,
        recurrence_type: selectedRecurrence,
      });
      setCalculation(response.data?.data || null);
    } catch (error) {
      console.error("Erro ao calcular mudança de plano:", error);
      toast.error("Erro ao calcular valores. Tente novamente.");
    } finally {
      setIsCalculating(false);
    }
  };

  const changePlanMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await api.post("/companies/change-plan", payload);
      return response.data;
    },
    onSuccess: async () => {
      toast.success("Plano alterado com sucesso!");
      try {
        await me();
      } catch (error) {
        console.error("Erro ao atualizar dados do usuário:", error);
      }
      navigate("/configuracoes");
    },
    onError: (error) => {
      const message = error.response?.data?.message || "Erro ao alterar plano. Tente novamente.";
      toast.error(message);
    },
  });

  const handleMaskedInput = (field, value) => {
    setCard({ ...card, [field]: value.replace(/\D/g, "") });
  };

  const handleDueInput = (value) => {
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

  const validateCard = () => {
    const rules = {
      number: ["required", "length:16"],
      holder_name: ["required"],
      holder_document: ["required", "length:11"],
      exp_month: ["required", "length:2"],
      exp_year: ["required", "length:4"],
      cvv: ["required", "length:3"],
    };

    const errors = validateData(card, rules);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChangePlan = () => {
    if (!calculation) {
      toast.error("Aguarde o cálculo dos valores");
      return;
    }

    if (showCreditCardForm && !validateCard()) {
      toast.error("Por favor, preencha todos os dados do cartão corretamente");
      return;
    }

    if (!showCreditCardForm) {
      if (cards.length === 0) {
        toast.error("Por favor, adicione um cartão para continuar");
        return;
      }
      if (cards.length > 1 && !selectedCardId) {
        toast.error("Por favor, selecione um cartão ou adicione um novo");
        return;
      }
    }

    if (window.confirm("Deseja realmente alterar seu plano? O pagamento será processado imediatamente.")) {
      const payload = {
        plan_type: selectedPlanType,
        recurrence_type: selectedRecurrence,
      };

      if (showCreditCardForm) {
        payload.credit_card = card;
      } else if (cards.length === 1) {
        payload.card_id = cards[0].id;
      } else if (selectedCardId) {
        payload.card_id = selectedCardId;
      }

      changePlanMutation.mutate(payload);
    }
  };

  const getCurrentPlanLabel = () => {
    if (!company?.plan_name || !company?.plan_recurrence) return "Plano atual";
    
    const planTypeLabel = company.plan_name === "pro" ? "PRO (com IA)" : "Básico";
    const recurrenceLabel = company.plan_recurrence === "yearly" ? "Anual" : "Mensal";
    return `${planTypeLabel} - ${recurrenceLabel}`;
  };

  const calculateSavings = (planType) => {
    const monthly = plansByType[planType]?.monthly;
    const yearly = plansByType[planType]?.yearly;
    
    if (!monthly || !yearly) return { percentage: 0, amount: 0 };
    
    const monthlyTotalYear = monthly.price * 12;
    const yearlyTotal = yearly.price;
    const savingsAmount = monthlyTotalYear - yearlyTotal;
    
    if (savingsAmount <= 0) return { percentage: 0, amount: 0 };
    
    const percentage = Math.round((1 - yearlyTotal / monthlyTotalYear) * 100);
    
    return { percentage, amount: savingsAmount };
  };

  const currentSavings = selectedPlanType === "basic" 
    ? calculateSavings("basic") 
    : calculateSavings("pro");

  if (!company) {
    return null;
  }

  return (
    <div className="overflow-auto min-h-full w-full pb-24 md:pb-0">
      <div className="mt-4 md:mt-10 flex flex-col gap-4 items-start px-4 md:px-10">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full">
          <h1 className="text-2xl md:text-4xl text-navy-900 dark:text-dark-text font-bold">
            Alterar Plano
          </h1>
          <button
            onClick={() => navigate("/configuracoes")}
            className="text-primary dark:text-blue-400 hover:opacity-80 transition-opacity"
          >
            ← Voltar para configurações
          </button>
        </div>

        <div className="w-full max-w-5xl mx-auto mt-8">
          <div className="bg-white dark:bg-dark-surface rounded-2xl border border-gray-100 dark:border-dark-border p-6 md:p-8 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text mb-4">
              Seu Plano Atual
            </h2>
            <div className="flex items-center gap-3">
              <div className="font-bold text-sm md:text-base h-8 rounded-lg bg-primary px-5 flex items-center justify-center text-white">
                {getCurrentPlanLabel()}
              </div>
              {calculation?.current_plan && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  R$ {calculation.current_plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {calculation.current_plan.recurrence === "yearly" ? "ano" : "mês"}
                </div>
              )}
            </div>
          </div>

          <div className="bg-linear-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-3xl shadow-xl border-2 border-purple-200 dark:border-purple-800 w-full px-6 py-8 md:px-10 md:py-10">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-dark-text mb-2">
                Escolha seu novo plano
              </h2>
            </div>

            <div className="mb-6">
              <div className="inline-flex items-center bg-white dark:bg-dark-surface rounded-2xl p-1.5 shadow-lg border-2 border-gray-200 dark:border-dark-border w-full max-w-md mx-auto">
                <button
                  type="button"
                  className={classNames(
                    "flex-1 px-6 py-3 text-sm md:text-base rounded-xl font-semibold transition-all duration-300",
                    selectedPlanType === "basic"
                      ? "bg-linear-to-r from-purple-400 to-blue-500 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-dark-text"
                  )}
                  onClick={() => setSelectedPlanType("basic")}
                >
                  📋 Básico
                </button>
                <button
                  type="button"
                  className={classNames(
                    "flex-1 px-6 py-3 text-sm md:text-base rounded-xl font-semibold transition-all duration-300",
                    selectedPlanType === "pro"
                      ? "bg-linear-to-r from-purple-400 to-blue-500 text-white shadow-md"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-dark-text"
                  )}
                  onClick={() => setSelectedPlanType("pro")}
                >
                  🤖 PRO (com IA)
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-md mb-6">
              <div className="text-center mb-6">
                <div className="flex flex-col items-center gap-3 mb-4">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-2xl text-gray-600 dark:text-gray-400">R$</span>
                    <span className="text-5xl md:text-6xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      {plansLoading ? "..." : currentPlan?.price?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0,00"}
                    </span>
                    <span className="text-2xl text-gray-600 dark:text-gray-400">
                      /{selectedRecurrence === "yearly" ? "ano" : "mês"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedRecurrence(selectedRecurrence === "monthly" ? "yearly" : "monthly")}
                      className={classNames(
                        "relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                        selectedRecurrence === "yearly"
                          ? "bg-linear-to-r from-purple-400 to-blue-500"
                          : "bg-gray-300 dark:bg-gray-600"
                      )}
                    >
                      <span
                        className={classNames(
                          "inline-block h-6 w-6 transform rounded-full bg-white dark:bg-gray-200 transition-transform duration-300 shadow-lg",
                          selectedRecurrence === "yearly" ? "translate-x-7" : "translate-x-1"
                        )}
                      />
                    </button>
                    <span className={classNames(
                      "text-sm font-medium transition-colors",
                      selectedRecurrence === "yearly" ? "text-gray-900 dark:text-dark-text" : "text-gray-500 dark:text-gray-400"
                    )}>
                      Pagamento Anual
                    </span>
                  </div>
                  
                  {currentSavings.amount > 0 && selectedRecurrence === "yearly" && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2">
                      <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        💰 Economize R$ {currentSavings.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} por ano
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {calculation && (
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-md mb-6 border-2 border-blue-200 dark:border-blue-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-4">
                  Resumo da Alteração
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-border">
                    <span className="text-gray-700 dark:text-gray-300">Plano atual:</span>
                    <span className="font-semibold text-gray-900 dark:text-dark-text">
                      {calculation.current_plan?.type_label} - {calculation.current_plan?.recurrence_label}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-border">
                    <span className="text-gray-700 dark:text-gray-300">Novo plano:</span>
                    <span className="font-semibold text-gray-900 dark:text-dark-text">
                      {calculation.new_plan.type_label} - {calculation.new_plan.recurrence_label}
                    </span>
                  </div>
                  
                  {calculation.current_plan && calculation.remaining_days > 0 && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-border">
                        <span className="text-gray-700 dark:text-gray-300">Dias restantes do plano atual:</span>
                        <span className="font-semibold text-gray-900 dark:text-dark-text">
                          {calculation.remaining_days} dias
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-border">
                        <span className="text-gray-700 dark:text-gray-300">Valor do plano atual:</span>
                        <span className="font-semibold text-gray-900 dark:text-dark-text">
                          R$ {calculation.current_plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      
                      {calculation.prorated_discount > 0 && (
                        <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-border">
                          <span className="text-gray-700 dark:text-gray-300">Desconto por dias não utilizados:</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            - R$ {calculation.prorated_discount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-border">
                    <span className="text-gray-700 dark:text-gray-300">Valor do novo plano:</span>
                    <span className="font-semibold text-gray-900 dark:text-dark-text">
                      R$ {calculation.new_plan_price.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 bg-linear-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg px-4">
                    <span className="text-lg font-bold text-gray-900 dark:text-dark-text">Valor a ser cobrado agora:</span>
                    <span className="text-2xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      R$ {calculation.final_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      <strong>Importante:</strong> O pagamento será processado imediatamente. 
                      A nova data de cobrança será a partir de hoje ({moment().format("DD/MM/YYYY")}).
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isCalculating && (
              <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-md mb-6">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="text-gray-700 dark:text-gray-300">Calculando valores...</span>
                </div>
              </div>
            )}

            {selectedPlanType === company?.plan_name && selectedRecurrence === company?.plan_recurrence && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 shadow-md mb-6 border-2 border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-300 text-center">
                  Você já está neste plano. Selecione um plano diferente para fazer a alteração.
                </p>
              </div>
            )}

            <div className="bg-white dark:bg-dark-surface rounded-2xl p-6 shadow-md mb-6 border-2 border-gray-200 dark:border-dark-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text mb-1">
                    💳 Cartão de Crédito
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {showCreditCardForm 
                      ? "Adicione um novo cartão" 
                      : cardsLoading 
                        ? "Carregando cartões..." 
                        : cards.length === 0
                          ? "Nenhum cartão cadastrado"
                          : "Selecione o cartão que será utilizado"}
                  </p>
                </div>
                {!showCreditCardForm && (
                  <button
                    type="button"
                    onClick={() => setShowCreditCardForm(true)}
                    className="text-primary dark:text-blue-400 hover:opacity-80 transition-opacity text-sm font-semibold"
                  >
                    {cards.length > 0 ? "Adicionar novo cartão" : "Adicionar cartão"}
                  </button>
                )}
                {showCreditCardForm && (
                  <button
                    type="button"
                    onClick={() => {
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
                      setFormErrors({});
                    }}
                    className="text-primary dark:text-blue-400 hover:opacity-80 transition-opacity text-sm font-semibold"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {!showCreditCardForm && !cardsLoading && (
                <div className="space-y-3">
                  {cards.length === 0 ? (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300 text-center">
                        Nenhum cartão cadastrado. Adicione um cartão para continuar.
                      </p>
                    </div>
                  ) : cards.length === 1 ? (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-dark-border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-linear-to-r from-purple-400 to-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">
                            💳
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-dark-text">
                              {cards[0].card_number || `${cards[0].first_six_digits}******${cards[0].last_four_digits}`}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Cartão que será utilizado
                            </p>
                          </div>
                        </div>
                        {company?.card_id === cards[0].id && (
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                            Atual
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Selecione o cartão que será utilizado:
                      </p>
                      {cards.map((cardItem) => (
                        <label
                          key={cardItem.id}
                          className={classNames(
                            "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                            selectedCardId === cardItem.id
                              ? "bg-purple-50 dark:bg-purple-900/20 border-purple-400 dark:border-purple-600"
                              : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-dark-border hover:border-purple-300 dark:hover:border-purple-700"
                          )}
                        >
                          <input
                            type="radio"
                            name="selectedCard"
                            value={cardItem.id}
                            checked={selectedCardId === cardItem.id}
                            onChange={(e) => setSelectedCardId(Number(e.target.value))}
                            className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-8 bg-linear-to-r from-purple-400 to-blue-500 rounded flex items-center justify-center text-white font-bold text-sm">
                                💳
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-dark-text">
                                  {cardItem.card_number || `${cardItem.first_six_digits}******${cardItem.last_four_digits}`}
                                </p>
                              </div>
                            </div>
                            {company?.card_id === cardItem.id && (
                              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                                Atual
                              </span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {showCreditCardForm && (
                <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-dark-border">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nome do Portador
                    </label>
                    <input
                      type="text"
                      placeholder="Nome como está no cartão"
                      value={card.holder_name}
                      onChange={(e) => setCard({ ...card, holder_name: e.target.value })}
                      className={classNames(
                        "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface",
                        "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                        {
                          "border-red-300 bg-red-50 dark:bg-red-900/20": formErrors.holder_name,
                          "border-gray-200 dark:border-dark-border": !formErrors.holder_name
                        }
                      )}
                    />
                    {formErrors.holder_name && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">⚠️ Nome obrigatório</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      CPF do Portador
                    </label>
                    <InputMask
                      type="text"
                      placeholder="000.000.000-00"
                      value={card.holder_document}
                      onChange={(e) => handleMaskedInput("holder_document", e.target.value)}
                      mask="999.999.999-99"
                    >
                      {(props) => (
                        <input
                          className={classNames(
                            "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface",
                            "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                            {
                              "border-red-300 bg-red-50 dark:bg-red-900/20": formErrors.holder_document,
                              "border-gray-200 dark:border-dark-border": !formErrors.holder_document
                            }
                          )}
                          {...props}
                        />
                      )}
                    </InputMask>
                    {formErrors.holder_document && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">⚠️ CPF inválido</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Número do Cartão
                    </label>
                    <InputMask
                      type="text"
                      placeholder="0000 0000 0000 0000"
                      value={card.number}
                      onChange={(e) => handleMaskedInput("number", e.target.value)}
                      mask="9999 9999 9999 9999"
                    >
                      {(props) => (
                        <input
                          className={classNames(
                            "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface font-mono text-lg",
                            "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                            {
                              "border-red-300 bg-red-50 dark:bg-red-900/20": formErrors.number,
                              "border-gray-200 dark:border-dark-border": !formErrors.number
                            }
                          )}
                          {...props}
                        />
                      )}
                    </InputMask>
                    {formErrors.number && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">⚠️ Número do cartão inválido</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Validade
                      </label>
                      <InputMask
                        type="text"
                        placeholder="MM/AA"
                        value={cardDue}
                        onChange={(e) => handleDueInput(e.target.value)}
                        mask="99/99"
                      >
                        {(props) => (
                          <input
                            className={classNames(
                              "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface font-mono",
                              "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                              {
                                "border-red-300 bg-red-50 dark:bg-red-900/20": formErrors.exp_month || formErrors.exp_year,
                                "border-gray-200 dark:border-dark-border": !formErrors.exp_month && !formErrors.exp_year
                              }
                            )}
                            {...props}
                          />
                        )}
                      </InputMask>
                      {(formErrors.exp_month || formErrors.exp_year) && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">⚠️ Data inválida</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        CVV
                      </label>
                      <InputMask
                        type="text"
                        placeholder="123"
                        value={card.cvv}
                        onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })}
                        mask="999"
                      >
                        {(props) => (
                          <input
                            className={classNames(
                              "w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 text-gray-900 dark:text-dark-text bg-white dark:bg-dark-surface font-mono",
                              "focus:outline-hidden focus:ring-4 focus:ring-purple-200 focus:border-purple-400",
                              {
                                "border-red-300 bg-red-50 dark:bg-red-900/20": formErrors.cvv,
                                "border-gray-200 dark:border-dark-border": !formErrors.cvv
                              }
                            )}
                            {...props}
                          />
                        )}
                      </InputMask>
                      {formErrors.cvv && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">⚠️ CVV inválido</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 space-y-3">
              <button
                className={classNames(
                  "w-full font-semibold py-4 px-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
                  calculation && calculation.final_amount > 0
                    ? "bg-linear-to-r from-purple-400 to-blue-500 hover:from-purple-500 hover:to-blue-600 text-white"
                    : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                )}
                type="button"
                onClick={handleChangePlan}
                disabled={
                  !calculation || 
                  isCalculating || 
                  changePlanMutation.isPending ||
                  (selectedPlanType === company?.plan_name && selectedRecurrence === company?.plan_recurrence)
                }
              >
                {changePlanMutation.isPending 
                  ? "Processando..." 
                  : calculation && calculation.final_amount > 0
                    ? `Confirmar alteração e pagar R$ ${calculation.final_amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : "Selecione um plano diferente"
                }
              </button>
              <button
                className="w-full bg-white dark:bg-dark-surface hover:bg-gray-50 dark:hover:bg-dark-surface-hover text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-dark-border transition-all duration-200"
                type="button"
                onClick={() => navigate("/configuracoes")}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

