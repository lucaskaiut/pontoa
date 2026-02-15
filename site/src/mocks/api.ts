import { Category } from '@/types/category';
import { Product } from '@/types/product';
import { Route } from '@/types/router';
import { Shipping } from '@/types/shipping';
import { Attribute } from '@/types/attribute';
import { User, UserWithToken } from '@/types/user';
import { Order } from '@/types/order';
import { ApiListResponse, ApiResponse } from '@/types/api-response';
import { categoriesByCompany } from './categories';
import { mockProducts } from './products';
import { attributesByCompany } from './attributes';
import { users as fixedUsers } from './users';
import { orders } from './orders';

const basePath = '/api';

const listResponse = <T>(data: T[], total?: number): ApiListResponse<T> => ({
  data,
  links: {
    first: `${basePath}?page=1`,
    last: `${basePath}?page=1`,
    prev: '',
    next: '',
  },
  meta: {
    current_page: 1,
    from: data.length ? 1 : 0,
    last_page: 1,
    path: basePath,
    per_page: data.length,
    to: data.length,
    total: total ?? data.length,
  },
});

const itemResponse = <T>(data: T): ApiResponse<T> => ({ data });

const user = (
  body?: Record<string, string | number | boolean>,
  headers?: HeadersInit
): ApiResponse<User | null> => {
  const authorization =
    headers && typeof headers === 'object' && !(headers instanceof Headers)
      ? (headers as Record<string, string>)['Authorization']
      : undefined;
  const searchUser =
    fixedUsers.find((user) => user.token == authorization?.replace('Bearer ', '')) ?? null;
  return itemResponse(searchUser);
};

const login = (
  body?: Record<string, string | number | boolean>,
  headers?: HeadersInit
): ApiResponse<UserWithToken | null> => {
  const searchUser = fixedUsers.find((user) => user.email == body?.email);

  if (!searchUser) {
    return itemResponse(null);
  }

  return itemResponse({ ...searchUser, token: 'bHVjYXMua2FpdXRAZ21haWwuY29t' });
};

const getApiUrl = (): string => {
  const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  return apiUrl ?? '';
};

const categories = (): ApiListResponse<Category> => {
  const companyId = getApiUrl();

  return listResponse(categoriesByCompany[companyId] ?? []);
};

const attributes = (): ApiListResponse<Attribute> => {
  const companyId = getApiUrl();

  return listResponse(attributesByCompany[companyId] ?? []);
};

const relatedProducts = (): ApiListResponse<Product> => {
  return listResponse(mockProducts);
};

const products = (query?: Record<string, string | number | boolean>): ApiListResponse<Product> => {
  let data: Product[] = mockProducts;

  if (query?.featured) {
    data = mockProducts.filter((product) => product.isFeatured == query.featured);
  } else if (query?.new) {
    data = mockProducts.filter((product) => product.isNew == query.new);
  } else if (query?.category) {
    data = mockProducts.filter((product) =>
      product.categories?.some((category) => category.id === query.category)
    );
  } else if (query?.searchTerm) {
    const searchTerm = query.searchTerm as string;

    const normalize = (text: string) =>
      text
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    const terms = normalize(searchTerm).split(/\s+/).filter(Boolean);

    data = mockProducts.filter((product) => {
      const name = normalize(product.name);
      return terms.every((term) => name.includes(term));
    });
  }

  return listResponse(data);
};

const router = (
  query?: Record<string, string | number | boolean>,
  headers?: HeadersInit
): ApiResponse<Route | Record<string, never>> => {
  if (!query) {
    return itemResponse({});
  }

  const productsData = products().data;
  const product = productsData.find((p) => p.url == query.url);

  if (product) {
    return itemResponse({ type: 'product', product });
  }

  const categoriesData = categories().data;
  const category = categoriesData.find((c) => c.url == query.url);

  if (category) {
    return itemResponse({ type: 'category', category });
  }

  return itemResponse({});
};

const shippingList: Shipping[] = [
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

const shipping = (): ApiListResponse<Shipping> => listResponse(shippingList);

type MockApi = {
  [key: string]: unknown | ((url: string) => unknown);
};
const ordersResponse = (): ApiListResponse<Order> => listResponse(orders);

export const mockApi: MockApi = {
  '/user': (body?: Record<string, string | number | boolean>, headers?: HeadersInit) =>
    user(body, headers),
  '/me': (body?: Record<string, string | number | boolean>, headers?: HeadersInit) =>
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
  '/orders': ordersResponse,
};
