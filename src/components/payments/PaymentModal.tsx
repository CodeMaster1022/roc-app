import { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentService, type Payment } from '@/services/paymentService';
import type { Application } from '@/services/applicationService';

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  paymentType: 'deposit' | 'first_month';
  amount: number;
  onPaymentSuccess?: (payment: Payment) => void;
}

interface PaymentFormProps {
  clientSecret: string;
  payment: Payment;
  onSuccess: (payment: Payment) => void;
  onError: (error: string) => void;
}

const PaymentForm = ({ clientSecret, payment, onSuccess, onError }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Fetch updated payment from backend
        const updatedPayment = await paymentService.getPaymentById(payment.id);
        onSuccess(updatedPayment.data.payment);
      }
    } catch (err: any) {
      onError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Lock className="h-4 w-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="h-5 w-5 text-primary" />
            <span className="font-medium">Card Information</span>
          </div>
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Processing Payment...
          </div>
        ) : (
          `Pay $${payment.amount.toLocaleString()}`
        )}
      </Button>
    </form>
  );
};

export const PaymentModal = ({ 
  isOpen, 
  onClose, 
  application, 
  paymentType, 
  amount,
  onPaymentSuccess 
}: PaymentModalProps) => {
  const { toast } = useToast();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Create payment intent when modal opens
  useEffect(() => {
    if (isOpen && application) {
      createPaymentIntent();
    }
  }, [isOpen, application, paymentType, amount]);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      setError('');

      // Handle potential _id vs id mismatch
      const applicationId = application.id || (application as any)._id;

      if (!applicationId) {
        throw new Error('Application ID is missing');
      }

      const response = await paymentService.createPayment({
        applicationId: applicationId,
        paymentType,
        amount,
        currency: 'usd'
      });

      setPayment(response.data.payment);
      setClientSecret(response.data.clientSecret || '');
    } catch (err: any) {
      
      // Handle specific error cases with user-friendly messages
      let errorTitle = 'Payment Error';
      let errorDescription = err.message || 'Failed to initialize payment';
      let variant: 'destructive' | 'default' = 'destructive';
      
      if (err.message?.includes('payment for this type already exists')) {
        errorTitle = 'Payment Already Exists';
        errorDescription = 'A payment for this application has already been created. You can check your payment status in the dashboard.';
        variant = 'default';
        
        // Close the modal since there's nothing to do here
        setTimeout(() => {
          onClose();
        }, 3000);
      } else if (err.message?.includes('not approved')) {
        errorTitle = 'Application Not Approved';
        errorDescription = 'Payment can only be made for approved applications. Please wait for approval.';
      } else if (err.message?.includes('pricing')) {
        errorTitle = 'Pricing Error';
        errorDescription = 'There is an issue with the property pricing. Please contact the property owner.';
      }
      
      setError(errorDescription);
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: variant
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (updatedPayment: Payment) => {
    setPaymentStatus('success');
    toast({
      title: 'Payment Successful!',
      description: 'Your payment has been processed successfully.',
    });
    onPaymentSuccess?.(updatedPayment);
    
    // Close modal after a short delay
    setTimeout(() => {
      handleClose();
    }, 2000);
  };

  const handlePaymentError = (errorMessage: string) => {
    setPaymentStatus('error');
    setError(errorMessage);
    toast({
      title: 'Payment Failed',
      description: errorMessage,
      variant: 'destructive'
    });
  };

  const handleClose = () => {
    setPayment(null);
    setClientSecret('');
    setError('');
    setPaymentStatus('idle');
    onClose();
  };

  const getPaymentTypeTitle = () => {
    switch (paymentType) {
      case 'deposit':
        return 'Security Deposit';
      case 'first_month':
        return 'First Month Rent';
      default:
        return 'Payment';
    }
  };

  const elementsOptions: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {getPaymentTypeTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Payment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Property</span>
                <span className="font-medium">
                  {application.property?.title || application.property?.name}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Type</span>
                <Badge variant="secondary">{getPaymentTypeTitle()}</Badge>
              </div>
              <Separator />
              <div className="flex justify-between font-medium">
                <span>Total Amount</span>
                <span className="text-lg">${amount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          {paymentStatus === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Payment Successful!</p>
                <p className="text-sm text-green-700">Your payment has been processed.</p>
              </div>
            </div>
          )}

          {paymentStatus === 'error' && error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Payment Failed</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Payment Form */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3">Initializing payment...</span>
            </div>
          )}

          {!loading && clientSecret && payment && paymentStatus === 'idle' && (
            <Elements stripe={stripePromise} options={elementsOptions}>
              <PaymentForm
                clientSecret={clientSecret}
                payment={payment}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}

          {paymentStatus === 'success' && (
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 