import { useState, useMemo, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Header } from "../components/Header";
import { useCartDrawer } from "../contexts/CartDrawerContext";
import { StepIndicator } from "../components/StepIndicator";
import { ServiceSelection } from "../components/ServiceSelection";
import { CollaboratorSelection } from "../components/CollaboratorSelection";
import { DateTimeSelection } from "../components/DateTimeSelection";
import { CustomerForm } from "../components/CustomerForm";
import { Confirmation } from "../components/Confirmation";
import { SuccessScreen } from "../components/SuccessScreen";
import { CollaboratorsService } from "../services/CollaboratorsService";
import { SettingsService } from "../services/SettingsService";
import { CompanyService } from "../services/CompanyService";
import { CartService } from "../services/CartService";
import type { Service, Collaborator, Scheduling, BookingState, Settings, Company } from "../types";

interface ExtendedBookingState extends BookingState {
  skippedSteps: number[];
}

const ALL_STEP_LABELS: Record<number, string> = {
  1: "Profissional",
  2: "Serviço",
  3: "Data e Hora",
  4: "Seus Dados",
  5: "Confirmação",
};

const initialState: ExtendedBookingState = {
  step: 1,
  service: null,
  collaborator: null,
  date: null,
  time: null,
  customer: {
    name: "",
    email: "",
    phone: "",
    document: "",
  },
  skippedSteps: [],
};

function BookingPage() {
  const queryClient = useQueryClient();
  const { openDrawer } = useCartDrawer();
  const [state, setState] = useState<ExtendedBookingState>(initialState);
  const [completedScheduling, setCompletedScheduling] = useState<Scheduling | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [processingServiceSelect, setProcessingServiceSelect] = useState(false);
  
  const [allCollaborators, setAllCollaborators] = useState<Collaborator[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);

  const loadInitialData = useCallback(async () => {
    setInitialLoading(true);
    try {
      const [collaboratorsData, settingsData, companyData] = await Promise.all([
        CollaboratorsService.listCollaborators(),
        SettingsService.getSettings(),
        CompanyService.getMe(),
      ]);
      
      setAllCollaborators(collaboratorsData);
      setSettings(settingsData);
      setCompany(companyData);
      
      let skipped: number[] = [];
      let startStep = 1;
      let selectedService: Service | null = null;
      let selectedCollaborator: Collaborator | null = null;

      if (collaboratorsData.length === 1) {
        selectedCollaborator = collaboratorsData[0];
        skipped.push(1);
        startStep = 2;
        
        if (selectedCollaborator.services.length === 1) {
          selectedService = selectedCollaborator.services[0];
          skipped.push(2);
          startStep = 3;
        }
      } else {
        const allCollaboratorsHaveSingleService = collaboratorsData.every((collaborator) => {
          return collaborator.services.length === 1;
        });

        if (allCollaboratorsHaveSingleService && collaboratorsData.length > 0) {
          skipped.push(2);
        }
      }

      setState((prev) => ({
        ...prev,
        service: selectedService,
        collaborator: selectedCollaborator,
        skippedSteps: skipped,
        step: startStep,
      }));
    } catch (error) {
      console.error("Erro ao carregar dados iniciais:", error);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const servicesForCollaborator = useMemo(() => {
    if (!state.collaborator) return [];
    return state.collaborator.services;
  }, [state.collaborator]);

  const visibleSteps = useMemo(() => {
    return [1, 2, 3, 4, 5].filter(step => !state.skippedSteps.includes(step));
  }, [state.skippedSteps]);

  const visibleStepLabels = useMemo(() => {
    return visibleSteps.map(step => ALL_STEP_LABELS[step]);
  }, [visibleSteps]);

  const currentVisibleStepIndex = useMemo(() => {
    return visibleSteps.indexOf(state.step) + 1;
  }, [visibleSteps, state.step]);

  function handleCollaboratorSelect(collaborator: Collaborator) {
    const serviceToSelect = collaborator.services.length === 1 ? collaborator.services[0] : null;
    
    setState((prev) => ({
      ...prev,
      collaborator,
      service: serviceToSelect,
      date: null,
      time: null,
    }));
  }

  function handleServiceSelect(service: Service) {
    setProcessingServiceSelect(true);
    
    setState((prev) => ({
      ...prev,
      service,
      date: null,
      time: null,
    }));
    
    setProcessingServiceSelect(false);
  }

  function handleDateTimeSelect(date: string, time: string) {
    setState((prev) => ({ ...prev, date, time }));
  }

  function handleCustomerSubmit(customer: { name: string; email: string; phone: string; document: string }) {
    setState((prev) => ({ ...prev, customer, step: 5 }));
  }

  async function handleConfirm() {
    if (!state.service || !state.collaborator || !state.date || !state.time) return;

    await createScheduling();
  }

  async function createScheduling() {
    if (!state.service || !state.collaborator || !state.date || !state.time) return;

    setLoading(true);
    try {
      const payload = {
        item_type: 'scheduling',
        service_id: state.service.id,
        user_id: state.collaborator.id,
        date: `${state.date} ${state.time}`,
        name: state.customer.name,
        email: state.customer.email,
        phone: state.customer.phone.replace(/\D/g, ""),
        quantity: 1,
      };

      await CartService.addItem(payload);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      
      setState((prev) => ({
        ...prev,
        date: null,
        time: null,
      }));
      
      openDrawer();
      toast.success("Agendamento adicionado ao carrinho!");
    } catch (error: any) {
      console.error("Erro ao adicionar agendamento ao carrinho:", error);
      const errorMessage = error?.response?.data?.message || "Erro ao adicionar agendamento ao carrinho. Tente novamente.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleNewBooking() {
    setState(initialState);
    setCompletedScheduling(null);
    setAllCollaborators([]);
    setShowCheckout(false);
    loadInitialData();
  }

  function nextStep() {
    const currentIndex = visibleSteps.indexOf(state.step);
    if (currentIndex < visibleSteps.length - 1) {
      setState((prev) => ({ ...prev, step: visibleSteps[currentIndex + 1] }));
    }
  }

  function prevStep() {
    const currentIndex = visibleSteps.indexOf(state.step);
    if (currentIndex > 0) {
      setState((prev) => ({ ...prev, step: visibleSteps[currentIndex - 1] }));
    }
  }

  function canProceed(): boolean {
    if (processingServiceSelect) return false;
    
    switch (state.step) {
      case 1:
        return state.collaborator !== null;
      case 2:
        return state.service !== null;
      case 3:
        return state.date !== null && state.time !== null && state.time !== "";
      case 4:
        return false;
      default:
        return false;
    }
  }

  function isFirstVisibleStep(): boolean {
    return visibleSteps.indexOf(state.step) === 0;
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 4rem)" }}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-text-secondary">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (completedScheduling) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center p-5 sm:p-8" style={{ minHeight: "calc(100vh - 4rem)" }}>
          <div className="w-full max-w-lg">
            <SuccessScreen scheduling={completedScheduling} onNewBooking={handleNewBooking} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex items-center justify-center p-4 lg:p-8" style={{ minHeight: "calc(100vh - 4rem)" }}>
      <div className="w-full max-w-6xl">
        <header className="text-center mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-1">
            Agende seu Horário
          </h1>
          <p className="text-text-secondary text-sm">Escolha o serviço e horário ideal para você</p>
        </header>

        <div className="hidden lg:block mb-6">
          <StepIndicator 
            currentStep={currentVisibleStepIndex} 
            totalSteps={visibleSteps.length}
            stepLabels={visibleStepLabels}
          />
        </div>

        <div className="lg:hidden mb-6">
          <StepIndicator 
            currentStep={currentVisibleStepIndex} 
            totalSteps={visibleSteps.length}
            stepLabels={visibleStepLabels}
          />
        </div>

        {(state.service || state.collaborator) && (
          <div className="hidden lg:flex flex-row gap-2 mb-4">
            {state.service && (
              <div className="flex items-center gap-2 py-2.5 px-3 bg-surface rounded-xl border border-white/10">
                <div className="w-7 h-7 bg-success/20 rounded-full flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-xs text-text-secondary">
                  Serviço: <span className="text-text-primary font-medium">{state.service.name}</span>
                </p>
              </div>
            )}

            {state.collaborator && (
              <div className="flex items-center gap-2 py-2.5 px-3 bg-surface rounded-xl border border-white/10">
                <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-xs text-text-secondary">
                  Você está agendando com <span className="text-text-primary font-medium">{state.collaborator.name}</span>
                </p>
              </div>
            )}
          </div>
        )}

        <div className="pb-6 lg:pb-8">
          {(state.service || state.collaborator) && (
            <div className="flex flex-col gap-2 mb-5 lg:hidden">
              {state.service && (
                <div className="flex items-center gap-2 py-2.5 px-3 bg-surface rounded-xl border border-white/10 justify-center">
                  <div className="w-7 h-7 bg-success/20 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Serviço: <span className="text-text-primary font-medium">{state.service.name}</span>
                  </p>
                </div>
              )}

              {state.collaborator && (
                <div className="flex items-center gap-2 py-2.5 px-3 bg-surface rounded-xl border border-white/10 justify-center">
                  <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Você está agendando com <span className="text-text-primary font-medium">{state.collaborator.name}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          <main className="w-full">
            <div className="bg-surface backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10">
              {state.step === 1 && (
                <CollaboratorSelection
                  collaborators={allCollaborators}
                  onSelect={handleCollaboratorSelect}
                  selectedCollaborator={state.collaborator}
                />
              )}

              {state.step === 2 && state.collaborator && (
                <ServiceSelection
                  services={servicesForCollaborator}
                  onSelect={handleServiceSelect}
                  selectedService={state.service}
                  isLoading={processingServiceSelect}
                />
              )}

              {state.step === 3 && state.service && state.collaborator && (
                <DateTimeSelection
                  service={state.service}
                  collaborator={state.collaborator}
                  onSelect={handleDateTimeSelect}
                  selectedDate={state.date}
                  selectedTime={state.time}
                />
              )}

              {state.step === 4 && (
                <CustomerForm 
                  onSubmit={handleCustomerSubmit} 
                  initialData={state.customer}
                  requireCheckout={settings?.scheduling_require_checkout || false}
                />
              )}

              {state.step === 5 && !showCheckout && state.service && state.collaborator && state.date && state.time && (
                <Confirmation
                  service={state.service}
                  collaborator={state.collaborator}
                  date={state.date}
                  time={state.time}
                  customer={state.customer}
                  onConfirm={handleConfirm}
                  loading={loading}
                  termsAndConditions={company?.terms_and_conditions || null}
                />
              )}

            </div>

            {state.step < 5 && state.step !== 4 && (
              <div className="flex justify-between mt-8 gap-3 pb-2 sm:pb-1">
                <button
                  onClick={prevStep}
                  disabled={isFirstVisibleStep()}
                  className="px-5 py-2.5 bg-surface hover:bg-primary-hover text-text-primary text-sm font-medium rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Voltar
                </button>
                <button
                  onClick={nextStep}
                  disabled={!canProceed()}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Continuar
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {state.step === 5 && !showCheckout && (
              <div className="mt-8 pb-2 sm:pb-1">
                <button
                  onClick={prevStep}
                  className="px-5 py-2.5 bg-surface hover:bg-primary-hover text-text-primary text-sm font-medium rounded-xl transition-all duration-300"
                >
                  Voltar
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
      </div>
    </div>
  );
}

export default BookingPage;

