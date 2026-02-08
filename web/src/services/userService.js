import { BaseService } from "./BaseService";

class UserService extends BaseService {
  constructor() {
    super("/users");
  }
}

export const userService = new UserService();

