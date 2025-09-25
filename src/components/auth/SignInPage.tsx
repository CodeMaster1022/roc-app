import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Mail, Lock } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import rocLogo from '@/assets/roc-logo.png'

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
    <div className="min-h-screen flex">
      {/* Left side - Login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 bg-white">
        <Card className="w-full max-w-md border-none shadow-none">
          <CardHeader className="text-center space-y-6">
            <img src={rocLogo} alt="ROC Logo" className="h-12 mx-auto" />
            <div>
              <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
              <CardDescription>
                Enter your email and password
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              {error && (
                <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}
              
              <Button type="submit" className="w-full bg-[#7C3AED] hover:bg-[#6D28D9]" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
                >
                  Create one
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side - Features */}
      <div className="hidden md:flex w-1/2 bg-gray-50 p-12 flex-col justify-center">
        <div className="max-w-lg mx-auto">
          <h2 className="text-3xl font-bold mb-2">
            Descubre la <span className="text-[#7C3AED]">diferencia</span> ROC
          </h2>
          <p className="text-gray-600 mb-8">
            Renta tu propiedad y administrala <span className="text-[#7C3AED]">todo dentro de un mismo lugar</span>
          </p>

          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#7C3AED] rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Verified tenants</h3>
                <p className="text-gray-600">We screen background, financial capacity, and compatibility with your rules —giving you peace of mind.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#7C3AED] rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Earn more, cut vacancy</h3>
                <p className="text-gray-600">Maximize revenue by keeping your spaces filled with reliable tenants.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#7C3AED] rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Complete management</h3>
                <p className="text-gray-600">Contracts, payments, and communication all in one place, hassle-free.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-2 bg-[#7C3AED] rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Predictable income</h3>
                <p className="text-gray-600">Lower risk, more stability: safe and on-time payments every month.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignInPage 