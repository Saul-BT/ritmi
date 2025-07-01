import { FixedSlot, ScheduleConfig, VariableSlot } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Colores para categorías
const COLORS = {
  sleep: '#6f42c1',      // Violeta
  work: '#dc3545',       // Rojo
  meals: '#fd7e14',      // Naranja
  study: '#007bff',      // Azul
  exercise: '#28a745',   // Verde
  leisure: '#6c757d',    // Gris
  selfCare: '#20c997',   // Turquesa
  commute: '#ffc107',    // Amarillo
  family: '#e83e8c',     // Rosa
  projects: '#17a2b8'    // Cyan
};

// Plantilla de trabajo estándar (8 horas diarias)
export const workTemplate: ScheduleConfig = {
  fixedSlots: [
    // Dormir
    {
      id: uuidv4(),
      name: 'Dormir',
      startTime: '23:00',
      endTime: '07:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      color: COLORS.sleep
    },
    {
      id: uuidv4(),
      name: 'Dormir',
      startTime: '00:00',
      endTime: '09:00',
      days: ['saturday', 'sunday'],
      color: COLORS.sleep
    },
    // Trabajo
    {
      id: uuidv4(),
      name: 'Trabajo',
      startTime: '09:00',
      endTime: '13:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      color: COLORS.work
    },
    {
      id: uuidv4(),
      name: 'Trabajo',
      startTime: '14:00',
      endTime: '18:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      color: COLORS.work
    },
    // Comidas
    {
      id: uuidv4(),
      name: 'Desayuno',
      startTime: '07:30',
      endTime: '08:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      color: COLORS.meals
    },
    {
      id: uuidv4(),
      name: 'Almuerzo',
      startTime: '13:00',
      endTime: '14:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      color: COLORS.meals
    },
    {
      id: uuidv4(),
      name: 'Cena',
      startTime: '20:00',
      endTime: '21:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      color: COLORS.meals
    }
  ],
  variableSlots: [
    {
      id: uuidv4(),
      name: 'Ejercicio',
      totalHours: 4,
      distributeEvenly: true,
      color: COLORS.exercise
    },
    {
      id: uuidv4(),
      name: 'Tiempo personal',
      totalHours: 10,
      distributeEvenly: false,
      color: COLORS.selfCare
    },
    {
      id: uuidv4(),
      name: 'Proyectos personales',
      totalHours: 6,
      distributeEvenly: false,
      color: COLORS.projects
    }
  ]
};

// Plantilla de estudios
export const studyTemplate: ScheduleConfig = {
  fixedSlots: [
    // Dormir
    {
      id: uuidv4(),
      name: 'Dormir',
      startTime: '23:30',
      endTime: '07:30',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      color: COLORS.sleep
    },
    {
      id: uuidv4(),
      name: 'Dormir',
      startTime: '00:00',
      endTime: '09:00',
      days: ['saturday', 'sunday'],
      color: COLORS.sleep
    },
    // Clases
    {
      id: uuidv4(),
      name: 'Clases de mañana',
      startTime: '09:00',
      endTime: '13:00',
      days: ['monday', 'wednesday', 'friday'],
      color: COLORS.study
    },
    {
      id: uuidv4(),
      name: 'Clases de tarde',
      startTime: '15:00',
      endTime: '19:00',
      days: ['tuesday', 'thursday'],
      color: COLORS.study
    },
    // Comidas
    {
      id: uuidv4(),
      name: 'Desayuno',
      startTime: '08:00',
      endTime: '08:30',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      color: COLORS.meals
    },
    {
      id: uuidv4(),
      name: 'Almuerzo',
      startTime: '13:00',
      endTime: '14:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      color: COLORS.meals
    },
    {
      id: uuidv4(),
      name: 'Cena',
      startTime: '20:00',
      endTime: '21:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      color: COLORS.meals
    },
    // Trabajo en grupo
    {
      id: uuidv4(),
      name: 'Estudio en grupo',
      startTime: '16:00',
      endTime: '18:00',
      days: ['wednesday'],
      color: COLORS.study
    }
  ],
  variableSlots: [
    {
      id: uuidv4(),
      name: 'Estudio individual',
      totalHours: 15,
      distributeEvenly: true,
      color: COLORS.study
    },
    {
      id: uuidv4(),
      name: 'Ejercicio',
      totalHours: 3,
      distributeEvenly: true,
      color: COLORS.exercise
    },
    {
      id: uuidv4(),
      name: 'Tiempo libre',
      totalHours: 10,
      distributeEvenly: false,
      color: COLORS.leisure
    }
  ]
};

// Plantilla de fin de semana/vacaciones
export const weekendTemplate: ScheduleConfig = {
  fixedSlots: [
    // Dormir
    {
      id: uuidv4(),
      name: 'Dormir',
      startTime: '00:00',
      endTime: '09:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      color: COLORS.sleep
    },
    // Comidas
    {
      id: uuidv4(),
      name: 'Desayuno',
      startTime: '09:30',
      endTime: '10:30',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      color: COLORS.meals
    },
    {
      id: uuidv4(),
      name: 'Almuerzo',
      startTime: '14:00',
      endTime: '15:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      color: COLORS.meals
    },
    {
      id: uuidv4(),
      name: 'Cena',
      startTime: '21:00',
      endTime: '22:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      color: COLORS.meals
    }
  ],
  variableSlots: [
    {
      id: uuidv4(),
      name: 'Paseos/Excursiones',
      totalHours: 10,
      distributeEvenly: false,
      color: COLORS.leisure
    },
    {
      id: uuidv4(),
      name: 'Ejercicio',
      totalHours: 4,
      distributeEvenly: true,
      color: COLORS.exercise
    },
    {
      id: uuidv4(),
      name: 'Tiempo con amigos',
      totalHours: 12,
      distributeEvenly: false,
      color: COLORS.family
    },
    {
      id: uuidv4(),
      name: 'Tiempo personal',
      totalHours: 8,
      distributeEvenly: false,
      color: COLORS.selfCare
    },
    {
      id: uuidv4(),
      name: 'Proyectos personales',
      totalHours: 6,
      distributeEvenly: false,
      color: COLORS.projects
    }
  ]
};

// Plantilla de estudio intensivo (para exámenes)
export const examPrepTemplate: ScheduleConfig = {
  fixedSlots: [
    // Dormir
    {
      id: uuidv4(),
      name: 'Dormir',
      startTime: '00:00',
      endTime: '07:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      color: COLORS.sleep
    },
    // Comidas
    {
      id: uuidv4(),
      name: 'Desayuno',
      startTime: '07:00',
      endTime: '07:30',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      color: COLORS.meals
    },
    {
      id: uuidv4(),
      name: 'Almuerzo',
      startTime: '13:00',
      endTime: '13:30',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      color: COLORS.meals
    },
    {
      id: uuidv4(),
      name: 'Cena',
      startTime: '20:00',
      endTime: '20:30',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      color: COLORS.meals
    },
    // Descansos programados
    {
      id: uuidv4(),
      name: 'Descanso',
      startTime: '10:30',
      endTime: '11:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      color: COLORS.selfCare
    },
    {
      id: uuidv4(),
      name: 'Descanso',
      startTime: '16:30',
      endTime: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      color: COLORS.selfCare
    }
  ],
  variableSlots: [
    {
      id: uuidv4(),
      name: 'Estudio materia 1',
      totalHours: 14,
      distributeEvenly: true,
      color: COLORS.study
    },
    {
      id: uuidv4(),
      name: 'Estudio materia 2',
      totalHours: 14,
      distributeEvenly: true,
      color: '#0077b6' // Variación de azul
    },
    {
      id: uuidv4(),
      name: 'Estudio materia 3',
      totalHours: 14,
      distributeEvenly: true,
      color: '#48cae4' // Otra variación de azul
    },
    {
      id: uuidv4(),
      name: 'Ejercicio breve',
      totalHours: 3.5,
      distributeEvenly: true,
      color: COLORS.exercise
    },
    {
      id: uuidv4(),
      name: 'Tiempo de desconexión',
      totalHours: 7,
      distributeEvenly: true,
      color: COLORS.leisure
    }
  ]
};

// Exportar todas las plantillas en un objeto para fácil acceso
export const templates = {
  work: {
    name: 'Trabajo Estándar',
    description: 'Horario para una semana laboral típica de 40 horas',
    template: workTemplate
  },
  study: {
    name: 'Estudiante',
    description: 'Horario para estudiantes con clases y tiempo de estudio',
    template: studyTemplate
  },
  weekend: {
    name: 'Fin de Semana/Vacaciones',
    description: 'Horario relajado para fin de semana o vacaciones',
    template: weekendTemplate
  },
  exam: {
    name: 'Preparación de Exámenes',
    description: 'Horario intensivo para preparación de exámenes',
    template: examPrepTemplate
  }
};
