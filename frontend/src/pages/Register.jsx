import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const { register, loginWithGoogle, loginWithApple, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAppleLogin = async () => {
    setError('');
    setLoading(true);
    setTimeout(async () => {
      const res = await loginWithApple('traveler_apple@HotelB.com', 'Apple Traveler');
      setLoading(false);
      if (!res.success) {
        setError(res.message);
      }
    }, 800);
  };

  const redirect = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    if (user) {
      navigate(user.role === 'admin' ? '/admin' : redirect);
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!terms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      return;
    }

    setLoading(true);
    const res = await register(name, email, password);
    setLoading(false);

    if (!res.success) {
      setError(res.message);
    }
  };

  return (
    <main className="w-full flex h-screen overflow-hidden font-body text-left bg-background">
      {/* Left Side: Serene Houseboat visual */}
      <section className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-secondary-container h-full">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-[10000ms] hover:scale-105" 
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=1200&auto=format&fit=crop')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/50 to-primary/20 pointer-events-none" />
        {/* Branding Overlay */}
        <div className="relative z-10 p-12 flex flex-col justify-between w-full h-full">
          <div>
            <h1 className="font-headline text-4xl text-white font-semibold tracking-tight">HotelB</h1>
            <p className="font-headline text-xl text-white/95 mt-3 max-w-sm">
              Reconnect with serenity in the backwaters.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl max-w-sm border border-white/20 shadow-sm">
            <p className="font-body text-sm italic text-white leading-relaxed">
              "Escape into a world where time slows down. HotelB houseboat retreats are a poetic sanctuary."
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 border border-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-base" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
              </div>
              <span className="font-semibold text-xs text-white">Emily S., Luxury Curator</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Side: Registration Form */}
      <section className="w-full lg:w-1/2 flex items-center justify-center bg-background px-margin-mobile md:px-margin-desktop py-4 h-full overflow-hidden">
        <div className="w-full max-w-md my-auto">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-4">
            <h1 className="font-headline text-2xl text-primary font-semibold tracking-tight">HotelB</h1>
          </div>
          <div className="mb-4">
            <h2 className="font-headline text-xl sm:text-2xl text-on-background font-medium mb-1">Create your sanctuary account</h2>
            <p className="font-body text-xs text-secondary">Join our community of discerning travelers.</p>
          </div>

          {error && (
            <div className="bg-error-container text-on-error-container p-2 rounded-lg text-xs font-semibold border border-error/10 mb-3 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm">error</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="font-semibold text-[9px] text-on-surface-variant uppercase tracking-wider" htmlFor="full_name">Full Name</label>
              <div className="relative group">
                <input 
                  className="w-full h-10 bg-white border border-outline-variant rounded-lg px-3.5 font-body text-xs outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" 
                  id="full_name" 
                  name="full_name" 
                  placeholder="E.g. Elena Gilbert" 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>
            {/* Email Address */}
            <div className="space-y-1">
              <label className="font-semibold text-[9px] text-on-surface-variant uppercase tracking-wider" htmlFor="email">Email Address</label>
              <div className="relative group">
                <input 
                  className="w-full h-10 bg-white border border-outline-variant rounded-lg px-3.5 font-body text-xs outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" 
                  id="email" 
                  name="email" 
                  placeholder="name@luxury-travel.com" 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {/* Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-[9px] text-on-surface-variant uppercase tracking-wider" htmlFor="password">Password</label>
                <div className="relative">
                  <input 
                    className="w-full h-10 bg-white border border-outline-variant rounded-lg px-3.5 pr-10 font-body text-xs outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" 
                    id="password" 
                    name="password" 
                    placeholder="••••••••" 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors cursor-pointer p-0.5"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[9px] text-on-surface-variant uppercase tracking-wider" htmlFor="confirm_password">Confirm Password</label>
                <div className="relative">
                  <input 
                    className="w-full h-10 bg-white border border-outline-variant rounded-lg px-3.5 pr-10 font-body text-xs outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary" 
                    id="confirm_password" 
                    name="confirm_password" 
                    placeholder="••••••••" 
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-primary transition-colors cursor-pointer p-0.5"
                    tabIndex={-1}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            {/* Terms & Conditions */}
            <div className="flex items-start gap-2 py-0.5">
              <div className="flex items-center h-4">
                <input 
                  className="h-3.5 w-3.5 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" 
                  id="terms" 
                  name="terms" 
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                />
              </div>
              <label className="font-body text-[10px] text-on-surface-variant cursor-pointer leading-tight" htmlFor="terms">
                I agree to the <span className="text-primary font-semibold hover:underline">Terms of Service</span> and <span className="text-primary font-semibold hover:underline">Privacy Policy</span>.
              </label>
            </div>
            {/* CTA Button */}
            <button 
              className="w-full h-10 bg-primary-container hover:bg-primary text-white font-semibold text-xs rounded-lg shadow-lg shadow-primary-container/10 transition-all active:scale-[0.98] mt-1 flex items-center justify-center gap-2 disabled:opacity-50" 
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span className="material-symbols-outlined text-xs">arrow_forward</span>
                </>
              )}
            </button>
            {/* Footer Link */}
            <p className="text-center font-body text-xs text-on-surface-variant mt-4">
              Already have an account? 
              <Link className="text-primary font-semibold hover:underline ml-1" to={`/login?redirect=${encodeURIComponent(redirect)}`}>Log in</Link>
            </p>
          </form>

          {/* Social Registration Alternative */}
          <div className="mt-5">
            <div className="relative flex items-center justify-center py-2 mb-3">
              <div className="flex-grow border-t border-outline-variant"></div>
              <span className="px-3 font-semibold text-[9px] text-outline tracking-wider bg-background uppercase">OR CONTINUE WITH</span>
              <div className="flex-grow border-t border-outline-variant"></div>
            </div>
            <div className="w-full flex flex-col items-center gap-3">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setError('');
                  setLoading(true);
                  const res = await loginWithGoogle(credentialResponse.credential);
                  setLoading(false);
                  if (!res.success) {
                    setError(res.message);
                  }
                }}
                onError={() => {
                  setError('Google authentication failed.');
                }}
                theme="outline"
                size="large"
                width="384"
              />

              <button
                type="button"
                onClick={handleAppleLogin}
                className="w-full max-w-[384px] h-[40px] bg-black text-white hover:bg-neutral-900 rounded-[4px] font-semibold text-xs flex items-center justify-center gap-3 transition-colors duration-200 cursor-pointer shadow-sm"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z"/>
                </svg>
                <span>Continue with Apple</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Register;
