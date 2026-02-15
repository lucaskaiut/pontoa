import { Banner } from '@/components/banner';
import { ProductCardSkeleton } from '@/components/catalog/skeletons/product-card-skeleton';
import { ProductsSwiper } from '@/components/catalog/swiper';
import { Container } from '@/components/Container';
import { get } from '@/services/api';
import { Product } from '@/types/product';
import { Suspense } from 'react';

export default async function Home() {
  const products = await get<Product[]>('/products', {
    featured: true,
  });

  return (
    <>
      <Banner />
      <Container className="mt-4">
        <Suspense
          fallback={
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ProductCardSkeleton />
              <ProductCardSkeleton />
              <ProductCardSkeleton />
            </div>
          }
        >
          <ProductsSwiper products={products} />
        </Suspense>
      </Container>
    </>
  );
}
