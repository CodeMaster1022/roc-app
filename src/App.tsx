import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

// Import file upload test utility for development
// import "@/utils/fileUploadTest";

// Tenant pages
import Index from "./pages/Index";
import PropertyDetails from "./pages/PropertyDetails";
import NotFound from "./pages/NotFound";

// Hoster pages
import { AppLayout } from "./components/hoster/layout/AppLayout";
import DashboardPage from "./pages/hoster/DashboardPage";
import PropertiesPage from "./pages/hoster/PropertiesPage";
import TenantsPage from "./pages/hoster/TenantsPage";
import TenantDetailPage from "./pages/hoster/TenantDetailPage";
import ProfilePage from "./pages/hoster/ProfilePage";
import { MobileProfilePage } from "./pages/hoster/MobileProfilePage";

// Auth components
import AuthPage from "./components/auth/AuthPage";

const queryClient = new QueryClient();

// Role-based route wrapper
const RoleBasedRoutes = () => {
  const { role, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/property/:id" element={<Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  if (role === 'hoster') {
    return (
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="propiedades" element={<PropertiesPage />} />
          <Route path="inquilinos" element={<TenantsPage />} />
          <Route path="inquilinos/:id" element={<TenantDetailPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route path="perfil-movil" element={<MobileProfilePage />} />
        </Route>
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // Tenant routes
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/property/:id" element={<PropertyDetails />} />
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <LanguageProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <RoleBasedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
