'use client';

import { useSchedule } from "@/lib/context";
import { Button } from "@/components/ui/button";
import WeeklyCalendar from "./WeeklyCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { exportToCSV, exportToICal } from '@/lib/export';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export default function PlannerPage() {
  const { generateSchedule, schedule } = useSchedule();
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [lastScheduleUpdate, setLastScheduleUpdate] = useState<string>('');
  
  // Detector de cambios para drag & drop
  useEffect(() => {
    if (!schedule) return;
    
    const currentScheduleStr = JSON.stringify(schedule);
    
    // Solo mostrar notificación si no es la carga inicial
    if (lastScheduleUpdate && currentScheduleStr !== lastScheduleUpdate) {
      // Mostrar notificación de éxito
      setNotification({
        message: 'Actividad movida correctamente',
        type: 'success'
      });
      
      // Limpiar la notificación después de 2 segundos
      setTimeout(() => {
        setNotification(null);
      }, 2000);
    }
    
    // Actualizar el último estado conocido
    setLastScheduleUpdate(currentScheduleStr);
  }, [schedule, lastScheduleUpdate]);
  
  const handleRegenerate = () => {
    generateSchedule();
  };
  
  // Manejadores para exportación
  const handleExportCSV = () => {
    if (!schedule) return;
    exportToCSV(schedule);
  };
  
  const handleExportICal = () => {
    if (!schedule) return;
    exportToICal(schedule);
  };

  const handleDownloadPDF = async () => {
    if (!schedule) return;
    
    // Mostrar mensaje de carga
    alert('Generando PDF, por favor espera...');
    
    // Esperar hasta que el siguiente ciclo de renderizado se complete
    setTimeout(async () => {
      try {
        // Mostrar spinner o mensaje durante la generación
        const loadingDiv = document.createElement('div');
        loadingDiv.style.position = 'fixed';
        loadingDiv.style.top = '0';
        loadingDiv.style.left = '0';
        loadingDiv.style.width = '100%';
        loadingDiv.style.height = '100%';
        loadingDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
        loadingDiv.style.display = 'flex';
        loadingDiv.style.justifyContent = 'center';
        loadingDiv.style.alignItems = 'center';
        loadingDiv.style.zIndex = '9999';
        loadingDiv.innerHTML = '<div style="background: white; padding: 20px; border-radius: 8px; text-align: center;"><h3>Generando PDF...</h3><p>Esto puede tardar unos segundos.</p></div>';
        document.body.appendChild(loadingDiv);
        const element = document.getElementById('weekly-calendar');
        if (!element) {
          alert('No se pudo encontrar el calendario para generar el PDF.');
          return;
        }
        
        // Crear una versión "limpia" del calendario para el PDF
        // Crear un contenedor especial para la captura del PDF con proporciones adecuadas
        const containerDiv = document.createElement('div');
        containerDiv.style.width = '2000px'; // Ancho ampliado para asegurar que quepan todos los días
        containerDiv.style.height = '2000px'; // Altura ampliada para asegurar que quepan todas las horas
        containerDiv.style.backgroundColor = 'white';
        containerDiv.style.padding = '10px'; // Padding reducido para maximizar espacio
        containerDiv.style.position = 'absolute';
        containerDiv.style.left = '-9999px';
        containerDiv.style.top = '-9999px';
        containerDiv.style.overflow = 'visible'; // Evitar cortes en el contenido
        
        // Clonar el calendario
        const clone = element.cloneNode(true) as HTMLElement;
        
        // Modificar algunos estilos para optimizar para PDF
        clone.style.fontFamily = 'Arial, sans-serif';
        clone.style.fontSize = '10pt'; // Fuente más grande para mejor legibilidad
        clone.style.transform = 'scale(1)'; // Sin reducción de escala para mantener el tamaño
        
        // Reemplazar cualquier clase con colores que usen oklab por colores hexadecimales standard
        const allColorElements = clone.querySelectorAll('[class*="bg-primary"], [class*="text-primary"], [class*="ring-primary"]');
        allColorElements.forEach((el: HTMLElement) => {
            // Eliminar clases que podrían causar problemas
            if (el.classList.contains('bg-primary')) {
                el.classList.remove('bg-primary');
                el.style.backgroundColor = '#3b82f6'; // Blue 500
            }
            if (el.classList.contains('text-primary')) {
                el.classList.remove('text-primary');
                el.style.color = '#1d4ed8'; // Blue 700
            }
            if (el.classList.contains('ring-primary')) {
                el.classList.remove('ring-primary');
                el.style.outline = '2px solid #3b82f6';
            }
        });
        
        // Forzar los estilos de texto para asegurar que no se corten
        const slots = clone.querySelectorAll('div[style*="position: absolute"]');
        slots.forEach((slot: HTMLElement) => {
          if (slot.style.position === 'absolute') {
            // Asegurar que el texto no se corte
            slot.style.overflow = 'visible';
            const textElements = slot.querySelectorAll('div');
            textElements.forEach((textEl: HTMLElement) => {
              textEl.style.whiteSpace = 'nowrap';
              textEl.style.overflow = 'visible';
              textEl.style.textOverflow = 'initial';
            });
          }
        });
        
        containerDiv.appendChild(clone);
        document.body.appendChild(containerDiv);
        
        // Crear canvas del elemento clonado con escala optimizada para PDF apaisado
        const canvas = await html2canvas(containerDiv, {
          scale: 1.25, // Escala balanceada entre calidad y captura completa
          useCORS: true,
          logging: false,
          allowTaint: true,
          backgroundColor: 'white',
          onclone: (clonedDoc) => {
            // Procesar elementos antes de renderizar
            // 1. Eliminar todas las animaciones y transiciones
            const elementsWithAnimations = clonedDoc.querySelectorAll('[class*="animate-"], [class*="transition-"]');
            elementsWithAnimations.forEach((el: HTMLElement) => {
              el.classList.remove(...Array.from(el.classList).filter(c => c.startsWith('animate-') || c.startsWith('transition-')));
            });
            
            // 2. Reemplazar colores de TailwindCSS por hexadecimales directos
            const tailwindColoredElements = clonedDoc.querySelectorAll('[class*="-primary"], [class*="/"]');
            tailwindColoredElements.forEach((el: HTMLElement) => {
              // Eliminar clases con colores
              el.classList.remove(...Array.from(el.classList).filter(c => c.includes('-primary') || c.includes('/')));
              // Usar colores hexadecimales estándar
              el.style.backgroundColor = el.style.backgroundColor || '#ffffff';
              el.style.color = el.style.color || '#000000';
            });
            
            // 3. Asegurar visibilidad y legibilidad de todos los textos
            const allText = clonedDoc.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6');
            allText.forEach((el: HTMLElement) => {
              el.style.fontFamily = 'Arial, sans-serif';
              if (el.style.color === 'white' || el.style.color === '#ffffff') {
                el.style.textShadow = '0 0 2px black';
              }
            });
            
            // 4. Optimizar slots para PDF
            const slots = clonedDoc.querySelectorAll('div[style*="position: absolute"]');
            slots.forEach((slot: HTMLElement) => {
              slot.style.overflow = 'visible';
              slot.style.zIndex = '1'; // Valor consistente para todos los slots
              
              // Asegurar que el fondo del slot tenga un color sólido (no oklab)
              if (slot.style.backgroundColor && slot.style.backgroundColor.includes('oklab')) {
                // Usar un color predeterminado en su lugar
                slot.style.backgroundColor = '#3b82f6'; // Blue 500
              }
              
              // Mejorar la legibilidad del texto dentro de los slots
              const textElements = slot.querySelectorAll('div');
              textElements.forEach((textEl: HTMLElement) => {
                textEl.style.whiteSpace = 'nowrap';
                textEl.style.overflow = 'visible';
                textEl.style.textOverflow = 'initial';
                textEl.style.fontSize = '9pt'; // Tamaño de letra más grande para mejor legibilidad
              });
            });
          }
        });
        
        // Limpiar después de capturar
        document.body.removeChild(containerDiv);
        
        // Obtener datos de la imagen
        const imgData = canvas.toDataURL('image/png');
        
        // Crear PDF con tamaño personalizado más grande que A3
        const pdf = new jsPDF({
          orientation: 'landscape', // Horizontal para calendario
          unit: 'mm',
          format: [420, 297] // Tamaño personalizado (A2) para asegurar que quepa todo
        });
        
        // Calcular dimensiones para ajustar al PDF
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        // Ajustar para asegurar que se vea todo el contenido
        // Calcular un ratio que tenga en cuenta tanto el ancho como el alto para asegurar que todo sea visible
        // Usamos un factor 0.8 para dejar margen adecuado
        const ratioWidth = pdfWidth / imgWidth;
        const ratioHeight = pdfHeight / imgHeight;
        const ratio = Math.min(ratioWidth, ratioHeight) * 0.85;
        
        // Centrar la imagen horizontalmente pero dejar espacio mínimo arriba para el título
        const x = (pdfWidth - imgWidth * ratio) / 2;
        const y = 25; // Reducir a 25mm en la parte superior para el título
        
        // Añadir título con fuente apropiada para el tamaño de página
        pdf.setFontSize(20); // Fuente más grande para mejor legibilidad
        pdf.text('Planificación Semanal Ritmi', pdfWidth / 2, 15, { align: 'center' });
        
        // Añadir fecha de generación
        const today = new Date().toLocaleDateString();
        pdf.setFontSize(14); // Fuente más grande para mejor legibilidad
        pdf.text(`Generado el ${today}`, pdfWidth / 2, 22, { align: 'center' });
        
        // Agregar imagen optimizada para ajustar en una página
        pdf.addImage(
          imgData, 'PNG', 
          x, y, 
          imgWidth * ratio, 
          imgHeight * ratio, 
          null, null, 
          0, // No rotar
          'FAST' // Optimización
        );
        
        // Guardar PDF
        pdf.save('planificacion-ritmi.pdf');
        
        // Eliminar el div de carga
        document.body.removeChild(loadingDiv);
      } catch (error) {
        // Eliminar el div de carga en caso de error
        const loadingElement = document.querySelector('div[style*="position: fixed"][style*="z-index: 9999"]');
        if (loadingElement && loadingElement.parentNode) {
          loadingElement.parentNode.removeChild(loadingElement);
        }
        
        window.console && console.error('Error al generar el PDF:', error);
        alert('Hubo un error al generar el PDF. Inténtalo de nuevo.');
      }
    }, 1000); // Mayor tiempo de espera para asegurar que todo esté renderizado
  };
  
  return (
    <div className="space-y-6 relative">  
      {/* Notificación de éxito para drag & drop */}
{notification && (
        <div 
          className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transform transition-all duration-300 ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}
          style={{
            animation: 'fadeInOut 2s ease-in-out',
          }}
        >
          <div className="flex items-center">
            {notification.type === 'success' && (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
            {notification.message}
          </div>
        </div>
      )}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Planificación Semanal</CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleRegenerate}>
                Regenerar
              </Button>
              {schedule && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">Exportar</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleDownloadPDF}>
                      Descargar PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportCSV}>
                      Exportar CSV
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportICal}>
                      Exportar iCal (.ics)
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <WeeklyCalendar />
        </CardContent>
      </Card>
      
      {!schedule && (
        <div className="rounded-lg bg-muted p-6 text-center">
          <h3 className="text-lg font-medium mb-2">No hay planificación generada</h3>
          <p className="text-muted-foreground mb-4">
            Configura tus actividades y genera una planificación para verla aquí.
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Ir a Configuración
          </Button>
        </div>
      )}
    </div>
  );
}
