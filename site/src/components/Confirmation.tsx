import { useState } from "react";
import type { Service, Collaborator } from "../types";
import { TermsModal } from "./TermsModal";

interface CustomerData {
  name: string;
  email: string;
  phone: string;
}

interface ConfirmationProps {
  service: Service;
  collaborator: Collaborator;
  date: string;
  time: string;
  customer: CustomerData;
  onConfirm: () => void;
  loading: boolean;
  termsAndConditions: string | null;
}

export function Confirmation({
  service,
  collaborator,
  date,
  time,
  customer,
  onConfirm,
  loading,
  termsAndConditions,
}: ConfirmationProps) {
  const [showTermsModal, setShowTermsModal] = useState(false);
  function formatDate(dateStr: string): string {
    const dateObj = new Date(dateStr + "T12:00:00");
    return dateObj.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} minutos`;
    if (mins === 0) return `${hours} hora${hours > 1 ? "s" : ""}`;
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
      <h2 className="text-xl font-bold text-center mb-5">Confirme seu Agendamento</h2>

      <div className="bg-surface rounded-xl p-5 space-y-4 mb-5 border border-white/10">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-text-secondary text-xs">Serviço</p>
            <p className="text-text-primary font-semibold">{service.name}</p>
            <p className="text-text-secondary text-sm">{formatDuration(service.duration)}</p>
          </div>
          <div className="text-right">
            <p className="text-primary font-bold text-lg">{formatPrice(service.price)}</p>
          </div>
        </div>

        <hr className="border-white/10" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <p className="text-text-secondary text-xs">Profissional</p>
            <p className="text-text-primary font-semibold">{collaborator.name}</p>
          </div>
        </div>

        <hr className="border-white/10" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-text-secondary text-xs">Data e Horário</p>
            <p className="text-text-primary font-semibold capitalize">{formatDate(date)}</p>
            <p className="text-primary font-bold text-lg">{time}</p>
          </div>
        </div>

        <hr className="border-white/10" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-text-secondary text-xs">Seus dados</p>
            <p className="text-text-primary font-semibold">{customer.name}</p>
            <p className="text-text-secondary text-sm">{customer.email}</p>
            <p className="text-text-secondary text-sm">{customer.phone}</p>
          </div>
        </div>
      </div>

      {termsAndConditions && (
        <div className="mb-5 text-center">
          <p className="text-text-secondary text-sm">
            Ao agendar, você concorda com os{" "}
            <button
              onClick={() => setShowTermsModal(true)}
              className="text-primary hover:text-primary/80 underline font-medium transition-colors"
            >
              termos e condições
            </button>
            .
          </p>
        </div>
      )}

      <button
        onClick={onConfirm}
        disabled={loading}
        className="w-full py-3 bg-success hover:bg-success/80 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Agendando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confirmar Agendamento
          </>
        )}
      </button>

      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        termsHtml={termsAndConditions}
      />
    </div>
  );
}

