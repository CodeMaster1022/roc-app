import { useState, useEffect } from "react"
import Header from "./Header"
import MobileNavigation from "./MobileNavigation"
import { useIsMobile } from "@/hooks/use-mobile"

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [currentSection, setCurrentSection] = useState("inicio")
  const isMobile = useIsMobile()

  const handleSearch = (query: string) => {
    console.log("Searching for:", query)
    // Implementar lógica de búsqueda
  }

  const handleFilterClick = () => {
    console.log("Open filters")
    // Implementar lógica de filtros
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onSearch={handleSearch} onFilterClick={handleFilterClick} />
      
      <main className={`${isMobile ? 'mobile-nav-height pb-20' : 'desktop-content'}`}>
        {children}
      </main>

      {isMobile && (
        <MobileNavigation 
          currentSection={currentSection} 
          onSectionChange={setCurrentSection} 
        />
      )}
    </div>
  )
}

export default MainLayout