'use client';

import { useSchedule } from "@/lib/context";
import { VariableSlot } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { FormEvent, useState } from "react";
import { X } from "lucide-react";

// Colores para slots variables - suficiente variedad para evitar repeticiones
const COLORS = [
  "#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FF33A8", 
  "#33FFF3", "#FFE933", "#FF8C33", "#8C33FF", "#33FFBD",
  "#4CAF50", "#9C27B0", "#E91E63", "#2196F3", "#FFC107",
  "#607D8B", "#795548", "#009688", "#673AB7", "#CDDC39"
];

// Determina si un color es oscuro (para usar texto blanco) o claro (para usar texto negro)
const isColorDark = (hexColor: string): boolean => {
  // Convertir color hex a RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calcular luminosidad percibida
  // https://www.w3.org/TR/WCAG20-TECHS/G17.html#G17-tests
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance < 0.5; // Oscuro si luminosidad < 0.5
};

export default function VariableSlotsManager() {
  const { variableSlots, addVariableSlot, updateVariableSlot, removeVariableSlot } = useSchedule();
  
  const [name, setName] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [distributeEvenly, setDistributeEvenly] = useState(false);
  
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  
  // Cargar datos de la tarea en el formulario para editar
  const handleEdit = (slot: VariableSlot) => {
    setEditingSlotId(slot.id);
    setName(slot.name);
    setTotalHours(String(slot.totalHours));
    setDistributeEvenly(slot.distributeEvenly);
  };

  // Resetear el estado de edición
  const cancelEdit = () => {
    setEditingSlotId(null);
    setName("");
    setTotalHours("");
    setDistributeEvenly(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!name || !totalHours) return;

    if (editingSlotId) {
      // Actualizar la tarea existente
      updateVariableSlot(editingSlotId, {
        name,
        totalHours: parseFloat(totalHours),
        distributeEvenly
      });
      cancelEdit(); // Resetear el formulario y estado de edición
    } else {
      // Crear una nueva tarea
      // Encontrar colores ya utilizados
      const usedColors = variableSlots.map(slot => slot.color);
      
      // Filtrar colores disponibles
      const availableColors = COLORS.filter(color => !usedColors.includes(color));
      
      // Si no quedan colores disponibles, reutilizar de la lista completa
      const colorPool = availableColors.length > 0 ? availableColors : COLORS;
      
      // Seleccionar un color aleatorio de los disponibles
      const randomColor = colorPool[Math.floor(Math.random() * colorPool.length)];
      
      addVariableSlot({
        name,
        totalHours: parseFloat(totalHours),
        distributeEvenly,
        color: randomColor
      });
      
      // Resetear el formulario
      setName("");
      setTotalHours("");
      setDistributeEvenly(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Slots Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nombre de la tarea
                </label>
                <Input
                  id="name"
                  placeholder="Ej: Estudiar, Ejercicio..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="hours" className="text-sm font-medium">
                  Horas totales
                </label>
                <Input
                  id="hours"
                  type="number"
                  min="0.5"
                  step="0.5"
                  placeholder="Ej: 10"
                  value={totalHours}
                  onChange={(e) => setTotalHours(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="distribute"
                checked={distributeEvenly}
                onCheckedChange={(checked) => 
                  setDistributeEvenly(checked === true)
                }
              />
              <label
                htmlFor="distribute"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Distribuir equitativamente en la semana
              </label>
            </div>
            
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {editingSlotId ? 'Actualizar Tarea' : 'Añadir Tarea Variable'}
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
      
      {variableSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tareas Variables Añadidas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {variableSlots.map((slot) => (
                <li key={slot.id} className="flex items-center justify-between p-3 rounded-md bg-muted">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: slot.color }}
                    />
                    <div>
                      <span className="font-medium">{slot.name}</span>
                      <span className="ml-2 text-sm text-muted-foreground">
                        {slot.totalHours} horas
                        {slot.distributeEvenly && " (distribuidas)"}
                      </span>
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
                      onClick={() => removeVariableSlot(slot.id)}
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
