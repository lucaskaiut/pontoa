import api from "./api";

export interface CustomerPackage {
  id: number;
  company_id: number;
  customer_id: number;
  package_id: number;
  order_id: number | null;
  total_sessions: number;
  remaining_sessions: number;
  expires_at: string | null;
  is_expired: boolean;
  is_valid: boolean;
  created_at: string;
  updated_at: string;
  package?: {
    id: number;
    name: string;
    description: string | null;
    total_sessions: number;
    bonus_sessions: number;
    expires_in_days: number | null;
    price: number | null;
  };
  usages?: Array<{
    id: number;
    customer_package_id: number;
    appointment_id: number;
    used_at: string;
    scheduling?: {
      id: number;
      date: string;
      time: string;
      service?: {
        name: string;
      };
    };
  }>;
}

class CustomerPackageServiceClass {
  async getMyPackages(): Promise<{ data: CustomerPackage[] }> {
    const response = await api.get<{ data: CustomerPackage[] }>("/customers/me/packages");
    return response.data;
  }
}

export const CustomerPackageService = new CustomerPackageServiceClass();

