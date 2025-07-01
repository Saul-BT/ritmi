'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSchedule } from "@/lib/context";
import { GeneralAnalysis } from "@/components/analysis/GeneralAnalysis";

export function AnalysisPage() {
  const { schedule } = useSchedule();

  if (!schedule) {
    return (
      <div className="rounded-lg bg-muted p-6 text-center">
        <h3 className="text-lg font-medium mb-2">No hay planificación generada</h3>
        <p className="text-muted-foreground mb-4">
          Configura tus actividades y genera una planificación para ver el análisis aquí.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Ir a Configuración
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Tiempo</CardTitle>
        </CardHeader>
        <CardContent>
          <GeneralAnalysis schedule={schedule} />
        </CardContent>
      </Card>
    </div>
  );
}
