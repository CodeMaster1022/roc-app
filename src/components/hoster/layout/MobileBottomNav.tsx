import { Home, Building2, Users, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const MobileBottomNav = () => {
  const { t } = useLanguage();

  const navItems = [
    {
      path: "/",
      icon: Home,
      label: t('sidebar.dashboard')
    },
    {
      path: "/propiedades",
      icon: Building2,
      label: t('sidebar.properties')
    },
    {
      path: "/inquilinos",
      icon: Users,
      label: t('sidebar.tenants')
    },
    {
      path: "/perfil",
      icon: User,
      label: t('header.profile')
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50 md:hidden">
      <div className="flex items-center justify-around px-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) => `
                flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors
                ${isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};