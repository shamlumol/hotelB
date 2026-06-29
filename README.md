#  HotelB - Luxury Retreats & Backwater Escapes

HotelB is a MERN-stack web application for booking luxury houseboats and heritage retreat experiences in Kerala, India. It features a premium user interface, customer loyalty system, dynamic stays catalog, and integrated checkout payments.

---

## Quick Start Guide (From Beginning to End)

Follow these steps in order to get the entire project up and running locally.

### Step 1: Start MongoDB
Ensure your local MongoDB instance is running. If utilizing the temporary project config, run this command in your root directory:
```bash
mongod --config mongod_temp.cfg
```

### Step 2: Setup & Seed the Backend
Open a new terminal window, navigate to the `backend/` folder, install dependencies, and run the database seeder:
```bash
cd backend
npm install
node scripts/seed.js
```
*Note: Seeding clears the old collections and populates the database with 108 luxury stays, experiences, mock users, and past booking entries.*

### Step 3: Start the Backend Server
Start the Express API server (runs on port `5000`):
```bash
npm start
```

### Step 4: Setup & Start the Frontend
Open another terminal window, navigate to the `frontend/` folder, install dependencies, and start the Vite development server:
```bash
cd frontend
npm install
npm run dev
```

Open your browser and navigate to **`http://localhost:5173/`** to begin exploring the application.

---

## Seeded Test Accounts

You can log in instantly with these pre-configured user credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Traveler (Regular User)** | `traveler@hotelb.com` | `password123` |
| **Administrator** | `admin@hotelb.com` | `password123` |

---

## Stripe Test Payments
* **Integration:** Rendered securely via Stripe Elements.
* **Testing:** Select **Credit Card** during checkout and input the Stripe test card:
  * **Card Number:** `4242 4242 4242 4242`
  * **Expiry & CVV:** Any future date and any 3-digit CVV (e.g. `12/30`, `123`).
* **Zero-Config Simulation:** If your Stripe keys in `.env` are placeholders, the payment will automatically run in a safe, visual **simulated mode** so you can test checkout without any keys!
* **Configuration:** To use your real Stripe developer account, replace the Stripe keys in `backend/.env` and `frontend/.env` with your actual Stripe credentials.

---

##  Email Confirmations
* **Real Emails:** Configure your Gmail credentials in `backend/.env`:
  ```env
  EMAIL_USER=your-email@gmail.com
  EMAIL_PASSWORD=your-gmail-app-password
  ```
  *(Requires a Google Account App Password generated under your Security settings).*
* **Fallback (Ethereal Mail):** If your credentials are not set up, the app automatically generates a mock Ethereal SMTP account. Each booking prints a click-to-open **Preview URL** link directly in your backend terminal console.
* **Online Mailbox:** Access the shared test inbox at [ethereal.email/login](https://ethereal.email/login):
  * **Username:** `s2vukzasycjnz2es@ethereal.email`
  * **Password:** `N1jyM6TFvbWrx478es`

---

##  WhatsApp & SMS Alerts
* **Simulation Mode:** By default, Twilio alerts run in simulation mode. All message contents (check-in/check-out dates, invoice totals, reservation details) are printed directly to the backend server logs.
* **Configuration:** If you want real WhatsApp/SMS delivery, uncomment the Twilio fields in `backend/.env` and add your Twilio Account SID, Auth Token, and phone numbers.

---

##  Testing Suites
HotelB contains automated test suites for both frontend and backend to verify feature stability.

### Backend Tests (Jest & Supertest)
Run the authentication API test suite:
```bash
cd backend
npm test
```
*Tests cover user registration, login credentials verification, welcome loyalty points bonuses, and profile endpoint authorization.*

### Frontend Tests (Vitest & jsdom)
Run the frontend unit test suite:
```bash
cd frontend
npm test
```
*Tests run inside a mocked browser DOM environment (`jsdom`) to verify frontend components and logic.*

---

##  CI/CD Pipeline & Deployments
This repository includes a pre-configured GitHub Actions CI/CD workflow (`.github/workflows/deploy.yml`) that executes on every push/pull-request to the `main` or `master` branches:

1. **Test-Backend:** Spawns a clean MongoDB environment and executes the Jest test suite.
2. **Test-Frontend:** Performs the Vitest test run and validates the frontend production compile (`npm run build`).
3. **Deploy-Backend (Netlify):** Deploys the Express server as serverless functions to Netlify.
4. **Deploy-Frontend (Vercel):** Deploys the built static Vite application to Vercel.

### Required GitHub Repository Secrets
To enable successful automated deployments, configure these secrets in your repository settings:
* `NETLIFY_AUTH_TOKEN` & `NETLIFY_SITE_ID` (for backend deployments)
* `VERCEL_TOKEN`, `VERCEL_ORG_ID`, & `VERCEL_PROJECT_ID` (for frontend deployments)

