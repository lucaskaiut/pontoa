import { BaseService } from "./BaseService";
import api from "./api";

class RoleService extends BaseService {
  constructor() {
    super("/roles");
  }

  async getPermissions() {
    const response = await api.get("/permissions");
    const data = response.data;
    
    if (data && data.permissions) {
      return data.permissions;
    }
    
    return [];
  }
}

export const roleService = new RoleService();


