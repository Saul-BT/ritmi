import { FixedSlot, ScheduleSlot, VariableSlot, WeekDay, WeeklySchedule } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { timeToMinutes, minutesToTime } from '@/lib/utils';

// Array de días de la semana para iterar
const WEEK_DAYS: WeekDay[] = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

// Estas funciones ahora se importan desde utils.ts

// Encuentra los espacios libres en un día específico (versión optimizada)
const findFreeSlots = (day: WeekDay, fixedSlots: ScheduleSlot[]): { start: number; end: number }[] => {
  // Si no hay slots fijos, todo el día está libre
  if (fixedSlots.length === 0) {
    return [{ start: 0, end: 24 * 60 }]; // 24 horas = 1440 minutos
  }

  // Pre-calcular los tiempos en minutos para evitar conversiones repetitivas
  const slotTimes = fixedSlots.map(slot => ({
    start: timeToMinutes(slot.startTime),
    end: timeToMinutes(slot.endTime),
    original: slot
  }));

  // Ordenar slots fijos por hora de inicio usando los valores precalculados
  const sortedSlots = slotTimes.sort((a, b) => a.start - b.start);

  const freeSlots: { start: number; end: number }[] = [];
  let currentTime = 0; // 00:00

  // Iterar por los slots fijos encontrando huecos entre ellos
  for (const slot of sortedSlots) {
    // Si hay espacio antes del slot actual, añadirlo a los huecos libres
    if (slot.start > currentTime) {
      freeSlots.push({ start: currentTime, end: slot.start });
    }
    
    // Actualizar el tiempo actual al final del slot
    currentTime = Math.max(currentTime, slot.end);
  }

  // Añadir el último hueco del día si queda tiempo
  if (currentTime < 24 * 60) { // 24 horas = 1440 minutos
    freeSlots.push({ start: currentTime, end: 24 * 60 });
  }

  return freeSlots;
};

// Función para distribuir un slot variable en el calendario (versión optimizada)
const distributeVariableSlot = (
  slot: VariableSlot,
  freeTimeByDay: Map<WeekDay, { start: number; end: number }[]>,
  scheduledSlots: Map<WeekDay, ScheduleSlot[]>
): void => {
  // Convertir las horas totales a minutos
  let totalMinutes = slot.totalHours * 60;
  
  // Si no hay minutos para asignar, salir inmediatamente
  if (totalMinutes <= 0) return;
  
  if (slot.distributeEvenly) {
    // Distribuir equitativamente entre los días de la semana
    // Optimización: calcular días disponibles primero para no desperdiciar tiempo
    const availableDays = WEEK_DAYS.filter(day => 
      (freeTimeByDay.get(day)?.length || 0) > 0 &&
      freeTimeByDay.get(day)?.some(slot => (slot.end - slot.start) >= 30) // Al menos 30 minutos libres
    );
    
    if (availableDays.length === 0) return; // No hay días disponibles
    
    // Distribuir equitativamente entre los días disponibles
    const minutesPerDay = Math.floor(totalMinutes / availableDays.length);
    let remainingMinutes = totalMinutes % availableDays.length;

    // Distribuir en cada día disponible
    for (const day of availableDays) {
      let minutesToAllocate = minutesPerDay;
      
      // Añadir un minuto extra si hay minutos restantes
      if (remainingMinutes > 0) {
        minutesToAllocate += 1;
        remainingMinutes -= 1;
      }
      
      if (minutesToAllocate > 0) {
        allocateTimeInDay(day, minutesToAllocate, slot, freeTimeByDay, scheduledSlots);
      }
    }
  } else {
    // Distribuir de forma aleatoria
    // Crear un mapa de días a minutos disponibles para acceso más rápido
    const dayToFreeMinutes = new Map<WeekDay, number>();
    const availableDays: WeekDay[] = [];
    
    for (const day of WEEK_DAYS) {
      const freeSlots = freeTimeByDay.get(day) || [];
      if (freeSlots.length > 0) {
        const totalFreeMinutes = freeSlots.reduce((total, slot) => total + (slot.end - slot.start), 0);
        if (totalFreeMinutes >= 30) { // Al menos 30 minutos libres
          dayToFreeMinutes.set(day, totalFreeMinutes);
          availableDays.push(day);
        }
      }
    }
    
    if (availableDays.length === 0) return; // No hay días disponibles
    
    // Mezclar los días disponibles para una distribución aleatoria
    // Usar Fisher-Yates shuffle, más eficiente que sort con random
    for (let i = availableDays.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableDays[i], availableDays[j]] = [availableDays[j], availableDays[i]];
    }
    
    // Intentar asignar tiempo en días aleatorios
    for (const day of availableDays) {
      if (totalMinutes <= 0) break;
      
      const totalFreeMinutes = dayToFreeMinutes.get(day) || 0;
      
      // Decidir aleatoriamente cuánto tiempo asignar (entre 30 minutos y el máximo disponible)
      const minutesToAllocate = Math.min(
        totalMinutes,
        Math.max(30, Math.floor(Math.random() * totalFreeMinutes))
      );
      
      if (minutesToAllocate > 0) {
        const allocated = allocateTimeInDay(day, minutesToAllocate, slot, freeTimeByDay, scheduledSlots);
        totalMinutes -= allocated;
      }
    }
    
    // Si aún queda tiempo por asignar, distribuirlo en cualquier espacio disponible
    if (totalMinutes > 0) {
      // Recalcular días disponibles en caso de que hayan cambiado
      const remainingDays = WEEK_DAYS.filter(day => 
        (freeTimeByDay.get(day)?.length || 0) > 0
      );
      
      for (const day of remainingDays) {
        if (totalMinutes <= 0) break;
        
        const freeSlots = freeTimeByDay.get(day) || [];
        if (freeSlots.length > 0) {
          const allocated = allocateTimeInDay(day, totalMinutes, slot, freeTimeByDay, scheduledSlots);
          totalMinutes -= allocated;
        }
      }
    }
  }
};

// Asigna un tiempo específico a un día, dividiendo en bloques si es necesario (versión optimizada)
const allocateTimeInDay = (
  day: WeekDay,
  minutes: number,
  slot: VariableSlot,
  freeTimeByDay: Map<WeekDay, { start: number; end: number }[]>,
  scheduledSlots: Map<WeekDay, ScheduleSlot[]>
): number => {
  if (minutes <= 0) return 0;
  
  let remainingMinutes = minutes;
  let allocatedMinutes = 0;
  const freeSlots = freeTimeByDay.get(day) || [];
  
  // Crear una copia para no modificar el array original durante la iteración
  const freeSlotsCopy = [...freeSlots];
  
  // Ordenar los slots libres por tamaño (de mayor a menor) para minimizar la fragmentación
  freeSlotsCopy.sort((a, b) => (b.end - b.start) - (a.end - a.start));
  
  // Preparar una nueva lista de slots libres que reemplazará la actual
  const newFreeSlots: { start: number; end: number }[] = [];
  
  for (const freeSlot of freeSlotsCopy) {
    if (remainingMinutes <= 0) {
      // Si ya no hay minutos por asignar, mantener este slot libre sin cambios
      newFreeSlots.push(freeSlot);
      continue;
    }
    
    const slotDuration = freeSlot.end - freeSlot.start;
    
    // Si el slot es muy pequeño, mantenerlo sin cambios
    if (slotDuration < 30) { // Mínimo 30 minutos por bloque
      newFreeSlots.push(freeSlot);
      continue;
    }
    
    // Asignar como máximo el tiempo disponible en este slot o el tiempo restante
    const minutesToAllocate = Math.min(slotDuration, remainingMinutes);
    
    // Crear un nuevo slot en el horario
    const newSlot: ScheduleSlot = {
      id: uuidv4(),
      slotId: slot.id,
      name: slot.name,
      startTime: minutesToTime(freeSlot.start),
      endTime: minutesToTime(freeSlot.start + minutesToAllocate),
      day,
      isFixed: false,
      color: slot.color
    };
    
    // Añadir el nuevo slot a la programación
    const daySlots = scheduledSlots.get(day) || [];
    daySlots.push(newSlot);
    scheduledSlots.set(day, daySlots);
    
    // Si queda espacio libre después de la asignación, añadirlo a la nueva lista
    if (freeSlot.start + minutesToAllocate < freeSlot.end) {
      newFreeSlots.push({ 
        start: freeSlot.start + minutesToAllocate, 
        end: freeSlot.end 
      });
    }
    
    // Actualizar el tiempo restante
    remainingMinutes -= minutesToAllocate;
    allocatedMinutes += minutesToAllocate;
  }
  
  // Actualizar la lista de slots libres para este día
  freeTimeByDay.set(day, newFreeSlots);
  
  return allocatedMinutes;
};

// Función principal para generar la planificación semanal
export const generateSchedule = (
  variableSlots: VariableSlot[],
  fixedSlots: FixedSlot[]
): WeeklySchedule => {
  // Inicializar el mapa de slots programados por día
  const scheduledSlots = new Map<WeekDay, ScheduleSlot[]>();
  
  // Inicializar el horario vacío
  WEEK_DAYS.forEach(day => {
    scheduledSlots.set(day, []);
  });
  
  // Primero, añadir todos los slots fijos al horario
  for (const fixedSlot of fixedSlots) {
    for (const day of fixedSlot.days) {
      const newSlot: ScheduleSlot = {
        id: uuidv4(),
        slotId: fixedSlot.id,
        name: fixedSlot.name,
        startTime: fixedSlot.startTime,
        endTime: fixedSlot.endTime,
        day,
        isFixed: true,
        color: fixedSlot.color
      };
      
      const daySlots = scheduledSlots.get(day) || [];
      daySlots.push(newSlot);
      scheduledSlots.set(day, daySlots);
    }
  }
  
  // Calcular los espacios libres para cada día
  const freeTimeByDay = new Map<WeekDay, { start: number; end: number }[]>();
  
  for (const day of WEEK_DAYS) {
    const fixedSlotsForDay = scheduledSlots.get(day) || [];
    const freeSlots = findFreeSlots(day, fixedSlotsForDay);
    freeTimeByDay.set(day, freeSlots);
  }
  
  // Ahora, distribuir los slots variables
  // Ordenar por prioridad: primero los que se distribuyen equitativamente
  const sortedVariableSlots = [...variableSlots].sort(
    (a, b) => (a.distributeEvenly === b.distributeEvenly) ? 0 : a.distributeEvenly ? -1 : 1
  );
  
  for (const slot of sortedVariableSlots) {
    distributeVariableSlot(slot, freeTimeByDay, scheduledSlots);
  }
  
  // Convertir el mapa a un objeto WeeklySchedule
  const result: Partial<WeeklySchedule> = {};
  
  for (const day of WEEK_DAYS) {
    const slots = scheduledSlots.get(day) || [];
    // Ordenar los slots por hora de inicio
    slots.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    result[day] = slots;
  }
  
  return result as WeeklySchedule;
};
