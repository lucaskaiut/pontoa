import { BaseService } from "./BaseService";

class NotificationService extends BaseService {
  constructor() {
    super("/notifications");
  }
}

export const notificationService = new NotificationService();

