'use client';

import { useSchedule } from "@/lib/context";
import { FixedSlot, WeekDay } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";
import { X } from "lucide-react";

// Color fijo para todos los slots fijos (un único tono de gris)
const FIXED_SLOT_COLOR = "#9E9E9E";

const DAYS_OF_WEEK: { label: string; value: WeekDay }[] = [
  { label: "Lunes", value: "monday" },
  { label: "Martes", value: "tuesday" },
  { label: "Miércoles", value: "wednesday" },
  { label: "Jueves", value: "thursday" },
  { label: "Viernes", value: "friday" },
  { label: "Sábado", value: "saturday" },
  { label: "Domingo", value: "sunday" }
];

export default function FixedSlotsManager() {
  const { fixedSlots, addFixedSlot, updateFixedSlot, removeFixedSlot } = useSchedule();
  
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [selectedDays, setSelectedDays] = useState<WeekDay[]>([]);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  
  // Cargar datos de la actividad fija en el formulario para editar
  const handleEdit = (slot: FixedSlot) => {
    setEditingSlotId(slot.id);
    setName(slot.name);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setSelectedDays(slot.days);
  };

  // Resetear el estado de edición
  const cancelEdit = () => {
    setEditingSlotId(null);
    setName("");
    setSelectedDays([]);
    // Mantener las horas para facilitar la entrada de datos similares
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!name || !startTime || !endTime || selectedDays.length === 0) return;
    
    // Validar que la hora de fin sea posterior a la de inicio
    if (startTime >= endTime) {
      alert("La hora de fin debe ser posterior a la hora de inicio");
      return;
    }
    
    if (editingSlotId) {
      // Actualizar la actividad fija existente
      updateFixedSlot(editingSlotId, {
        name,
        startTime,
        endTime,
        days: selectedDays
      });
      cancelEdit(); // Resetear el formulario y estado de edición
    } else {
      // Crear una nueva actividad fija
      // Asignar el color gris definido
      const randomColor = FIXED_SLOT_COLOR;
      
      addFixedSlot({
        name,
        startTime,
        endTime,
        days: selectedDays,
        color: randomColor
      });
      
      // Resetear parcialmente el formulario
      setName("");
      // Mantener las horas y días seleccionados para facilitar la entrada de datos similares
    }
  };
  
  const toggleDay = (day: WeekDay) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Slots Fijos</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="fixed-name" className="text-sm font-medium">
                Nombre de la actividad
              </label>
              <Input
                id="fixed-name"
                placeholder="Ej: Dormir, Comer, Trabajo..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="start-time" className="text-sm font-medium">
                  Hora de inicio
                </label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="end-time" className="text-sm font-medium">
                  Hora de fin
                </label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Días de la semana</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day.value}`}
                      checked={selectedDays.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value)}
                    />
                    <label
                      htmlFor={`day-${day.value}`}
                      className="text-sm font-medium leading-none"
                    >
                      {day.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingSlotId ? 'Actualizar Actividad' : 'Añadir Actividad Fija'}
              </Button>
              
              {editingSlotId && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      
      {fixedSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actividades Fijas Añadidas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {fixedSlots.map((slot) => (
                <li key={slot.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: slot.color }}
                    />
                    <div>
                      <div className="font-medium">{slot.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {slot.startTime} - {slot.endTime} • 
                        {slot.days.map((day, i) => (
                          <span key={day}>
                            {i > 0 && ", "}
                            {DAYS_OF_WEEK.find(d => d.value === day)?.label.substring(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(slot)}
                      title="Editar"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFixedSlot(slot.id)}
                      title="Eliminar"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
