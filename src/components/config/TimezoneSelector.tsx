'use client';

import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSchedule } from '@/lib/context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Lista de zonas horarias populares
const POPULAR_TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'Europe/Madrid', label: 'Madrid (UTC+2)' },
  { value: 'Europe/London', label: 'Londres (UTC+1)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+2)' },
  { value: 'America/New_York', label: 'Nueva York (UTC-4)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (UTC-7)' },
  { value: 'Asia/Tokyo', label: 'Tokio (UTC+9)' },
  { value: 'Australia/Sydney', label: 'Sydney (UTC+10)' }
];

export default function TimezoneSelector() {
  const { updateTimezone } = useSchedule();
  const [currentTimezone, setCurrentTimezone] = useState<string>('');
  const [systemTimezone, setSystemTimezone] = useState<string>('');
  
  // Detectar la zona horaria del sistema al cargar
  useEffect(() => {
    const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    setSystemTimezone(detectedTimezone);
    
    // Cargar zona horaria guardada o usar la del sistema por defecto
    const savedTimezone = localStorage.getItem('ritmi-timezone') || detectedTimezone;
    setCurrentTimezone(savedTimezone);
  }, []);
  
  // Manejar cambio de zona horaria
  const handleTimezoneChange = (newTimezone: string) => {
    setCurrentTimezone(newTimezone);
    localStorage.setItem('ritmi-timezone', newTimezone);
    
    // Actualizar en el contexto
    if (updateTimezone) {
      updateTimezone(newTimezone);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Zona Horaria</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="timezone">Seleccionar zona horaria</Label>
            <Select
              value={currentTimezone}
              onValueChange={handleTimezoneChange}
            >
              <SelectTrigger id="timezone">
                <SelectValue placeholder="Selecciona zona horaria" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value={systemTimezone}>
                  Sistema ({systemTimezone})
                </SelectItem>
                {POPULAR_TIMEZONES.filter(tz => tz.value !== systemTimezone).map(timezone => (
                  <SelectItem key={timezone.value} value={timezone.value}>
                    {timezone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-2">
              Las horas mostradas en el calendario se ajustarán a la zona horaria seleccionada.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
