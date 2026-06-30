import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const BookingConfirmed = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { API_URL, user } = useContext(AuthContext);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/bookings/${bookingId}`);
        if (res.data.success) {
          setBooking(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching confirmed booking:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [bookingId, API_URL]);

  const handleAddToCalendar = () => {
    if (!booking) return;
    
    const formatICSDate = (dateStr) => {
      const d = new Date(dateStr);
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const checkInICS = formatICSDate(booking.checkIn);
    const checkOutICS = formatICSDate(booking.checkOut);
    const dtStamp = formatICSDate(new Date());

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'PRODID:-//HotelB//Stay Reservation//EN',
      'BEGIN:VEVENT',
      `UID:booking-${booking._id}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${checkInICS}`,
      `DTEND:${checkOutICS}`,
      `SUMMARY:Reservation at ${booking.stay?.title || 'HotelB stay'}`,
      `DESCRIPTION:Stay: ${booking.stay?.title || 'HotelB stay'}\\nRoom: ${booking.roomTitle}\\nConfirmation #: ${booking.bookingNumber}\\nGuests: ${booking.guestCount}`,
      `LOCATION:${booking.stay?.location || 'Kerala, India'}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `hotelb-booking-${booking.bookingNumber}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadInvoice = () => {
    if (!booking) return;

    const nights = Math.round((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24)) || 1;
    const baseAmount = Math.round(booking.totalAmount / 1.09);
    const taxAmount = Math.round(booking.totalAmount * 0.09);
    const ratePerNight = Math.round(baseAmount / nights);
    const issueDate = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const checkInFmt = new Date(booking.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const checkOutFmt = new Date(booking.checkOut).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    const guestName = booking.user?.name || user?.name || 'Valued Guest';
    const guestEmail = booking.user?.email || user?.email || 'guest@hotelb.com';

    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice #${booking.bookingNumber} — HotelB</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,400&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
  <style>
    :root {
      --forest:  #00382B;
      --forest2: #00261C;
      --gold:    #C89B3C;
      --gold2:   #F5D98B;
      --cream:   #FAF7F2;
      --ink:     #111827;
      --muted:   #6B7280;
      --border:  #E5E7EB;
      --success: #166534;
    }
    *{box-sizing:border-box;margin:0;padding:0;}
    html{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    body{
      font-family:'Inter',sans-serif;
      background:var(--cream);
      color:var(--ink);
      padding:48px 24px 80px;
      -webkit-font-smoothing:antialiased;
    }

    /* ─── CARD SHELL ─── */
    .card{
      max-width:860px;
      margin:0 auto;
      background:#fff;
      border-radius:20px;
      overflow:hidden;
      box-shadow:0 32px 64px -12px rgba(0,56,43,0.14),0 0 0 1px rgba(0,56,43,0.06);
    }

    /* ─── HEADER ─── */
    .hdr{
      background:linear-gradient(140deg,var(--forest) 0%,var(--forest2) 100%);
      padding:44px 48px 40px;
      display:flex;
      align-items:flex-start;
      justify-content:space-between;
      position:relative;
      overflow:hidden;
    }
    /* decorative watermark circle */
    .hdr::before{
      content:'';
      position:absolute;
      top:-60px; right:-60px;
      width:280px; height:280px;
      border-radius:50%;
      border:2px solid rgba(200,155,60,.18);
      pointer-events:none;
    }
    .hdr::after{
      content:'';
      position:absolute;
      bottom:0; left:0; right:0;
      height:3px;
      background:linear-gradient(90deg,transparent,var(--gold),var(--gold2),var(--gold),transparent);
    }

    .brand-name{
      font-family:'Playfair Display',serif;
      font-size:36px;
      font-weight:700;
      color:#fff;
      letter-spacing:.02em;
      line-height:1;
    }
    .brand-sub{
      font-size:10px;
      text-transform:uppercase;
      letter-spacing:.3em;
      color:var(--gold2);
      margin-top:6px;
      font-weight:500;
    }
    .brand-addr{
      font-size:11px;
      color:rgba(255,255,255,.55);
      margin-top:12px;
      line-height:1.6;
    }

    .hdr-right{text-align:right;}
    .inv-word{
      font-size:11px;
      text-transform:uppercase;
      letter-spacing:.22em;
      color:var(--gold2);
      font-weight:600;
    }
    .inv-num{
      font-family:'Playfair Display',serif;
      font-size:28px;
      color:#fff;
      margin-top:4px;
      font-weight:700;
    }
    .inv-date{
      font-size:12px;
      color:rgba(255,255,255,.55);
      margin-top:8px;
    }
    .badge-paid{
      display:inline-flex;
      align-items:center;
      gap:5px;
      margin-top:14px;
      padding:5px 14px;
      border-radius:99px;
      background:rgba(22,101,52,.45);
      border:1px solid rgba(134,239,172,.3);
      font-size:10px;
      font-weight:700;
      text-transform:uppercase;
      letter-spacing:.1em;
      color:#86efac;
    }
    .badge-dot{
      width:6px;height:6px;
      border-radius:50%;
      background:#4ade80;
      display:inline-block;
    }

    /* ─── BODY ─── */
    .body{padding:44px 48px;}

    /* ─── BILATERAL GRID ─── */
    .bilateral{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:32px;
      padding-bottom:36px;
      border-bottom:1px solid var(--border);
      margin-bottom:36px;
    }
    .bi-label{
      font-size:10px;
      text-transform:uppercase;
      letter-spacing:.16em;
      color:var(--muted);
      font-weight:700;
      margin-bottom:10px;
    }
    .bi-name{
      font-family:'Playfair Display',serif;
      font-size:18px;
      font-weight:500;
      color:var(--ink);
      margin-bottom:4px;
    }
    .bi-detail{
      font-size:13px;
      color:var(--muted);
      line-height:1.65;
    }
    .bi-right{text-align:right;}

    /* ─── STAY STRIP ─── */
    .stay-strip{
      background:var(--cream);
      border:1px solid var(--border);
      border-radius:14px;
      padding:20px 24px;
      display:grid;
      grid-template-columns:repeat(5,1fr);
      gap:12px;
      margin-bottom:36px;
    }
    .strip-item{}
    .strip-label{
      font-size:9px;
      text-transform:uppercase;
      letter-spacing:.15em;
      color:var(--muted);
      font-weight:700;
      margin-bottom:5px;
    }
    .strip-value{
      font-size:13px;
      font-weight:600;
      color:var(--ink);
      line-height:1.35;
    }

    /* ─── SECTION HEADING ─── */
    .sec-head{
      display:flex;
      align-items:center;
      gap:10px;
      margin-bottom:18px;
    }
    .sec-title{
      font-family:'Playfair Display',serif;
      font-size:15px;
      font-weight:700;
      color:var(--forest);
      white-space:nowrap;
    }
    .sec-line{flex:1;height:1px;background:var(--border);}

    /* ─── TABLE ─── */
    .tbl{width:100%;border-collapse:collapse;margin-bottom:36px;}
    .tbl thead tr{
      background:var(--forest);
    }
    .tbl thead th{
      padding:13px 18px;
      font-size:10px;
      text-transform:uppercase;
      letter-spacing:.12em;
      color:rgba(255,255,255,.8);
      font-weight:600;
    }
    .tbl thead th:first-child{border-radius:10px 0 0 0;}
    .tbl thead th:last-child{border-radius:0 10px 0 0; text-align:right;}
    .tbl tbody tr:nth-child(even){background:#FAFAF8;}
    .tbl tbody td{
      padding:16px 18px;
      font-size:13px;
      border-bottom:1px solid var(--border);
      vertical-align:top;
    }
    .tbl .td-desc strong{
      font-weight:600;
      color:var(--ink);
      display:block;
      margin-bottom:3px;
    }
    .tbl .td-desc small{font-size:11px;color:var(--muted);}
    .tbl .td-num{text-align:right;font-weight:500;color:#374151;}
    .tbl .td-total{text-align:right;font-weight:700;color:var(--forest);}
    .tbl tfoot td{
      padding:14px 18px;
      font-size:12px;
    }
    /* extras rows */
    .extra-row td{color:var(--muted);}

    /* ─── TOTALS + VERIFY ROW ─── */
    .bottom-row{
      display:grid;
      grid-template-columns:1fr 1fr;
      gap:28px;
      margin-top:4px;
    }

    /* verify block */
    .verify{
      border:1.5px dashed #D1D5DB;
      border-radius:14px;
      padding:18px 20px;
      display:flex;
      gap:16px;
      align-items:flex-start;
    }
    .qr{
      width:76px;height:76px;
      flex-shrink:0;
      border-radius:10px;
      background:repeating-linear-gradient(
        0deg,#e5e7eb 0px,#e5e7eb 1px,transparent 1px,transparent 6px),
        repeating-linear-gradient(
        90deg,#e5e7eb 0px,#e5e7eb 1px,transparent 1px,transparent 6px);
      background-color:#F9FAFB;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:8px;
      font-weight:700;
      color:#9CA3AF;
      text-align:center;
      line-height:1.4;
      letter-spacing:.05em;
    }
    .verify-text h6{
      font-size:12px;font-weight:700;
      color:var(--ink);margin-bottom:5px;
    }
    .verify-text p{font-size:11px;color:var(--muted);line-height:1.55;}
    .verify-text .book-id{
      margin-top:8px;
      display:inline-block;
      font-family:monospace;
      font-size:10px;
      background:#F3F4F6;
      border:1px solid var(--border);
      border-radius:6px;
      padding:3px 8px;
      color:#374151;
    }

    /* totals block */
    .totals{
      background:var(--forest);
      border-radius:14px;
      padding:22px 24px;
      color:#fff;
    }
    .tot-row{
      display:flex;
      justify-content:space-between;
      font-size:13px;
      padding:7px 0;
      color:rgba(255,255,255,.65);
      border-bottom:1px solid rgba(255,255,255,.08);
    }
    .tot-row:last-child{border-bottom:none;}
    .tot-row.highlight{color:rgba(255,255,255,.9);}
    .tot-row.grand{
      font-size:20px;
      font-weight:700;
      color:#fff;
      margin-top:10px;
      padding-top:14px;
      border-top:1px solid var(--gold);
      border-bottom:none;
    }
    .tot-row.grand span:last-child{color:var(--gold2);}

    /* ─── FOOTER ─── */
    .ftr{
      background:linear-gradient(135deg,var(--forest2),var(--forest));
      padding:30px 48px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:24px;
      margin-top:40px;
    }
    .ftr-quote{
      font-family:'Playfair Display',serif;
      font-style:italic;
      font-size:14px;
      color:rgba(255,255,255,.75);
      max-width:340px;
      line-height:1.6;
    }
    .ftr-contact{
      text-align:right;
      font-size:11px;
      color:rgba(255,255,255,.45);
      line-height:1.7;
    }
    .ftr-contact a{color:var(--gold2);text-decoration:none;}
    .ftr-contact strong{color:rgba(255,255,255,.75);display:block;font-size:12px;margin-bottom:2px;}

    /* gold rule between sections */
    .gold-rule{
      height:2px;
      background:linear-gradient(90deg,transparent,var(--gold),transparent);
      margin:0 48px 0;
      opacity:.35;
    }

    /* ─── ACTIONS (no-print) ─── */
    .actions{
      display:flex;
      justify-content:center;
      gap:14px;
      margin-top:32px;
    }
    .btn{
      padding:12px 30px;
      border-radius:10px;
      font-size:14px;
      font-weight:600;
      cursor:pointer;
      border:none;
      transition:all .18s;
      font-family:'Inter',sans-serif;
    }
    .btn-print{
      background:var(--forest);
      color:#fff;
      box-shadow:0 4px 14px rgba(0,56,43,.25);
    }
    .btn-print:hover{background:var(--forest2);transform:translateY(-1px);}
    .btn-close{
      background:#fff;
      color:var(--muted);
      border:1px solid var(--border);
    }
    .btn-close:hover{background:#F9FAFB;}

    @media print{
      body{background:#fff;padding:0;}
      .card{box-shadow:none;border-radius:0;}
      .actions{display:none;}
    }
  </style>
</head>
<body>

<div class="card">

  <!-- ════ HEADER ════ -->
  <div class="hdr">
    <div>
      <div class="brand-name">HotelB</div>
      <div class="brand-sub">Luxury Backwater Retreats</div>
      <div class="brand-addr">
        HotelB Hospitality Pvt. Ltd.<br/>
        Kumarakom, Kottayam — Kerala 686563<br/>
        GSTIN: 32AABCH1234F1Z5
      </div>
    </div>
    <div class="hdr-right">
      <div class="inv-word">Tax Invoice</div>
      <div class="inv-num">#${booking.bookingNumber}</div>
      <div class="inv-date">Issued: ${issueDate}</div>
      <div class="badge-paid"><span class="badge-dot"></span>Payment Confirmed</div>
    </div>
  </div>

  <div class="gold-rule"></div>

  <!-- ════ BODY ════ -->
  <div class="body">

    <!-- Bilateral -->
    <div class="bilateral">
      <div>
        <div class="bi-label">Billed To</div>
        <div class="bi-name">${guestName}</div>
        <div class="bi-detail">
          ${guestEmail}<br/>
          Loyalty Tier: <strong style="color:var(--ink)">${!booking.user?.loyaltyTier || booking.user?.loyaltyTier === 'None' ? 'Standard Member' : `${booking.user.loyaltyTier} Member`}</strong>
        </div>
      </div>
      <div class="bi-right">
        <div class="bi-label">Payment Details</div>
        <div class="bi-name" style="font-size:15px;">Paid in Full</div>
        <div class="bi-detail">
          Method: <strong style="color:var(--ink)">${booking.paymentMethod}</strong><br/>
          Transaction Date: ${issueDate}<br/>
          Status: <span style="color:var(--success);font-weight:600;">&#10003; Cleared</span>
        </div>
      </div>
    </div>

    <!-- Stay Strip -->
    <div class="sec-head">
      <span class="sec-title">Reservation Details</span>
      <div class="sec-line"></div>
    </div>
    <div class="stay-strip">
      <div class="strip-item">
        <div class="strip-label">Property</div>
        <div class="strip-value">${booking.stay?.title || 'HotelB Resort'}</div>
      </div>
      <div class="strip-item">
        <div class="strip-label">Location</div>
        <div class="strip-value">${booking.stay?.location || 'Kerala, India'}</div>
      </div>
      <div class="strip-item">
        <div class="strip-label">Check-In</div>
        <div class="strip-value">${checkInFmt}</div>
      </div>
      <div class="strip-item">
        <div class="strip-label">Check-Out</div>
        <div class="strip-value">${checkOutFmt}</div>
      </div>
      <div class="strip-item">
        <div class="strip-label">Duration</div>
        <div class="strip-value">${nights} Night${nights !== 1 ? 's' : ''}</div>
      </div>
    </div>

    <!-- Itemized Table -->
    <div class="sec-head">
      <span class="sec-title">Itemized Charges</span>
      <div class="sec-line"></div>
    </div>
    <table class="tbl">
      <thead>
        <tr>
          <th style="width:46%;text-align:left;">Description</th>
          <th style="text-align:right;">Rate/Night</th>
          <th style="text-align:right;">Nights</th>
          <th style="text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="td-desc">
            <strong>${booking.stay?.title || 'HotelB Resort'} &mdash; ${booking.roomTitle}</strong>
            <small>Premium accommodation &middot; inclusive breakfast &middot; private canoe access</small>
          </td>
          <td class="td-num">&#8377;${ratePerNight.toLocaleString('en-IN')}</td>
          <td class="td-num">${nights}</td>
          <td class="td-total">&#8377;${baseAmount.toLocaleString('en-IN')}</td>
        </tr>
        <tr class="extra-row">
          <td class="td-desc">
            <strong style="color:#374151;font-weight:500;">Complimentary Inclusions</strong>
            <small>Daily Ayurvedic spa (30 min) &middot; welcome amenity kit &middot; WiFi</small>
          </td>
          <td class="td-num" style="color:#16a34a;font-weight:600;">Complimentary</td>
          <td class="td-num">—</td>
          <td class="td-total" style="color:#16a34a;">&#8377;0</td>
        </tr>
        <tr class="extra-row">
          <td class="td-desc">
            <strong style="color:#374151;font-weight:500;">Guest Count</strong>
            <small>${booking.guestCount} Adult${booking.guestCount !== 1 ? 's' : ''}</small>
          </td>
          <td class="td-num">—</td>
          <td class="td-num">—</td>
          <td class="td-total" style="color:#374151;font-weight:500;">Included</td>
        </tr>
      </tbody>
    </table>

    <!-- Bottom Row: Verify + Totals -->
    <div class="bottom-row">
      <div class="verify">
        <div class="qr">QR<br/>CODE</div>
        <div class="verify-text">
          <h6>Booking Verified</h6>
          <p>Scan this code at the property to validate your reservation instantly. Issued under HotelB Secure Hospitality Protocol.</p>
          <span class="book-id">ID: ${booking._id.substring(0, 16).toUpperCase()}</span>
        </div>
      </div>

      <div class="totals">
        <div class="tot-row">
          <span>Subtotal (${nights} night${nights !== 1 ? 's' : ''})</span>
          <span>&#8377;${baseAmount.toLocaleString('en-IN')}</span>
        </div>
        <div class="tot-row highlight">
          <span>CGST (4.5%)</span>
          <span>&#8377;${Math.round(taxAmount / 2).toLocaleString('en-IN')}</span>
        </div>
        <div class="tot-row highlight">
          <span>SGST (4.5%)</span>
          <span>&#8377;${Math.round(taxAmount / 2).toLocaleString('en-IN')}</span>
        </div>
        <div class="tot-row highlight">
          <span>Complimentary Services</span>
          <span style="color:#4ade80;">&#8377;0</span>
        </div>
        <div class="tot-row grand">
          <span>Total Paid</span>
          <span>&#8377;${booking.totalAmount.toLocaleString('en-IN')}</span>
        </div>
      </div>
    </div>

  </div><!-- /body -->

  <!-- ════ FOOTER ════ -->
  <div class="ftr">
    <div class="ftr-quote">
      &ldquo;The backwaters whisper a promise of stillness — we honour that promise for every guest.&rdquo;
    </div>
    <div class="ftr-contact">
      <strong>HotelB Guest Relations</strong>
      <a href="mailto:support@hotelb.com">support@hotelb.com</a>
      +91 484 2884 000<br/>
      This is a computer-generated invoice &amp; requires no signature.
    </div>
  </div>

</div><!-- /card -->

<div class="actions">
  <button class="btn btn-close" onclick="window.close()">&#10005; Close</button>
  <button class="btn btn-print" onclick="window.print()">&#128438; Print / Save PDF</button>
</div>

</body>
</html>`);
    invoiceWindow.document.close();
  };

  if (loading) {
    return (
      <div className="text-center py-40">
        <span className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary inline-block"></span>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-40">
        <span className="material-symbols-outlined text-6xl text-primary mb-4">gavel</span>
        <h2 className="font-headline text-3xl text-primary font-medium mb-4">No Reservation Found</h2>
        <Link to="/" className="bg-primary text-on-primary px-6 py-2.5 rounded-lg font-semibold">
          Go Home
        </Link>
      </div>
    );
  }

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-20">
      {/* Success Header Section */}
      <header className="flex flex-col items-center text-center mb-16 space-y-6">
        <div className="w-20 h-20 bg-primary-container/15 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              className="success-checkmark-draw" 
              d="M5 13l4 4L19 7" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2"
            ></path>
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="font-headline text-3xl md:text-5xl text-primary leading-tight font-semibold">
            Your journey to serenity begins.
          </h1>
          <p className="font-body text-body-lg text-secondary max-w-xl mx-auto text-sm md:text-base">
            A confirmation email has been sent to your inbox. We are preparing for your arrival at the backwaters.
          </p>
        </div>
      </header>

      {/* Auto-Generated Receipt Notice */}
      <div className="mb-10 flex items-start gap-3 bg-primary/5 border border-primary/20 rounded-xl px-5 py-4 max-w-2xl mx-auto text-left">
        <span
          className="material-symbols-outlined text-primary text-[22px] mt-0.5 flex-shrink-0"
          style={{ fontVariationSettings: '"FILL" 1' }}
        >
          info
        </span>
        <div>
          <p className="text-sm font-bold text-primary mb-0.5">Receipt Automatically Generated</p>
          <p className="text-xs text-secondary leading-relaxed">
            Your receipt has been automatically generated. The invoice below is the official proof of your transaction with HotelB. Please download and keep it for your records.
          </p>
        </div>
      </div>

      {/* Main Confirmation Grid */}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter text-left">
        {/* Left Column: Details & Summary */}
        <div className="lg:col-span-7 space-y-gutter">
          {/* Booking ID & Quick Actions */}
          <div className="bento-card p-8 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="font-semibold text-[10px] text-secondary uppercase tracking-widest mb-1">Booking Confirmation</p>
              <h2 className="font-headline text-2xl text-on-surface font-semibold">#{booking.bookingNumber}</h2>
            </div>
            <button 
              onClick={handleDownloadInvoice}
              className="flex items-center gap-2 text-primary font-bold hover:underline text-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              Download Invoice
            </button>
          </div>

          {/* Stay Details */}
          <div className="bento-card p-8 rounded-xl space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
              <div className="space-y-1">
                <p className="font-semibold text-[10px] text-secondary uppercase tracking-wider">Check-in</p>
                <p className="font-semibold text-on-surface">{formatDate(booking.checkIn)}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-[10px] text-secondary uppercase tracking-wider">Check-out</p>
                <p className="font-semibold text-on-surface">{formatDate(booking.checkOut)}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-[10px] text-secondary uppercase tracking-wider">Guests</p>
                <p className="font-semibold text-on-surface">{booking.guestCount} Adults</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-[10px] text-secondary uppercase tracking-wider">Room</p>
                <p className="font-semibold text-on-surface line-clamp-1">{booking.roomTitle}</p>
              </div>
            </div>
            {/* Guest Info */}
            <div className="grid grid-cols-2 gap-6 text-sm pt-2">
              <div className="space-y-1">
                <p className="font-semibold text-[10px] text-secondary uppercase tracking-wider">Guest Name</p>
                <p className="font-semibold text-on-surface">{booking.user?.name || user?.name || '—'}</p>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-[10px] text-secondary uppercase tracking-wider">Email</p>
                <p className="font-semibold text-on-surface truncate">{booking.user?.email || user?.email || '—'}</p>
              </div>
            </div>
            <hr className="border-outline-variant/30"/>
            {/* Payment Summary */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-secondary font-medium">Total Amount Paid</p>
                <p className="font-headline text-2xl text-on-surface font-semibold">₹{booking.totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-2 bg-secondary-container/50 px-4 py-2 rounded-lg w-fit text-xs font-semibold text-on-secondary-container">
                <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
                <span>Paid via {booking.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-primary text-on-primary py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all text-sm shadow-md cursor-pointer"
            >
              <span className="material-symbols-outlined">edit_calendar</span>
              Manage Booking
            </button>
            <button 
              onClick={handleAddToCalendar}
              className="flex-1 border border-primary text-primary py-4 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-primary-container/10 transition-all text-sm cursor-pointer"
            >
              <span className="material-symbols-outlined">calendar_add_on</span>
              Add to Calendar
            </button>
          </div>
        </div>

        {/* Right Column: Property Preview */}
        <div className="lg:col-span-5">
          <div className="bento-card rounded-xl overflow-hidden h-full flex flex-col justify-between">
            <div className="relative h-64 md:h-80">
              <img className="w-full h-full object-cover" src={booking.stay?.image} alt={booking.stay?.title} />
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-on-surface shadow-sm">
                <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                <span>{booking.stay?.rating.toFixed(1)} Premium Stay</span>
              </div>
            </div>
            <div className="p-8 flex-1 flex flex-col justify-between">
              <div>
                <p className="font-semibold text-[10px] text-primary uppercase tracking-widest mb-2">Your Sanctuary</p>
                <h3 className="font-headline text-2xl text-on-surface mb-1 font-semibold">{booking.stay?.title}</h3>
                <div className="flex items-center gap-1 text-secondary text-xs font-semibold">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  <p>{booking.stay?.location}</p>
                </div>
              </div>
              <div className="mt-8">
                <button 
                  onClick={() => navigate('/stays')}
                  className="w-full text-center py-4 bg-secondary-container text-on-secondary-container rounded-lg font-bold hover:bg-secondary-fixed transition-all flex items-center justify-center gap-2 text-sm"
                >
                  Explore More Stays
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Section */}
      <section className="mt-20 pt-20 border-t border-outline-variant/30 text-center space-y-10">
        <h4 className="font-headline text-2xl text-on-surface italic">"The water is the mirror of the sky's soul."</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter opacity-60 max-w-4xl mx-auto">
          <div className="space-y-2">
            <span className="material-symbols-outlined text-3xl">wifi</span>
            <p className="font-semibold text-[10px] uppercase tracking-wider">Satellite WiFi</p>
          </div>
          <div className="space-y-2">
            <span className="material-symbols-outlined text-3xl">restaurant</span>
            <p className="font-semibold text-[10px] uppercase tracking-wider">Curated Dining</p>
          </div>
          <div className="space-y-2">
            <span className="material-symbols-outlined text-3xl">spa</span>
            <p className="font-semibold text-[10px] uppercase tracking-wider">Ayurvedic Care</p>
          </div>
          <div className="space-y-2">
            <span className="material-symbols-outlined text-3xl">nature</span>
            <p className="font-semibold text-[10px] uppercase tracking-wider">Sustainable Luxury</p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default BookingConfirmed;
