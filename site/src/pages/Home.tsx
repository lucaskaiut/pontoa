import { Banner } from '@/components/banner';
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
        <Suspense fallback={<div>Loading...</div>}>
          <ProductsSwiper products={products} />
        </Suspense>
      </Container>
    </>
  );
}
