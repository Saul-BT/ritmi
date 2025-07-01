import { ScheduleConfig, WeeklySchedule } from "@/types";

// Claves para el localStorage
const CONFIG_STORAGE_KEY = 'ritmi-config';
const SCHEDULE_STORAGE_KEY = 'ritmi-schedule';

// Guardar la configuración en localStorage
export const saveConfig = (config: ScheduleConfig): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  }
};

// Obtener la configuración de localStorage
export const getConfig = (): ScheduleConfig | null => {
  if (typeof window !== 'undefined') {
    const storedConfig = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (storedConfig) {
      return JSON.parse(storedConfig) as ScheduleConfig;
    }
  }
  return null;
};

// Guardar la planificación en localStorage
export const saveSchedule = (schedule: WeeklySchedule): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
  }
};

// Obtener la planificación de localStorage
export const getSchedule = (): WeeklySchedule | null => {
  if (typeof window !== 'undefined') {
    const storedSchedule = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (storedSchedule) {
      return JSON.parse(storedSchedule) as WeeklySchedule;
    }
  }
  return null;
};
