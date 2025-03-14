import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const StripePaymentForm = ({ clientSecret, totalAmount, onSuccess, onError, guestName, guestEmail }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Stripe card styles customized to match HotelB theme
  const cardElementOptions = {
    style: {
      base: {
        color: '#1e293b', // slate-800
        fontFamily: 'Outfit, Inter, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '15px',
        '::placeholder': {
          color: '#94a3b8', // slate-400
        },
      },
      invalid: {
        color: '#ef4444', // red-500
        iconColor: '#ef4444',
      },
    },
    hidePostalCode: true,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet.
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');

    // Handle simulation mode fallback
    const isSimulated = clientSecret && clientSecret.startsWith('mock_secret_intent_');
    if (isSimulated) {
      console.log('💳 [SIMULATED PAYMENT] Processing credit card via mock Stripe Elements...');
      setTimeout(() => {
        setIsProcessing(false);
        onSuccess(`mock_pi_${Date.now()}`);
      }, 1500); // Simulate processing time
      return;
    }

    try {
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: guestName || 'Sanctuary Guest',
            email: guestEmail || 'guest@example.com',
          },
        },
      });

      if (result.error) {
        setErrorMessage(result.error.message);
        onError(result.error.message);
        setIsProcessing(false);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          console.log('✅ Real Stripe payment succeeded:', result.paymentIntent.id);
          setIsProcessing(false);
          onSuccess(result.paymentIntent.id);
        }
      }
    } catch (err) {
      console.error('Error confirming payment:', err);
      setErrorMessage(err.message || 'Payment confirmation error occurred.');
      onError(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 transition-all focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
        <CardElement options={cardElementOptions} />
      </div>

      {errorMessage && (
        <div className="bg-error/8 text-error text-xs font-semibold p-4 rounded-xl">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-primary text-on-primary py-4.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
      >
        {isProcessing ? (
          <>
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
            Processing Payment...
          </>
        ) : (
          <>
            Pay {totalAmount} &amp; Complete Booking
            <span className="material-symbols-outlined">lock</span>
          </>
        )}
      </button>
      <p className="text-center text-[10px] text-on-surface-variant flex items-center justify-center gap-1.5 font-medium">
        <span className="material-symbols-outlined text-[12px] text-primary">verified_user</span>
        Payments are secured by Stripe with 256-bit encryption.
      </p>
    </form>
  );
};

export default StripePaymentForm;
