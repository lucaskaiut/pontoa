import { useState, useMemo } from "react";
import { usePlans } from "../../hooks/usePlans";
import classNames from "class-names";

export const Plan = ({ nextStep, previousStep, data, setFieldValue }) => {
  const { data: plans = [], isLoading } = usePlans();
  
  // Initialize with saved data or defaults
  const [selectedPlanType, setSelectedPlanType] = useState(
    data?.company?.plan_type || "basic"
  );
  const [selectedRecurrence, setSelectedRecurrence] = useState(
    data?.company?.plan_recurrence || data?.company?.plan || "monthly"
  );

  // Group plans by type
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

  // Get current selected plan
  const currentPlan = useMemo(() => {
    return plansByType[selectedPlanType]?.[selectedRecurrence] || null;
  }, [plansByType, selectedPlanType, selectedRecurrence]);

  // Calculate savings for yearly plans
  const calculateSavings = (planType) => {
    const monthly = plansByType[planType]?.monthly;
    const yearly = plansByType[planType]?.yearly;
    
    if (!monthly || !yearly) return { percentage: 0, amount: 0 };
    
    const monthlyTotalYear = monthly.price * 12;
    const yearlyTotal = yearly.price;
    const savingsAmount = monthlyTotalYear - yearlyTotal;
    
    if (savingsAmount <= 0) return { percentage: 0, amount: 0 };
    
    const percentage = Math.round(
      (1 - yearlyTotal / monthlyTotalYear) * 100
    );
    
    return { percentage, amount: savingsAmount };
  };

  const basicSavings = calculateSavings("basic");
  const proSavings = calculateSavings("pro");
  const currentSavings = selectedPlanType === "basic" ? basicSavings : proSavings;

  const handleContinue = () => {
    const company = {
      ...data.company,
      plan_type: selectedPlanType,
      plan_recurrence: selectedRecurrence,
      // Keep legacy plan for backward compatibility
      plan: selectedRecurrence,
    };
    setFieldValue("company", company);
    nextStep();
  };

  const basicMonthly = plansByType.basic?.monthly;
  const basicYearly = plansByType.basic?.yearly;
  const proMonthly = plansByType.pro?.monthly;
  const proYearly = plansByType.pro?.yearly;

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-r from-purple-400 to-blue-500 text-3xl mb-4 shadow-lg">
          ⭐
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Escolha o plano ideal para o seu negócio
        </h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Você pode começar com o plano mensal e migrar para o anual quando
          estiver pronto. Cancele quando quiser.
        </p>
      </div>

      {/* Plan Type Selection */}
      <div className="mb-6">
        <div className="inline-flex items-center bg-white rounded-2xl p-1.5 shadow-lg border-2 border-gray-200 w-full max-w-md mx-auto">
          <button
            type="button"
            className={classNames(
              "flex-1 px-6 py-3 text-sm md:text-base rounded-xl font-semibold transition-all duration-300",
              selectedPlanType === "basic"
                ? "bg-linear-to-r from-purple-400 to-blue-500 text-white shadow-md"
                : "text-gray-600 hover:text-gray-900"
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
                : "text-gray-600 hover:text-gray-900"
            )}
            onClick={() => setSelectedPlanType("pro")}
          >
            🤖 PRO (com IA)
          </button>
        </div>
      </div>

      {/* Plan Details Card */}
      <div className="bg-linear-to-br from-purple-50 to-blue-50 rounded-3xl shadow-xl border-2 border-purple-200 w-full px-6 py-8 md:px-10 md:py-10">
        <div className="text-center mb-6">
          <div className="inline-block bg-linear-to-r from-purple-400 to-blue-500 text-white px-4 py-2 rounded-full text-xs font-semibold mb-3 shadow-md">
            {selectedPlanType === "pro" ? "🤖 COM IA" : "📋 PLANO BÁSICO"}
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {currentPlan?.type_label || (selectedPlanType === "pro" ? "PRO (com IA)" : "Básico")} • {currentPlan?.recurrence_label || (selectedRecurrence === "yearly" ? "Anual" : "Mensal")}
          </h3>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
          <div className="text-center mb-6">
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-2xl text-gray-600">R$</span>
                <span className="text-5xl md:text-6xl font-bold bg-linear-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {isLoading ? "..." : currentPlan?.price?.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0,00"}
                </span>
                <span className="text-2xl text-gray-600">
                  /{selectedRecurrence === "yearly" ? "ano" : "mês"}
                </span>
              </div>
              
              {/* Toggle Mensal/Pagamento Anual */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedRecurrence(selectedRecurrence === "monthly" ? "yearly" : "monthly")}
                  className={classNames(
                    "relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                    selectedRecurrence === "yearly"
                      ? "bg-linear-to-r from-purple-400 to-blue-500"
                      : "bg-gray-300"
                  )}
                >
                  <span
                    className={classNames(
                      "inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-lg",
                      selectedRecurrence === "yearly" ? "translate-x-7" : "translate-x-1"
                    )}
                  />
                </button>
                <span className={classNames(
                  "text-sm font-medium transition-colors",
                  selectedRecurrence === "yearly" ? "text-gray-900" : "text-gray-500"
                )}>
                  Pagamento Anual
                </span>
              </div>
              
              {/* Savings message - sempre mostra quando há economia */}
              {currentSavings.amount > 0 && (
                <div className={classNames(
                  "rounded-xl px-4 py-2 transition-all duration-300",
                  selectedRecurrence === "yearly"
                    ? "bg-emerald-50 border-2 border-emerald-200"
                    : "bg-gray-50 border-2 border-gray-200"
                )}>
                  <p className={classNames(
                    "text-sm font-semibold transition-colors",
                    selectedRecurrence === "yearly"
                      ? "text-emerald-700"
                      : "text-gray-600"
                  )}>
                    {selectedRecurrence === "yearly" ? "💰" : "💡"} Economize R$ {currentSavings.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} por ano
                  </p>
                </div>
              )}
            </div>
            
            {currentPlan?.trial_days !== undefined && currentPlan.trial_days > 0 ? (
              <div className="inline-block bg-linear-to-r from-emerald-400 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                🎁 Experimente grátis por {currentPlan.trial_days} dias
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Comece agora e pague apenas quando estiver pronto
              </p>
            )}
          </div>

          {/* Modules included */}
          {currentPlan?.modules && currentPlan.modules.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Módulos incluídos:</p>
              <div className="space-y-2">
                {currentPlan.modules.map((module) => (
                  <div key={module.id} className="flex items-start gap-2 bg-emerald-50 p-3 rounded-lg">
                    <span className="text-emerald-600 text-xl shrink-0">✓</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{module.name}</p>
                      <p className="text-xs text-gray-600">{module.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
            <div className="flex items-start gap-2 bg-emerald-50 p-3 rounded-lg">
              <span className="text-emerald-600 text-xl shrink-0">✓</span>
              <span>Agenda online com confirmação automática de clientes</span>
            </div>
            <div className="flex items-start gap-2 bg-emerald-50 p-3 rounded-lg">
              <span className="text-emerald-600 text-xl shrink-0">✓</span>
              <span>Controle de colaboradores, serviços e horários</span>
            </div>
            <div className="flex items-start gap-2 bg-emerald-50 p-3 rounded-lg">
              <span className="text-emerald-600 text-xl shrink-0">✓</span>
              <span>Notificações e lembretes automáticos</span>
            </div>
            <div className="flex items-start gap-2 bg-emerald-50 p-3 rounded-lg">
              <span className="text-emerald-600 text-xl shrink-0">✓</span>
              <span>Sem fidelidade, cancele quando quiser</span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <button
            className="w-full bg-linear-to-r from-purple-400 to-blue-500 hover:from-purple-500 hover:to-blue-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            type="button"
            onClick={handleContinue}
            disabled={isLoading || !currentPlan}
          >
            {selectedRecurrence === "yearly"
              ? "🎉 Continuar com plano anual"
              : "🚀 Continuar com plano mensal"}
          </button>
          <button
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
            type="button"
            onClick={previousStep}
          >
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
};
