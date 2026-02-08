import { BaseService } from "./BaseService";

class ServiceService extends BaseService {
  constructor() {
    super("/services");
  }
}

export const serviceService = new ServiceService();

