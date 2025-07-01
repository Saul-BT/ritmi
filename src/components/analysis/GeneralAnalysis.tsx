'use client';

import { WeeklySchedule } from "@/types";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useMemo } from "react";

// Traducción de días para la visualización
const dayTranslation: Record<string, string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo'
};

// Colores para los gráficos
const COLORS = [
  '#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', 
  '#d0ed57', '#ffc658', '#ff8042', '#ff5252', '#e056fd'
];

interface GeneralAnalysisProps {
  schedule: WeeklySchedule;
}

export function GeneralAnalysis({ schedule }: GeneralAnalysisProps) {
  // Preparar datos para los gráficos
  const { stackedBarData, radarData, variableActivities } = useMemo(() => {
    // 1. Extraer actividades variables únicas
    const variableSlots = Object.values(schedule)
      .flatMap(slots => slots.filter(slot => !slot.isFixed));
    
    // Obtener nombres únicos de actividades variables
    const uniqueActivities = Array.from(
      new Set(variableSlots.map(slot => slot.name))
    );
    
    // 2. Preparar datos para gráfico de barras apiladas
    const stackedData: Record<string, any>[] = [];
    
    // Para cada día, calcular horas por actividad variable
    Object.entries(schedule).forEach(([day, slots]) => {
      const dayData: Record<string, any> = {
        day: dayTranslation[day],
      };
      
      // Inicializar a 0 todas las actividades
      uniqueActivities.forEach(activity => {
        dayData[activity] = 0;
      });
      
      // Sumar horas por actividad
      slots.filter(slot => !slot.isFixed).forEach(slot => {
        const startMinutes = timeToMinutes(slot.startTime);
        const endMinutes = timeToMinutes(slot.endTime);
        const hours = (endMinutes - startMinutes) / 60;
        
        dayData[slot.name] = (dayData[slot.name] || 0) + hours;
      });
      
      stackedData.push(dayData);
    });
    
    // 3. Preparar datos para gráfico radial
    const radarData = uniqueActivities.map(activity => {
      const totalHours = Object.values(schedule)
        .flatMap(slots => slots)
        .filter(slot => !slot.isFixed && slot.name === activity)
        .reduce((total, slot) => {
          const startMinutes = timeToMinutes(slot.startTime);
          const endMinutes = timeToMinutes(slot.endTime);
          return total + (endMinutes - startMinutes) / 60;
        }, 0);
      
      return {
        activity,
        hours: parseFloat(totalHours.toFixed(1))
      };
    });
    
    return { 
      stackedBarData: stackedData, 
      radarData,
      variableActivities: uniqueActivities
    };
  }, [schedule]);

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium mb-4">Distribución de Slots Variables por Día</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stackedBarData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => [
                  `${parseFloat(value as string).toFixed(1)} horas`, 
                  name
                ]}
              />
              <Legend />
              {variableActivities.map((activity, index) => (
                <Bar 
                  key={activity} 
                  dataKey={activity} 
                  stackId="a" 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Horas dedicadas a cada actividad variable por día de la semana
        </p>
      </div>

      <div className="mt-10">
        <h3 className="text-lg font-medium mb-4">Resumen Semanal de Actividades Variables</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={radarData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={100}
                fill="#8884d8"
                dataKey="hours"
                nameKey="activity"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {radarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} horas`, 'Tiempo Total']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-muted-foreground mt-2 text-center">
          Distribución total de horas por actividad variable en la semana
        </p>
      </div>
    </div>
  );
}

// Convertir string de hora a minutos desde medianoche
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}
