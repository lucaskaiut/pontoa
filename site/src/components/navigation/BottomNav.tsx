'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuHouse, LuPackage, LuClipboardList, LuShoppingCart, LuUser } from 'react-icons/lu';
import { menuItems } from '@/config/menu';
import { useAuth } from '@/contexts/AuthContext';
import { LAYOUT } from '@/config/layout';

const routeIcons: Record<string, typeof LuHouse> = {
  '/': LuHouse,
  '/produtos': LuPackage,
  '/servicos': LuClipboardList,
};

const iconSize = 22;

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const cartQuantity = 0;

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: LAYOUT.bottomNavSafeArea }}
      aria-label="Navegação principal"
    >
      <div className="flex items-center justify-around h-18 max-w-lg mx-auto">
        {menuItems.map((item) => {
          const Icon = routeIcons[item.href] ?? LuHouse;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-16 py-2 transition-colors ${
                isActive ? 'text-primary' : 'text-slate-500'
              }`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <Icon size={iconSize} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <Link
          href="/carrinho"
          className="flex flex-col items-center justify-center gap-0.5 min-w-16 py-2 text-slate-500 transition-colors relative"
          aria-label={`Carrinho${cartQuantity > 0 ? ` com ${cartQuantity} itens` : ''}`}
        >
          <LuShoppingCart size={iconSize} />
          {cartQuantity > 0 && (
            <span className="absolute top-1.5 right-1/4 min-w-4 h-4 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
              {cartQuantity > 9 ? '9+' : cartQuantity}
            </span>
          )}
          <span className="text-[10px] font-medium">Carrinho</span>
        </Link>
        <Link
          href={isAuthenticated ? '/conta' : '/login'}
          className="flex flex-col items-center justify-center gap-0.5 min-w-16 py-2 text-slate-500 transition-colors"
          aria-label={isAuthenticated ? `Conta de ${user?.name ?? 'usuário'}` : 'Fazer login'}
        >
          <LuUser size={iconSize} />
          <span className="text-[10px] font-medium">{isAuthenticated ? 'Conta' : 'Entrar'}</span>
        </Link>
      </div>
    </nav>
  );
}
