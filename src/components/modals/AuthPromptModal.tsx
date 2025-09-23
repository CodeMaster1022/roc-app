import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { RocButton } from "@/components/ui/roc-button"
import { LogIn, X } from "lucide-react"
import { useLanguage } from "@/contexts/LanguageContext"

interface AuthPromptModalProps {
  isOpen: boolean
  onClose: () => void
  onLogin: () => void
  title?: string
  description?: string
  actionText?: string
}

const AuthPromptModal = ({
  isOpen,
  onClose,
  onLogin,
  title = "Authentication Required",
  description = "You need to sign in to continue with your application.",
  actionText = "Sign In to Continue"
}: AuthPromptModalProps) => {
  const { t } = useLanguage()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <LogIn className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  {title}
                </DialogTitle>
              </div>
            </div>
            {/* <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button> */}
          </div>
        </DialogHeader>
        
        <div className="py-4">
          <DialogDescription className="text-gray-600 text-base leading-relaxed">
            {description}
          </DialogDescription>
          
          <div className="mt-6 space-y-3">
            <RocButton 
              onClick={onLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {actionText}
            </RocButton>
            
            <RocButton 
              variant="outline"
              onClick={onClose}
              className="w-full py-3"
            >
              Maybe Later
            </RocButton>
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{" "}
              <button 
                onClick={onLogin}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AuthPromptModal 