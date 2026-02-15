import { Banner } from '@/components/banner';
import { CatalogGrid } from '@/components/catalog/grid';
import { ProductCardSkeleton } from '@/components/catalog/skeletons/product-card-skeleton';
import { ProductsSwiper } from '@/components/catalog/swiper';
import { Container } from '@/components/Container';
import { get } from '@/services/api';
import { ApiListResponse } from '@/types/api-response';
import { Product } from '@/types/product';
import { Suspense } from 'react';

export default async function Home() {
  const { data: products } = await get<ApiListResponse<Product>>('/products', {
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
          <h2 className="text-2xl font-bold mb-4">Produtos em destaque</h2>
          <CatalogGrid products={products} />
        </Suspense>
      </Container>
    </>
  );
}
