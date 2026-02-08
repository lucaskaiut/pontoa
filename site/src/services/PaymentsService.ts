import api from "./api";

interface CardTokenPayload {
  method: string;
  number: string;
  holder_name: string;
  holder_document: string;
  exp_month: string;
  exp_year: string;
  cvv: string;
}

class PaymentsServiceClass {
  async generateCardToken(payload: CardTokenPayload): Promise<string> {
    const response = await api.post("/payments/token", payload);
    const responseData = response.data;
    
    if (responseData?.data?.token) {
      return responseData.data.token;
    }
    
    if (responseData?.token) {
      return responseData.token;
    }
    
    throw new Error("Token não encontrado na resposta");
  }
}

export const PaymentsService = new PaymentsServiceClass();

