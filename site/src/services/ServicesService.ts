import { BaseService } from "./BaseService";
import type { Service } from "../types";

class ServicesServiceClass extends BaseService {
  constructor() {
    super("/services");
  }

  async listServices(): Promise<Service[]> {
    return this.list<Service>();
  }
}

export const ServicesService = new ServicesServiceClass();

