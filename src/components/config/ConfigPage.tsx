'use client';

import { useSchedule } from "@/lib/context";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import VariableSlotsManager from "./VariableSlotsManager";
import FixedSlotsManager from "./FixedSlotsManager";
import { templates } from "@/lib/templates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function ConfigPage() {
  const { generateSchedule, variableSlots, fixedSlots, addVariableSlot, addFixedSlot } = useSchedule();
  const router = useRouter();
  
  // Aplicar una plantilla predefinida
  const applyTemplate = (templateKey: string) => {
    // Obtener la plantilla seleccionada
    const selectedTemplate = templates[templateKey as keyof typeof templates];
    if (!selectedTemplate) return;
    
    // Confirmar con el usuario
    if (variableSlots.length > 0 || fixedSlots.length > 0) {
      const confirmed = window.confirm(
        `¿Estás seguro de que deseas aplicar la plantilla "${selectedTemplate.name}"? Esto reemplazará tu configuración actual.`
      );
      if (!confirmed) return;
    }
    
    // Limpiar la configuración actual (reiniciar el estado)
    window.localStorage.removeItem('ritmi-config');
    window.localStorage.removeItem('ritmi-schedule');
    
    // Aplicar los slots fijos de la plantilla
    selectedTemplate.template.fixedSlots.forEach(slot => {
      addFixedSlot({
        name: slot.name,
        startTime: slot.startTime,
        endTime: slot.endTime,
        days: [...slot.days],
        color: slot.color
      });
    });
    
    // Aplicar los slots variables de la plantilla
    selectedTemplate.template.variableSlots.forEach(slot => {
      addVariableSlot({
        name: slot.name,
        totalHours: slot.totalHours,
        distributeEvenly: slot.distributeEvenly,
        color: slot.color
      });
    });
    
    // Mostrar mensaje de éxito
    alert(`Plantilla "${selectedTemplate.name}" aplicada con éxito. Ahora puedes generar tu horario.`);
  };
  
  const handleGenerateSchedule = () => {
    // Verificar que hay datos para generar el horario
    if (variableSlots.length === 0 && fixedSlots.length === 0) {
      alert("Necesitas añadir al menos un slot variable o fijo para generar una planificación.");
      return;
    }
    
    // Generar horario y navegar a la vista de planificación
    generateSchedule();
    router.push("/planner");
  };
  
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Plantillas Predefinidas</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Seleccionar Plantilla</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {Object.entries(templates).map(([key, value]) => (
                <DropdownMenuItem key={key} onClick={() => applyTemplate(key)}>
                  <div className="flex flex-col">
                    <span className="font-medium">{value.name}</span>
                    <span className="text-xs text-muted-foreground">{value.description}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Selecciona una plantilla predefinida o configura manualmente tus actividades fijas y variables.
          </p>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <VariableSlotsManager />
        <FixedSlotsManager />
      </div>
      
      <div className="flex justify-center pt-4">
        <Button 
          size="lg" 
          onClick={handleGenerateSchedule}
          className="w-full max-w-md"
        >
          Generar Planificación
        </Button>
      </div>
    </div>
  );
}
