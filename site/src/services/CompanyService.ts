import { BaseService } from "./BaseService";
import type { Company } from "../types";

class CompanyServiceClass extends BaseService {
  constructor() {
    super("/companies");
  }

  async getMe(): Promise<Company> {
    const response = await this.get<Company>("me");
    return response;
  }
}

export const CompanyService = new CompanyServiceClass();

