import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileHeader } from "./MobileHeader";
import { MobileBottomNav } from "./MobileBottomNav";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export const AppLayout = () => {
  const isMobile = useIsMobile();
  const location = useLocation();
  
  // Detectar si estamos en el detalle de inquilino en mobile
  const isInTenantDetail = isMobile && location.pathname.match(/^\/inquilinos\/[^\/]+$/);

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        {!isInTenantDetail && <MobileHeader />}
        
        <main className={`flex-1 ${isInTenantDetail ? '' : 'p-4 pb-20'}`}>
          <Outlet />
        </main>
        
        {!isInTenantDetail && <MobileBottomNav />}
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};