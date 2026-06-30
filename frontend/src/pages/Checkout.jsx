import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import gpayLogo from '../assets/gpay.png';
import phonepeLogo from '../assets/phonepe.png';
import paytmLogo from '../assets/paytm.png';
import upiLogo from '../assets/upi.png';

const Checkout = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { API_URL, user } = useContext(AuthContext);

  const [stay, setStay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Simulated credit card states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // Form states - populated from user when available
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dialCode, setDialCode] = useState('+91');
  const [specialRequests, setSpecialRequests] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [promoCode, setPromoCode] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPay');
  const [upiProcessing, setUpiProcessing] = useState(false);
  const [upiAppLoadingText, setUpiAppLoadingText] = useState('');

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

  // Calculate pricing with safe fallbacks if dates are missing or invalid
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFutureDateString = (daysAhead) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const safeCheckIn = (checkIn && !isNaN(new Date(checkIn).getTime())) ? checkIn : getTodayString();
  const safeCheckOut = (checkOut && !isNaN(new Date(checkOut).getTime()) && new Date(checkOut) > new Date(safeCheckIn)) ? checkOut : getFutureDateString(2);

  const checkInDate = new Date(safeCheckIn);
  const checkOutDate = new Date(safeCheckOut);
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

  const handleSimulatedCardPayment = async (e) => {
    e.preventDefault();
    if (!phone) {
      alert('Please enter your phone number');
      return;
    }
    if (!fullName || !email) {
      alert('Please fill in your name and email');
      return;
    }
    if (!cardNumber || cardNumber.length < 15) {
      alert('Please enter a valid card number');
      return;
    }
    if (!cardExpiry || !cardExpiry.includes('/')) {
      alert('Please enter a valid expiry date (MM/YY)');
      return;
    }
    if (cardCvc.length < 3) {
      alert('Please enter a valid CVC');
      return;
    }
    if (!cardName) {
      alert('Please enter the cardholder name');
      return;
    }

    try {
      setSubmitting(true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      const res = await axios.post(`${API_URL}/bookings`, {
        stayId: id,
        roomTitle,
        checkIn: safeCheckIn,
        checkOut: safeCheckOut,
        guestCount: parseInt(guests) || 2,
        guestDetails: {
          name: fullName,
          email,
          phone: `${dialCode} ${phone}`,
          specialRequests
        },
        paymentMethod: 'Credit Card (Simulated)',
        paymentIntentId: `sim_cc_${Date.now()}`
      });

      if (res.data.success) {
        navigate(`/booking-confirmed/${res.data.data._id}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing reservation');
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
                    placeholder="Enter your name" 
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
                    placeholder="Enter your email" 
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

          <div className="pt-4 text-left relative">
            {/* Full-Screen Processing Overlay for UPI App Simulation */}
            {upiProcessing && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center text-white p-6">
                <div className="bg-surface-container-lowest text-on-surface p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl border border-outline-variant space-y-6 animate-fade-in">
                  <span className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary inline-block"></span>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg text-primary">{upiAppLoadingText}</h3>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Please open your UPI app on your phone to authorize the pending transaction request.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'Credit Card' ? (
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 space-y-6">
                <div className="space-y-4 text-left">
                  <h3 className="font-semibold text-sm text-primary uppercase tracking-wider flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-[18px]">credit_card</span>
                    Simulated Credit Card Details
                  </h3>
                  
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                      maxLength="19"
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary text-on-surface"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength="5"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary text-on-surface"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-secondary uppercase tracking-wider">CVC</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        maxLength="3"
                        className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary text-on-surface"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Cardholder Name"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary text-on-surface"
                      required
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSimulatedCardPayment}
                  disabled={submitting}
                  className="w-full bg-primary text-on-primary py-4.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Processing Simulated Payment...
                    </>
                  ) : (
                    <>
                      Pay ₹{total.toLocaleString('en-IN')} &amp; Complete Booking
                      <span className="material-symbols-outlined">lock</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              // UPI Payments UI
              <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/30 space-y-6">
                <div>
                  <h3 className="font-semibold text-sm text-primary uppercase tracking-wider flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                    Select UPI Application
                  </h3>
                  
                  {/* UPI App Selection Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'GPay', name: 'Google Pay', logo: gpayLogo },
                      { id: 'PhonePe', name: 'PhonePe', logo: phonepeLogo },
                      { id: 'Paytm', name: 'Paytm', logo: paytmLogo },
                      { id: 'Custom', name: 'Other UPI ID', logo: upiLogo }
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedUpiApp(app.id)}
                        className={`p-4 rounded-xl border font-semibold text-xs transition-all flex flex-col items-center justify-between min-h-[90px] w-full cursor-pointer ${
                          selectedUpiApp === app.id
                            ? 'border-primary bg-primary/8 text-primary shadow-sm'
                            : 'border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'
                        }`}
                      >
                        <div className="h-6 flex items-center justify-center w-full">
                          <img src={app.logo} alt={app.name} className="max-h-full max-w-[50px] object-contain" />
                        </div>
                        <span className="text-[10px] mt-1 tracking-tight text-center">{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom UPI ID Input */}
                {selectedUpiApp === 'Custom' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-secondary uppercase tracking-wider">UPI ID / VPA</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl p-3.5 text-sm focus:border-primary outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                {/* Submit Booking and trigger UPI animation */}
                <button
                  type="button"
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
                    if (selectedUpiApp === 'Custom' && !upiId.includes('@')) {
                      alert('Please enter a valid UPI ID (e.g. username@upi)');
                      return;
                    }

                    // UPI app redirection simulation
                    setUpiProcessing(true);
                    setUpiAppLoadingText(selectedUpiApp === 'Custom' ? 'Initiating UPI request...' : `Opening ${selectedUpiApp} App...`);
                    
                    setTimeout(() => {
                      setUpiAppLoadingText('Awaiting authorization...');
                    }, 1200);

                    setTimeout(async () => {
                      try {
                        const res = await axios.post(`${API_URL}/bookings`, {
                          stayId: id,
                          roomTitle,
                          checkIn: safeCheckIn,
                          checkOut: safeCheckOut,
                          guestCount: parseInt(guests) || 2,
                          guestDetails: {
                            name: fullName,
                            email,
                            phone: `${dialCode} ${phone}`,
                            specialRequests
                          },
                          paymentMethod: `UPI (${selectedUpiApp})`
                        });

                        if (res.data.success) {
                          setUpiProcessing(false);
                          navigate(`/booking-confirmed/${res.data.data._id}`);
                        }
                      } catch (err) {
                        setUpiProcessing(false);
                        alert(err.response?.data?.message || 'Error processing reservation');
                      }
                    }, 3000);
                  }}
                  className="w-full bg-primary text-on-primary py-4.5 rounded-xl font-bold text-sm shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
                >
                  Pay ₹{total.toLocaleString('en-IN')} &amp; Confirm Booking
                  <span className="material-symbols-outlined">done</span>
                </button>
              </div>
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
