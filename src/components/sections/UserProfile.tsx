import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RocButton } from "@/components/ui/roc-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Mail, Phone, Briefcase, GraduationCap, Building2, Edit, Save, X, LogIn, LogOut, Building, Languages, Camera } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/authService"
import { cn } from "@/lib/utils"

interface UserProfileProps {
  onUpdateProfile?: (data: any) => void
}

const UserProfile = ({ onUpdateProfile }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const { language, setLanguage, t } = useLanguage()
  const { user, updateProfile, logout } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Initialize profile data from auth context
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.profile?.phone || "",
    occupation: user?.profile?.occupation || "estudiante",
    company: user?.profile?.company || "",
    position: user?.profile?.position || "", // Use actual user data
    workEmail: user?.profile?.workEmail || "", // Use actual user data
    workSince: user?.profile?.workSince || "", // Use actual user data
    university: user?.profile?.university || "",
    incomeRange: user?.profile?.incomeRange || "10000-20000", // Use actual user data
    profileImage: user?.profile?.avatar || ""
  })

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: user.profile?.phone || "",
        occupation: user.profile?.occupation || "estudiante",
        company: user.profile?.company || "",
        position: user.profile?.position || "", // Use actual user data
        workEmail: user.profile?.workEmail || "", // Use actual user data
        workSince: user.profile?.workSince || "", // Use actual user data
        university: user.profile?.university || "",
        incomeRange: user.profile?.incomeRange || "10000-20000", // Use actual user data
        profileImage: user.profile?.avatar || ""
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Send all profile fields that exist in the backend schema
      const profileUpdate = {
        phone: profileData.phone,
        occupation: profileData.occupation,
        company: profileData.company,
        university: profileData.university,
        avatar: profileData.profileImage,
        // Extended fields
        position: profileData.position,
        workEmail: profileData.workEmail,
        workSince: profileData.workSince,
        incomeRange: profileData.incomeRange
      }

      console.log('Updating profile with data:', profileUpdate)
      await updateProfile(profileUpdate)
      
      toast({
        title: "Perfil actualizado",
        description: "Tu información ha sido guardada exitosamente.",
      })
      
      setIsEditing(false)
      onUpdateProfile?.(profileData)
    } catch (error: any) {
      console.error('Profile update error:', error)
      toast({
        title: "Error al actualizar",
        description: error.message || "No se pudo actualizar el perfil. Intenta de nuevo.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Revert to original user data
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
        phone: user.profile?.phone || "",
        occupation: user.profile?.occupation || "estudiante",
        company: user.profile?.company || "",
        position: user.profile?.position || "",
        workEmail: user.profile?.workEmail || "",
        workSince: user.profile?.workSince || "",
        university: user.profile?.university || "",
        incomeRange: user.profile?.incomeRange || "10000-20000",
        profileImage: user.profile?.avatar || ""
      })
    }
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión exitosamente.",
    })
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive"
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de archivo inválido",
        description: "Solo se permiten archivos de imagen",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      console.log('Uploading avatar file:', file.name, 'Size:', file.size, 'Type:', file.type)
      const response = await authService.uploadAvatar(file)
      console.log('Avatar upload response:', response)
      
      // Update local profile data with new avatar URL
      setProfileData(prev => ({
        ...prev,
        profileImage: response.data.avatarUrl
      }))

      toast({
        title: "Avatar actualizado",
        description: "Tu foto de perfil ha sido actualizada exitosamente.",
      })
    } catch (error: any) {
      console.error('Avatar upload error:', error)
      toast({
        title: "Error al subir imagen",
        description: error.message || "No se pudo subir la imagen. Intenta de nuevo.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const triggerImageUpload = () => {
    fileInputRef.current?.click()
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!user) return 0
    
    const fields = [
      user.name,
      user.email,
      user.profile?.phone,
      user.profile?.occupation
    ]
    
    const completedFields = fields.filter(field => field && field.trim() !== '').length
    return Math.round((completedFields / fields.length) * 100)
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <User className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Inicia sesión para ver tu perfil</h3>
        <p className="text-muted-foreground mb-6">
          Accede a tu cuenta para gestionar tu información personal
        </p>
        <RocButton onClick={() => window.location.href = '/auth'}>
          <LogIn className="h-4 w-4 mr-2" />
          Iniciar sesión
        </RocButton>
      </div>
    )
  }

  const renderOccupationDetails = () => {
    switch (profileData.occupation) {
      case "profesionista":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  value={profileData.company}
                  onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="position">Puesto</Label>
                <Input
                  id="position"
                  value={profileData.position}
                  onChange={(e) => setProfileData({...profileData, position: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workEmail">Correo institucional</Label>
                <Input
                  id="workEmail"
                  type="email"
                  value={profileData.workEmail}
                  onChange={(e) => setProfileData({...profileData, workEmail: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="workSince">Trabajas ahí desde</Label>
                <Input
                  id="workSince"
                  type="date"
                  value={profileData.workSince}
                  onChange={(e) => setProfileData({...profileData, workSince: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </>
        )
      case "estudiante":
        return (
          <div>
            <Label htmlFor="university">Universidad</Label>
            <Input
              id="university"
              value={profileData.university}
              onChange={(e) => setProfileData({...profileData, university: e.target.value})}
              disabled={!isEditing}
              placeholder="Nombre de tu universidad"
            />
          </div>
        )
      case "emprendedor":
        return (
          <>
            <div>
              <Label htmlFor="company">Nombre del emprendimiento</Label>
              <Input
                id="company"
                value={profileData.company}
                onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="description">¿Qué hace tu emprendimiento?</Label>
              <Textarea
                id="description"
                placeholder="Describe brevemente tu emprendimiento"
                disabled={!isEditing}
              />
            </div>
          </>
        )
      default:
        return null
    }
  }

  const getOccupationIcon = () => {
    switch (profileData.occupation) {
      case "profesionista": return <Briefcase className="h-5 w-5" />
      case "estudiante": return <GraduationCap className="h-5 w-5" />
      case "emprendedor": return <Building2 className="h-5 w-5" />
      default: return <User className="h-5 w-5" />
    }
  }

  return (
    <div className="space-y-6 px-4 pt-6 md:px-0 md:pt-0">
      {/* Mobile Layout */}
      <div className="md:hidden space-y-6">
        {/* Profile Photo - Top Center */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileData.profileImage} alt={profileData.name} />
              <AvatarFallback>
                {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <button
                onClick={triggerImageUpload}
                className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {!isEditing ? (
            <RocButton onClick={() => setIsEditing(true)} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </RocButton>
          ) : (
            <div className="flex gap-2">
              <RocButton onClick={handleSave} size="sm" disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
                <Save className="h-4 w-4 ml-2" />
              </RocButton>
              <RocButton variant="outline" onClick={handleCancel} size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </RocButton>
            </div>
          )}
        </div>

        {/* Información personal */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Información profesional */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getOccupationIcon()}
              Información profesional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="occupation">¿A qué te dedicas?</Label>
              <Select 
                value={profileData.occupation} 
                onValueChange={(value) => setProfileData({...profileData, occupation: value})}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profesionista">Profesionista</SelectItem>
                  <SelectItem value="estudiante">Estudiante</SelectItem>
                  <SelectItem value="emprendedor">Emprendedor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderOccupationDetails()}

            <div>
              <Label htmlFor="incomeRange">Rango de ingresos mensuales</Label>
              <Select 
                value={profileData.incomeRange} 
                onValueChange={(value) => setProfileData({...profileData, incomeRange: value})}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10000-20000">$10,000 - $20,000</SelectItem>
                  <SelectItem value="20000-30000">$20,000 - $30,000</SelectItem>
                  <SelectItem value="30000-50000">$30,000 - $50,000</SelectItem>
                  <SelectItem value="50000-80000">$50,000 - $80,000</SelectItem>
                  <SelectItem value="80000+">$80,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Estado de perfil */}
        <Card className="gradient-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Estado del perfil</h3>
                <p className="text-sm text-muted-foreground">
                  {calculateProfileCompletion() === 100
                    ? "Tu perfil está completo y listo para aplicar" 
                    : "Completa tu perfil para aplicaciones más rápidas"
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold highlight-text">
                  {calculateProfileCompletion()}%
                </div>
                <div className="text-xs text-muted-foreground">completado</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Actions - Bottom */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-4">
            <div className="space-y-3">
              <button
                onClick={() => window.open('https://preview--hoster-haven.lovable.app/', '_blank')}
                className="flex items-center gap-3 w-full p-3 text-left hover:bg-muted rounded-lg transition-colors"
              >
                <LogIn className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{t('profile.login')}</span>
              </button>
              <button
                onClick={() => window.open('https://preview--hoster-haven.lovable.app/', '_blank')}
                className="flex items-center gap-3 w-full p-3 text-left hover:bg-muted rounded-lg transition-colors"
              >
                <Building className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">{t('profile.register_property')}</span>
              </button>
              
              <Separator className="my-3" />
              
              <div className="px-3 py-2">
                <div className="flex items-center gap-3 mb-3">
                  <Languages className="h-5 w-5 text-muted-foreground" />
                  <span className="font-medium text-sm">{t('profile.language')}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setLanguage('es')}
                    className={cn(
                      "flex-1 py-2 px-3 text-sm rounded-md transition-colors",
                      language === 'es' 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {t('language.spanish')}
                  </button>
                  <button
                    onClick={() => setLanguage('en')}
                    className={cn(
                      "flex-1 py-2 px-3 text-sm rounded-md transition-colors",
                      language === 'en' 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {t('language.english')}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{t('profile.title')}</h2>
            <p className="text-muted-foreground">
              {t('profile.subtitle')}
            </p>
          </div>
          
          {!isEditing ? (
            <RocButton onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </RocButton>
          ) : (
            <div className="flex gap-2">
              <RocButton onClick={handleSave} disabled={loading}>
                {loading ? "Guardando..." : "Guardar"}
                <Save className="h-4 w-4 ml-2" />
              </RocButton>
              <RocButton variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </RocButton>
            </div>
          )}
        </div>

        {/* Profile Photo and Info */}
        <Card className="animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileData.profileImage} alt={profileData.name} />
                  <AvatarFallback>
                    {profileData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button
                    onClick={triggerImageUpload}
                    className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg hover:bg-primary/90 transition-colors"
                  >
                    <Camera className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{profileData.name}</h3>
                <p className="text-muted-foreground">{profileData.email}</p>
                <p className="text-sm text-muted-foreground">{profileData.phone}</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Información básica */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información personal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </CardContent>
        </Card>

        {/* Información profesional */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getOccupationIcon()}
              Información profesional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="occupation">¿A qué te dedicas?</Label>
              <Select 
                value={profileData.occupation} 
                onValueChange={(value) => setProfileData({...profileData, occupation: value})}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profesionista">Profesionista</SelectItem>
                  <SelectItem value="estudiante">Estudiante</SelectItem>
                  <SelectItem value="emprendedor">Emprendedor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {renderOccupationDetails()}

            <div>
              <Label htmlFor="incomeRange">Rango de ingresos mensuales</Label>
              <Select 
                value={profileData.incomeRange} 
                onValueChange={(value) => setProfileData({...profileData, incomeRange: value})}
                disabled={!isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10000-20000">$10,000 - $20,000</SelectItem>
                  <SelectItem value="20000-30000">$20,000 - $30,000</SelectItem>
                  <SelectItem value="30000-50000">$30,000 - $50,000</SelectItem>
                  <SelectItem value="50000-80000">$50,000 - $80,000</SelectItem>
                  <SelectItem value="80000+">$80,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Estado de perfil */}
        <Card className="gradient-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Estado del perfil</h3>
                <p className="text-sm text-muted-foreground">
                  {calculateProfileCompletion() === 100
                    ? "Tu perfil está completo y listo para aplicar" 
                    : "Completa tu perfil para aplicaciones más rápidas"
                  }
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold highlight-text">
                  {calculateProfileCompletion()}%
                </div>
                <div className="text-xs text-muted-foreground">completado</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout Section */}
        <Card className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold mb-1">Cerrar sesión</h3>
                <p className="text-sm text-muted-foreground">
                  Cierra tu sesión de forma segura
                </p>
              </div>
              <RocButton 
                variant="outline" 
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </RocButton>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserProfile