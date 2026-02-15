export type MenuItem = {
  href: string;
  label: string;
};

export const menuItems: MenuItem[] = [
  { href: '/', label: 'Home' },
  { href: '/produtos', label: 'Produtos' },
  { href: '/servicos', label: 'Serviços' },
];
