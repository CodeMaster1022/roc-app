import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import rocLogo from '@/assets/roc-logo.png'
import groupLogo from '@/assets/group-logo.png'
const HosterSignInPage = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  
  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await login(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

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
      <div className="flex flex-col min-h-screen md:items-center md:justify-center py-6 px-4 sm:px-6 md:px-8">
        {/* Mobile Header */}
        <div className="md:hidden mb-8">
          <button 
            onClick={() => navigate(-1)}
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

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">Sign In</h1>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-600">Email Address / Phone number</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
                placeholder="Email Address / Phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-600">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                placeholder="Password"
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md text-center">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full bg-[#57007B] hover:bg-blue-700 py-6 text-base" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Continuar'}
            </Button>
            <div className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/hoster/signup" 
                className="font-medium text-[#57007B] hover:text-blue-500"
              >
                Create One
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default HosterSignInPage 