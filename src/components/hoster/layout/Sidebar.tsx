import { NavLink, useLocation } from "react-router-dom";
import { Building2, BarChart3, Users } from "lucide-react";
import rocLogo from "@/assets/roc-logo.png";
import rocLogoCollapsed from "@/assets/roc-logo-collapsed.png";
import {
  Sidebar as SidebarWrapper,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLanguage } from "@/contexts/LanguageContext";

export const Sidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useLanguage();
  
  const collapsed = state === "collapsed";

  const isActive = (path: string) => currentPath === path;

  const operationItems = [
    { title: t('sidebar.dashboard') || 'Dashboard', url: "/", icon: BarChart3 },
    { title: t('sidebar.tenants') || 'Inquilinos', url: "/inquilinos", icon: Users },
  ];

  const offerItems = [
    { title: t('sidebar.properties') || 'Propiedades', url: "/propiedades", icon: Building2 },
  ];

  return (
    <SidebarWrapper collapsible="icon">
      <SidebarContent>
        {/* Logo Section */}
        <div className={`flex items-center justify-center ${collapsed ? 'p-2' : 'p-4'} border-b`}>
          {collapsed ? (
            <img src={rocLogoCollapsed} alt="ROC" className="w-12 h-12" />
          ) : (
            <img src={rocLogo} alt="ROC" className="w-20 h-20" />
          )}
        </div>

        {/* Operations Section */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('sidebar.operation') || 'OPERACIÓN'}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {operationItems.map((item) => {
                const Icon = item.icon;
                const itemIsActive = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={itemIsActive}>
                      <NavLink
                        to={item.url}
                        end
                        className="flex items-center gap-3"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Offer Section */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {t('sidebar.offer') || 'OFERTA'}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {offerItems.map((item) => {
                const Icon = item.icon;
                const itemIsActive = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={itemIsActive}>
                      <NavLink
                        to={item.url}
                        end
                        className="flex items-center gap-3"
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarWrapper>
  );
};
