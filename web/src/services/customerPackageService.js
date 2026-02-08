import api from "./api";

class CustomerPackageServiceClass {
  async getPackages(customerId) {
    const response = await api.get(`/customers/${customerId}/packages`);
    return response.data;
  }
}

export const customerPackageService = new CustomerPackageServiceClass();
