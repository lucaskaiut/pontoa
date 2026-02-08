import React from "react";

interface PaymentMethodCardsProps {
  methods: string[];
  selectedMethod: string;
  onSelectMethod: (method: string) => void;
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    pagarmeCreditCard: "Cartão de Crédito",
    pagarmePix: "PIX",
    mercadopagoCreditCard: "Cartão de Crédito (Mercado Pago)",
  };
  return labels[method] || method;
}

function getPaymentMethodIcon(method: string): React.JSX.Element {
  if (method.includes("CreditCard") || method.includes("creditCard")) {
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    );
  }
  
  if (method.includes("Pix") || method.includes("pix")) {
    return (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

export function PaymentMethodCards({ methods, selectedMethod, onSelectMethod }: PaymentMethodCardsProps) {
  if (methods.length === 0) {
    return null;
  }

  const isSingleMethod = methods.length === 1;

  return (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-3">
        Método de Pagamento
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {methods.map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => !isSingleMethod && onSelectMethod(method)}
            disabled={isSingleMethod}
            className={`
              flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300
              ${
                selectedMethod === method
                  ? "bg-primary/10 border-primary"
                  : "bg-surface border-white/20"
              }
              ${isSingleMethod ? "cursor-default" : "cursor-pointer hover:bg-primary/10"}
            `}
          >
            <div className={`${selectedMethod === method ? "text-primary" : "text-text-secondary"}`}>
              {getPaymentMethodIcon(method)}
            </div>
            <span className="text-text-primary font-medium">{getPaymentMethodLabel(method)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

