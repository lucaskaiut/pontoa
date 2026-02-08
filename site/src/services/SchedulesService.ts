import api from "./api";
import type { ScheduleHours } from "../types";

class SchedulesServiceClass {
  async getAvailableHours(serviceId: number, date: string, userId?: number): Promise<ScheduleHours> {
    const response = await api.get("/schedules/hours", {
      params: {
        service_id: serviceId,
        date: date,
        ...(userId && { user_id: userId }),
      },
    });
    return response.data.data;
  }
}

export const SchedulesService = new SchedulesServiceClass();

