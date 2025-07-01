import { WeekDay, WeeklySchedule } from '@/types';
import ical from 'ical-generator';

// Mapeo de días de la semana a formato iCal
const weekDayMap: Record<WeekDay, number> = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0
};

// Función para obtener la fecha actual de un día de la semana
const getDateForWeekday = (weekday: WeekDay): Date => {
  const date = new Date();
  const currentDay = date.getDay(); // 0 = domingo, 1 = lunes, ...
  const targetDay = weekDayMap[weekday];
  const daysToAdd = (7 + targetDay - currentDay) % 7;
  
  date.setDate(date.getDate() + daysToAdd);
  return date;
};

// Función para convertir hora (HH:MM) a objeto Date para un día específico
const timeToDate = (time: string, date: Date): Date => {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

// Exportar a formato CSV
export const exportToCSV = (schedule: WeeklySchedule): void => {
  // Crear cabecera CSV
  let csv = 'Día,Nombre,Inicio,Fin,Tipo\n';
  
  // Traducción de días para CSV
  const dayTranslation: Record<WeekDay, string> = {
    monday: 'Lunes',
    tuesday: 'Martes',
    wednesday: 'Miércoles',
    thursday: 'Jueves',
    friday: 'Viernes',
    saturday: 'Sábado',
    sunday: 'Domingo'
  };
  
  // Recorrer cada día y sus slots
  Object.entries(schedule).forEach(([day, slots]) => {
    const translatedDay = dayTranslation[day as WeekDay];
    
    slots.forEach(slot => {
      // Escapar posibles comas en el nombre
      const escapedName = slot.name.includes(',') ? `"${slot.name}"` : slot.name;
      const slotType = slot.isFixed ? 'Fijo' : 'Variable';
      
      // Añadir línea al CSV
      csv += `${translatedDay},${escapedName},${slot.startTime},${slot.endTime},${slotType}\n`;
    });
  });
  
  // Crear y descargar el archivo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'planificacion-ritmi.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Exportar a formato iCal
export const exportToICal = (schedule: WeeklySchedule): void => {
  // Crear calendario
  const calendar = ical({ name: 'Planificación Ritmi' });
  
  // Recorrer cada día y sus slots
  Object.entries(schedule).forEach(([day, slots]) => {
    const weekday = day as WeekDay;
    const baseDate = getDateForWeekday(weekday);
    
    slots.forEach(slot => {
      const startDate = timeToDate(slot.startTime, baseDate);
      const endDate = timeToDate(slot.endTime, baseDate);
      
      // Crear evento
      calendar.createEvent({
        start: startDate,
        end: endDate,
        summary: slot.name,
        description: `Actividad ${slot.isFixed ? 'fija' : 'variable'} en la planificación Ritmi`,
        location: 'Ritmi Planner',
        // Usar color como categoría (algunos clientes de calendario lo soportan)
        categories: [{ name: slot.color || '#808080' }]
      });
    });
  });
  
  // Crear y descargar el archivo
  const blob = new Blob([calendar.toString()], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'planificacion-ritmi.ics');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
