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

const slidesByBreakpoint: Record<string, number> = {
  sm: 1,
  md: 2,
  lg: 3,
  xl: 3,
};

export function ProductsSwiper({ products }: ProductsSwiperProps) {
  const breakpoint = useBreakpoint();
  const slidesPerView = slidesByBreakpoint[breakpoint] ?? 1;
  return (
    <Swiper
      modules={[Navigation]}
      spaceBetween={16}
      slidesPerView={slidesPerView}
      navigation
      pagination={{ clickable: true }}
      className="pb-12! px-1! sm:px-2! md:px-4!"
      style={{ width: '100%' }}
    >
      {products.map((product) => (
        <SwiperSlide key={product.id}>
          <ProductCard product={product} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
