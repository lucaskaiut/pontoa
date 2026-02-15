import { Product } from './product';

export type OrderProduct = Product & { quantity: number };

export type Order = {
  id: string;
  products: OrderProduct[];
  paymentMethod: string;
  total: number;
  createdAt: string;
  status: 'pending' | 'approved' | 'shipped' | 'delivered' | 'canceled';
};
