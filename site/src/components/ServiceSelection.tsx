import type { Service } from "../types";

interface ServiceSelectionProps {
  services: Service[];
  onSelect: (service: Service) => void;
  selectedService: Service | null;
  isLoading?: boolean;
}

export function ServiceSelection({ services, onSelect, selectedService, isLoading }: ServiceSelectionProps) {
  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
  }

  function formatPrice(price: string): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(price));
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-center mb-5">Escolha o Serviço</h2>
      
      <div className="space-y-3">
        {services.map((service) => (
          <button
            key={service.id}
            onClick={() => onSelect(service)}
            disabled={isLoading}
            className={`
              group relative w-full p-4 rounded-xl text-left transition-all duration-300
              ${selectedService?.id === service.id
                ? "bg-primary/20 border-2 border-primary"
                : "bg-white/5 border-2 border-transparent hover:bg-white/10 hover:border-primary/50"
              }
              ${isLoading ? "opacity-50 cursor-wait" : ""}
            `}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-primary transition-colors">
                  {service.name}
                </h3>
                <p className="text-white/60 text-sm mt-1">{service.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1.5 text-white/70 text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatDuration(service.duration)}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-primary">
                  {formatPrice(service.price)}
                </span>
              </div>
            </div>
            
            {selectedService?.id === service.id && (
              <div className="absolute top-4 right-4">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
