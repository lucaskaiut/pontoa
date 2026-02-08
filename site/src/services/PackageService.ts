import api from "./api";

export interface Package {
  id: number;
  name: string;
  description: string;
  total_sessions: number;
  bonus_sessions: number;
  expires_in_days: number | null;
  is_active: boolean;
  price?: number;
  created_at: string;
  updated_at: string;
}

class PackageServiceClass {
  private baseEndpoint = "/packages";

  async listAvailable(): Promise<{ data: Package[] }> {
    const response = await api.get(`${this.baseEndpoint}/available`);
    return response.data;
  }
}

export const PackageService = new PackageServiceClass();

