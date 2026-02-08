export interface Service {
  id: string | number;
  name: string;
  duration?: number;
}

export interface User {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
}

export interface Customer {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
}

export interface Scheduling {
  id?: string | number;
  date: string;
  service_id: string | number;
  user_id: string | number;
  customer_id?: string | number;
  service?: Service;
  user?: User;
  customer?: Customer;
  price?: number;
  cost?: number;
  status?: "pending" | "confirmed" | "cancelled" | "no_show";
  payment_status?: "paid" | "awaiting_payment" | "canceled";
  created_at?: string;
}

export interface SchedulingEvent {
  id: string | number;
  title: string;
  start: Date;
  end: Date;
  price?: number;
  email?: string;
}

export interface SchedulingFormValues {
  date: string;
  service_id: string;
  user_id: string;
}

export interface NewSchedulingFormValues {
  service_id: string;
  user_id: string;
  date: string;
  time: string;
  name: string;
  email: string;
  phone: string;
}

export interface SchedulingPayload {
  date: string;
  service_id: number;
  user_id: number;
}

export interface NewSchedulingPayload {
  service_id: number;
  user_id: number;
  date: string;
  name: string;
  email: string;
  phone?: string;
}

export interface ScheduleHoursData {
  schedule?: Record<string, Record<string | number, string[]>>;
}

import { FormFieldConfig } from "../../components/Form/types";

export type SchedulingFormField = FormFieldConfig;
export type SchedulingCreateFormField = FormFieldConfig;
