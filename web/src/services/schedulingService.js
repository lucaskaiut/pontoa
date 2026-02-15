import { BaseService } from "./BaseService";
import api from "./api";

class SchedulingService extends BaseService {
  constructor() {
    super("/schedulings");
  }

  async cancel(id) {
    const { data } = await api.post(`${this.baseEndpoint}/${id}/cancel`);
    return data?.data || data;
  }

  async confirm(id) {
    const { data } = await api.post(`${this.baseEndpoint}/${id}/confirm`);
    return data?.data || data;
  }

  async markAsNoShow(id) {
    const { data } = await api.post(`${this.baseEndpoint}/${id}/no-show`);
    return data?.data || data;
  }

  async checkIn(id) {
    const { data } = await api.post(`${this.baseEndpoint}/${id}/check-in`);
    return data?.data || data;
  }

  async checkOut(id) {
    const { data } = await api.post(`${this.baseEndpoint}/${id}/check-out`);
    return data?.data || data;
  }

  async getExecution(id) {
    const { data } = await api.get(`${this.baseEndpoint}/${id}/execution`);
    return data?.data || data;
  }

  async getExecutions(id) {
    const { data } = await api.get(`${this.baseEndpoint}/${id}/execution?all=true`);
    return data?.data || data;
  }
}

export const schedulingService = new SchedulingService();

