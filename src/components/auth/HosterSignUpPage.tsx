import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Building } from 'lucide-react'
import rocLogo from '@/assets/roc-logo.png'
import groupLogo from '@/assets/group-logo.png'

const HosterSignUpPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    gender: "",
    password: "",
    confirmPassword: "",
    role: "hoster",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.password || !formData.confirmPassword) {
      setError("Please fill in all password fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate("/");
    } catch (error: any) {
      setError(error.message || "Failed to sign up");
      console.error("Failed to sign up", error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    setError("");
    if (step === 1) {
      if (!formData.name || !formData.email || !formData.phone) {
        setError("Please fill in all fields.");
        return;
      }
    } else if (step === 2) {
      if (!formData.birthday || !formData.gender) {
        setError("Please fill in all fields.");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  // Check if current step fields are filled
  const isStep1Valid = formData.name.trim() !== "" && formData.email.trim() !== "" && formData.phone.trim() !== "";
  const isStep2Valid = formData.birthday !== "" && formData.gender !== "";
  const isStep3Valid = formData.password !== "" && formData.confirmPassword !== "";

  return (
    <div className="w-full md:grid md:min-h-screen md:grid-cols-[35%_65%]">
      <div className="hidden bg-[#57007B] lg:flex lg:flex-col py-8 px-6 lg:py-12 lg:pl-8 xl:pl-12 text-white justify-between items-center">
        <div className="w-full">
          <img src={rocLogo} alt="ROC Logo" className="h-12 lg:h-16 xl:h-20 mb-8 lg:mb-12 invert brightness-0" />
          <p className="text-blue-300 mb-3 lg:mb-4 text-sm lg:text-base">The New Standard for Property Management</p>
          <h1 className="text-2xl lg:text-4xl xl:text-5xl font-bold">Manage Properties</h1>
          <h1 className="text-2xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6">Verified Tenants</h1>
          <p className="text-blue-200 text-sm lg:text-base xl:text-lg leading-relaxed">
            All-in-one platform for property owners to list, manage, and grow their rental business
          </p>
        </div>
        <div className="flex flex-col w-full items-end justify-end relative">
          <img 
            src={groupLogo} 
            alt="Group Logo" 
            className="max-w-full h-auto object-contain lg:h-[250px] lg:w-[280px] xl:h-[320px] xl:w-[350px] 2xl:h-[380px] 2xl:w-[390px] transform lg:translate-x-[20px] lg:-translate-y-[30px] xl:translate-x-[30px] xl:-translate-y-[40px] 2xl:translate-x-[60px] 2xl:-translate-y-[20px]" 
          />
        </div>
      </div>
      <div className="flex flex-col min-h-screen lg:items-center lg:justify-center py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-8 xl:px-12">
        {/* Mobile Header */}
        <div className="lg:hidden mb-6 sm:mb-8">
          <button 
            onClick={() => step === 1 ? navigate(-1) : prevStep()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
        </div>

        <div className="mx-auto flex flex-col w-full max-w-sm lg:max-w-md xl:max-w-lg space-y-6 lg:space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-6 sm:mb-8">
            <img src={rocLogo} alt="ROC Logo" className="h-16 sm:h-20" />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">Create account</h1>
            </div>
            <p className="text-balance text-muted-foreground text-sm sm:text-base">
              Create your account to start listing and managing properties
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4 lg:gap-6">
            {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
            {step === 1 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-gray-600">Full Name</Label>
                  <Input 
                    id="name" 
                    type="text" 
                    placeholder="John Doe" 
                    required 
                    value={formData.name} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-gray-600">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    required 
                    value={formData.email} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-gray-600">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+1234567890" 
                    required 
                    value={formData.phone} 
                    onChange={handleChange} 
                  />
                </div>

                <Button 
                  type="button" 
                  onClick={nextStep} 
                  className="w-full bg-[#57007B] hover:bg-blue-700 py-4 sm:py-6 text-sm sm:text-base lg:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!isStep1Valid}
                >
                  Continuar
                </Button>
                <div className="text-center text-xs sm:text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/hoster/signin" className="font-medium text-[#57007B] hover:text-blue-500">
                    Sign in
                  </Link>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="birthday" className="text-gray-600">Birthday</Label>
                  <Input 
                    id="birthday" 
                    type="date" 
                    required 
                    value={formData.birthday} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gender" className="text-gray-600">Gender</Label>
                  <Select onValueChange={(value) => handleSelectChange("gender", value)} value={formData.gender}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center text-xs sm:text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/hoster/signin" className="font-medium text-[#57007B] hover:text-blue-500">
                    Sign in
                  </Link>
                </div>

                <div className="flex justify-between gap-3 sm:gap-4">
                  <Button type="button" onClick={prevStep} variant="outline" className="w-full py-4 sm:py-6 text-sm sm:text-base hidden lg:flex">
                    Previous
                  </Button>
                  <Button 
                    type="button" 
                    onClick={nextStep} 
                    className="w-full bg-[#57007B] hover:bg-blue-700 py-4 sm:py-6 text-sm sm:text-base lg:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isStep2Valid}
                  >
                    Continuar
                  </Button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-gray-600">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Password"
                    required 
                    value={formData.password} 
                    onChange={handleChange} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword" className="text-gray-600">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="Confirm Password"
                    required 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                  />
                </div>

                <div className="text-center text-xs sm:text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/hoster/signin" className="font-medium text-[#57007B] hover:text-blue-500">
                    Sign in
                  </Link>
                </div>

                <div className="flex justify-between gap-3 sm:gap-4">
                  <Button type="button" onClick={prevStep} variant="outline" className="w-full py-4 sm:py-6 text-sm sm:text-base hidden lg:flex">
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    className="w-full bg-[#57007B] hover:bg-blue-700 py-4 sm:py-6 text-sm sm:text-base lg:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading || !isStep3Valid || formData.password !== formData.confirmPassword}
                  >
                    {isLoading ? "Creating Account..." : "Continuar"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default HosterSignUpPage; 