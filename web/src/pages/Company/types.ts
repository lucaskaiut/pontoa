export interface Company {
  id?: string | number;
  name: string;
  email: string;
  document: string;
  domain: string;
  phone: string;
  support_phone?: string;
  logo?: string;
  banner?: string;
  terms_and_conditions?: string;
  plan_name?: string;
  plan_recurrence?: string;
  subscription_status?: string;
  current_period_start?: string;
  current_period_end?: string;
  canceled_at?: string;
  cancel_at_period_end?: boolean;
  is_free?: boolean;
  last_billed_at?: string;
  plan_trial_ends_at?: string;
  card_id?: number;
}

export interface CompanyFormValues {
  name: string;
  email: string;
  document: string;
  domain: string;
  phone: string;
  support_phone: string;
  logo: string;
  banner: string;
  terms_and_conditions: string;
}

export interface Card {
  id: number;
  card_number?: string;
  first_six_digits?: string;
  last_four_digits?: string;
  source?: string;
}

export interface CardFormValues {
  number: string;
  holder_name: string;
  holder_document: string;
  exp_month: string;
  exp_year: string;
  cvv: string;
}

export interface SettingsFormValues {
  [key: string]: any;
}

export interface SettingsMetadata {
  [key: string]: {
    label: string;
    type: string;
    options?: Array<{
      value: string;
      label: string;
    }>;
  };
}



