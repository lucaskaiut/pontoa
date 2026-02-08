import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { CollaboratorsService } from "../services/CollaboratorsService";
import { useCartDrawer } from "../contexts/CartDrawerContext";
import { CartService } from "../services/CartService";
import type { Collaborator, Service, Scheduling, BookingState } from "../types";
import { Header } from "../components/Header";
import { StepIndicator } from "../components/StepIndicator";
import { ServiceSelection } from "../components/ServiceSelection";
import { DateTimeSelection } from "../components/DateTimeSelection";
import { CustomerForm } from "../components/CustomerForm";
import { Confirmation } from "../components/Confirmation";
import { SuccessScreen } from "../components/SuccessScreen";

interface ExtendedBookingState extends BookingState {
  skippedSteps: number[];
}

const STEP_LABELS: Record<number, string> = {
  1: "Serviço",
  2: "Data e Hora",
  3: "Seus Dados",
  4: "Confirmação",
};

function UserProfilePage() {
  const { url } = useParams<{ url: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { openDrawer } = useCartDrawer();
  const [collaborator, setCollaborator] = useState<Collaborator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [state, setState] = useState<ExtendedBookingState>({
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
  });
  
  const [completedScheduling, setCompletedScheduling] = useState<Scheduling | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [processingServiceSelect, setProcessingServiceSelect] = useState(false);

  useEffect(() => {
    if (url) {
      loadCollaborator();
    }
  }, [url]);

  useEffect(() => {
    if (collaborator) {
      const hasSingleService = collaborator.services.length === 1;
      setState({
        step: hasSingleService ? 2 : 1,
        service: hasSingleService ? collaborator.services[0] : null,
        collaborator,
        date: null,
        time: null,
        customer: {
          name: "",
          email: "",
          phone: "",
          document: "",
        },
        skippedSteps: hasSingleService ? [1] : [],
      });
    }
  }, [collaborator]);

  async function loadCollaborator() {
    if (!url) return;

    setLoading(true);
    setError(null);
    try {
      const collaboratorData = await CollaboratorsService.getByUrl(url);
      if (collaboratorData) {
        setCollaborator(collaboratorData);
      } else {
        setError("Profissional não encontrado");
      }
    } catch (err) {
      console.error("Erro ao carregar profissional:", err);
      setError("Erro ao carregar informações do profissional. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  const visibleSteps = useMemo(() => {
    return [1, 2, 3, 4].filter(step => !state.skippedSteps.includes(step));
  }, [state.skippedSteps]);

  const visibleStepLabels = useMemo(() => {
    return visibleSteps.map(step => STEP_LABELS[step]);
  }, [visibleSteps]);

  const currentVisibleStepIndex = useMemo(() => {
    return visibleSteps.indexOf(state.step) + 1;
  }, [visibleSteps, state.step]);

  const servicesForCollaborator = useMemo(() => {
    if (!collaborator) return [];
    return collaborator.services;
  }, [collaborator]);

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
    setState((prev) => ({ ...prev, customer, step: 4 }));
  }

  async function handleConfirm() {
    if (!state.service || !state.collaborator || !state.date || !state.time) return;

    setBookingLoading(true);
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
      setBookingLoading(false);
    }
  }

  function handleNewBooking() {
    if (!collaborator) return;
    
    const hasSingleService = collaborator.services.length === 1;
    setState({
      step: hasSingleService ? 2 : 1,
      service: hasSingleService ? collaborator.services[0] : null,
      collaborator,
      date: null,
      time: null,
      customer: {
        name: "",
        email: "",
        phone: "",
        document: "",
      },
      skippedSteps: hasSingleService ? [1] : [],
    });
    setCompletedScheduling(null);
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
        return state.service !== null;
      case 2:
        return state.date !== null && state.time !== null && state.time !== "";
      case 3:
        return false;
      default:
        return false;
    }
  }

  function isFirstVisibleStep(): boolean {
    return visibleSteps.indexOf(state.step) === 0;
  }

  function getInitials(name: string): string {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function formatPhone(phone: string): string {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton onBack={() => navigate("/")} />
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 4rem)" }}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-text-secondary">Carregando informações...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!collaborator && !loading)) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton onBack={() => navigate("/")} />
        <div className="flex items-center justify-center" style={{ height: "calc(100vh - 4rem)" }}>
          <div className="text-center">
            <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-text-primary mb-4">{error || "Profissional não encontrado"}</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 bg-primary hover:bg-primary-hover text-white rounded-xl transition-colors"
            >
              Voltar para Agendamento
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (completedScheduling && collaborator) {
    return (
      <div className="min-h-screen bg-background">
        <Header showBackButton onBack={() => navigate("/")} />
        <div className="flex items-center justify-center p-5 sm:p-8" style={{ minHeight: "calc(100vh - 4rem)" }}>
          <div className="w-full max-w-lg">
            <SuccessScreen scheduling={completedScheduling} onNewBooking={handleNewBooking} />
          </div>
        </div>
      </div>
    );
  }

  if (!collaborator) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showBackButton onBack={() => navigate("/")} />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-surface backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/10">
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            <div className="shrink-0 flex justify-center sm:justify-start">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden bg-linear-to-br from-primary to-primary-hover flex items-center justify-center">
                {collaborator.image ? (
                  <img
                    src={collaborator.image}
                    alt={collaborator.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-4xl sm:text-5xl">
                    {getInitials(collaborator.name)}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
                {collaborator.name}
              </h1>
              
              {collaborator.description && (
                <div 
                  className="text-text-secondary text-sm sm:text-base mb-4 prose prose-invert prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: collaborator.description }}
                />
              )}

              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {collaborator.email && (
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>{collaborator.email}</span>
                  </div>
                )}

                {collaborator.phone && (
                  <div className="flex items-center gap-2 text-text-secondary text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{formatPhone(collaborator.phone)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {collaborator && (
            <div className="border-t border-white/10 pt-8 pb-6 lg:pb-8">
              <div className="mb-6">
                <StepIndicator 
                  currentStep={currentVisibleStepIndex} 
                  totalSteps={visibleSteps.length}
                  stepLabels={visibleStepLabels}
                />
              </div>

              <div className="bg-surface backdrop-blur-sm rounded-2xl p-5 sm:p-6 border border-white/10">
                {state.step === 1 && (
                  <ServiceSelection
                    services={servicesForCollaborator}
                    onSelect={handleServiceSelect}
                    selectedService={state.service}
                    isLoading={processingServiceSelect}
                  />
                )}

                {state.step === 2 && state.service && state.collaborator && (
                  <DateTimeSelection
                    onCartUpdate={() => {}}
                    service={state.service}
                    collaborator={state.collaborator}
                    onSelect={handleDateTimeSelect}
                    selectedDate={state.date}
                    selectedTime={state.time}
                  />
                )}

                {state.step === 3 && (
                  <CustomerForm onSubmit={handleCustomerSubmit} initialData={state.customer} />
                )}

                {state.step === 4 && state.service && state.collaborator && state.date && state.time && (
                  <Confirmation
                    service={state.service}
                    collaborator={state.collaborator}
                    date={state.date}
                    time={state.time}
                    customer={state.customer}
                    onConfirm={handleConfirm}
                    loading={bookingLoading}
                    termsAndConditions={state.collaborator?.company?.terms_and_conditions || null}
                  />
                )}
              </div>

              {state.step < 4 && state.step !== 3 && (
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

              {state.step === 4 && (
                <div className="mt-8 pb-2 sm:pb-1">
                  <button
                    onClick={prevStep}
                    className="px-5 py-2.5 bg-surface hover:bg-primary-hover text-text-primary text-sm font-medium rounded-xl transition-all duration-300"
                  >
                    Voltar
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;

