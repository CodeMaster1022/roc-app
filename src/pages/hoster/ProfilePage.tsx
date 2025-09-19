import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileImageUpload } from "@/components/hoster/profile/ProfileImageUpload";
import { ArrowLeft, User, Edit3, Save, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    firstName: "Juan",
    lastName: "Pérez",
    email: "juan.perez@email.com",
    phone: "+52 55 1234 5678",
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
      title: "Mi Perfil",
      description: "Gestiona tu información personal y configuración de cuenta",
      personalInfo: "Información Personal",
      firstName: "Nombre",
      lastName: "Apellido",
      email: "Correo Electrónico",
      phone: "Teléfono",
      edit: "Editar",
      save: "Guardar",
      cancel: "Cancelar",
      backToDashboard: "Volver al Dashboard"
    },
    en: {
      title: "My Profile",
      description: "Manage your personal information and account settings",
      personalInfo: "Personal Information",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      phone: "Phone",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      backToDashboard: "Back to Dashboard"
    }
  };

  const currentLang = t('header.spanish') === '🇪🇸 Español' ? 'es' : 'en';
  const profileT = translations[currentLang];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with back button */}
      <div className="border-b bg-background px-6 py-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {profileT.backToDashboard}
        </Button>
      </div>

      {/* Profile content */}
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{profileT.title}</h1>
            <p className="text-muted-foreground mt-2">{profileT.description}</p>
          </div>
          
          <ProfileImageUpload
            currentImage={userInfo.profileImage}
            onImageChange={handleImageChange}
            size="lg"
            showUploadButton={true}
          />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {profileT.personalInfo}
                </CardTitle>
              </div>
              
              <div className="flex items-center gap-2">
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    {profileT.edit}
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      {profileT.cancel}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {profileT.save}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{profileT.firstName}</Label>
                <Input
                  id="firstName"
                  value={isEditing ? editInfo.firstName : userInfo.firstName}
                  onChange={(e) => setEditInfo({ ...editInfo, firstName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">{profileT.lastName}</Label>
                <Input
                  id="lastName"
                  value={isEditing ? editInfo.lastName : userInfo.lastName}
                  onChange={(e) => setEditInfo({ ...editInfo, lastName: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{profileT.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={isEditing ? editInfo.email : userInfo.email}
                  onChange={(e) => setEditInfo({ ...editInfo, email: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{profileT.phone}</Label>
                <Input
                  id="phone"
                  value={isEditing ? editInfo.phone : userInfo.phone}
                  onChange={(e) => setEditInfo({ ...editInfo, phone: e.target.value })}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;