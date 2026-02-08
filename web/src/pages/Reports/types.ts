export interface RevenueReportItem {
  id?: number;
  order_id?: number;
  customer_id?: number;
  company_id?: number;
  user_id?: number;
  service_id?: number;
  date?: string;
  cost?: string | number;
  price?: string | number;
  commission?: string | number | null;
  payment_reference?: string | null;
  status?: string;
  created_at?: string;
  updated_at?: string;
  customer?: {
    id: number;
    name: string;
  };
  service?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
  };
  order?: {
    id: number;
    items?: Array<{
      id: number;
      item_type: string;
      description: string;
      quantity: number;
      unit_price: number;
      total_price: number;
    }>;
  };
}

export interface RevenueReportGroupedItem {
  date: string;
  price: number;
  cost: number;
  count: number;
}

export type RevenueReportData = RevenueReportItem[] | RevenueReportGroupedItem[];

export interface RevenueReportFilters {
  group_by?: 'day' | 'month' | 'year' | '';
  date_start_at?: string;
  date_end_at?: string;
  user_id?: string | number;
  service_id?: string | number;
}

export interface RevenueReportTotals {
  totalPrice: number;
  totalCost: number;
  totalProfit: number;
  totalCount: number;
}

export interface NoShowReportItem {
  id?: number;
  customer_id?: number;
  company_id?: number;
  user_id?: number;
  service_id?: number;
  date?: string;
  price?: string | number;
  status?: string;
  created_at?: string;
  updated_at?: string;
  customer?: {
    id: number;
    name: string;
  };
  service?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    name: string;
  };
}

export interface NoShowReportGroupedItem {
  date: string;
  count: number;
  total_price: number;
}

export interface NoShowReportGroupedByCustomerItem {
  customer_id: number;
  customer?: {
    id: number;
    name: string;
  };
  count: number;
  total_price: number;
}

export type NoShowReportData = NoShowReportItem[] | NoShowReportGroupedItem[] | NoShowReportGroupedByCustomerItem[];

export interface NoShowReportFilters {
  group_by?: 'day' | 'month' | 'year' | 'customer' | '';
  date_start_at?: string;
  date_end_at?: string;
  user_id?: string | number;
  service_id?: string | number;
  customer_id?: string | number;
}

export interface NoShowReportTotals {
  totalCount: number;
  totalPrice: number;
}

