import { BaseService } from "./BaseService";
import api from "./api";

class PackageServiceClass extends BaseService {
  constructor() {
    super("/packages");
  }

  async toggleActive(id) {
    const { data } = await api.post(`${this.baseEndpoint}/${id}/toggle-active`);
    return data;
  }
}

export const PackageService = new PackageServiceClass();

