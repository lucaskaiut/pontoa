import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Welcome } from './steps/Welcome';
import { ServiceStep } from './steps/ServiceStep';
import { ScheduleStep } from './steps/ScheduleStep';
import { NotificationStep } from './steps/NotificationStep';
import { Completion } from './steps/Completion';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../hooks/useAuth';

const ONBOARDING_STEPS = [
  { id: 'welcome', title: 'Bem-vindo', component: Welcome },
  { id: 'services', title: 'Serviços', component: ServiceStep },
  { id: 'schedules', title: 'Horários', component: ScheduleStep },
  { id: 'notifications', title: 'Notificações', component: NotificationStep },
  { id: 'completion', title: 'Concluir', component: Completion },
];

export function Onboarding({ onComplete }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isCompleting, setIsCompleting] = useState(false);
  
  const [createdServices, setCreatedServices] = useState([]);

  const CurrentStepComponent = ONBOARDING_STEPS[currentStep].component;
  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1;

  const handleNext = (dataCreated = false) => {
    if (dataCreated) {
      setCompletedSteps([...completedSteps, ONBOARDING_STEPS[currentStep].id]);
    }

    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await companyService.completeOnboarding();
      
      if (user && user.company) {
        user.company.onboarding_completed = true;
      }
      
      toast.success('Configuração inicial concluída! Bem-vindo ao PontoA!');
      onComplete();
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast.error('Erro ao finalizar configuração. Tente novamente.');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleServiceCreated = (service) => {
    console.log('Onboarding - Serviço criado:', service);
    console.log('Onboarding - createdServices antes:', createdServices);
    const updatedServices = [...createdServices, service];
    setCreatedServices(updatedServices);
    console.log('Onboarding - createdServices depois:', updatedServices);
  };

  const currentStepId = ONBOARDING_STEPS[currentStep].id;

  const getStepProps = (stepId) => {
    const baseProps = {
      onNext: handleNext,
      onSkip: handleSkip,
      onBack: handleBack,
      isFirstStep: currentStep === 0,
      isLastStep: isLastStep,
      isCompleting: isCompleting,
    };

    switch (stepId) {
      case 'services':
        return {
          ...baseProps,
          onServiceCreated: handleServiceCreated,
          currentUser: user,
        };
      case 'schedules':
        console.log('Onboarding - ScheduleStep props:', {
          availableServices: createdServices,
          currentUser: user,
        });
        return {
          ...baseProps,
          availableServices: createdServices,
          currentUser: user,
        };
      default:
        return baseProps;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-linear-to-r from-purple-400 to-blue-500 p-6">
          <div className="flex items-center justify-between text-white mb-4">
            <h2 className="text-2xl font-bold">Configuração Inicial</h2>
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
              Passo {currentStep + 1} de {ONBOARDING_STEPS.length}
            </span>
          </div>

          <div className="flex gap-2">
            {ONBOARDING_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`flex-1 h-2 rounded-full transition-all ${
                  index <= currentStep 
                    ? 'bg-white' 
                    : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <CurrentStepComponent {...getStepProps(currentStepId)} />
        </div>
      </div>
    </div>
  );
}

