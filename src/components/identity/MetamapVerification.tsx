import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import './metamap-styles.css'
import { RocButton } from '@/components/ui/roc-button'
import { Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useLanguage } from '@/contexts/LanguageContext'

// Metamap SDK types
declare global {
  interface Window {
    metamapSdk: any
    Mati: any
  }
}

export interface MetamapVerificationResult {
  verificationId: string
  status: 'completed' | 'failed' | 'cancelled'
  identityId?: string
  metadata?: any
}

interface MetamapVerificationProps {
  applicationType: 'student' | 'professional' | 'entrepreneur'
  paymentResponsible?: 'student' | 'guardian'
  onVerificationComplete: (result: MetamapVerificationResult) => void
  onBack: () => void
  isLoading?: boolean
  onHideModal?: () => void
  onShowModal?: () => void
}

export const MetamapVerification: React.FC<MetamapVerificationProps> = ({
  applicationType,
  paymentResponsible,
  onVerificationComplete,
  onBack,
  isLoading = false,
  onHideModal,
  onShowModal
}) => {
  const { toast } = useToast()
  const { t } = useLanguage()
  const metamapButtonRef = useRef<HTMLDivElement>(null)
  const [sdkLoaded, setSdkLoaded] = useState(false)
  const [sdkLoading, setSdkLoading] = useState(true)
  const [verificationInProgress, setVerificationInProgress] = useState(false)
  const [currentStep, setCurrentStep] = useState<'guardian' | 'student' | 'completed'>('student')
  const [verificationResults, setVerificationResults] = useState<{
    guardian?: MetamapVerificationResult
    student?: MetamapVerificationResult
  }>({})
  const [loadingMessage, setLoadingMessage] = useState('Initializing verification service...')

  // Try different credential formats
  const clientId = import.meta.env.VITE_METAMAP_CLIENT_ID || 
                   import.meta.env.VITE_METAMAP_MERCHANT_ID || 
                   '68e4b8d96947f5373f697efc'
  const flowId = import.meta.env.VITE_METAMAP_FLOW_ID || 
                 import.meta.env.VITE_METAMAP_WORKFLOW_ID || 
                 '68e4b8d96947f5373f697efc'

  // Load Metamap SDK
  useEffect(() => {
    if (!clientId || !flowId) {
      console.error('Metamap configuration missing. Please set VITE_METAMAP_CLIENT_ID and VITE_METAMAP_FLOW_ID')
      toast({
        title: 'Configuration Error',
        description: 'Identity verification is not properly configured. Please contact support.',
        variant: 'destructive'
      })
      return
    }

    // Debug logging for credentials
    console.log('🔍 Metamap Debug Info:', {
      clientId: clientId ? `${clientId.substring(0, 8)}...` : 'missing',
      flowId: flowId ? `${flowId.substring(0, 8)}...` : 'missing',
      environment: 'production'
    })

    const loadMetamapSDK = () => {
      if (window.metamapSdk || window.Mati) {
        setSdkLoaded(true)
        setSdkLoading(false)
        setLoadingMessage('SDK ready')
        return
      }

      // Try multiple SDK URLs as fallbacks
      const sdkUrls = [
        'https://sdk.getmati.com/web',
        'https://web-button.metamap.com/button.js',
        'https://cdn.metamap.com/sdk/web/v1/button.js'
      ]

      let currentUrlIndex = 0

      const tryLoadSDK = () => {
        if (currentUrlIndex >= sdkUrls.length) {
          console.error('All Metamap SDK URLs failed to load')
          setSdkLoading(false)
          setLoadingMessage('Failed to load verification service')
          toast({
            title: 'SDK Load Error',
            description: 'Failed to load identity verification service. Please check your internet connection and try again.',
            variant: 'destructive'
          })
          return
        }

        setLoadingMessage(`Loading verification service... (${currentUrlIndex + 1}/${sdkUrls.length})`)

        const script = document.createElement('script')
        script.src = sdkUrls[currentUrlIndex]
        script.async = true
        
        script.onload = () => {
          console.log(`✅ Metamap SDK loaded from: ${sdkUrls[currentUrlIndex]}`)
          setSdkLoaded(true)
          setSdkLoading(false)
          setLoadingMessage('Verification service ready')
        }
        
        script.onerror = () => {
          console.warn(`❌ Failed to load SDK from: ${sdkUrls[currentUrlIndex]}`)
          currentUrlIndex++
          // Remove failed script
          document.head.removeChild(script)
          // Try next URL
          setTimeout(tryLoadSDK, 1000)
        }
        
        document.head.appendChild(script)
      }

      tryLoadSDK()
    }

    loadMetamapSDK()
  }, [clientId, flowId, toast])

  // Initialize Metamap button when SDK is loaded
  useEffect(() => {
    if (!sdkLoaded || !metamapButtonRef.current) return

    const initializeMetamapButton = () => {
      if (!metamapButtonRef.current) return

      // Clear previous button
      metamapButtonRef.current.innerHTML = ''

      // Create metamap button element - try different approaches
      let metamapButton
      
      // Try the newer metamap-button element
      if (window.customElements && window.customElements.get('metamap-button')) {
        metamapButton = document.createElement('metamap-button')
        metamapButton.setAttribute('clientid', clientId)
        metamapButton.setAttribute('flowid', flowId)
      }
      // Try the legacy mati-button element
      else if (window.customElements && window.customElements.get('mati-button')) {
        metamapButton = document.createElement('mati-button')
        metamapButton.setAttribute('clientid', clientId)
        metamapButton.setAttribute('flowid', flowId)
      }
      // Fallback: create a div and initialize manually
      else {
        metamapButton = document.createElement('div')
        metamapButton.id = 'metamap-mount-' + Date.now()
        
        // Try to initialize with JavaScript API if available
        setTimeout(() => {
          if (window.Mati) {
            window.Mati.init({
              clientId: clientId,
              flowId: flowId,
              element: metamapButton
            })
          }
        }, 100)
      }
      
      // Set metadata based on current step and user type
      const metadata = {
        applicationType,
        paymentResponsible,
        verificationStep: currentStep,
        timestamp: new Date().toISOString()
      }
      metamapButton.setAttribute('metadata', JSON.stringify(metadata))

        // Event listeners
        metamapButton.addEventListener('metamap:userStartedSdk', () => {
          setVerificationInProgress(true)
          setLoadingMessage('Verification in progress...')
          // Hide the rental modal when Metamap opens
          onHideModal?.()
        })

      metamapButton.addEventListener('metamap:userFinishedSdk', (event: any) => {
        setVerificationInProgress(false)
        // Show the rental modal again after verification
        onShowModal?.()
        handleVerificationComplete(event.detail)
      })

      metamapButton.addEventListener('metamap:userCancelledSdk', () => {
        setVerificationInProgress(false)
        setLoadingMessage('Verification cancelled')
        // Show the rental modal again after cancellation
        onShowModal?.()
        handleVerificationCancelled()
      })

      metamapButton.addEventListener('metamap:sdkError', (event: any) => {
        console.error('🚨 Metamap SDK Error:', event.detail)
        handleVerificationError(event.detail)
      })

      // Add authentication error handler
      metamapButton.addEventListener('metamap:authError', (event: any) => {
        console.error('🚨 Metamap Auth Error (403):', event.detail)
        toast({
          title: 'Authentication Error',
          description: 'Invalid Metamap credentials. Please check your CLIENT_ID and FLOW_ID configuration.',
          variant: 'destructive'
        })
      })

      metamapButtonRef.current.appendChild(metamapButton)
    }

    initializeMetamapButton()
  }, [sdkLoaded, currentStep, clientId, flowId, applicationType, paymentResponsible])

  const handleVerificationComplete = (result: any) => {
    const verificationResult: MetamapVerificationResult = {
      verificationId: result.verificationId || result.id,
      status: 'completed',
      identityId: result.identityId,
      metadata: result
    }

    if (currentStep === 'guardian') {
      // Guardian verification complete, now verify student
      setVerificationResults(prev => ({ ...prev, guardian: verificationResult }))
      setCurrentStep('student')
      toast({
        title: 'Guardian Verification Complete',
        description: 'Guardian identity verified successfully. Now please verify the student identity.',
      })
    } else {
      // Student verification complete
      setVerificationResults(prev => {
        const updatedResults = { ...prev, student: verificationResult }
        
        // Check if this is a student with guardian flow and we have both verifications
        if (applicationType === 'student' && paymentResponsible === 'guardian' && updatedResults.guardian) {
          // Both verifications complete, proceed with combined data
          toast({
            title: 'All Verifications Complete!',
            description: 'Both guardian and student identities verified successfully. Submitting your application...',
          })
          onVerificationComplete({
            ...verificationResult,
            metadata: {
              ...verificationResult.metadata,
              guardianVerification: updatedResults.guardian
            }
          })
        } else {
          // Single verification complete, proceed
          toast({
            title: 'Verification Complete!',
            description: 'Identity verification successful. Submitting your application...',
          })
          onVerificationComplete(verificationResult)
        }
        
        return updatedResults
      })
    }
  }

  const handleVerificationCancelled = () => {
    toast({
      title: 'Verification Cancelled',
      description: 'Identity verification was cancelled. Please try again to complete your application.',
      variant: 'destructive'
    })
  }

  const handleVerificationError = (error: any) => {
    console.error('Metamap verification error:', error)
    // Show the rental modal again after error
    onShowModal?.()
    toast({
      title: 'Verification Error',
      description: 'There was an error during identity verification. Please try again.',
      variant: 'destructive'
    })
  }

  // Determine if we need to verify guardian first
  const needsGuardianVerification = applicationType === 'student' && paymentResponsible === 'guardian'
  
  // Set initial step
  useEffect(() => {
    if (needsGuardianVerification && !verificationResults.guardian) {
      setCurrentStep('guardian')
    } else {
      setCurrentStep('student')
    }
  }, [needsGuardianVerification, verificationResults.guardian])

  const getStepTitle = () => {
    if (currentStep === 'guardian') {
      return 'Guardian Identity Verification'
    }
    return 'Identity Verification'
  }

  const getStepDescription = () => {
    if (currentStep === 'guardian') {
      return 'First, we need to verify the guardian/parent identity who will be responsible for payments.'
    }
    return 'Please verify your identity by uploading your ID and taking a video selfie.'
  }

  const getStepInstructions = () => {
    if (currentStep === 'guardian') {
      return [
        'The guardian/parent should complete this verification',
        'Have your government-issued ID ready',
        'Ensure good lighting for the video selfie',
        'Follow the on-screen instructions carefully'
      ]
    }
    return [
      'Have your government-issued ID ready',
      'Ensure good lighting for clear photos',
      'Follow the on-screen instructions for the video selfie',
      'The process typically takes 2-3 minutes'
    ]
  }

  if (!clientId || !flowId) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <span>Identity verification is not properly configured. Please contact support.</span>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-between">
          <RocButton variant="outline" onClick={onBack}>
            Back
          </RocButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">{getStepTitle()}</h2>
        <p className="text-muted-foreground">
          {getStepDescription()}
        </p>
      </div>

      {/* Progress indicator for student with guardian */}
      {needsGuardianVerification && (
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${
            verificationResults.guardian ? 'text-green-600' : currentStep === 'guardian' ? 'text-primary' : 'text-muted-foreground'
          }`}>
            {verificationResults.guardian ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-current" />
            )}
            <span className="text-sm font-medium">Guardian Verification</span>
          </div>
          <div className="flex-1 h-px bg-muted" />
          <div className={`flex items-center space-x-2 ${
            currentStep === 'student' ? 'text-primary' : 'text-muted-foreground'
          }`}>
            <div className="w-5 h-5 rounded-full border-2 border-current" />
            <span className="text-sm font-medium">Student Verification</span>
          </div>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Secure Identity Verification</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Before you start:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {getStepInstructions().map((instruction, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Metamap button container */}
          <div className="flex flex-col items-center py-4 space-y-4">
            {sdkLoading ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">{loadingMessage}</span>
                </div>
                <div className="w-48 bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-300 ease-out" 
                       style={{ width: sdkLoaded ? '100%' : '60%' }}></div>
                </div>
              </div>
            ) : verificationInProgress ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-2 text-primary">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-medium">{loadingMessage}</span>
                </div>
                <div className="text-xs text-muted-foreground text-center max-w-xs">
                  Please complete the verification process in the popup window
                </div>
              </div>
            ) : sdkLoaded ? (
              <div className="w-full">
                <div ref={metamapButtonRef} className="metamap-button-container" />
                {/* Help section */}
                <div className="mt-6 text-center">
                  <details className="group">
                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Having trouble? Click for help options
                    </summary>
                    <div className="mt-3 space-y-2">
                      <RocButton
                        onClick={() => {
                          window.location.reload()
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Refresh Page
                      </RocButton>
                      <div className="text-xs text-muted-foreground">
                        If issues persist, contact support with error code: SDK_INIT_FAILED
                      </div>
                    </div>
                  </details>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center space-x-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">Failed to load verification service</span>
                </div>
                <RocButton
                  onClick={() => window.location.reload()}
                  variant="outline"
                  size="sm"
                >
                  Try Again
                </RocButton>
              </div>
            )}
          </div>

          <div className="text-xs text-muted-foreground text-center">
            Your data is encrypted and processed securely by Metamap, a trusted identity verification provider.
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <RocButton 
          variant="outline" 
          onClick={onBack} 
          disabled={isLoading || verificationInProgress || sdkLoading}
        >
          Back
        </RocButton>
        {/* Status indicator */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          {verificationInProgress && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Verification in progress...</span>
            </>
          )}
          {sdkLoading && (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Loading...</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
