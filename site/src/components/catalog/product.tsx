import { Product } from '@/types/product';
import Image from 'next/image';

export function ProductCard({ product }: { product: Product }) {
  const getPriceBlock = () => {
    return (
      <p className="text-xl font-bold">
        {new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(product.price)}
      </p>
    );
  };
  return (
    <div className="min-w-72 w-full lg:w-72 h-[510px] bg-white rounded-sm shadow-xl cursor-pointer transition-transform duration-200 ease-in-out hover:scale-105">
      <div className="w-full lg:w-72 h-72">
        <Image
          src={product.images?.[0] ?? ''}
          className="w-full h-full object-contain rounded-sm"
          alt="Produto"
          width={400}
          height={400}
        />
      </div>

      <div className="flex flex-col px-2 pt-2 h-[220px]">
        <p className="font-bold text-primary">{product.name.length > 30 ? product.name.substring(0, 30) + '...' : product.name}</p>

        <div className="h-10">
          <p className="text-xs">{product.shortDescription}</p>
        </div>

        {product.attributes?.map((attribute: any) => (
            <p key={attribute.id} className="text-sm">
              <span className="font-semibold">{attribute.name}</span>:{" "}
              <span className="font-normal">{attribute.value}</span>
            </p>
          ))}

        {getPriceBlock()}

        <div className="flex-1" />

        <button className="w-full mb-2 font-bold bg-primary text-white py-2 rounded-md">
          Comprar
        </button>
      </div>
    </div>
  );
}
