interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
  vertical?: boolean;
}

const defaultStepLabels = ["Serviço", "Profissional", "Data e Hora", "Seus Dados", "Confirmação"];

export function StepIndicator({ 
  currentStep, 
  totalSteps, 
  stepLabels = defaultStepLabels,
  vertical = false 
}: StepIndicatorProps) {
  if (vertical) {
    return (
      <div className="flex flex-col gap-1">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-start">
            <div className="flex flex-col items-center">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold
                  transition-all duration-300 shrink-0
                  ${step === currentStep
                    ? "bg-primary text-white shadow-md shadow-primary/40"
                    : step < currentStep
                      ? "bg-success text-white"
                      : "bg-accent-soft text-text-secondary"
                  }
                `}
              >
                {step < currentStep ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              {step < totalSteps && (
                <div
                  className={`
                    w-0.5 h-5 transition-colors duration-300
                    ${step < currentStep ? "bg-success" : "bg-accent-soft"}
                  `}
                />
              )}
            </div>
            <span
              className={`
                text-xs ml-3 mt-1.5 transition-colors duration-300
                ${step === currentStep ? "text-primary font-semibold" : "text-text-secondary"}
              `}
            >
              {stepLabels[step - 1]}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mb-5">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`
                w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold
                transition-all duration-300
                ${step === currentStep
                  ? "bg-primary text-white scale-110 shadow-md shadow-primary/40"
                  : step < currentStep
                    ? "bg-success text-white"
                    : "bg-accent-soft text-text-secondary"
                }
              `}
            >
              {step < currentStep ? (
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            <span
              className={`
                text-[9px] mt-1 hidden sm:block transition-colors duration-300 whitespace-nowrap
                ${step === currentStep ? "text-primary font-semibold" : "text-text-secondary"}
              `}
            >
              {stepLabels[step - 1]}
            </span>
          </div>
          {step < totalSteps && (
            <div
              className={`
                w-3 sm:w-6 h-0.5 mx-1 transition-colors duration-300
                  ${step < currentStep ? "bg-success" : "bg-accent-soft"}
              `}
            />
          )}
        </div>
      ))}
    </div>
  );
}
