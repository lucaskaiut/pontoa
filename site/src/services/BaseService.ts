import api from "./api";

export class BaseService {
  protected baseEndpoint: string;

  constructor(baseEndpoint: string) {
    this.baseEndpoint = baseEndpoint;
  }

  async list<T>(filters: Record<string, unknown> = {}): Promise<T[]> {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        queryParams.append(key, String(filters[key]));
      }
    });

    const queryString = queryParams.toString();
    const url = queryString 
      ? `${this.baseEndpoint}?${queryString}` 
      : this.baseEndpoint;

    const response = await api.get(url);
    const responseData = response.data;
    
    if (responseData && typeof responseData === 'object' && responseData.data !== undefined) {
      return Array.isArray(responseData.data) ? responseData.data : responseData.data;
    }
    
    if (Array.isArray(responseData)) {
      return responseData;
    }
    
    return responseData || [];
  }

  async get<T>(id: number | string): Promise<T> {
    const response = await api.get(`${this.baseEndpoint}/${id}`);
    const data = response.data;
    
    if (data && data.data) {
      return data.data;
    }
    
    return data;
  }

  async create<T>(payload: Record<string, unknown>): Promise<T> {
    const { data } = await api.post(this.baseEndpoint, payload);
    return data;
  }

  async update<T>(id: number | string, payload: Record<string, unknown>): Promise<T> {
    const { data } = await api.put(`${this.baseEndpoint}/${id}`, payload);
    return data;
  }

  async patch<T>(id: number | string, payload: Record<string, unknown>): Promise<T> {
    const { data } = await api.patch(`${this.baseEndpoint}/${id}`, payload);
    return data?.data || data;
  }

  async delete<T>(id: number | string): Promise<T> {
    const { data } = await api.delete(`${this.baseEndpoint}/${id}`);
    return data;
  }
}



