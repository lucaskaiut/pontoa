import api from "./api";
import type { Settings } from "../types";

interface SettingItem {
  value: any;
  label: string;
}

class SettingsServiceClass {
  async getSettings(): Promise<Settings> {
    const response = await api.get("/settings");
    const data = response.data?.data || response.data || {};
    
    const transformedSettings: Partial<Settings> = {};
    
    for (const [key, item] of Object.entries(data)) {
      if (item && typeof item === 'object' && 'value' in item) {
        transformedSettings[key as keyof Settings] = (item as SettingItem).value;
      } else if (item !== null && item !== undefined) {
        transformedSettings[key as keyof Settings] = item as any;
      }
    }
    
    return transformedSettings as Settings;
  }
}

export const SettingsService = new SettingsServiceClass();

