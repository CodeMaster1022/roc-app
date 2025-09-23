import { Home, Heart, FileText, User, Building, ChevronUp, LogIn, Languages, FileSignature } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

interface MobileNavigationProps {
  currentSection: string
  onSectionChange: (section: string) => void
}

const MobileNavigation = ({ currentSection, onSectionChange }: MobileNavigationProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  
  // Helper function to get user initials for fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }
  
  // Different navigation items based on authentication status
  const navItems = isAuthenticated ? [
    { id: "inicio", label: t('nav.inicio'), icon: Home },
    { id: "favoritos", label: t('nav.favoritos'), icon: Heart },
    { id: "hogar", label: t('nav.hogar'), icon: FileText },
  ] : [
    // Simplified navigation for unauthenticated users
    { id: "inicio", label: t('nav.inicio'), icon: Home },
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
        
        {/* Profile/Auth Button - Different for authenticated vs unauthenticated */}
        {isAuthenticated ? (
          // Authenticated user profile button
          <button
            onClick={handleProfileClick}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 transition-all duration-200",
              "relative"
            )}
          >
            <Avatar className="h-6 w-6 mb-1">
              <AvatarImage src={user?.profile?.avatar} alt={user?.name} />
              <AvatarFallback className="text-xs">
                {user?.name ? getUserInitials(user.name) : 'U'}
              </AvatarFallback>
            </Avatar>
            <span className={cn(
              "text-xs font-medium transition-colors",
              currentSection === "perfil" ? "text-primary" : "text-muted-foreground"
            )}>
              {user?.name ? user.name.split(' ')[0] : 'Profile'}
            </span>
            {/* Active indicator */}
            {currentSection === "perfil" && (
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-foreground rounded-full" />
            )}
          </button>
        ) : (
          // Unauthenticated user - Sign In button
          <button
            onClick={() => onSectionChange('perfil')} // This will trigger the auth redirect
            className={cn(
              "flex flex-col items-center justify-center py-1 px-3 transition-all duration-200",
              "relative"
            )}
          >
            <LogIn 
              className="h-6 w-6 mb-1 text-muted-foreground"
            />
            <span className="text-xs font-medium text-muted-foreground">
              Sign In
            </span>
          </button>
        )}

        {/* Language selector for unauthenticated users */}
        {!isAuthenticated && (
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="flex flex-col items-center justify-center py-1 px-3 transition-all duration-200"
          >
            <Languages className="h-6 w-6 mb-1 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">
              {language === 'es' ? 'ES' : 'EN'}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}

export default MobileNavigation