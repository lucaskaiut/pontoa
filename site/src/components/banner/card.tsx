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
      className={`hover:scale-101 transition-all duration-300 w-1/2 h-40 rounded-lg flex flex-col justify-center items-center ${className}`}
    >
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="text-sm">{description}</p>
    </Link>
  );
}
