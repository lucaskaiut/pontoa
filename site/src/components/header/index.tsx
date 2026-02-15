import { Buttons } from './buttons';
import { Container } from '@/components/Container';
import Image from 'next/image';
import Link from 'next/link';
import logo from '@/assets/logo.jpg';
import { menuItems } from '@/config/menu';

export default async function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-primary text-slate-900">
      <Container className="py-3">
        <div className="flex flex-col w-full gap-3 sm:gap-4">
          <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:gap-4">
            <Link
              href="/"
              className="transition-opacity hover:opacity-90"
              aria-label="Ir para página inicial"
            >
              <Image
                src={logo}
                alt="Logo"
                width={160}
                height={80}
                className="h-10 w-auto sm:h-12"
                sizes="(max-width: 640px) 120px, 160px"
                priority
              />
            </Link>
            <nav
              className="flex flex-wrap gap-1 sm:gap-2 text-white items-center justify-center"
              aria-label="Navegação do menu"
            >
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-200/50"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Buttons />
          </div>
        </div>
      </Container>
    </header>
  );
}
