import { BaseService } from "./BaseService";
import api from "./api";

class CustomerService extends BaseService {
  constructor() {
    super("/customers");
  }

  async updateNotes(id, notes) {
    const { data } = await api.put(`${this.baseEndpoint}/${id}/notes`, { notes });
    return data?.data || data;
  }
}

export const customerService = new CustomerService();

