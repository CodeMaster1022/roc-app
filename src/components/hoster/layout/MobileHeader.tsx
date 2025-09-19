import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationPanel } from "@/components/hoster/notifications/NotificationPanel";
import rocLogoCollapsed from "@/assets/roc-logo-collapsed.png";

export const MobileHeader = () => {
  return (
    <header className="bg-background border-b border-border px-4 py-3 md:hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-semibold text-foreground">Hoster</span>
        </div>
        
        <NotificationPanel />
      </div>
    </header>
  );
};