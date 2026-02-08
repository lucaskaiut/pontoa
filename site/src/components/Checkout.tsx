import { useState, useEffect } from "react";
import type { Service, PaymentData } from "../types";
import { PaymentMethodForm } from "./payment-methods";

interface CheckoutProps {
  service: Service;
  activePaymentMethods: string[];
  onPaymentComplete: (paymentData: PaymentData) => void;
  onCancel: () => void;
  loading: boolean;
}

export function Checkout({
  service,
  activePaymentMethods,
  onPaymentComplete,
  onCancel,
  loading,
}: CheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  useEffect(() => {
    if (activePaymentMethods.length > 0) {
      setSelectedMethod(activePaymentMethods[0]);
    }
  }, [activePaymentMethods]);

  function formatPrice(price: string): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(parseFloat(price));
  }

  function getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
      pagarmeCreditCard: "Cartão de Crédito",
      pagarmePix: "PIX",
      mercadopagoCreditCard: "Cartão de Crédito (Mercado Pago)",
    };
    return labels[method] || method;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-center mb-5">Finalizar Pagamento</h2>

      <div className="bg-surface rounded-xl p-5 space-y-4 mb-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-text-secondary text-xs">Serviço</p>
            <p className="text-text-primary font-semibold">{service.name}</p>
          </div>
          <div className="text-right">
            <p className="text-primary font-bold text-lg">{formatPrice(service.price)}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {activePaymentMethods.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Método de Pagamento
            </label>
            <div className="space-y-2">
              {activePaymentMethods.map((method) => (
                <label
                  key={method}
                  className={`
                    flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                    ${
                      selectedMethod === method
                        ? "bg-primary/10 border-primary"
                        : "bg-surface border-transparent hover:bg-primary/10"
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={selectedMethod === method}
                    onChange={(e) => setSelectedMethod(e.target.value)}
                    className="w-4 h-4 text-primary"
                  />
                  <span className="text-text-primary font-medium">{getPaymentMethodLabel(method)}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {selectedMethod && (
          <PaymentMethodForm
            method={selectedMethod}
            onPaymentComplete={onPaymentComplete}
            loading={loading}
          />
        )}

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-5 py-3 bg-surface hover:bg-primary-hover text-text-primary font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

