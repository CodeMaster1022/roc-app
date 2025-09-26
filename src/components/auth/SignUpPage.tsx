import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import rocLogo from '@/assets/roc-logo.png'

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
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-violet-800 lg:flex lg:flex-col items-center justify-center p-12 text-white">
        <div className="max-w-sm">
          <img src={rocLogo} alt="ROC Logo" className="h-10 mb-12 invert brightness-0" />
          <p className="text-violet-300 mb-4">The New Standard for Housing</p>
          <h1 className="text-4xl font-bold">Verified tenants</h1>
          <h1 className="text-4xl font-bold mb-6">Complete management</h1>
          <p className="text-violet-200">
            All-in-one solution for safe, simple property management
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="grid gap-2 text-center">
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
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" type="text" placeholder="John Doe" required value={formData.name} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" required value={formData.email} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="+1234567890" required value={formData.phone} onChange={handleChange} />
                </div>
                <Button type="button" onClick={nextStep} className="w-full bg-violet-600 hover:bg-violet-700">
                  Next
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input id="birthday" type="date" required value={formData.birthday} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="gender">Gender</Label>
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
                <div className="flex justify-between gap-4">
                  <Button type="button" onClick={prevStep} variant="outline" className="w-full">
                    Previous
                  </Button>
                  <Button type="button" onClick={nextStep} className="w-full bg-violet-600 hover:bg-violet-700">
                    Next
                  </Button>
                </div>
              </>
            )}
            {step === 3 && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={formData.password} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" required value={formData.confirmPassword} onChange={handleChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
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
                <div className="flex justify-between gap-4">
                  <Button type="button" onClick={prevStep} variant="outline" className="w-full">
                    Previous
                  </Button>
                  <Button
                    type="submit"
                    className="w-full bg-violet-600 hover:bg-violet-700"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
                  </Button>
                </div>
              </>
            )}
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/signin" className="font-medium text-violet-600 hover:text-violet-500">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage; 