import { FormFieldConfig } from "../../components/Form/types";

export interface Notification {
  id?: string | number;
  time_before?: number;
  time_unit: string;
  message: string;
  active: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  is_confirmation?: boolean;
  created_at?: string;
}

export interface NotificationFormValues {
  time_before: string;
  time_unit: string;
  message: string;
  active: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  is_confirmation: boolean;
}

export interface NotificationPayload {
  time_before?: number;
  time_unit: string;
  message: string;
  active: boolean;
  email_enabled: boolean;
  whatsapp_enabled: boolean;
  is_confirmation?: boolean;
}

export type NotificationFormField = FormFieldConfig;

