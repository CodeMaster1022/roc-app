import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, User, Languages } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NotificationPanel } from "@/components/hoster/notifications/NotificationPanel";

import rocLogo from "@/assets/roc-logo.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";

export const Header = () => {
  const { t, language, setLanguage } = useLanguage();
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b bg-background px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
        </div>

        <div className="flex items-center gap-4">
          <NotificationPanel />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Avatar className="w-8 h-8">
                  <AvatarFallback>
                    <User className="w-4 h-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/perfil")}>
                {t('header.profile')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                {t('header.language')}
              </DropdownMenuLabel>
              <DropdownMenuItem 
                onClick={() => setLanguage('es')}
                className={language === 'es' ? "bg-muted" : ""}
              >
                🇪🇸 {t('header.spanish')}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setLanguage('en')}
                className={language === 'en' ? "bg-muted" : ""}
              >
                🇺🇸 {t('header.english')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>{t('header.logout')}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
