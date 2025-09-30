import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link, useNavigate } from 'react-router-dom'
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
    <div className="w-full lg:grid lg:min-h-screen md:grid-cols-[35%_65%]">
      <div className="hidden bg-violet-800 lg:flex lg:flex-col p-12 text-white">
        <div className="w-full flex flex-col items-center justify-center h-full">
          <img src={rocLogo} alt="ROC Logo" className="h-24 mb-12 invert brightness-0" />
          <h1 className="text-[24px] font-bold">Find it-Live it-Own it</h1>
          <p className="text-violet-200">
          Properties & Rooms
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-2 py-12">
            <h1 className="text-3xl font-bold">Sign in</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md text-center">
                {error}
              </div>
            )}
            
            <Button type="submit" className="w-full bg-violet-600 hover:bg-violet-700" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              className="font-medium text-violet-600 hover:text-violet-500"
            >
              Create One
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignInPage 