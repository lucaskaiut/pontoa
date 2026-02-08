import api from "./api";
import type { Customer, Scheduling } from "../types";

export interface FirstAccessPayload {
  password: string;
  password_confirmation: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  should_reset_password: boolean;
  created_at: string;
  updated_at: string;
}

export interface FirstAccessResponse {
  token: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

class CustomersServiceClass {
  async login(data: LoginPayload): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/customers/login", data);
    return response.data;
  }

  async firstAccess(token: string, data: FirstAccessPayload): Promise<FirstAccessResponse> {
    const response = await api.post<FirstAccessResponse>(`/customers/first-access/${token}`, data);
    return response.data;
  }

  async getMe(): Promise<Customer> {
    const response = await api.post<{ data: Customer }>("/customers/me");
    return response.data.data;
  }

  async getMySchedulings(email: string): Promise<Scheduling[]> {
    const response = await api.get<{ data: Scheduling[] }>("/schedulings", {
      params: { 
        email,
        status: "pending,confirmed"
      }
    });
    return response.data.data;
  }

  async updateMe(data: Partial<Customer>): Promise<Customer> {
    const response = await api.put<{ data: Customer }>("/customers/me", data);
    return response.data.data;
  }
}

const CustomersService = new CustomersServiceClass();
export { CustomersService };

