import type React from "react";
import { PagarmeCreditCardForm } from "./PagarmeCreditCardForm";
import { PagarmePixForm } from "./PagarmePixForm";
import type { PaymentData } from "../../types";

interface PaymentMethodFormProps {
  method: string;
  onPaymentComplete: (paymentData: PaymentData) => void;
  loading: boolean;
}

function methodToComponentName(method: string): string {
  const parts = method.split(/(?=[A-Z])/);
  const capitalized = parts
    .map((part, index) => {
      if (index === 0) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      }
      return part;
    })
    .join("");
  return `${capitalized}Form`;
}

const paymentMethodComponents: Record<
  string,
  React.ComponentType<{
    onPaymentComplete: (paymentData: PaymentData) => void;
    loading: boolean;
  }>
> = {
  PagarmeCreditCardForm,
  PagarmePixForm,
};

export function PaymentMethodForm({
  method,
  onPaymentComplete,
  loading,
}: PaymentMethodFormProps) {
  const componentName = methodToComponentName(method);
  const Component = paymentMethodComponents[componentName];

  if (!Component) {
    return (
      <div className="bg-white/5 rounded-xl p-5 text-center">
        <p className="text-white/70 text-sm">Método de pagamento não suportado.</p>
      </div>
    );
  }

  return <Component onPaymentComplete={onPaymentComplete} loading={loading} />;
}

