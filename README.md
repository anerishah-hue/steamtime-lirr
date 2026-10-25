# BrassLine — Every line, right on time (SBU Hacks 2026 — Theme: Steel and Steam)

> **BrassLine: Every line, right on time. Victorian Mechanical Timetable, Toll & Congestion Dynamo, and Gemini AI Conductor for Long Island Rail Road Commuters.**

Targeting:
- **Beginner Track**
- **UI/UX Track**
- **Google Gemini API Track**

---

## 🚂 The Vision: Steel & Steam Meets Everyday Long Island Commuters

The Long Island Rail Road is the oldest continuously operating railroad under its original charter in the United States (founded in 1834 during the dawn of the Industrial Steam Revolution). 

**BrassLine** re-envisions the everyday commuter experience through the lens of Victorian mechanical engineering and industrial Gilded Age aesthetics, while solving everyday commuter problems with state-of-the-art AI.

---

## ⚙️ Key Enhancements & Features

### 1. The Congestion & Toll Avoidance Dynamo (Ground Truth Data Telemetry)
While the official MTA TrainTime app only shows a basic carbon estimate, BrassLine features an interactive mechanical boiler dashboard grounded in verified real-world sources:
- **Tolls Avoided Counter:** Official MTA Bridges & Tunnels 2026 E-ZPass rate schedule ($7.38 Queens-Midtown Tunnel / RFK) + MTA Central Business District (CBD) Tolling Program ($9.00 off-peak / $15.00 peak). Bypassing highway toll plazas saves **$16.38 to $26.06 per trip** (or up to $37.56 round trip with mail rates).
- **L.I.E. Gridlock Pressure Gauge:** NYSDOT / 511NY sensor speeds along Interstate 495 (Long Island Expressway) comparing 55 mph baseline against 21–24 mph rush hour standstills. Saves **35 to 80 minutes** of bumper-to-bumper braking.
- **Gas & Wear Register:** Fuel saved calculated using AAA 2026 Driving Benchmarks (24.5 MPG @ $3.49/gal) + avoided Manhattan municipal parking fees ($12–$25).
- **Atmospheric Steam vs. Smog Meter:** EPA light-vehicle emissions standard (0.89 lbs CO₂/mile) vs. LIRR electric third-rail locomotive (0.12 lbs/passenger-mile).
- **Transparent Data Sources Drawer:** One-click "Data Sources" button right on the dashboard to inspect the exact formulas and telemetry.

### 2. Enter-Key Schedule Search & Authentic LIRR Runs
- Select departure and arrival stations with instant swap.
- Type custom departure times (e.g. `8:30 AM`, `5:15 PM`) or select quick presets (`Now`, `8:00 AM`, `12:30 PM`, `5:15 PM`).
- Press the **Enter key** on your keyboard or click the **Update** button to immediately refresh the timetable.
- Official MTA fare zone calculations:
  - Zone 10 (Stony Brook / Port Jeff) to Zone 1 (Penn / Grand Central): $19.25 Peak, $14.00 Off-Peak.
  - Automatically calculates discounts for Veterans (-50%), Seniors (-50%), and SBU Students (-33%).

### 3. "The Conductor" Stationmaster Abernathy (Google Gemini 3.8 Flash)
- **Free-Form Chat:** Ask anything in plain English:
  - *"What are the exact ticket prices for veterans traveling into NYC?"*
  - *"Where can I get good artisanal coffee near Stony Brook station under $10?"*
  - *"I'm a senior citizen, what are the off-peak 50% discount rules?"*
- **Actionable Transit Details:** Conductor Abernathy quotes exact fares, TVM ticket purchasing steps, SBU campus shuttle loops, and quiet-car study tips.
- **Fail-Safe Reliability:** Works seamlessly with your Google Gemini API key or via the built-in intelligent transit engine.

### 4. Station Vicinity Guide with Budget Filters
Explore dining, coffee, and sights around stations filtered by budget:
- **Under $25:** Quick casual, coffee roasters, grab-and-go bakeries, student favorites (e.g. SBU SAC, Druthers Coffee, Green Cactus, Tara Inn).
- **$25 – $50:** Sit-down taverns, grills, seafood shacks (e.g. Three Village Inn Mirabelle Tavern, Moynihan Food Hall).
- **$50+:** Premier fine dining, historic 1710 taverns, Grand Central Oyster Bar, Summit One Vanderbilt.
- **Free:** Public harbor parks, university campuses, and historic monuments.

### 5. Clean Commuter Account Management
- Clean, intuitive account setup with zero confusing jargon:
  - **Military Veteran / Active Duty:** 50% off-peak reduced fare ($7.00 vs $14.00), active duty military discounts, and accessible car priority.
  - **Senior Citizen (65+):** 50% off-peak discount and elevator/boarding assistance.
  - **SBU Student / Scholar:** 33% monthly university commuter ticket discount and campus shuttle links.
  - **Daily Commuter:** Rush hour express routing and monthly savings tracking.
  - **Visitor / Explorer:** Station vicinity guides and off-peak CityTicket rates ($5.00 within NYC).

### 6. Mobile Handset View & Offline SVG QR Code
- Click the **Phone View** button to open the instant QR Code modal—featuring a 100% offline-rendered SVG QR code and a direct live link (`https://steamtime-lirr.vercel.app`) so judges can scan and test the app live on their phones!
- Click **Handset** on desktop to preview the app inside a mobile handset mockup with responsive navigation and no clipping.
- Click the **spinning gear in the top-left** at any time to return immediately to the main schedule screen.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Design:** Refined industrial slate, dark graphite (`#121316`), warm bronze & amber metallic accents, Cinzel display serif, Share Tech Mono
- **AI Engine:** Google Gemini 3.8 Flash (`@google/genai` SDK)
- **Tooling:** Vite 6 with network `--host` support

---

## 🚀 Running Locally

```bash
cd C:\Users\imane\.gemini\antigravity\scratch\steamtime-lirr
npm run dev
```

- Local browser: `http://localhost:5173/`
- Production live site: `https://steamtime-lirr.vercel.app`
