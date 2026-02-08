import type { PaymentData } from "../../types";

interface PagarmePixFormProps {
  onPaymentComplete: (paymentData: PaymentData) => void;
  loading: boolean;
}

export function PagarmePixForm({
  onPaymentComplete,
  loading,
}: PagarmePixFormProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onPaymentComplete({
      method: "pagarmePix",
    } as PaymentData);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-xl p-6 border border-white/10">
      <div className="mb-6">
        <p className="text-text-secondary text-sm text-center">
          Seu QR Code será gerado na próxima etapa
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-5 py-3 bg-success hover:bg-success/80 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processando...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Confirmar Pedido
          </>
        )}
      </button>
    </form>
  );
}
