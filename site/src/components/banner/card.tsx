import Link from 'next/link';

type CardProps = {
  title: string;
  description: string;
  href: string;
  className?: string;
};

export function Card({ title, description, href, className }: CardProps) {
  return (
    <Link
      href={href}
      className={`hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 w-full sm:w-1/2 min-h-28 sm:min-h-40 rounded-xl md:rounded-lg flex flex-col justify-center items-center p-4 text-center ${className}`}
    >
      <h3 className="text-xl sm:text-2xl font-bold">{title}</h3>
      <p className="text-xs sm:text-sm mt-1 max-w-[280px]">{description}</p>
    </Link>
  );
}
