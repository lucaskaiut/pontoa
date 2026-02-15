import { BaseService } from "./BaseService";

class CompanyRecurrencyService extends BaseService {
  constructor() {
    super("/companies/recurrencies");
  }
}

export const companyRecurrencyService = new CompanyRecurrencyService();

