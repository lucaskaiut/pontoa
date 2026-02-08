import { useState, useEffect } from "react";
import type { PaymentData } from "../types";
import { PaymentMethodForm } from "./payment-methods";
import { PaymentMethodCards } from "./PaymentMethodCards";
import { OrderService } from "../services/OrderService";
import type { Order } from "../services/OrderService";
import toast from "react-hot-toast";

interface OrderCheckoutProps {
  order: Order;
  activePaymentMethods: string[];
  onPaymentComplete: (paymentData: PaymentData) => void;
  onCancel: () => void;
  loading: boolean;
  requireCheckout?: boolean;
  onOrderUpdate?: (order: Order) => void;
}

export function OrderCheckout({
  order,
  activePaymentMethods,
  onPaymentComplete,
  onCancel,
  loading,
  requireCheckout = true,
  onOrderUpdate,
}: OrderCheckoutProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  useEffect(() => {
    if (activePaymentMethods.length > 0 && requireCheckout) {
      const validMethod = order.payment_method && activePaymentMethods.includes(order.payment_method)
        ? order.payment_method
        : activePaymentMethods[0];
      
      setSelectedMethod(validMethod);
    }
  }, [activePaymentMethods, requireCheckout, order.payment_method]);

  async function handleMethodSelect(method: string) {
    setSelectedMethod(method);
    try {
      const response = await OrderService.updatePaymentMethod(order.id, method);
      if (onOrderUpdate) {
        onOrderUpdate(response.data);
      }
    } catch (error) {
      console.error("Erro ao atualizar método de pagamento:", error);
      toast.error("Erro ao atualizar método de pagamento. Tente novamente.");
    }
  }

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-center mb-6">Finalizar Pagamento</h2>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <div className="bg-surface rounded-xl p-5 sticky top-4">
            <h3 className="text-lg font-bold text-text-primary mb-4">Resumo do Pedido</h3>
            <div className="space-y-3">
              {order.items?.map((item) => {
                const availablePackage = order.available_packages?.find(pkg => pkg.item_id === item.id);
                const packageFromMetadata = item.metadata?.package;
                const packageInfo = packageFromMetadata || availablePackage?.package;
                const hasPackage = !!packageInfo;
                const originalTotalPrice = item.original_total_price ?? item.total_price;
                const hasDiscount = item.discount_amount && item.discount_amount > 0;
                return (
                  <div key={item.id}>
                    {hasPackage && (
                      <div className="mb-2 flex items-center gap-2">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 border border-primary/40 rounded-full">
                          <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span className="text-primary font-semibold text-xs">Pacote aplicado</span>
                        </div>
                      </div>
                    )}
                    <div className={`flex items-start justify-between gap-3 pb-3 ${hasPackage ? 'border-b border-primary/20' : 'border-b border-white/10'}`}>
                      <div className="flex-1">
                        <p className="text-text-primary font-semibold text-sm">{item.description}</p>
                        <p className="text-text-secondary text-xs">
                          {item.quantity}x {formatPrice(item.original_unit_price ?? item.unit_price)}
                        </p>
                      </div>
                      <div className="text-right">
                        {hasDiscount && (
                          <p className="text-text-secondary text-xs line-through mb-1">
                            {formatPrice(originalTotalPrice)}
                          </p>
                        )}
                        <p className={`font-medium text-sm ${hasDiscount ? 'text-success' : 'text-text-primary'}`}>
                          {formatPrice(item.total_price)}
                        </p>
                        {hasDiscount && (
                          <p className="text-success text-xs font-semibold mt-1">
                            -{formatPrice(item.discount_amount!)}
                          </p>
                        )}
                      </div>
                    </div>
                    {packageInfo && (
                      <div className="mt-2 mb-3 p-4 bg-primary/15 border-2 border-primary/30 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <p className="text-primary font-bold text-sm mb-2">
                              Utilizando sessão do pacote
                            </p>
                            <div className="space-y-1.5">
                              <p className="text-text-primary text-sm">
                                <span className="text-text-secondary">Pacote:</span> <strong className="text-primary">{packageFromMetadata ? packageFromMetadata.package_name : (packageInfo as any).name}</strong>
                              </p>
                              <p className="text-text-primary text-sm">
                                <span className="text-text-secondary">Sessões restantes:</span> <strong className="text-primary">{packageFromMetadata ? packageFromMetadata.remaining_sessions - 1 : (packageInfo as any).remaining_sessions - 1}</strong>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {order.discount_amount && order.discount_amount > 0 && (
                <div className="pt-3 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-text-secondary text-sm">Subtotal</p>
                    <p className="text-text-secondary text-sm">{formatPrice(order.original_total_amount ?? order.total_amount)}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-success font-semibold text-sm">Desconto (Pacote)</p>
                    <p className="text-success font-semibold text-sm">-{formatPrice(order.discount_amount)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between pt-3 border-t-2 border-primary/20">
                <p className="text-text-primary font-bold text-lg">Total</p>
                <div className="text-right">
                  {order.discount_amount && order.discount_amount > 0 && order.original_total_amount && (
                    <p className="text-text-secondary text-sm line-through mb-1">
                      {formatPrice(order.original_total_amount)}
                    </p>
                  )}
                  <p className="text-primary font-bold text-xl">{formatPrice(order.total_amount)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          {!requireCheckout ? (
            <div className="bg-surface rounded-xl p-6 text-center">
              <p className="text-text-primary font-medium mb-4">
                Para concluir seu pedido, clique no botão abaixo
              </p>
              <button
                onClick={() => onPaymentComplete({ method: "none" } as PaymentData)}
                disabled={loading}
                className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Pedido
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {activePaymentMethods.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-text-primary mb-4">Forma de Pagamento</h3>
                  <PaymentMethodCards
                    methods={activePaymentMethods}
                    selectedMethod={selectedMethod}
                    onSelectMethod={handleMethodSelect}
                  />
                </div>
              )}

              {selectedMethod && (
                <div>
                  <PaymentMethodForm
                    method={selectedMethod}
                    onPaymentComplete={onPaymentComplete}
                    loading={loading}
                  />
                </div>
              )}

              <div className="flex gap-3">
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
          )}
        </div>
      </div>
    </div>
  );
}

