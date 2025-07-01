// Definición de días de la semana
export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

// Slots variables (tareas con tiempo asignado)
export interface VariableSlot {
  id: string;
  name: string;
  totalHours: number;
  distributeEvenly: boolean;
  color?: string;
}

// Slots fijos (tareas con horario fijo)
export interface FixedSlot {
  id: string;
  name: string;
  startTime: string; // formato "HH:MM"
  endTime: string;   // formato "HH:MM"
  days: WeekDay[];   // ["monday", "tuesday", etc.]
  color?: string;
}

// Slot en la planificación final
export interface ScheduleSlot {
  id: string;
  slotId: string;
  name: string;
  startTime: string;
  endTime: string;
  day: WeekDay;
  isFixed: boolean;
  color?: string;
}

// Planificación semanal completa
export type WeeklySchedule = {
  [key in WeekDay]: ScheduleSlot[];
};

// Tipo para almacenar la configuración completa
export interface ScheduleConfig {
  variableSlots: VariableSlot[];
  fixedSlots: FixedSlot[];
  timezone?: string; // Zona horaria seleccionada por el usuario
}
