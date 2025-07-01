'use client';

import { FixedSlot, ScheduleConfig, VariableSlot, WeeklySchedule } from '@/types';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { generateSchedule } from './scheduler';
import { getConfig, getSchedule, saveConfig, saveSchedule } from './storage';
import { v4 as uuidv4 } from 'uuid';

interface ScheduleContextType {
  // Estado
  variableSlots: VariableSlot[];
  fixedSlots: FixedSlot[];
  schedule: WeeklySchedule | null;
  timezone: string;
  
  // Acciones para slots variables
  addVariableSlot: (slot: Omit<VariableSlot, 'id'>) => void;
  updateVariableSlot: (id: string, updates: Partial<Omit<VariableSlot, 'id'>>) => void;
  removeVariableSlot: (id: string) => void;
  
  // Acciones para slots fijos
  addFixedSlot: (slot: Omit<FixedSlot, 'id'>) => void;
  updateFixedSlot: (id: string, updates: Partial<Omit<FixedSlot, 'id'>>) => void;
  removeFixedSlot: (id: string) => void;
  
  // Acciones para slots en el horario
  updateScheduleSlot: (slotId: string, day: WeekDay, updates: Partial<Omit<ScheduleSlot, 'id' | 'slotId' | 'day'>>) => void;
  moveScheduleSlot: (slotId: string, fromDay: WeekDay, toDay: WeekDay, newStartTime: string, newEndTime: string) => void;
  updateSchedule: (newSchedule: WeeklySchedule) => void;
  
  // Configuración
  updateTimezone: (timezone: string) => void;
  
  // Generación de horario
  generateSchedule: () => void;
}

const defaultWeeklySchedule: WeeklySchedule = {
  monday: [],
  tuesday: [],
  wednesday: [],
  thursday: [],
  friday: [],
  saturday: [],
  sunday: []
};

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

export function ScheduleProvider({ children }: { children: ReactNode }) {
  // Estado para slots variables
  const [variableSlots, setVariableSlots] = useState<VariableSlot[]>([]);
  // Estado para slots fijos
  const [fixedSlots, setFixedSlots] = useState<FixedSlot[]>([]);
  // Estado para el horario generado
  const [schedule, setSchedule] = useState<WeeklySchedule | null>(null);
  // Estado para la zona horaria
  const [timezone, setTimezone] = useState<string>(
    typeof window !== 'undefined' ? 
      localStorage.getItem('ritmi-timezone') || 
      Intl.DateTimeFormat().resolvedOptions().timeZone : 
      'UTC'
  );

  // Cargar datos guardados al iniciar
  useEffect(() => {
    const savedConfig = getConfig();
    const savedSchedule = getSchedule();
    
    if (savedConfig) {
      setVariableSlots(savedConfig.variableSlots);
      setFixedSlots(savedConfig.fixedSlots);
      
      // Cargar zona horaria si existe
      if (savedConfig.timezone) {
        setTimezone(savedConfig.timezone);
      }
    }
    
    if (savedSchedule) {
      setSchedule(savedSchedule);
    }
  }, []);

  // Guardar configuración cuando cambia
  useEffect(() => {
    if (variableSlots.length > 0 || fixedSlots.length > 0) {
      const config: ScheduleConfig = {
        variableSlots,
        fixedSlots,
        timezone
      };
      saveConfig(config);
    }
  }, [variableSlots, fixedSlots, timezone]);

  // Añadir un nuevo slot variable
  const addVariableSlot = (slot: Omit<VariableSlot, 'id'>) => {
    const newSlot: VariableSlot = {
      ...slot,
      id: uuidv4()
    };
    setVariableSlots(prev => [...prev, newSlot]);
  };

  // Actualizar un slot variable existente
  const updateVariableSlot = (id: string, updates: Partial<Omit<VariableSlot, 'id'>>) => {
    setVariableSlots(prev => 
      prev.map(slot => 
        slot.id === id ? { ...slot, ...updates } : slot
      )
    );
  };

  // Eliminar un slot variable
  const removeVariableSlot = (id: string) => {
    setVariableSlots(prev => prev.filter(slot => slot.id !== id));
  };

  // Añadir un nuevo slot fijo
  const addFixedSlot = (slot: Omit<FixedSlot, 'id'>) => {
    const newSlot: FixedSlot = {
      ...slot,
      id: uuidv4()
    };
    setFixedSlots(prev => [...prev, newSlot]);
  };

  // Actualizar un slot fijo existente
  const updateFixedSlot = (id: string, updates: Partial<Omit<FixedSlot, 'id'>>) => {
    setFixedSlots(prev => 
      prev.map(slot => 
        slot.id === id ? { ...slot, ...updates } : slot
      )
    );
  };

  // Eliminar un slot fijo
  const removeFixedSlot = (id: string) => {
    setFixedSlots(prev => prev.filter(slot => slot.id !== id));
  };

  // Actualizar un slot en el horario (para drag & drop)
  const updateScheduleSlot = (slotId: string, day: WeekDay, updates: Partial<Omit<ScheduleSlot, 'id' | 'slotId' | 'day'>>) => {
    if (!schedule) return;
    
    setSchedule(prev => {
      if (!prev) return prev;
      
      const updatedSchedule = { ...prev };
      updatedSchedule[day] = updatedSchedule[day].map(slot => 
        slot.id === slotId ? { ...slot, ...updates } : slot
      );
      
      // Guardar los cambios
      saveSchedule(updatedSchedule);
      return updatedSchedule;
    });
  };
  
  // Mover un slot de un día a otro (para drag & drop entre días)
  const moveScheduleSlot = (slotId: string, fromDay: WeekDay, toDay: WeekDay, newStartTime: string, newEndTime: string) => {
    if (!schedule) return;
    
    setSchedule(prev => {
      if (!prev) return prev;
      
      // Encontrar el slot a mover
      const slotToMove = prev[fromDay].find(slot => slot.id === slotId);
      if (!slotToMove) return prev;
      
      // Crear una copia profunda del horario actual
      const updatedSchedule = { ...prev };
      
      // Eliminar el slot del día original
      updatedSchedule[fromDay] = updatedSchedule[fromDay].filter(slot => slot.id !== slotId);
      
      // Añadir el slot al nuevo día con los nuevos horarios
      const movedSlot: ScheduleSlot = {
        ...slotToMove,
        day: toDay,
        startTime: newStartTime,
        endTime: newEndTime
      };
      
      updatedSchedule[toDay] = [...updatedSchedule[toDay], movedSlot];
      
      // Guardar los cambios
      saveSchedule(updatedSchedule);
      return updatedSchedule;
    });
  };

  // Generar horario semanal
  // Actualizar zona horaria
  const updateTimezone = (newTimezone: string) => {
    setTimezone(newTimezone);
    localStorage.setItem('ritmi-timezone', newTimezone);
  };
  
  // Actualizar el horario completo (para drag & drop)
  const updateSchedule = (newSchedule: WeeklySchedule) => {
    setSchedule(newSchedule);
    saveSchedule(newSchedule);
  };
  
  // Generar horario semanal
  const generateWeeklySchedule = () => {
    const newSchedule = generateSchedule(variableSlots, fixedSlots);
    setSchedule(newSchedule);
    saveSchedule(newSchedule);
  };

  const value: ScheduleContextType = {
    variableSlots,
    fixedSlots,
    schedule,
    timezone,
    addVariableSlot,
    updateVariableSlot,
    removeVariableSlot,
    addFixedSlot,
    updateFixedSlot,
    removeFixedSlot,
    updateScheduleSlot,
    moveScheduleSlot,
    updateSchedule,
    updateTimezone,
    generateSchedule: generateWeeklySchedule
  };

  return (
    <ScheduleContext.Provider value={value}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule() {
  const context = useContext(ScheduleContext);
  
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  
  return context;
}
