import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileImageUpload } from "@/components/hoster/profile/ProfileImageUpload";
import { useLanguage } from "@/contexts/LanguageContext";
import { Languages, User, Mail, Phone, Edit, Save, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const MobileProfilePage = () => {
  const { t, language, setLanguage } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    firstName: "María",
    lastName: "González",
    email: "maria.gonzalez@email.com",
    phone: "+1 234 567 8900",
    profileImage: null as string | null
  });
  const [editInfo, setEditInfo] = useState(userInfo);

  const handleSave = () => {
    setUserInfo(editInfo);
    setIsEditing(false);
  };

  const handleImageChange = (imageUrl: string | null) => {
    const updatedInfo = { ...userInfo, profileImage: imageUrl };
    setUserInfo(updatedInfo);
    setEditInfo(updatedInfo);
  };

  const handleCancel = () => {
    setEditInfo(userInfo);
    setIsEditing(false);
  };

  const translations = {
    es: {
      title: "Perfil de Usuario",
      description: "Gestiona tu información personal y preferencias",
      personalInfo: "Información Personal",
      firstName: "Nombre",
      lastName: "Apellido",
      email: "Correo Electrónico",
      phone: "Teléfono",
      language: "Idioma",
      spanish: "Español",
      english: "English",
      edit: "Editar",
      save: "Guardar",
      cancel: "Cancelar",
      logout: "Cerrar Sesión"
    },
    en: {
      title: "User Profile",
      description: "Manage your personal information and preferences",
      personalInfo: "Personal Information",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      language: "Language",
      spanish: "Español",
      english: "English",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      logout: "Logout"
    }
  };

  const currentTranslations = translations[language as keyof typeof translations];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <ProfileImageUpload
          currentImage={userInfo.profileImage}
          onImageChange={handleImageChange}
          size="lg"
          className="mx-auto"
          showUploadButton={true}
        />
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {currentTranslations.title}
          </h1>
          <p className="text-muted-foreground mt-2">
            {currentTranslations.description}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {currentTranslations.personalInfo}
          </CardTitle>
          <CardDescription>
            {isEditing ? "Edita tu información" : "Tu información actual"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">{currentTranslations.firstName}</Label>
              <Input
                id="firstName"
                value={isEditing ? editInfo.firstName : userInfo.firstName}
                onChange={(e) => setEditInfo({...editInfo, firstName: e.target.value})}
                disabled={!isEditing}
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">{currentTranslations.lastName}</Label>
              <Input
                id="lastName"
                value={isEditing ? editInfo.lastName : userInfo.lastName}
                onChange={(e) => setEditInfo({...editInfo, lastName: e.target.value})}
                disabled={!isEditing}
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">{currentTranslations.email}</Label>
              <Input
                id="email"
                type="email"
                value={isEditing ? editInfo.email : userInfo.email}
                onChange={(e) => setEditInfo({...editInfo, email: e.target.value})}
                disabled={!isEditing}
                className="bg-background"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">{currentTranslations.phone}</Label>
              <Input
                id="phone"
                type="tel"
                value={isEditing ? editInfo.phone : userInfo.phone}
                onChange={(e) => setEditInfo({...editInfo, phone: e.target.value})}
                disabled={!isEditing}
                className="bg-background"
              />
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="flex-1">
                <Edit className="w-4 h-4 mr-2" />
                {currentTranslations.edit}
              </Button>
            ) : (
              <>
                <Button onClick={handleSave} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {currentTranslations.save}
                </Button>
                <Button onClick={handleCancel} variant="outline" className="flex-1">
                  <X className="w-4 h-4 mr-2" />
                  {currentTranslations.cancel}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            {currentTranslations.language}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant={language === 'es' ? "default" : "outline"}
            onClick={() => setLanguage('es')}
            className="w-full justify-start"
          >
            🇪🇸 {currentTranslations.spanish}
          </Button>
          <Button
            variant={language === 'en' ? "default" : "outline"}
            onClick={() => setLanguage('en')}
            className="w-full justify-start"
          >
            🇺🇸 {currentTranslations.english}
          </Button>
        </CardContent>
      </Card>

      <Separator />

      <Button variant="destructive" className="w-full">
        {currentTranslations.logout}
      </Button>
    </div>
  );
};