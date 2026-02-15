'use client';

import { Product } from '@/types/product';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ProductCard } from './product';
import { useBreakpoint } from '@/hooks/useBreakpoint';

interface ProductsSwiperProps {
  products: Product[];
}

export function ProductsSwiper({ products }: ProductsSwiperProps) {
  const breakpoint = useBreakpoint();
  const slidesPerView = breakpoint === 'sm' ? 1 : 3;
  return (
    <Swiper
      modules={[Navigation]}
      spaceBetween={45}
      slidesPerView={slidesPerView}
      navigation
      pagination={{ clickable: true }}
      style={{
        width: '100%',
        paddingBottom: '40px',
        paddingLeft: '10px',
        paddingRight: '30px',
      }}
    >
      {products.map((product) => (
        <SwiperSlide key={product.id}>
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
