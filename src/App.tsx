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
import PropertiesPage from "./pages/PropertiesPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import NotFound from "./pages/NotFound";

// Hoster pages
import { AppLayout } from "./components/hoster/layout/AppLayout";
import DashboardPage from "./pages/hoster/DashboardPage";
import HosterPropertiesPage from "./pages/hoster/PropertiesPage"; // Aliased import
import PropertyConfigurationPage from "./pages/hoster/PropertyConfigurationPage";
import TenantsPage from "./pages/hoster/TenantsPage";
import TenantDetailPage from "./pages/hoster/TenantDetailPage";
import ProfilePage from "./pages/hoster/ProfilePage";
import { MobileProfilePage } from "./pages/hoster/MobileProfilePage";

// Auth components
import AuthPage from "./components/auth/AuthPage";
import SignInPage from "./components/auth/SignInPage";
import SignUpPage from "./components/auth/SignUpPage";
import HosterSignInPage from "./components/auth/HosterSignInPage";
import HosterSignUpPage from "./components/auth/HosterSignUpPage";

const queryClient = new QueryClient();

// Role-based route wrapper
const RoleBasedRoutes = () => {
  const { role, isAuthenticated } = useAuth();

  // Authenticated hoster routes
  if (isAuthenticated && role === 'hoster') {
    return (
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="properties" element={<HosterPropertiesPage />} />
          <Route path="properties/:id/configure" element={<PropertyConfigurationPage />} />
          <Route path="tenants" element={<TenantsPage />} />
          <Route path="tenants/:id" element={<TenantDetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile-mobile" element={<MobileProfilePage />} />
        </Route>
        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="/signin" element={<Navigate to="/" replace />} />
        <Route path="/signup" element={<Navigate to="/" replace />} />
        <Route path="/hoster/signin" element={<Navigate to="/" replace />} />
        <Route path="/hoster/signup" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // Public routes (accessible to everyone, including unauthenticated users)
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/property/:id" element={<PropertyDetails />} />
      <Route path="/properties" element={<PropertiesPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/hoster/signin" element={<HosterSignInPage />} />
      <Route path="/hoster/signup" element={<HosterSignUpPage />} />
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
