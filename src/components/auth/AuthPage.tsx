import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const AuthPage = () => {
  const navigate = useNavigate()
  
  // Redirect to signin page
  useEffect(() => {
    navigate('/signin', { replace: true })
  }, [navigate])

  return null // Component will redirect before rendering
}
export default AuthPage
