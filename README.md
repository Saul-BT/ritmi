# Ritmi - Planificación Semanal Inteligente

## ¿En qué consiste el proyecto?

Ritmi es una aplicación web diseñada para ayudarte a organizar tu semana de manera eficiente y personalizada. Utilizando tecnologías modernas como **Next.js** para el desarrollo del frontend y **ShadCN** para los componentes de interfaz de usuario, Ritmi te permite crear horarios semanales optimizados según tus necesidades.

### Funcionalidades del proyecto

- **Configuración de Slots Variables**: Define actividades con el tiempo total que deseas dedicarles y decide si quieres que se distribuyan equitativamente a lo largo de la semana o de forma aleatoria.

- **Configuración de Slots Fijos**: Establece actividades con horarios inamovibles (como dormir, comidas, compromisos, etc.) y especifica en qué días de la semana ocurren.

- **Generación Automática de Horarios**: El algoritmo inteligente crea un horario semanal que respeta tus slots fijos y distribuye los variables optimizando el tiempo disponible.

- **Regeneración con un Clic**: Si no estás satisfecho con el resultado, puedes regenerar el horario manteniendo la misma configuración para obtener una distribución diferente.

- **Persistencia Local**: Tu configuración y última planificación se guardan automáticamente en el navegador mediante localStorage.

- **Diseño Responsive**: La interfaz se adapta perfectamente a dispositivos móviles y de escritorio, siguiendo un enfoque "mobile first".

- **Visualización de Calendario Intuitiva**: El calendario semanal, similar al de Google Calendar, muestra los días en horizontal y las horas en vertical, con una representación visual clara de cada actividad.

- **Exportación a PDF**: Puedes exportar tu planificación semanal en formato PDF para guardarla o imprimirla.

## Implementaciones técnicas destacadas

### Algoritmo de distribución inteligente

El componente `scheduler.ts` implementa un algoritmo sofisticado que:

1. Identifica los espacios libres entre slots fijos para cada día
2. Distribuye los slots variables según preferencias (equitativo o aleatorio)
3. Evita solapamientos y optimiza la distribución de tiempo
4. Mantiene bloques de tiempo contiguos cuando es posible

### Visualización del calendario

El componente `WeeklyCalendar.tsx` implementa una visualización de calendario con las siguientes características:

1. Grid responsive que mantiene la alineación precisa entre horas y slots
2. Cálculo matemático exacto para posicionar los slots en función de su hora de inicio/fin
3. Espaciado uniforme y consistente entre elementos
4. Adaptación a diferentes tamaños de pantalla
5. Detección automática de colores para asegurar la legibilidad del texto

### Exportación a PDF

Implementación de generación de PDF a través de `jsPDF` y `html2canvas` que:

1. Captura el estado actual del calendario
2. Genera una representación de alta calidad
3. Maneja automáticamente calendarios de gran altura dividiéndolos en múltiples páginas
4. Mantiene la fidelidad visual respecto al calendario mostrado en pantalla

## Requisitos Técnicos

- **Node.js**: Versión 18.x o superior
- **npm/yarn/pnpm**: Gestor de paquetes para instalar dependencias
- **Navegador moderno**: Chrome, Firefox, Safari o Edge en sus versiones recientes

## Estructura del Proyecto

```
src/
├── components/
│   ├── ui/             # Componentes de ShadCN
│   ├── layout/         # Componentes de layout
│   ├── config/         # Componentes de la pestaña de configuración
│   └── planner/        # Componentes de la pestaña de planificación
├── hooks/              # Custom hooks
├── lib/                # Utilidades y lógica de negocio
├── types/              # Definiciones de tipos
└── app/                # Rutas de Next.js
```

## Estructura de Datos

### Slots Variables
```typescript
interface VariableSlot {
  id: string;
  name: string;
  totalHours: number;
  distributeEvenly: boolean;
  color?: string;
}
```

### Slots Fijos
```typescript
interface FixedSlot {
  id: string;
  name: string;
  startTime: string; // formato "HH:MM"
  endTime: string;   // formato "HH:MM"
  days: WeekDay[];   // ["monday", "tuesday", etc.]
  color?: string;
}

type WeekDay = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
```

### Planificación
```typescript
interface ScheduleSlot {
  id: string;
  slotId: string;
  name: string;
  startTime: string;
  endTime: string;
  day: WeekDay;
  isFixed: boolean;
  color?: string;
}

type WeeklySchedule = {
  [key in WeekDay]: ScheduleSlot[];
};
```

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd ritmi

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Iniciar servidor de producción
npm run start

# Ejecutar linter
npm run lint
```

## Funcionalidades recientemente implementadas

✅ **Modo oscuro completo**: Se ha implementado un modo oscuro completo que se adapta a las preferencias del sistema o puede ser seleccionado manualmente por el usuario.

✅ **Optimización del algoritmo**: Se ha mejorado el rendimiento del algoritmo de distribución para manejar planificaciones complejas más rápidamente.

✅ **Mejor feedback visual**: Se han añadido indicadores visuales para las actividades a punto de comenzar o finalizar, barra de progreso en tareas activas, resaltado del día actual y una línea indicadora de la hora actual.

✅ **Optimización de la visualización en PDF**: Se ha mejorado la generación de PDF para asegurar que todo el contenido se muestre correctamente en una sola página, con mayor calidad y mejor legibilidad.

✅ **Depuración de consola**: Se han eliminado todos los logs de depuración de la consola del navegador, manteniendo solo los esenciales para el manejo de errores.

✅ **Exportación en múltiples formatos**: Se ha añadido la capacidad de exportar la planificación en formatos CSV e iCal (.ics) además del ya existente PDF.

✅ **Plantillas predefinidas**: Se han agregado plantillas predefinidas para diferentes tipos de semanas (trabajo, estudio, vacaciones, etc.) que el usuario puede seleccionar y personalizar.

## Próximas mejoras

- **Interacción con drag & drop**: Permitir arrastrar y soltar slots variables para ajustar manualmente la planificación después de la generación automática. Ten en cuenta las posibles colisiones entre slots variables. Solamente se permitirá arrastrar slots variables sobre huecos libres.

---

Este proyecto se ha desarrollado siguiendo las mejores prácticas de React y Next.js, utilizando componentes de servidor cuando es posible para optimizar el rendimiento, siguiendo un enfoque "mobile first" para garantizar una experiencia óptima en todos los dispositivos, y adhiriéndose a la arquitectura recomendada para App Router.
