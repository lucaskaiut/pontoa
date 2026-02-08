import { BaseService } from "./BaseService";
import type { Scheduling, SchedulingPayload } from "../types";

class SchedulingsServiceClass extends BaseService {
  constructor() {
    super("/schedulings");
  }

  async createScheduling(payload: SchedulingPayload): Promise<Scheduling> {
    const response = await this.create<{ data: Scheduling }>(payload as unknown as Record<string, unknown>);
    return response.data;
  }
}

export const SchedulingsService = new SchedulingsServiceClass();

