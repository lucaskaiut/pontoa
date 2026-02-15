import { Category } from '@/types/category';
import { Product } from '@/types/product';
import { Route } from '@/types/router';
import { Shipping } from '@/types/shipping';
import { Attribute } from '@/types/attribute';
import { User, UserWithToken } from '@/types/user';
import { categoriesByCompany } from './categories';
import { mockProducts } from './products';
import { attributesByCompany } from './attributes';
import { users as fixedUsers } from './users';
import { orders } from './orders';

const user = (
  body?: Record<string, string | number | boolean>,
  headers?: HeadersInit
): User | null => {
  const authorization =
    headers && typeof headers === 'object' && !(headers instanceof Headers)
      ? (headers as Record<string, string>)['Authorization']
      : undefined;
  const searchUser =
    fixedUsers.find((user) => user.token == authorization?.replace('Bearer ', '')) ?? null;
  return searchUser;
};

const login = (
  body?: Record<string, string | number | boolean>,
  headers?: HeadersInit
): UserWithToken | null => {
  const searchUser = fixedUsers.find((user) => user.email == body?.email);

  if (!searchUser) {
    return null;
  }

  return { ...searchUser, token: 'bHVjYXMua2FpdXRAZ21haWwuY29t' };
};

const getApiUrl = (): string => {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  return apiUrl ?? '';
};

const categories = (): Category[] => {
  const companyId = getApiUrl();

  return categoriesByCompany[companyId];
};

const attributes = (): Attribute[] => {
  const companyId = getApiUrl();

  return attributesByCompany[companyId];
};

const relatedProducts = (): Product[] | [] => {
  return mockProducts;
};

const products = (query?: Record<string, string | number | boolean>): Product[] | [] => {
  if (query?.featured) {
    return mockProducts.filter((product) => product.isFeatured == query.featured);
  }

  if (query?.new) {
    return mockProducts.filter((product) => product.isNew == query.new);
  }

  if (query?.category) {
    return mockProducts.filter((product) =>
      product.categories?.some((category) => category.id === query.category)
    );
  }

  if (query?.searchTerm) {
    const searchTerm = query.searchTerm as string;

    const normalize = (text: string) =>
      text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const terms = normalize(searchTerm).split(/\s+/).filter(Boolean); // garante que não tenha termos vazios

    return mockProducts.filter((product) => {
      const name = normalize(product.name);
      return terms.every((term) => name.includes(term));
    });
  }

  return mockProducts;
};

const router = (
  query?: Record<string, string | number | boolean>,
  headers?: HeadersInit
): Route | {} => {
  if (!query) {
    return {};
  }

  const product = products().find((product) => product.url == query.url);

  if (product) {
    return {
      type: 'product',
      product,
    };
  }

  const category = categories().find((category) => category.url == query.url);

  if (category) {
    return {
      type: 'category',
      category,
    };
  }

  return {};
};

const shipping: Shipping[] = [
  {
    id: '1',
    carrier: 'Correios',
    deliveryTime: 4,
    method: 'correios_sedex',
    description: 'SEDEX',
    value: 29.9,
  },
  {
    id: '2',
    carrier: 'Correios',
    deliveryTime: 7,
    method: 'correios_pac',
    description: 'PAC',
    value: 18.23,
  },
  {
    id: '3',
    carrier: 'Correios',
    deliveryTime: 10,
    method: 'correios_pac_free',
    description: 'PAC',
    value: 0,
  },
];

type MockApi = {
  [key: string]: unknown | ((url: string) => unknown);
};
export const mockApi: MockApi = {
  '/user': (body?: Record<string, string | number | boolean>, headers?: HeadersInit) =>
    user(body, headers),
  '/login': (body?: Record<string, string | number | boolean>, headers?: HeadersInit) =>
    login(body, headers),
  '/categories': categories,
  '/products': products,
  '/router': (query?: Record<string, string | number | boolean>, headers?: HeadersInit) =>
    router(query, headers),
  '/shipping/quote': shipping,
  '/attributes': attributes,
  '/product/related': relatedProducts,
  '/orders': orders,
};
