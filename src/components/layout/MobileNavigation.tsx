import { Home, Heart, FileText, User, Building, ChevronUp, LogIn, Languages, FileSignature } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Separator } from "@/components/ui/separator"

interface MobileNavigationProps {
  currentSection: string
  onSectionChange: (section: string) => void
}

const MobileNavigation = ({ currentSection, onSectionChange }: MobileNavigationProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  
  const navItems = [
    { id: "inicio", label: t('nav.inicio'), icon: Home },
    { id: "favoritos", label: t('nav.favoritos'), icon: Heart },
    { id: "contratos", label: "Contratos", icon: FileSignature },
    { id: "hogar", label: t('nav.hogar'), icon: FileText },
  ]

  const handleProfileClick = () => {
    onSectionChange('perfil')
  }

  const handleProfileOptionClick = (action: 'profile' | 'register') => {
    if (action === 'profile') {
      onSectionChange('perfil')
    } else {
      window.open('https://preview--hoster-haven.lovable.app/', '_blank')
    }
    setShowProfileMenu(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border md:hidden z-50">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentSection === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center py-1 px-3 transition-all duration-200",
                "relative"
              )}
            >
              <Icon 
                className={cn(
                  "h-6 w-6 mb-1 transition-colors", 
                  isActive 
                    ? "text-primary fill-current" 
                    : "text-muted-foreground"
                )} 
              />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-foreground rounded-full" />
              )}
            </button>
          )
        })}
        
        {/* Profile Button with Menu */}
        <button
          onClick={handleProfileClick}
          className={cn(
            "flex flex-col items-center justify-center py-1 px-3 transition-all duration-200",
            "relative"
          )}
        >
          <User 
            className={cn(
              "h-6 w-6 mb-1 transition-colors", 
              currentSection === "perfil"
                ? "text-primary fill-current" 
                : "text-muted-foreground"
            )} 
          />
          <span className={cn(
            "text-xs font-medium transition-colors",
            currentSection === "perfil" ? "text-primary" : "text-muted-foreground"
          )}>
            {t('nav.perfil')}
          </span>
          {/* Active indicator */}
          {currentSection === "perfil" && (
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-foreground rounded-full" />
          )}
        </button>
      </div>
    </div>
  )
}

export default MobileNavigation