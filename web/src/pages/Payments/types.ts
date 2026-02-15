export interface Payment {
  id?: string | number;
  company_id: number;
  amount: number;
  payment_method: string;
  payment_method_label?: string;
  plan: string;
  plan_label?: string;
  billed_at: string;
  external_id: string;
  created_at?: string;
  updated_at?: string;
}

