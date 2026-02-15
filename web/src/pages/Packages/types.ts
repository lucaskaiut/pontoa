import { FormFieldConfig } from "../../components/Form/types";

export interface Package {
  id?: string | number;
  name: string;
  description?: string;
  total_sessions: number;
  bonus_sessions: number;
  expires_in_days?: number | null;
  is_active: boolean;
  price?: number | null;
  services?: Array<{ id: number; name: string }>;
  created_at?: string;
  updated_at?: string;
}

export interface PackageFormValues {
  name: string;
  description: string;
  total_sessions: number;
  bonus_sessions: number;
  expires_in_days: number | null;
  is_active: boolean;
  price: number | null;
  services: number[];
}

export interface PackagePayload {
  name: string;
  description?: string;
  total_sessions: number;
  bonus_sessions?: number;
  expires_in_days?: number | null;
  is_active?: boolean;
  price?: number | null;
  services?: number[];
}

export type PackageFormField = FormFieldConfig;

