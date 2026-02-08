export interface Company {
  id: number;
  name: string;
  domain: string;
  banner: string | null;
  logo: string | null;
  email: string;
  phone: string;
  document: string;
  plan: string;
  is_free: number;
  addresses: unknown[];
  terms_and_conditions: string | null;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  name: string;
  description: string;
  photo: string | null;
  price: string;
  cost: string;
  duration: number;
  created_at: string;
  updated_at: string;
}

export interface Collaborator {
  id: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  bank: string | null;
  branch_number: string | null;
  account_number: string | null;
  account_check_digit: string | null;
  bank_account_type: string | null;
  created_at: string;
  updated_at: string;
  is_collaborator: boolean;
  company: Company;
  services: Service[];
  image?: string | null;
  description?: string | null;
  url?: string | null;
}

export interface ScheduleHours {
  schedule: Record<string, Record<string, string[]>>;
  users: Collaborator[];
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  created_at: string;
  updated_at: string;
}

export interface Scheduling {
  id: number;
  date: string;
  commission: string | null;
  cost: string;
  price: string;
  service: Service;
  user: Collaborator;
  customer: Customer;
  status: string | null;
  create_at: string;
  updated_at: string;
}

export interface SchedulingPayload {
  service_id: number;
  user_id: number;
  date: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  payment?: PaymentData;
}

export interface BookingState {
  step: number;
  service: Service | null;
  collaborator: Collaborator | null;
  date: string | null;
  time: string | null;
  customer: {
    name: string;
    email: string;
    phone: string;
    document: string;
  };
}

export interface Settings {
  scheduling_require_checkout?: boolean;
  active_payment_methods?: string[];
  pagarme_public_key?: string;
  pagarme_app_id?: string;
  pagarme_secret_key?: string;
  auto_confirm_scheduling_on_paid?: boolean;
}

export interface CreditCardData {
  card_number: string;
  card_holder_name: string;
  card_expiration_date: string;
  card_cvv: string;
  card_holder_document: string;
  card_token?: string;
}

export interface PaymentData {
  method: string;
  card_token?: string;
}

