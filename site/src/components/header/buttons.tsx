'use client';
import { LuShoppingCart, LuUser } from 'react-icons/lu';

import { useAuth } from '@/contexts/AuthContext';

export function Buttons() {
  const { isAuthenticated, user } = useAuth();
  const cartQuantity = 0;

  return (
    <div className="flex items-center gap-2">
      <div
        className="flex items-center gap-1.5 rounded-md px-3 py-2 text-white text-sm font-medium transition-colors hover:bg-slate-200/50"
        aria-label={
          isAuthenticated
            ? `Dados do usuário ${user?.name ?? ''}`
            : 'Fazer login'
        }
      >
        <LuUser className="h-5 w-5" />
      </div>
      <div
        className="relative flex text-white items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-200/50"
        aria-label={`Carrinho com ${cartQuantity} itens`}
      >
        <LuShoppingCart className="h-5 w-5" />
        {cartQuantity > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-xs font-medium text-white">
            {cartQuantity > 9 ? '9+' : cartQuantity}
          </span>
        )}
      </div>
    </div>
  );
}
