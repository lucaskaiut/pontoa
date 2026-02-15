import { FormFieldConfig } from "../../components/Form/types";

export interface Permission {
  name: string;
  label: string;
}

export interface Role {
  id?: string | number;
  company_id?: number;
  name: string;
  description?: string;
  permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface RoleFormValues {
  name: string;
  description: string;
  permissions: Permission[];
}

export interface RolePayload {
  name: string;
  description?: string;
  permissions?: string[];
}

export type RoleFormField = FormFieldConfig;


