'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

interface MainLayoutProps {
  children?: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string>("config");

  // Sincronizar el tab activo con la ruta actual
  useEffect(() => {
    if (pathname === "/planner") {
      setActiveTab("planner");
    } else if (pathname === "/analysis") {
      setActiveTab("analysis");
    } else {
      setActiveTab("config");
    }
  }, [pathname]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "config") {
      router.push("/");
    } else if (value === "planner") {
      router.push("/planner");
    } else if (value === "analysis") {
      router.push("/analysis");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1"></div> {/* Espaciador izquierdo */}
          <div className="flex-1 text-center">
            <h1 className="text-3xl font-bold mb-2">Ritmi</h1>
            <p className="text-muted-foreground">Planificación semanal inteligente</p>
          </div>
          <div className="flex-1 flex justify-end">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="config">Configuración</TabsTrigger>
          <TabsTrigger value="planner">Planificación</TabsTrigger>
          <TabsTrigger value="analysis">Análisis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config" className="mt-0">
          {activeTab === 'config' && children}
        </TabsContent>
        
        <TabsContent value="planner" className="mt-0">
          {activeTab === 'planner' && children}
        </TabsContent>

        <TabsContent value="analysis" className="mt-0">
          {activeTab === 'analysis' && children}
        </TabsContent>
      </Tabs>
    </div>
  );
}
