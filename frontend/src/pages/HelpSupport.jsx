import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HelpSupport = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState('faq');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState('');

  const faqItems = [
    {
      question: 'How do I book a houseboat stay?',
      answer: 'Browse our Stays page, select your preferred houseboat, choose your dates, and proceed to checkout. You\'ll receive a confirmation email with all the details of your reservation.'
    },
    {
      question: 'What is the cancellation policy?',
      answer: 'Free cancellation is available up to 48 hours before check-in for most stays. Cancellations made within 48 hours may incur a charge of one night\'s stay. Premium and peak-season bookings may have different policies — please check the specific stay details.'
    },
    {
      question: 'How do loyalty points work?',
      answer: 'You earn 10 loyalty points for every ₹1,000 spent on bookings. Points can be redeemed for discounts on future stays, complimentary experiences, and exclusive upgrades. Points expire after 24 months of account inactivity.'
    },
    {
      question: 'Can I modify my booking after confirmation?',
      answer: 'Yes, you can modify your booking dates and guest count from the My Bookings page up to 24 hours before check-in, subject to availability. Changes to room type may require cancelling and rebooking.'
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit and debit cards (Visa, Mastercard, RuPay), UPI payments, net banking, and popular digital wallets. International cards are also supported for overseas guests.'
    },
    {
      question: 'Is my personal data secure?',
      answer: 'Absolutely. We use industry-standard AES-256 encryption for all personal data. Your payment information is processed through PCI-DSS compliant payment gateways and is never stored on our servers.'
    },
    {
      question: 'How do I reset my password?',
      answer: 'Go to Settings → Security & Account, enter your current password and set a new one. If you\'ve forgotten your password, use the "Forgot?" link on the login page to receive a password reset email.'
    },
    {
      question: 'Do you offer group or corporate bookings?',
      answer: 'Yes! For group bookings of 5+ rooms or corporate retreats, please contact our dedicated team at groups@HotelB.com or call +91 484 250 1200 for customized packages and pricing.'
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess('');
    // Simulate sending
    setTimeout(() => {
      setContactSuccess('Your message has been sent successfully. Our team will respond within 24 hours.');
      setContactForm({ subject: '', message: '' });
    }, 600);
  };

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 text-left bg-background min-h-screen">
      {/* Header */}
      <section className="mb-12">
        <span className="inline-block text-[11px] font-bold uppercase tracking-[0.18em] text-primary bg-primary/8 px-3 py-1.5 rounded-full mb-4">
          Support Center
        </span>
        <h1 className="font-headline text-4xl md:text-6xl text-primary font-semibold mb-4 leading-tight">
          Help &amp;<br />
          <span style={{ background: 'linear-gradient(135deg, #004630, #1f8c5e, #95d4b5)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Support
          </span>
        </h1>
        <p className="font-body text-sm md:text-base text-secondary max-w-2xl leading-relaxed">
          Find answers to common questions or get in touch with our dedicated concierge team.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Navigation */}
        <aside className="lg:col-span-3 space-y-1.5">
          <button
            onClick={() => setActiveSection('faq')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer border ${
              activeSection === 'faq'
                ? 'bg-primary text-on-primary border-primary shadow-md'
                : 'bg-white text-secondary hover:bg-secondary-container/20 border-secondary-container/40'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">quiz</span>
            FAQ
          </button>
          <button
            onClick={() => setActiveSection('contact')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer border ${
              activeSection === 'contact'
                ? 'bg-primary text-on-primary border-primary shadow-md'
                : 'bg-white text-secondary hover:bg-secondary-container/20 border-secondary-container/40'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">mail</span>
            Contact Us
          </button>
          <button
            onClick={() => setActiveSection('info')}
            className={`w-full flex items-center gap-3 p-4 rounded-xl font-bold text-xs tracking-wider uppercase transition-all cursor-pointer border ${
              activeSection === 'info'
                ? 'bg-primary text-on-primary border-primary shadow-md'
                : 'bg-white text-secondary hover:bg-secondary-container/20 border-secondary-container/40'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">info</span>
            Contact Info
          </button>
        </aside>

        {/* Right Content */}
        <section className="lg:col-span-9 bg-white rounded-2xl border border-secondary-container/40 p-6 sm:p-8 shadow-soft min-h-[400px]">
          
          {/* FAQ Section */}
          {activeSection === 'faq' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h3 className="font-headline text-xl text-primary font-semibold mb-1">Frequently Asked Questions</h3>
                <p className="text-xs text-secondary mb-6">Quick answers to the most common inquiries.</p>
              </div>

              <div className="space-y-3">
                {faqItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="border border-secondary-container/40 rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                      className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer hover:bg-secondary-container/10 transition-colors"
                    >
                      <span className="text-sm font-semibold text-primary">{item.question}</span>
                      <span className={`material-symbols-outlined text-[20px] text-secondary shrink-0 transition-transform duration-300 ${expandedFaq === idx ? 'rotate-180' : ''}`}>
                        expand_more
                      </span>
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        expandedFaq === idx ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-5 pb-4 pt-0">
                        <p className="text-xs text-secondary leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Form */}
          {activeSection === 'contact' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h3 className="font-headline text-xl text-primary font-semibold mb-1">Send Us a Message</h3>
                <p className="text-xs text-secondary mb-6">Our concierge team typically responds within 24 hours.</p>
              </div>

              {contactSuccess && (
                <div className="bg-[#1f5e46]/10 text-primary p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  {contactSuccess}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-5 max-w-lg">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Your Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 text-sm outline-none text-secondary cursor-not-allowed"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Subject</label>
                  <select
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                    required
                    className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 text-sm focus:border-primary outline-none cursor-pointer"
                  >
                    <option value="">Select a topic...</option>
                    <option value="booking">Booking Issue</option>
                    <option value="payment">Payment & Refund</option>
                    <option value="account">Account & Login</option>
                    <option value="experience">Experiences & Activities</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-secondary uppercase tracking-wider">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    required
                    rows={5}
                    placeholder="Describe your issue or question in detail..."
                    className="w-full bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-3.5 text-sm focus:border-primary outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-primary text-on-primary px-6 py-3.5 rounded-xl font-bold text-xs hover:opacity-95 shadow-md transition-colors cursor-pointer"
                >
                  Send Message
                </button>
              </form>
            </div>
          )}

          {/* Contact Info */}
          {activeSection === 'info' && (
            <div className="animate-fade-in space-y-6">
              <div>
                <h3 className="font-headline text-xl text-primary font-semibold mb-1">Get In Touch</h3>
                <p className="text-xs text-secondary mb-6">Reach us through any of the channels below.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="p-5 rounded-2xl border border-secondary-container/40 bg-secondary-container/5 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">call</span>
                  </div>
                  <h4 className="text-sm font-bold text-primary">Phone</h4>
                  <p className="text-xs text-secondary leading-relaxed">+91 484 250 1200</p>
                  <p className="text-[10px] text-secondary">Mon – Sat, 9:00 AM – 8:00 PM IST</p>
                </div>

                {/* Email */}
                <div className="p-5 rounded-2xl border border-secondary-container/40 bg-secondary-container/5 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">mail</span>
                  </div>
                  <h4 className="text-sm font-bold text-primary">Email</h4>
                  <p className="text-xs text-secondary leading-relaxed">support@HotelB.com</p>
                  <p className="text-[10px] text-secondary">Response within 24 hours</p>
                </div>

                {/* WhatsApp */}
                <div className="p-5 rounded-2xl border border-secondary-container/40 bg-secondary-container/5 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#25D366] text-xl">chat</span>
                  </div>
                  <h4 className="text-sm font-bold text-primary">WhatsApp</h4>
                  <p className="text-xs text-secondary leading-relaxed">+91 98765 43210</p>
                  <p className="text-[10px] text-secondary">Quick chat support available</p>
                </div>

                {/* Address */}
                <div className="p-5 rounded-2xl border border-secondary-container/40 bg-secondary-container/5 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                  </div>
                  <h4 className="text-sm font-bold text-primary">Office</h4>
                  <p className="text-xs text-secondary leading-relaxed">HotelB Houseboats,<br />Alleppey, Kerala 688001, India</p>
                </div>
              </div>

              {/* Emergency */}
              <div className="mt-6 p-5 rounded-2xl border border-[#f5a623]/30 bg-[#f5a623]/5 flex items-start gap-4">
                <span className="material-symbols-outlined text-[#f5a623] text-2xl shrink-0 mt-0.5">emergency</span>
                <div>
                  <h4 className="text-sm font-bold text-primary mb-1">Emergency During Stay</h4>
                  <p className="text-xs text-secondary leading-relaxed">
                    If you have an emergency during your stay, contact the on-site crew directly or call our 24/7 emergency line at <span className="font-bold text-primary">+91 484 250 1111</span>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default HelpSupport;
