import { FormFieldConfig } from "../../components/Form/types";

// Interface simples para serviços selecionados em schedules
export interface Service {
  id: string | number;
  name: string;
}

// Interface completa para serviços do usuário
export interface UserService {
  id?: string | number;
  name: string;
  duration: number;
  price: number;
  cost?: number;
  commission?: number;
  description?: string;
  photo?: string | null;
  status: boolean;
}

export interface Day {
  id: number;
  name: string;
  short: string;
}

export interface UserSchedule {
  id?: string | number;
  days: string;
  start_at: string;
  end_at: string;
  services: Service[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: string[];
}

export interface User {
  id?: string | number;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  password?: string;
  is_collaborator: boolean;
  roles?: Role[];
  services?: UserService[] | Service[]; // Pode ser serviços completos ou apenas IDs
  schedules?: UserSchedule[];
  image?: string | null;
  description?: string | null;
  url?: string | null;
  created_at?: string;
}

export interface UserScheduleFormValue {
  id?: string | number;
  days: Day[];
  start_at: string;
  end_at: string;
  services: Service[];
}

export interface UserServiceFormValue {
  id?: string | number;
  name: string;
  duration: number;
  price: number;
  cost: number;
  commission: number;
  description: string;
  status: boolean;
  photo?: string | null;
}

export interface UserFormValues {
  name: string;
  email: string;
  phone: string;
  document: string;
  password: string;
  is_collaborator: boolean;
  roles: Role[];
  services: UserServiceFormValue[];
  schedules: UserScheduleFormValue[];
  image?: string | null;
  description?: string | null;
  url?: string | null;
}

export interface UserSchedulePayload {
  id?: string | number;
  days: string;
  start_at: string;
  end_at: string;
  services: (string | number)[];
}

export interface UserServicePayload {
  id?: string | number;
  name: string;
  duration: number;
  price: number;
  cost?: number;
  commission?: number;
  description?: string;
  photo?: string | null;
  status: boolean;
}

export interface UserPayload {
  name: string;
  email: string;
  phone?: string;
  document?: string;
  password?: string;
  is_collaborator: boolean;
  roles?: (string | number)[];
  services?: UserServicePayload[] | null;
  schedules?: UserSchedulePayload[] | null;
  image?: string | null;
  description?: string | null;
  url?: string | null;
}

export type UserFormField = FormFieldConfig;

