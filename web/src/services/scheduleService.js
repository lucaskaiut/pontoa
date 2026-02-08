import { BaseService } from "./BaseService";

class ScheduleService extends BaseService {
  constructor() {
    super("/schedules");
  }
}

export const scheduleService = new ScheduleService();

