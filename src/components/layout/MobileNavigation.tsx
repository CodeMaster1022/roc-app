import { Home, Heart, FileText, User, Building, ChevronUp, LogIn, Languages, FileSignature } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface MobileNavigationProps {
  currentSection: string
  onSectionChange: (section: string) => void
}

const MobileNavigation = ({ currentSection, onSectionChange }: MobileNavigationProps) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  
  // Helper function to get user initials for fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }
  
  // Navigation items - same for all users to maintain product feel
  const navItems = [
    { id: "inicio", label: t('nav.inicio'), icon: Home },
    { id: "favoritos", label: t('nav.favoritos'), icon: Heart },
    { id: "hogar", label: t('nav.hogar'), icon: FileText },
  ]

  const handleProfileClick = () => {
    onSectionChange('perfil')
  }

  const handleProfileOptionClick = (action: 'profile' | 'register') => {
    if (action === 'profile') {
      onSectionChange('perfil')
    } else {
      navigate('/hoster/signup')
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
          // Unauthenticated user - Profile split button with sheet
          <Sheet>
            <SheetTrigger asChild>
              <button className={cn(
              "flex flex-col items-center justify-center py-1 px-3 transition-all duration-200",
              "relative"
              )}>
                <User 
              className="h-6 w-6 mb-1 text-muted-foreground"
            />
            <span className="text-xs font-medium text-muted-foreground">
                  Profile
            </span>
          </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-auto">
              <SheetHeader>
                <SheetTitle>Profile Options</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-4">
                <button
                  onClick={() => {
                    navigate('/signin')
                    setShowProfileMenu(false)
                  }}
                  className="flex items-center gap-3 p-4 text-left hover:bg-muted rounded-lg transition-colors"
                >
                  <LogIn className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Sign In / Sign Up</div>
                    <div className="text-sm text-muted-foreground">Access your account or create one</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    navigate('/hoster/signup')
                    setShowProfileMenu(false)
                  }}
                  className="flex items-center gap-3 p-4 text-left hover:bg-muted rounded-lg transition-colors"
                >
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Register Property</div>
                    <div className="text-sm text-muted-foreground">List your property for rent</div>
                  </div>
                </button>
                <Separator />
                <div className="px-4">
                  <div className="font-medium mb-3">Language</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setLanguage('es')
                        setShowProfileMenu(false)
                      }}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg transition-colors border",
                        language === 'es' 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "hover:bg-muted border-border"
                      )}
                    >
                      🇪🇸 Español
                    </button>
          <button
                      onClick={() => {
                        setLanguage('en')
                        setShowProfileMenu(false)
                      }}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg transition-colors border",
                        language === 'en' 
                          ? "bg-primary text-primary-foreground border-primary" 
                          : "hover:bg-muted border-border"
                      )}
                    >
                      🇺🇸 English
          </button>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  )
}

export default MobileNavigation