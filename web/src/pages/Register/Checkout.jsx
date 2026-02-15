import { useState, useMemo } from 'react';
import { TermsModal } from '../../components/TermsModal';
import { usePlans } from '../../hooks/usePlans';

export const Checkout = ({ submit, previousStep, data }) => {
  const { data: plans = [] } = usePlans();
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Get selected plan from plans array
  const selectedPlan = useMemo(() => {
    const planType = data?.company?.plan_type || 'basic';
    const recurrence = data?.company?.plan_recurrence || data?.company?.plan || 'monthly';

    return plans.find((plan) => plan.type === planType && plan.recurrence === recurrence) || null;
  }, [plans, data?.company?.plan_type, data?.company?.plan_recurrence, data?.company?.plan]);

  const currentPlanPrice =
    selectedPlan?.price || (data?.company?.plan_recurrence === 'yearly' ? 499.0 : 49.9);
  const currentPlanLabel =
    selectedPlan?.type_label || (data?.company?.plan_type === 'pro' ? 'PRO (com IA)' : 'Básico');
  const currentPlanRecurrenceLabel =
    selectedPlan?.recurrence_label ||
    (data?.company?.plan_recurrence === 'yearly' ? 'Anual' : 'Mensal');
  const currentPlanPeriod =
    data?.company?.plan_recurrence === 'yearly' || data?.company?.plan === 'yearly' ? 'ano' : 'mês';
  const currentPlanTestDays =
    selectedPlan?.trial_days ||
    (data?.company?.plan_recurrence === 'yearly' || data?.company?.plan === 'yearly' ? 30 : 7);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await submit();
    } finally {
      setIsLoading(false);
    }
  };

  const responsibleName = data?.name || '';
  const responsibleEmail = data?.email || '';
  const companyName = data?.company?.name || '';
  const companyEmail = data?.company?.email || '';
  const companyDocument = data?.company?.document || '';
  const companyPhone = data?.company?.phone || '';

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-r from-purple-400 to-blue-500 text-3xl mb-4 shadow-lg">
          💳
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Finalize seu Cadastro</h2>
        <p className="text-gray-600">Última etapa! Confirme seus dados</p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="w-full">
          <div className="bg-linear-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg border-2 border-purple-200 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-full bg-linear-to-r from-purple-400 to-blue-500 flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-purple-600">
                  Resumo
                </p>
                <h3 className="text-base font-semibold text-gray-900">Antes de confirmar</h3>
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              Confira se os dados estão corretos antes de finalizar.
            </p>

            <div className="flex w-full gap-2 text-sm">
              <div className="bg-white rounded-xl p-4 shadow-sm w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">👤</span>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">
                    Responsável
                  </p>
                </div>
                <p className="text-gray-900 font-semibold mb-1">
                  {responsibleName || 'Nome não informado'}
                </p>
                <p className="text-xs text-gray-600">
                  {responsibleEmail || 'E-mail não informado'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🏢</span>
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Empresa</p>
                </div>
                <p className="text-gray-900 font-semibold mb-1">
                  {companyName || 'Nome fantasia não informado'}
                </p>
                <div className="text-xs text-gray-600 space-y-0.5">
                  <p>{companyEmail || 'E-mail não informado'}</p>
                  <p>{companyPhone || 'Telefone não informado'}</p>
                  <p>{companyDocument || 'Documento não informado'}</p>
                </div>
              </div>

              <div className="bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border-2 border-emerald-200 shadow-sm w-full">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">⭐</span>
                  <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                    Plano escolhido
                  </p>
                </div>
                <p className="text-gray-900 font-semibold mb-1">
                  PontoA • {currentPlanLabel} • {currentPlanRecurrenceLabel}
                </p>
                <p className="text-sm text-gray-700 font-bold mb-1">
                  R${' '}
                  {currentPlanPrice.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  /{currentPlanPeriod}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-emerald-600 text-sm">🎁</span>
                  <p className="text-xs font-semibold text-emerald-700">
                    {currentPlanTestDays} dias grátis
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
            <div className="mt-8 space-y-3">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Ao se cadastrar, você concorda com os{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-purple-600 hover:text-purple-700 font-semibold underline transition-colors"
                  >
                    termos e condições
                  </button>
                </p>
              </div>
              <button
                className="w-full bg-linear-to-r from-emerald-400 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 text-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Criando sua conta...
                  </span>
                ) : (
                  '🎉 Confirmar e Criar Conta'
                )}
              </button>
              <button
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-200"
                type="button"
                onClick={previousStep}
              >
                ← Voltar para escolha do plano
              </button>
            </div>
          </div>
        </div>
      </div>
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
};
