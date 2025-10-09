import { Search, Filter, Menu, ChevronDown } from "lucide-react"
import { RocButton } from "@/components/ui/roc-button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { Link } from "react-router-dom"
import rocLogo from "@/assets/roc-logo.png"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu"

interface HeaderProps {
  onSearch: (query: string) => void
  onFilterClick: () => void
}

const Header = ({ onSearch, onFilterClick }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("")
  const { t, language, setLanguage } = useLanguage()
  const { user, isAuthenticated } = useAuth()
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  // Helper function to get user initials for fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('')
  }

  return (
    <header className="bg-background border-b border-border sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link to="/">
              <img src={rocLogo} alt="ROC Logo" className="h-24 w-auto cursor-pointer hover:opacity-80 transition-opacity" loading="lazy" />
            </Link>
            <nav className="flex space-x-6">
              <a href="#" className="text-foreground hover:text-primary transition-colors">{t('nav.inicio')}</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">{t('nav.favoritos')}</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">{t('nav.hogar')}</a>
              <a href="#" className="text-foreground hover:text-primary transition-colors">{t('nav.perfil')}</a>
            </nav>
          </div>
          
            <div className="flex items-center gap-2 flex-1 max-w-xl mx-8">
              <form onSubmit={handleSearch} className="flex items-center space-x-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <RocButton type="button" variant="outline" size="icon" onClick={onFilterClick}>
                  <Filter className="h-4 w-4" />
                </RocButton>
              </form>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <RocButton variant="outline" className="flex items-center gap-2">
                    {isAuthenticated && user ? (
                      <>
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.profile?.avatar} alt={user.name} />
                          <AvatarFallback className="text-xs">
                            {getUserInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="hidden sm:inline">{user.name}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('nav.perfil')}</span>
                      </>
                    )}
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </RocButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  {isAuthenticated ? (
                    <>
                      <DropdownMenuItem>{t('profile.dashboard')}</DropdownMenuItem>
                      <DropdownMenuItem>{t('profile.settings')}</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>{t('profile.logout')}</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem>{t('profile.login')}</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open('/hoster/signup', '_blank', 'noopener,noreferrer')}>{t('profile.register_property')}</DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>{t('profile.language')}</DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={language} onValueChange={(val) => setLanguage(val as 'es' | 'en')}>
                    <DropdownMenuRadioItem value="es">{t('language.spanish')}</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="en">{t('language.english')}</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </div>

        {/* Mobile Header */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <img 
              src={rocLogo} 
              alt="ROC Logo" 
              className="h-24 w-auto"
            />
            <RocButton variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </RocButton>
          </div>
          
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <RocButton type="button" variant="outline" size="icon" onClick={onFilterClick}>
              <Filter className="h-4 w-4" />
            </RocButton>
          </form>
        </div>
      </div>
    </header>
  )
}

export default Header