import { BaseService } from "./BaseService";
import api from "./api";

class CompanyService extends BaseService {
  constructor() {
    super("/companies");
  }

  async completeOnboarding() {
    const response = await api.post(`${this.baseEndpoint}/complete-onboarding`);
    return response.data;
  }

  async configureWhatsApp() {
    const response = await api.post(`${this.baseEndpoint}/configure-whatsapp`);
    return response.data;
  }

  async getWhatsAppQrCode() {
    const response = await api.get(`${this.baseEndpoint}/whatsapp-qrcode`);
    return response.data;
  }

  async getWhatsAppConnectionStatus() {
    const response = await api.get(`${this.baseEndpoint}/whatsapp-connection-status`);
    return response.data;
  }

  async cancelSubscription() {
    const response = await api.post(`${this.baseEndpoint}/cancel-subscription`);
    return response.data;
  }

  async reactivateSubscription() {
    const response = await api.post(`${this.baseEndpoint}/reactivate-subscription`);
    return response.data;
  }

  async updateCreditCard(creditCardData) {
    const response = await api.post(`${this.baseEndpoint}/update-credit-card`, { credit_card: creditCardData });
    return response.data;
  }

  async setActiveCard(cardId) {
    const response = await api.post(`${this.baseEndpoint}/set-active-card`, { card_id: cardId });
    return response.data;
  }
}

export const companyService = new CompanyService();

