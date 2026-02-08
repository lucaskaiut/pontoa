import { FormFieldConfig } from "../../components/Form/types";

export interface Customer {
  id?: string | number;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  context?: string;
  conversation_state?: string | null;
  created_at?: string;
}

export interface CustomerFormValues {
  name: string;
  email: string;
  phone: string;
  document: string;
}

export interface CustomerPayload {
  name: string;
  email?: string;
  phone?: string;
  document?: string;
}

export type CustomerFormField = FormFieldConfig;

