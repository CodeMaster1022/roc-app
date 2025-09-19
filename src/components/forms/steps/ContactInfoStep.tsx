import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RocButton } from "@/components/ui/roc-button"
import { useLanguage } from "@/contexts/LanguageContext"

interface ContactInfoStepProps {
  phone: string
  onPhoneChange: (phone: string) => void
  onNext: () => void
  onBack: () => void
}

export const ContactInfoStep = ({ phone, onPhoneChange, onNext, onBack }: ContactInfoStepProps) => {
  const { t } = useLanguage()
  const [error, setError] = useState('')

  const handleNext = () => {
    if (!phone.trim()) {
      setError('Phone number is required')
      return
    }
    
    // Basic phone validation
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/
    if (!phoneRegex.test(phone.trim())) {
      setError('Please enter a valid phone number')
      return
    }
    
    setError('')
    onNext()
  }

  const handlePhoneChange = (value: string) => {
    setError('')
    onPhoneChange(value)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Contact Information</h2>
        <p className="text-muted-foreground">
          We need your phone number to process your rental application
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="Enter your phone number"
            className={error ? 'border-red-500' : ''}
          />
          {error && (
            <p className="text-sm text-red-500 mt-1">{error}</p>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <RocButton variant="outline" onClick={onBack}>
          Back
        </RocButton>
        <RocButton onClick={handleNext}>
          Continue
        </RocButton>
      </div>
    </div>
  )
} 