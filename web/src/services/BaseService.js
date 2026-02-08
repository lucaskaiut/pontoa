import api from "./api";

export class BaseService {
  constructor(baseEndpoint) {
    this.baseEndpoint = baseEndpoint;
  }

  async list(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString 
      ? `${this.baseEndpoint}?${queryString}` 
      : this.baseEndpoint;

    const response = await api.get(url);
    const responseData = response.data;
    
    if (responseData && typeof responseData === 'object') {
      if (responseData.meta && responseData.links) {
        return {
          data: responseData.data !== undefined 
            ? (Array.isArray(responseData.data) ? responseData.data : responseData.data)
            : [],
          meta: responseData.meta,
          links: responseData.links,
        };
      }
      
      if (responseData.data !== undefined) {
        return Array.isArray(responseData.data) ? responseData.data : responseData.data;
      }
    }
    
    if (Array.isArray(responseData)) {
      return responseData;
    }
    
    return responseData || [];
  }

  async get(id) {
    const response = await api.get(`${this.baseEndpoint}/${id}`);
    const data = response.data;
    
    if (data && data.data) {
      return data.data;
    }
    
    return data;
  }

  async create(payload) {
    const { data } = await api.post(this.baseEndpoint, payload);
    return data;
  }

  async update(id, payload) {
    const { data } = await api.put(`${this.baseEndpoint}/${id}`, payload);
    return data;
  }

  async patch(id, payload) {
    const { data } = await api.patch(`${this.baseEndpoint}/${id}`, payload);
    return data?.data || data;
  }

  async delete(id) {
    const { data } = await api.delete(`${this.baseEndpoint}/${id}`);
    return data;
  }
}

