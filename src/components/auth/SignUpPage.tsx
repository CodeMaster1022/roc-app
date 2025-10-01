import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from 'lucide-react'
import rocLogo from '@/assets/roc-logo.png'
import groupLogo from '@/assets/group-logo.png'

const SignUpPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    gender: "",
    password: "",
    confirmPassword: "",
    role: "tenant",
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
      const { confirmPassword, role, ...registerData } = formData;
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

  return (
    <div className="w-full md:grid md:min-h-screen md:grid-cols-[35%_65%]">
      <div className="hidden bg-[#57007B] md:flex md:flex-col py-12 pl-12 text-white justify-between items-center">
        <div className="w-full">
          <img src={rocLogo} alt="ROC Logo" className="h-16 mb-12 invert brightness-0" />
          <p className="text-violet-300 mb-4">The New Standard for Housing</p>
          <h1 className="text-4xl font-bold">Verified tenants</h1>
          <h1 className="text-4xl font-bold mb-6">Complete management</h1>
          <p className="text-violet-200">
            All-in-one solution for safe, simple property management
          </p>
        </div>
        <div className="flex flex-col w-full items-end justify-end relative">
          <img 
            src={groupLogo} 
            alt="Group Logo" 
            className="max-w-full h-auto object-contain lg:h-[300px] lg:w-[330px] xl:h-[350px] xl:w-[380px] 2xl:h-[400px] 2xl:w-[430px] transform lg:translate-x-[30px] lg:-translate-y-[50px] xl:translate-x-[40px] xl:-translate-y-[60px]" 
          />
        </div>
      </div>
      <div className="flex flex-col min-h-screen md:items-center md:justify-center py-6 px-4 sm:px-6 md:px-8">
        {/* Mobile Header */}
        <div className="md:hidden mb-8">
          <button 
            onClick={() => step === 1 ? navigate(-1) : prevStep()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>

        <div className="mx-auto flex flex-col w-full max-w-sm space-y-8">
          {/* Mobile Logo */}
          <div className="md:hidden flex justify-center mb-8">
            <img src={rocLogo} alt="ROC Logo" className="h-20" />
          </div>

          <div className="grid gap-2">
            <h1 className="text-3xl font-bold">Sign Up</h1>
            <p className="text-balance text-muted-foreground">
              Enter your information to create an account
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
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

                <Button type="button" onClick={nextStep} className="w-full bg-[#57007B] hover:bg-violet-700 py-6 text-base">
                  Continuar
                </Button>
                <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/signin" className="font-medium text-[#57007B] hover:text-violet-500">
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

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/signin" className="font-medium text-violet-600 hover:text-violet-500">
                    Sign in
                  </Link>
                </div>

                <div className="flex justify-between gap-4">
                  <Button type="button" onClick={prevStep} variant="outline" className="w-full py-6 hidden md:flex">
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep} className="w-full bg-[#57007B] hover:bg-violet-700 py-6 text-base">
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
                <div className="grid gap-2">
                  <Label htmlFor="role" className="text-gray-600">Role</Label>
                  <Select onValueChange={(value) => handleSelectChange("role", value)} value={formData.role}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="hoster">Hoster</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/signin" className="font-medium text-[#57007B] hover:text-violet-500">
                    Sign in
                  </Link>
                </div>

                <div className="flex justify-between gap-4">
                  <Button type="button" onClick={prevStep} variant="outline" className="w-full py-6 hidden md:flex">
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    className="w-full bg-[#57007B] hover:bg-violet-700 py-6 text-base"
                    disabled={isLoading}
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

export default SignUpPage; 