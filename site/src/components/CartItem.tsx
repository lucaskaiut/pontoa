import { useState } from "react";

export interface CartItemData {
  id: number;
  item_type: string;
  item_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  metadata?: {
    service_id?: number;
    user_id?: number;
    date?: string;
    package?: {
      id: number;
      package_id: number;
      package_name: string;
      remaining_sessions: number;
    };
  };
  discount_amount?: number;
  original_unit_price?: number;
  original_total_price?: number;
}

interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
  loading?: boolean;
}

export function CartItem({ item, onUpdateQuantity, onRemove, loading = false }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  function formatPrice(price: number): string {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(price);
  }

  function handleQuantityChange(newQuantity: number) {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    onUpdateQuantity(item.id, newQuantity);
  }

  function handleRemove() {
    if (window.confirm("Deseja remover este item do carrinho?")) {
      onRemove(item.id);
    }
  }

  const hasPackage = item.metadata?.package;
  const hasDiscount = item.discount_amount && item.discount_amount > 0;
  const originalTotalPrice = item.original_total_price ?? item.total_price;

  return (
    <div className={`bg-surface rounded-xl p-4 border ${hasPackage ? 'border-primary/30' : 'border-white/10'}`}>
      {hasPackage && (
        <div className="mb-3 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 border border-primary/40 rounded-full">
            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-primary font-semibold text-xs">Pacote aplicado</span>
          </div>
        </div>
      )}
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-text-primary font-semibold mb-1">{item.description}</h3>
          <p className="text-text-secondary text-sm">
            {item.item_type === "package" ? "Pacote" : "Serviço"}
          </p>
        </div>

        <div className="text-right">
          {hasDiscount && (
            <p className="text-text-secondary text-xs line-through mb-1">
              {formatPrice(originalTotalPrice)}
            </p>
          )}
          <p className={`font-bold text-lg mb-2 ${hasDiscount ? 'text-success' : 'text-primary'}`}>
            {formatPrice(item.total_price)}
          </p>
          {hasDiscount && (
            <p className="text-success text-xs font-semibold mb-1">
              -{formatPrice(item.discount_amount!)}
            </p>
          )}
          <p className="text-text-secondary text-xs">
            {formatPrice(item.unit_price)} cada
          </p>
        </div>
      </div>

      {hasPackage && item.metadata?.package && (
        <div className="mt-3 pt-3 border-t border-primary/20">
          <div className="p-4 bg-primary/15 border-2 border-primary/30 rounded-lg">
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
                    <span className="text-text-secondary">Pacote:</span> <strong className="text-primary">{item.metadata.package.package_name}</strong>
                  </p>
                  <p className="text-text-primary text-sm">
                    <span className="text-text-secondary">Sessões restantes:</span> <strong className="text-primary">{item.metadata.package.remaining_sessions - 1}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={loading || quantity <= 1}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="text-text-primary font-medium w-8 text-center">{quantity}</span>
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity + 1)}
            disabled={loading}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={handleRemove}
          disabled={loading}
          className="text-red-400 hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Remover
        </button>
      </div>
    </div>
  );
}

