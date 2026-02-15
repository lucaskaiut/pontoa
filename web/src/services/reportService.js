import { BaseService } from "./BaseService";
import api from "./api";

class ReportService extends BaseService {
  constructor() {
    super("/report");
  }

  async getRevenue(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/revenue?${queryString}` 
      : `${this.baseEndpoint}/revenue`;

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

  async getNoShow(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        queryParams.append(key, filters[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString 
      ? `${this.baseEndpoint}/no-show?${queryString}` 
      : `${this.baseEndpoint}/no-show`;

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
}

export const reportService = new ReportService();

