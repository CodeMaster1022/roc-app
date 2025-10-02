import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import rocLogo from '@/assets/roc-logo.png'
import groupLogo from '@/assets/group-logo.png'

const SignInPage = () => {
  const { login } = useAuth()
  const { t } = useLanguage()
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
      <div className="hidden bg-[#10116B] md:flex md:flex-col p-12 text-white">
        <div className="w-full flex flex-col items-center justify-center h-full">
          <img src={rocLogo} alt="ROC Logo" className="h-24 mb-12 invert brightness-0" />
          <h1 className="text-[24px] font-bold">Find it-Live it-Own it</h1>
          <p className="text-violet-200">
          Properties & Rooms
          </p>
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
            <h1 className="text-3xl font-bold">Sign in</h1>
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
            
            <Button type="submit" className="w-full bg-[#10116B] hover:bg-violet-700 py-6 text-base" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Continuar'}
            </Button>
            <div className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-medium text-[#10116B] hover:text-violet-500"
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

export default SignInPage 