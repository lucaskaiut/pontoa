import { FormFieldConfig } from "../../components/Form/types";

export interface Service {
  id?: string | number;
  name: string;
  description?: string;
  price: number;
  cost: number;
  duration?: number;
  commission?: number;
  status: number;
  photo?: string | null;
  created_at?: string;
}

export interface ServiceFormValues {
  name: string;
  description: string;
  price: number;
  cost: number;
  duration: number;
  commission: number;
  status: number;
  photo: string | null;
}

export interface ServicePayload {
  name: string;
  description?: string;
  price: number;
  cost: number;
  duration?: number;
  commission?: number;
  status: number;
  photo?: string | null;
}

export type ServiceFormField = FormFieldConfig;

