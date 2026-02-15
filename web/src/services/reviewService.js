import { BaseService } from "./BaseService";
import api from "./api";

class ReviewService extends BaseService {
  constructor() {
    super("/reviews");
  }

  async getPublic(companyId) {
    const response = await api.get(`${this.baseEndpoint}/public?company_id=${companyId}`);
    return response.data;
  }
}

export const reviewService = new ReviewService();

