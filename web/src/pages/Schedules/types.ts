import { FormFieldConfig } from "../../components/Form/types";

export interface Day {
  id: number;
  name: string;
  short: string;
}

export interface Service {
  id: string | number;
  name: string;
}

export interface User {
  id: string | number;
  name: string;
}

export interface Schedule {
  id?: string | number;
  start_at: string;
  end_at: string;
  days: string;
  services: Service[];
  users: User[];
  created_at?: string;
}

export interface ScheduleFormValues {
  start_at: string;
  end_at: string;
  days: Day[];
  services: Service[];
  users: User[];
}

export interface SchedulePayload {
  start_at: string;
  end_at: string;
  services: (string | number)[];
  users: (string | number)[];
  days: string;
}

export type ScheduleFormField = FormFieldConfig;
