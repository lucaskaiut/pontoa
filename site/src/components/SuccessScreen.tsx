import type { Scheduling } from "../types";

interface SuccessScreenProps {
  scheduling: Scheduling;
  onNewBooking: () => void;
}

export function SuccessScreen({ scheduling, onNewBooking }: SuccessScreenProps) {
  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    date.setHours(date.getHours() + 3);
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    date.setHours(date.getHours() + 3);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="relative mb-6">
        <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center animate-bounce">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="absolute -inset-3 bg-success/20 rounded-full animate-ping" />
      </div>

      <h2 className="text-2xl font-bold text-text-primary mb-2">Agendamento Confirmado!</h2>
      <p className="text-text-secondary max-w-sm mb-6">
        Seu agendamento foi realizado com sucesso. Enviamos os detalhes para o seu e-mail.
      </p>

      <div className="bg-surface rounded-xl p-5 w-full max-w-sm text-left space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-text-secondary text-sm">Serviço</span>
          <span className="text-text-primary font-medium text-sm">{scheduling.service.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary text-sm">Profissional</span>
          <span className="text-text-primary font-medium text-sm">{scheduling.user.name}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary text-sm">Data</span>
          <span className="text-text-primary font-medium text-sm capitalize">{formatDate(scheduling.date)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-text-secondary text-sm">Horário</span>
          <span className="text-primary font-bold text-lg">{formatTime(scheduling.date)}</span>
        </div>
      </div>

      <button
        onClick={onNewBooking}
        className="px-6 py-3 bg-surface hover:bg-primary-hover text-text-primary font-medium rounded-xl transition-all duration-300"
      >
        Fazer novo agendamento
      </button>
    </div>
  );
}

