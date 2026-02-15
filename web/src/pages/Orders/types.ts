export interface Order {
  id?: string | number;
  company_id?: number;
  customer_id?: number;
  status: string;
  total_amount: number;
  payment_method?: string | null;
  payment_reference?: string | null;
  paid_at?: string | null;
  expires_at?: string | null;
  created_at?: string;
  updated_at?: string;
  items?: OrderItem[];
  customer?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface OrderItem {
  id: number;
  order_id: number;
  item_type: string;
  item_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  metadata?: any;
}

