import api from "./api";

export interface CartItem {
  item_type: string;
  item_id?: number;
  quantity?: number;
  service_id?: number;
  user_id?: number;
  date?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface CartResponse {
  data: {
    id: number;
    status: string;
    total_amount: number;
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
  } | null;
}

export interface UpdateItemQuantity {
  quantity: number;
}

const CART_ID_KEY = "cart_order_id";

class CartServiceClass {
  private baseEndpoint = "/cart";

  private saveCartId(id: number | null) {
    if (id) {
      localStorage.setItem(CART_ID_KEY, id.toString());
    } else {
      localStorage.removeItem(CART_ID_KEY);
    }
  }

  getCartId(): number | null {
    const stored = localStorage.getItem(CART_ID_KEY);
    return stored ? Number(stored) : null;
  }

  clearCartId() {
    localStorage.removeItem(CART_ID_KEY);
  }

  async getCart(): Promise<CartResponse> {
    const cartId = this.getCartId();
    const params = cartId ? { cart_id: cartId } : {};
    const response = await api.get(this.baseEndpoint, { params });
    if (response.data?.data?.id) {
      this.saveCartId(response.data.data.id);
    }
    return response.data;
  }

  async addItem(item: CartItem): Promise<CartResponse> {
    const response = await api.post(`${this.baseEndpoint}/items`, item);
    if (response.data?.data?.id) {
      this.saveCartId(response.data.data.id);
    }
    return response.data;
  }

  async updateItem(orderItemId: number, data: UpdateItemQuantity): Promise<CartResponse> {
    const response = await api.put(`${this.baseEndpoint}/items/${orderItemId}`, data);
    if (response.data?.data?.id) {
      this.saveCartId(response.data.data.id);
    }
    return response.data;
  }

  async removeItem(orderItemId: number): Promise<void> {
    await api.delete(`${this.baseEndpoint}/items/${orderItemId}`);
    const cartId = this.getCartId();
    if (cartId) {
      const cart = await this.getCart();
      if (!cart.data || cart.data.items.length === 0) {
        this.clearCartId();
      }
    }
  }

  async checkout(paymentData: any): Promise<any> {
    const cartId = this.getCartId();
    if (!cartId) {
      throw new Error("Carrinho não encontrado");
    }
    const response = await api.post(`${this.baseEndpoint}/checkout`, {
      order_id: cartId,
      payment: paymentData,
    });
    this.clearCartId();
    return response.data;
  }

  getCartSchedulingTimes(cart: CartResponse["data"] | null): {
    [date: string]: { [userId: string]: string[] };
  } {
    if (!cart || !cart.items) {
      return {};
    }

    const schedulingTimes: { [date: string]: { [userId: string]: string[] } } = {};

    cart.items
      .filter((item) => item.item_type === "scheduling" && item.metadata)
      .forEach((item) => {
        const metadata = item.metadata as {
          service_id: number;
          user_id: number;
          date: string;
          customer?: {
            name?: string;
            email?: string;
            phone?: string;
          };
        };

        if (!metadata.date || !metadata.user_id) {
          return;
        }

        const dateObj = new Date(metadata.date);
        const dateKey = dateObj.toISOString().split("T")[0];
        const timeKey = dateObj.toTimeString().slice(0, 5);

        if (!schedulingTimes[dateKey]) {
          schedulingTimes[dateKey] = {};
        }

        const userId = metadata.user_id.toString();
        if (!schedulingTimes[dateKey][userId]) {
          schedulingTimes[dateKey][userId] = [];
        }

        if (!schedulingTimes[dateKey][userId].includes(timeKey)) {
          schedulingTimes[dateKey][userId].push(timeKey);
        }
      });

    return schedulingTimes;
  }

  isTimeInCart(
    cart: CartResponse["data"] | null,
    date: string,
    time: string,
    userId: number
  ): boolean {
    if (!cart) {
      return false;
    }

    const schedulingTimes = this.getCartSchedulingTimes(cart);
    const dateKey = date;
    const timeKey = time;
    const userIdKey = userId.toString();

    return (
      schedulingTimes[dateKey]?.[userIdKey]?.includes(timeKey) ?? false
    );
  }
}

export const CartService = new CartServiceClass();

