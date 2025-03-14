import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from '../components/StripePaymentForm';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder_publishable');

const Checkout = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { API_URL, user } = useContext(AuthContext);

  const [stay, setStay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState('');
  const [showStripeForm, setShowStripeForm] = useState(false);

  // Form states - populated from user when available
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [promoCode, setPromoCode] = useState('');

  // Extract from query params
  const roomTitle = searchParams.get('roomTitle') || 'Default Room';
  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests = searchParams.get('guests') || '2 Guests';

  // Populate form fields when user data becomes available
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name || '');
      if (!email) setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchStay = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/stays/${id}`);
        if (res.data.success) {
          setStay(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching checkout details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStay();
  }, [id, API_URL]);

  if (loading) {
    return (
      <div className="text-center py-40">
        <span className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary inline-block"></span>
      </div>
    );
  }

  if (!stay) {
    return (
      <div className="text-center py-40">
        <h2 className="font-headline text-3xl text-primary font-medium mb-4">Stay details not found</h2>
        <button onClick={() => navigate('/stays')} className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-semibold">
          Back to Stays
        </button>
      </div>
    );
  }

  // Find room price
  const room = stay.rooms?.find(r => r.title === roomTitle);
  const roomPrice = room ? room.price : stay.basePrice;

  // Calculate pricing
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.abs(checkOutDate - checkInDate);
  const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  const subtotal = roomPrice * nights;
  const serviceFee = Math.round(subtotal * 0.06);
  const taxes = Math.round(subtotal * 0.03);
  const total = subtotal + serviceFee + taxes;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone) {
      alert('Please enter your phone number');
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post(`${API_URL}/bookings`, {
        stayId: id,
        roomTitle,
        checkIn,
        checkOut,
        guestCount: parseInt(guests) || 2,
        guestDetails: {
          name: fullName,
          email,
          phone: `${dialCode} ${phone}`,
          specialRequests
        },
        paymentMethod
      });

      if (res.data.success) {
        const booking = res.data.data;
        navigate(`/booking-confirmed/${booking._id}`);
      }
    } catch (err) {
      console.error('Error submitting booking:', err);
      alert(err.response?.data?.message || 'Error processing reservation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Guest Information */}
        <div className="lg:col-span-7 flex flex-col gap-10">
          <section>
          <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
              Complete Your Booking
            </span>
            <h1 className="font-headline text-4xl md:text-6xl text-primary font-semibold mb-8 leading-tight">
              Guest<br />
              <span style={{ background: 'linear-gradient(135deg, #004630, #1f8c5e, #95d4b5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Details
              </span>
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 text-left">
                  <label className="font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:border-primary transition-all outline-none" 
                    placeholder="John Doe" 
                  />
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <label className="font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:border-primary transition-all outline-none" 
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-2 text-left">
                <label className="font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Phone Number</label>
                <div className="flex gap-3">
                  <select 
                    value={dialCode}
                    onChange={(e) => setDialCode(e.target.value)}
                    className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm w-24 outline-none"
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </select>
                  <input 
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-grow bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:border-primary transition-all outline-none" 
                    placeholder="98765 43210" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 text-left">
                <label className="font-semibold text-xs text-on-surface-variant uppercase tracking-wider">Special Requests</label>
                <textarea 
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 text-sm focus:border-primary transition-all resize-none outline-none" 
                  placeholder="Add a note for the host (e.g., dietary requirements, late check-in)..." 
                  rows="4"
                ></textarea>
              </div>
            </form>
          </section>

          <section className="text-left">
            <h2 className="font-headline text-2xl text-on-surface mb-6 font-medium">Payment Method</h2>
            <div className="flex flex-col gap-4">
              {/* Card Option */}
              <label className="flex items-center p-4 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors group">
                <input 
                  type="radio"
                  name="payment" 
                  checked={paymentMethod === 'Credit Card'}
                  onChange={() => setPaymentMethod('Credit Card')}
                  className="w-5 h-5 text-primary border-outline-variant focus:ring-primary" 
                />
                <div className="ml-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">credit_card</span>
                  <span className="font-semibold text-sm">Credit / Debit Card</span>
                </div>
                <div className="ml-auto flex gap-2">
                  <span className="material-symbols-outlined text-outline">payments</span>
                </div>
              </label>
              
              {/* UPI Option */}
              <label className="flex items-center p-4 border border-outline-variant rounded-xl cursor-pointer hover:bg-surface-container-low transition-colors group">
                <input 
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="w-5 h-5 text-primary border-outline-variant focus:ring-primary" 
                />
                <div className="ml-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
                  <span className="font-semibold text-sm">UPI (Google Pay, PhonePe)</span>
                </div>
              </label>
            </div>
          </section>

          <div className="pt-4 text-left">
            {paymentMethod === 'Credit Card' ? (
              showStripeForm && stripeClientSecret ? (
                <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 space-y-4">
                  <h3 className="font-semibold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">credit_card</span>
                    Enter Card Details
                  </h3>
                  <Elements stripe={stripePromise}>
                    <StripePaymentForm
                      clientSecret={stripeClientSecret}
                      totalAmount={`₹${total.toLocaleString('en-IN')}`}
                      guestName={fullName}
                      guestEmail={email}
                      onSuccess={async (paymentIntentId) => {
                        try {
                          setSubmitting(true);
                          const res = await axios.post(`${API_URL}/bookings`, {
                            stayId: id,
                            roomTitle,
                            checkIn,
                            checkOut,
                            guestCount: parseInt(guests) || 2,
                            guestDetails: {
                              name: fullName,
                              email,
                              phone: `${dialCode} ${phone}`,
                              specialRequests
                            },
                            paymentMethod: 'Credit Card',
                            paymentIntentId: paymentIntentId
                          });

                          if (res.data.success) {
                            navigate(`/booking-confirmed/${res.data.data._id}`);
                          }
                        } catch (err) {
                          alert(err.response?.data?.message || 'Error processing reservation');
                        } finally {
                          setSubmitting(false);
                        }
                      }}
                      onError={(err) => {
                        alert(err || 'Payment failed.');
                      }}
                    />
                  </Elements>
                </div>
              ) : (
                <button 
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!phone) {
                      alert('Please enter your phone number');
                      return;
                    }
                    if (!fullName || !email) {
                      alert('Please fill in your name and email');
                      return;
                    }
                    try {
                      setSubmitting(true);
                      const res = await axios.post(`${API_URL}/payments/create-payment-intent`, {
                        amount: Math.round(total * 100), // convert to paise / cents
                        currency: 'inr'
                      });
                      if (res.data.success) {
                        setStripeClientSecret(res.data.clientSecret);
                        setShowStripeForm(true);
                      }
                    } catch (err) {
                      console.error('Payment intent generation failed:', err);
                      alert(err.response?.data?.message || 'Failed to initiate payment.');
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                  disabled={submitting}
                  className="w-full md:w-auto bg-primary text-on-primary px-12 py-5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-md group disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Initiating Stripe...' : 'Continue to Payment'}
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              )
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full md:w-auto bg-primary text-on-primary px-12 py-5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 hover:opacity-90 transition-all shadow-md group disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Confirming...' : 'Continue to Payment'}
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
            )}
            
            <p className="mt-4 text-xs text-on-surface-variant flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Your data is encrypted and secure.
            </p>
          </div>
        </div>

        {/* Right Column: Booking Summary */}
        <div className="lg:col-span-5 text-left">
          <div className="sticky top-24 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl shadow-lg border border-secondary-container overflow-hidden">
              {/* Property Info */}
              <div className="p-6 border-b border-surface-variant flex gap-4 items-start">
                <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <img className="w-full h-full object-cover" src={stay.image} alt={stay.title} />
                </div>
                <div>
                  <span className="font-semibold text-[10px] text-tertiary uppercase tracking-widest">{stay.category}</span>
                  <h3 className="font-headline text-lg leading-tight mt-1 font-semibold">{stay.title}</h3>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1 font-medium">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    {stay.location}
                  </p>
                </div>
              </div>
              {/* Stay Details */}
              <div className="p-6 border-b border-surface-variant grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-[10px] text-on-surface-variant uppercase tracking-wider">Dates</p>
                  <p className="font-bold text-primary mt-1">{checkIn} - {checkOut}</p>
                </div>
                <div>
                  <p className="font-semibold text-[10px] text-on-surface-variant uppercase tracking-wider">Guests</p>
                  <p className="font-bold text-primary mt-1">{guests}</p>
                </div>
              </div>
              {/* Pricing */}
              <div className="p-6 space-y-4 text-sm text-on-surface-variant">
                <div className="flex justify-between items-center">
                  <span>₹{roomPrice.toLocaleString('en-IN')} x {nights} nights</span>
                  <span className="text-on-surface font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Service Fee</span>
                  <span className="text-on-surface font-semibold">₹{serviceFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Taxes &amp; Charges</span>
                  <span className="text-on-surface font-semibold">₹{taxes.toLocaleString('en-IN')}</span>
                </div>
                <div className="pt-4 border-t border-surface-variant flex justify-between items-end">
                  <div>
                    <p className="font-bold text-on-surface">Total (INR)</p>
                    <p className="text-[10px] text-on-surface-variant font-medium">Inclusive of all taxes</p>
                  </div>
                  <div className="text-right">
                    <span className="font-headline text-2xl text-primary font-semibold">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Code */}
            <div className="bg-secondary-container/30 rounded-xl p-6 border border-secondary-container text-left">
              <label className="font-semibold text-xs text-on-surface-variant block mb-3 uppercase tracking-wider">Promo Code</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-grow bg-surface-container-lowest border border-outline-variant rounded-lg p-2 text-sm focus:border-primary outline-none" 
                  placeholder="Enter code" 
                />
                <button 
                  onClick={() => alert('Promo code applied successfully!')}
                  className="bg-primary text-on-primary px-6 py-2 rounded-lg font-bold hover:opacity-80 transition-opacity text-xs"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Cancellation Policy Note */}
            <div className="flex gap-3 p-4 rounded-xl border border-outline-variant bg-surface-container-low/50 text-left">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">info</span>
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                <strong>Free cancellation</strong> until check-in. After that, a cancellation fee of 1 night's stay will apply.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
