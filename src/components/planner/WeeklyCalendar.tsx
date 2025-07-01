'use client';

import { ScheduleSlot, WeekDay } from "@/types";
import { useSchedule } from "@/lib/context";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { timeToMinutes, minutesToTime } from "@/lib/utils";

// Constantes para el calendario
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS_NAMES = [
  { day: "monday" as WeekDay, label: "Lunes" },
  { day: "tuesday" as WeekDay, label: "Martes" },
  { day: "wednesday" as WeekDay, label: "Miércoles" },
  { day: "thursday" as WeekDay, label: "Jueves" },
  { day: "friday" as WeekDay, label: "Viernes" },
  { day: "saturday" as WeekDay, label: "Sábado" },
  { day: "sunday" as WeekDay, label: "Domingo" }
];

// Estas funciones ahora se importan desde utils.ts

// Determina si un color es oscuro (para usar texto blanco) o claro (para usar texto negro)
const isColorDark = (hexColor: string): boolean => {
  if (!hexColor || !hexColor.startsWith('#') || hexColor.length !== 7) {
    return true; // Por defecto usar texto blanco si el color no es válido
  }
  
  // Convertir color hex a RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calcular luminosidad percibida
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance < 0.5; // Oscuro si luminosidad < 0.5
};

// Función para obtener la hora actual en formato HH:MM
const getCurrentTime = (): string => {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

// Función para obtener el día actual
const getCurrentDay = (): WeekDay => {
  const now = new Date();
  const dayNum = now.getDay(); // 0 es domingo, 1 es lunes, ...
  const days: WeekDay[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[dayNum];
};

// Calcular el progreso del día (0-100%)
const getDayProgress = (): number => {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  return (minutes / (24 * 60)) * 100;
};

// Función para verificar si un slot está activo actualmente
const isSlotActive = (startTime: string, endTime: string): boolean => {
  const currentMinutes = timeToMinutes(getCurrentTime());
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
};

// Función para verificar si un slot está a punto de comenzar (próximos 15 minutos)
const isSlotUpcoming = (startTime: string): boolean => {
  const currentMinutes = timeToMinutes(getCurrentTime());
  const startMinutes = timeToMinutes(startTime);
  return startMinutes > currentMinutes && startMinutes - currentMinutes <= 15;
};

// Función para verificar si un slot está a punto de terminar (próximos 15 minutos)
const isSlotEnding = (endTime: string): boolean => {
  const currentMinutes = timeToMinutes(getCurrentTime());
  const endMinutes = timeToMinutes(endTime);
  return endMinutes > currentMinutes && endMinutes - currentMinutes <= 15;
};

export default function WeeklyCalendar() {
  const { schedule, updateSchedule } = useSchedule();
  const [visibleDays, setVisibleDays] = useState<WeekDay[]>(DAYS_NAMES.map(d => d.day));
  const [isMobile, setIsMobile] = useState(false);
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [dayProgress, setDayProgress] = useState(getDayProgress());
  const calendarRef = useRef<HTMLDivElement>(null);
  const currentDay = useMemo(() => getCurrentDay(), []);
  const [draggingSlot, setDraggingSlot] = useState<ScheduleSlot | null>(null);
  const [freeTimeSlots, setFreeTimeSlots] = useState<{day: WeekDay, start: number, end: number}[]>([]);
  const [showFreeSlots, setShowFreeSlots] = useState(false);
  const [dragPreview, setDragPreview] = useState<{day: WeekDay, startMinutes: number, endMinutes: number} | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Actualizar la hora actual cada minuto
  // Calcular los espacios libres en cada día
  const calculateFreeTimeSlots = useCallback(() => {
    if (!schedule) return [];
    
    const freeSlots: {day: WeekDay, start: number, end: number}[] = [];
    
    // Para cada día de la semana
    DAYS_NAMES.map(({ day }) => {
      const daySlots = schedule[day].sort((a, b) => 
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );
      
      // Si no hay slots, todo el día está libre
      if (daySlots.length === 0) {
        freeSlots.push({ day, start: 0, end: 24 * 60 });
        return;
      }
      
      let currentTime = 0; // 00:00
      
      // Iterar por los slots encontrando huecos
      for (const slot of daySlots) {
        const slotStart = timeToMinutes(slot.startTime);
        const slotEnd = timeToMinutes(slot.endTime);
        
        // Si hay espacio antes del slot actual
        if (slotStart > currentTime) {
          freeSlots.push({ day, start: currentTime, end: slotStart });
        }
        
        // Actualizar el tiempo actual
        currentTime = Math.max(currentTime, slotEnd);
      }
      
      // Añadir el último hueco del día si queda tiempo
      if (currentTime < 24 * 60) {
        freeSlots.push({ day, start: currentTime, end: 24 * 60 });
      }
    });
    
    // Filtrar slots muy pequeños (menos de 30 minutos)
    return freeSlots.filter(slot => (slot.end - slot.start) >= 30);
  }, [schedule]);
  
  // Actualizar slots libres cuando cambia el horario
  useEffect(() => {
    setFreeTimeSlots(calculateFreeTimeSlots());
  }, [schedule, calculateFreeTimeSlots]);
  
  // Actualizar la hora actual cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setDayProgress(getDayProgress());
    }, 60000); // Actualizar cada minuto
    
    return () => clearInterval(interval);
  }, []);
  
  // Detectar tamaño de pantalla para comportamiento responsive
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Comprobar tamaño inicial
    checkScreenSize();
    
    // Añadir event listener para cambios de tamaño
    window.addEventListener('resize', checkScreenSize);
    
    // En móvil, mostrar solo los primeros días
    if (isMobile) {
      setVisibleDays(DAYS_NAMES.slice(0, 3).map(d => d.day));
    } else {
      setVisibleDays(DAYS_NAMES.map(d => d.day));
    }
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [isMobile]);
  
  // Cambiar días visibles en móvil
  const showNextDays = () => {
    if (visibleDays[0] === 'monday') {
      setVisibleDays(['thursday', 'friday', 'saturday', 'sunday']);
    } else {
      setVisibleDays(['monday', 'tuesday', 'wednesday']);
    }
  };
  
  if (!schedule) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg">
        <p className="text-muted-foreground">No hay planificación generada</p>
      </div>
    );
  }
  
  // Constantes para dimensiones y espaciado
  const CELL_HEIGHT = 60; // Altura de cada celda de hora
  const TIME_COLUMN_WIDTH = 70; // Ancho de la columna de tiempo
  const GAP = 4; // Gap uniforme para todo el calendario - reducido para mejor alineación
  
  return (
    <div className="space-y-4" id="weekly-calendar" style={{ fontFamily: 'Arial, sans-serif' }} ref={calendarRef}>
      <div className="flex justify-between items-center mb-4">
        {isMobile && (
          <button 
            onClick={showNextDays}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
          >
            Ver {visibleDays[0] === 'monday' ? 'Jue-Dom' : 'Lun-Mié'}
          </button>
        )}
        
        <div className="flex space-x-2 ml-auto">
          <button
            onClick={() => setShowFreeSlots(!showFreeSlots)}
            className={`px-4 py-2 rounded-md text-sm ${showFreeSlots ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
          >
            {showFreeSlots ? 'Ocultar espacios libres' : 'Mostrar espacios libres'}
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <div className="min-w-[1024px] w-full" style={{ tableLayout: 'fixed' }}>
          {/* Cabecera con los días */}
          <div className="grid border-b" style={{ 
            gridTemplateColumns: `${TIME_COLUMN_WIDTH}px 1fr`,
            borderWidth: '1px'
          }}>
            <div className="font-medium text-center" style={{ 
              padding: '8px', 
              height: `${CELL_HEIGHT/2}px`, 
              lineHeight: `${CELL_HEIGHT/2 - 16}px` 
            }}>
              Hora
            </div>
            <div className="grid" style={{ 
              gridTemplateColumns: `repeat(${visibleDays.length}, 1fr)`,
              gap: `${GAP}px`
            }}>
              {DAYS_NAMES.filter(d => visibleDays.includes(d.day)).map(({ day, label }) => (
                <div key={day} className={`font-medium text-center border-l ${day === currentDay ? 'bg-primary/10 font-bold' : ''}`} style={{ 
                  padding: '8px', 
                  borderLeftWidth: '1px', 
                  height: `${CELL_HEIGHT/2}px`, 
                  lineHeight: `${CELL_HEIGHT/2 - 16}px`,
                  position: 'relative'
                }}>
                  {label}
                  {day === currentDay && (
                    <div className="absolute bottom-0 left-0 h-1 bg-primary" style={{ width: `${dayProgress}%` }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Cuerpo del calendario */}
          <div className="relative">
            {HOURS.map(hour => (
              <div key={hour} className="grid border-b" style={{ 
                gridTemplateColumns: `${TIME_COLUMN_WIDTH}px 1fr`,
                borderWidth: '1px',
                boxSizing: 'border-box',
                height: `${CELL_HEIGHT}px`
              }}>
                <div className="text-center text-sm" style={{ 
                  padding: '8px', 
                  height: `${CELL_HEIGHT}px`,
                  lineHeight: `${CELL_HEIGHT - 16}px`,
                  boxSizing: 'border-box'
                }}>
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="grid" style={{ 
                  gridTemplateColumns: `repeat(${visibleDays.length}, 1fr)`,
                  gap: `${GAP}px`
                }}>
                  {DAYS_NAMES.filter(d => visibleDays.includes(d.day)).map(({ day }) => (
                    <div key={`${hour}-${day}`} className={`border-l relative ${day === currentDay ? 'bg-primary/5' : ''}`} style={{ 
                      height: `${CELL_HEIGHT}px`, 
                      borderLeftWidth: '1px',
                      boxSizing: 'border-box'
                    }}>
                      {/* Indicador de hora actual */}
                      {day === currentDay && hour === parseInt(currentTime.split(':')[0]) && (
                        <div className="absolute w-full h-0.5 bg-primary z-20" style={{
                          top: `${(parseInt(currentTime.split(':')[1]) / 60) * CELL_HEIGHT}px`,
                          left: 0
                        }}></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Renderizar slots de tiempo libre si está activado */}
            {showFreeSlots && freeTimeSlots.filter(slot => visibleDays.includes(slot.day)).map((freeSlot, index) => {
              const dayIndex = visibleDays.indexOf(freeSlot.day);
              if (dayIndex === -1) return null;
              
              const startHourExact = freeSlot.start / 60;
              const durationHours = (freeSlot.end - freeSlot.start) / 60;
              const startY = startHourExact * CELL_HEIGHT;
              const height = durationHours * CELL_HEIGHT;
              
              const columnWidth = `calc((100% - ${TIME_COLUMN_WIDTH}px - ${(visibleDays.length-1) * GAP}px) / ${visibleDays.length})`;
              const left = `calc(${TIME_COLUMN_WIDTH}px + ${dayIndex} * (${columnWidth} + ${GAP}px))`;
              
              return (
                <div key={`free-${freeSlot.day}-${index}`}
                  className="absolute border-2 border-dashed border-green-500 bg-green-100 dark:bg-green-900 dark:bg-opacity-30 bg-opacity-30 rounded-md z-0"
                  style={{
                    left: left,
                    top: `${startY}px`,
                    height: `${height - GAP}px`,
                    width: `calc(${columnWidth} - ${GAP}px)`,
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'var(--green-700)',
                    pointerEvents: 'none'
                  }}
                >
                  {durationHours >= 1 && (
                    <span>
                      {Math.floor(durationHours * 60)} min
                    </span>
                  )}
                </div>
              );
            })}
            
            {/* Mostrar preview del drag si existe */}
            {dragPreview && (
              <div 
                className="absolute bg-blue-200 dark:bg-blue-800 bg-opacity-50 dark:bg-opacity-50 border-2 border-blue-500 rounded-md z-30"
                style={{
                  left: `calc(${TIME_COLUMN_WIDTH}px + ${visibleDays.indexOf(dragPreview.day)} * (calc((100% - ${TIME_COLUMN_WIDTH}px - ${(visibleDays.length-1) * GAP}px) / ${visibleDays.length}) + ${GAP}px))`,
                  top: `${(dragPreview.startMinutes / 60) * CELL_HEIGHT}px`,
                  height: `${((dragPreview.endMinutes - dragPreview.startMinutes) / 60) * CELL_HEIGHT - GAP}px`,
                  width: `calc((100% - ${TIME_COLUMN_WIDTH}px - ${(visibleDays.length-1) * GAP}px) / ${visibleDays.length} - ${GAP}px)`,
                  pointerEvents: 'none'
                }}
              />
            )}
            
            {/* Renderizado de slots */}
            {visibleDays.map((day, dayIndex) => (
              schedule[day].map((slot) => {
                // Convertir horas a minutos para cálculos precisos
                const startMinutes = timeToMinutes(slot.startTime);
                const endMinutes = timeToMinutes(slot.endTime);
                
                // Calcular posiciones exactas basadas en minutos
                
                // IMPORTANTE: Ajuste preciso para resolver el problema de alineación vertical
                // Calculamos las posiciones exactas basadas en minutos para alineación perfecta
                const startHourExact = startMinutes / 60; // Por ejemplo: 0.0 para 00:00, 7.5 para 07:30
                const endHourExact = endMinutes / 60;     // Por ejemplo: 7.0 para 07:00, 8.5 para 08:30
                
                // La duración en horas es la diferencia exacta entre horas
                const durationHours = endHourExact - startHourExact;
                
                // Calcular posición Y exacta usando la hora exacta, no solo la hora entera
                // Esto asegura que 07:30 se posicione correctamente a mitad de camino entre 7:00 y 8:00
                const startY = startHourExact * CELL_HEIGHT;
                
                // La altura debe ser exactamente proporcional a la duración en horas
                // Un slot de 1.5 horas (90 minutos) debe ocupar exactamente 1.5 * CELL_HEIGHT píxeles
                const height = durationHours * CELL_HEIGHT;
                
                // Calcular posición X y ancho
                const columnWidth = `calc((100% - ${TIME_COLUMN_WIDTH}px - ${(visibleDays.length-1) * GAP}px) / ${visibleDays.length})`;
                const left = `calc(${TIME_COLUMN_WIDTH}px + ${dayIndex} * (${columnWidth} + ${GAP}px))`;
                
                // Determinar color de texto según fondo
                const isDark = isColorDark(slot.color || '#000000');
                const textColor = isDark ? 'white' : 'black';
                
                return (
                  <div key={slot.id}>
                    <div
                      id={`slot-${slot.id}`}
                      className={`absolute rounded-md overflow-hidden
                        transition-all duration-300 hover:z-20 hover:scale-105
                        ${isSlotActive(slot.startTime, slot.endTime) ? 'ring-2 ring-primary shadow-lg z-10' : ''}
                        ${isSlotUpcoming(slot.startTime) ? 'animate-pulse border-l-4 border-primary' : ''}
                        ${isSlotEnding(slot.endTime) ? 'opacity-80' : 'opacity-95'}
                        ${slot.day === currentDay ? 'ring-1 ring-primary/30' : ''}
                        ${!slot.isFixed ? 'cursor-move' : ''}
                        ${isDragging && draggingSlot?.id === slot.id ? 'opacity-50 border-2 border-dashed' : ''}`}
                      draggable={!slot.isFixed}
                      onDragStart={(e) => {
                        if (slot.isFixed) return;
                        
                        setDraggingSlot(slot);
                        setIsDragging(true);
                        
                        // Permitir ver la imagen del elemento durante el arrastre
                        // para tener mejor feedback visual
                        try {
                          const rect = e.currentTarget.getBoundingClientRect();
                          e.dataTransfer.setDragImage(
                            e.currentTarget as Element, 
                            e.clientX - rect.left, 
                            e.clientY - rect.top
                          );
                          e.dataTransfer.effectAllowed = 'move';
                        } catch (err) {
                          console.error('Error setting drag image:', err);
                        }
                      }}
                      onDragEnd={() => {
                        setDraggingSlot(null);
                        setDragPreview(null);
                        setIsDragging(false);
                      }}
                      style={{
                        left: left,
                        top: `${startY}px`,
                        height: `${height - GAP}px`,
                        width: `calc(${columnWidth} - ${GAP}px)`,
                        backgroundColor: slot.color,
                        borderLeft: slot.isFixed ? '3px solid white' : 'none',
                        color: textColor,
                        padding: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        fontSize: '0.75rem',
                        lineHeight: '1.2',
                        boxSizing: 'border-box',
                        zIndex: 10
                      }}
                    >
                      <div style={{ fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {slot.name}
                      </div>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {slot.startTime} - {slot.endTime}
                      </div>
                      {/* Barra de progreso para visualizar cuánto tiempo ha pasado */}
                      {isSlotActive(slot.startTime, slot.endTime) && slot.day === currentDay && (
                        <div 
                          className="mt-auto h-1 bg-black bg-opacity-20 rounded-full overflow-hidden"
                          style={{ marginTop: 'auto' }}
                        >
                          <div 
                            className="h-full bg-primary"
                            style={{ 
                              width: `${((timeToMinutes(getCurrentTime()) - timeToMinutes(slot.startTime)) / 
                                      (timeToMinutes(slot.endTime) - timeToMinutes(slot.startTime))) * 100}%`,
                              transition: 'width 1s linear',
                              zIndex: 15
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ))}
            
            {/* Mostrar claramente las zonas de destino válidas durante el arrastre */}
            {isDragging && freeTimeSlots.filter(slot => visibleDays.includes(slot.day)).map((freeSlot, index) => {
              const dayIndex = visibleDays.indexOf(freeSlot.day);
              if (dayIndex === -1) return null;
              
              const startHourExact = freeSlot.start / 60;
              const durationHours = (freeSlot.end - freeSlot.start) / 60;
              const startY = startHourExact * CELL_HEIGHT;
              const height = durationHours * CELL_HEIGHT;
              
              const columnWidth = `calc((100% - ${TIME_COLUMN_WIDTH}px - ${(visibleDays.length-1) * GAP}px) / ${visibleDays.length})`;
              const left = `calc(${TIME_COLUMN_WIDTH}px + ${dayIndex} * (${columnWidth} + ${GAP}px))`;
              
              // Solo mostrar destinos válidos para la duración del slot actual
              if (!draggingSlot) return null;
              const slotDurationMinutes = timeToMinutes(draggingSlot.endTime) - timeToMinutes(draggingSlot.startTime);
              if ((freeSlot.end - freeSlot.start) < slotDurationMinutes) return null;
              
              return (
                <div key={`dropzone-${freeSlot.day}-${index}`}
                  className="absolute border-2 border-dashed border-blue-500 bg-blue-100 dark:bg-blue-900 dark:bg-opacity-20 bg-opacity-20 rounded-md z-40"
                  style={{
                    left: left,
                    top: `${startY}px`,
                    height: `${height - GAP}px`,
                    width: `calc(${columnWidth} - ${GAP}px)`,
                    fontSize: '0.7rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    color: 'var(--blue-700)',
                    cursor: 'pointer'
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    
                    if (!draggingSlot) return;
                    
                    // Calcular minutos desde el inicio del slot basado en posición Y relativa
                    const rect = e.currentTarget.getBoundingClientRect();
                    const yRelative = e.clientY - rect.top;
                    const yPercent = yRelative / rect.height;
                    const slotStartMinutes = freeSlot.start;
                    const slotEndMinutes = freeSlot.end;
                    const slotDurationMinutes = slotEndMinutes - slotStartMinutes;
                    
                    // Calcular la posición relativa al tiempo disponible
                    const clickOffsetMinutes = Math.floor(yPercent * slotDurationMinutes);
                    const newStartMinutes = slotStartMinutes + clickOffsetMinutes;
                    
                    // La duración se mantiene igual que el slot original
                    const draggedSlotDuration = timeToMinutes(draggingSlot.endTime) - timeToMinutes(draggingSlot.startTime);
                    const newEndMinutes = newStartMinutes + draggedSlotDuration;
                    
                    // Verificar si cabe en el espacio libre
                    if (newEndMinutes <= slotEndMinutes) {
                      setDragPreview({
                        day: freeSlot.day,
                        startMinutes: newStartMinutes,
                        endMinutes: newEndMinutes
                      });
                    }
                  }}
                  onDragLeave={(e) => {
                    // Solo limpiar si realmente salimos de la zona
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX;
                    const y = e.clientY;
                    
                    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                      setDragPreview(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    
                    if (!draggingSlot || !dragPreview) return;
                    
                    // Actualizar el horario con la nueva posición del slot
                    const updatedSchedule = {...schedule};
                    
                    // Eliminar el slot de su ubicación original
                    updatedSchedule[draggingSlot.day] = updatedSchedule[draggingSlot.day].filter(
                      s => s.id !== draggingSlot.id
                    );
                    
                    // Crear el slot actualizado
                    const updatedSlot: ScheduleSlot = {
                      ...draggingSlot,
                      day: dragPreview.day,
                      startTime: minutesToTime(dragPreview.startMinutes),
                      endTime: minutesToTime(dragPreview.endMinutes)
                    };
                    
                    // Añadir el slot a su nueva ubicación
                    updatedSchedule[dragPreview.day] = [...updatedSchedule[dragPreview.day], updatedSlot];
                    
                    // Actualizar el horario
                    updateSchedule(updatedSchedule);
                    setDraggingSlot(null);
                    setDragPreview(null);
                    setIsDragging(false);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
