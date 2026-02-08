import api from "./api";

export interface Order {
  id: number;
  status: string;
  total_amount: number;
  original_total_amount?: number;
  discount_amount?: number;
  payment_method?: string;
  payment_reference?: string;
  paid_at?: string;
  items: Array<{
    id: number;
    item_type: string;
    item_id: number;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    original_unit_price?: number;
    original_total_price?: number;
    discount_amount?: number;
    metadata?: {
      service_id?: number;
      user_id?: number;
      date?: string;
      package?: {
        id: number;
        package_id: number;
        package_name: string;
        remaining_sessions: number;
      };
    };
  }>;
  customer?: any;
  created_at: string;
  updated_at: string;
  available_packages?: Array<{
    item_id: number;
    service_id: number;
    package: {
      id: number;
      name: string;
      remaining_sessions: number;
    };
  }>;
}

class OrderServiceClass {
  private baseEndpoint = "/orders";

  async listMyOrders(): Promise<{ data: Order[] }> {
    const response = await api.get(`${this.baseEndpoint}/my-orders`);
    return response.data;
  }

  async get(orderId: number): Promise<{ data: Order }> {
    const response = await api.get(`${this.baseEndpoint}/${orderId}`);
    const responseData = response.data;
    
    if (responseData && typeof responseData === 'object' && 'data' in responseData && responseData.data) {
      return responseData;
    }
    
    if (responseData && responseData.id) {
      return { data: responseData };
    }
    
    throw new Error("Resposta da API inválida");
  }

  async updatePaymentMethod(orderId: number, paymentMethod: string): Promise<{ data: Order }> {
    const response = await api.put(`${this.baseEndpoint}/${orderId}/payment-method`, {
      payment_method: paymentMethod,
    });
    return response.data;
  }
}

export const OrderService = new OrderServiceClass();

