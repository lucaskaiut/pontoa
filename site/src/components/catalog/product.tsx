import { Product } from '@/types/product';
import Image from 'next/image';

const MAX_NAME_LENGTH = 30;
const formatPrice = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function ProductCard({ product }: { product: Product }) {
  const displayName =
    product.name.length > MAX_NAME_LENGTH
      ? `${product.name.substring(0, MAX_NAME_LENGTH)}...`
      : product.name;

  return (
    <div className="flex flex-col min-w-0 w-full max-w-[320px] mx-auto sm:max-w-none sm:min-w-[200px] lg:min-w-[288px] min-h-[420px] sm:min-h-[480px] lg:h-[510px] bg-white rounded-xl sm:rounded-lg shadow-lg sm:shadow-xl cursor-pointer transition-transform duration-200 ease-out hover:scale-[1.02] active:scale-[0.99] touch-manipulation">
      <div className="w-full aspect-square max-h-[240px] sm:max-h-[288px] lg:h-72 shrink-0">
        <Image
          src={product.images?.[0] ?? ''}
          className="w-full h-full object-contain rounded-t-xl sm:rounded-t-lg"
          alt={product.name}
          width={400}
          height={400}
        />
      </div>

      <div className="flex flex-col px-3 sm:px-2 pt-3 sm:pt-2 flex-1 min-h-0">
        <p className="font-bold text-primary text-sm sm:text-base line-clamp-2">{displayName}</p>
        <p className="text-xs text-slate-600 mt-1 line-clamp-2">{product.shortDescription}</p>

        {product.attributes?.map((attribute: { id: string; name: string; value: string }) => (
          <p key={attribute.id} className="text-xs sm:text-sm mt-0.5">
            <span className="font-semibold">{attribute.name}</span>:{' '}
            <span className="font-normal">{attribute.value}</span>
          </p>
        ))}

        <p className="text-lg sm:text-xl font-bold mt-2">{formatPrice(product.price)}</p>

        <div className="flex-1 min-h-2" />

        <button
          type="button"
          className="w-full mt-auto py-2.5 sm:py-2 mb-2 font-bold bg-primary text-white rounded-lg sm:rounded-md text-sm sm:text-base hover:bg-primary/90 active:bg-primary/80 transition-colors touch-manipulation"
        >
          Comprar
        </button>
      </div>
    </div>
  );
}
