import { BaseService } from "./BaseService";

class OrderServiceClass extends BaseService {
  constructor() {
    super("/orders");
  }
}

export const OrderService = new OrderServiceClass();

