# CasaEstate AI Platform — Refactoring & Feature Upgrades Changelog

This document lists all active modifications, design enhancements, and backend refactors introduced to the CasaEstate platform.

---

### 🎨 Focus & Branding Realignment (AI-First Operations)
- [x] **Branding Overhaul**: Shifted homepage copy and visual guides to highlight an **AI-First Autonomous Real Estate Platform** rather than a generic properties brochure.
- [x] **Branding Rename**: Renamed the "Workflow AI" section to **"Casa AI"** across all header navigation bars, route links, and buttons.
- [x] **Removed Tower Portfolios Catalog**: Deleted the static tower listing grids and properties searches, keeping the page focused on AI-driven construction tracking and investor portal controls.
- [x] **Sliding Theme Switcher Integration**: Removed the floating theme pill from the homepage body and integrated it as a responsive sliding theme switcher directly in the header [Navbar.jsx](file:///C:/Users/kumar/.gemini/antigravity/scratch/aura-estates/frontend/src/components/Navbar.jsx).

---

### 🔒 Standard Credentials Login (No OTP / No Google Auth)
- [x] **Email & Password Authentication**: Removed all Google Single Sign-On (SSO/GSI) APIs and OTP verification codes, implementing a standard **Email ID and Password** form field for registration and logins.
- [x] **Automatic Role Router**: Programmatically redirects authenticated sessions to their designated dashboards:
  - **Client / Buyer Users** -> Routed to the `/buyer-lounge` properties space.
  - **Resident Users** -> Routed to the `/resident-portal`.
  - **Administrators** -> Routed to the `/admin` console.
  - **Site Engineers** -> Routed to the `/engineer` console.
- [x] **Pre-Seeded Test Credentials**: Configured SHA-256 hashed password credentials for testing roles in the database controller, printing them directly on the login card for easy evaluation:
  - **Resident**: `arjun.mehta@email.com` / `password123`
  - **Admin**: `admin@casaestate.com` / `password123`
  - **Site Engineer**: `engineer@casaestate.com` / `password123`

---

### 🤖 Casa AI Dashboard (Glassmorphism & Security)
- [x] **Vibrant Glassmorphism Styling**: Redesigned all cards, telemetry logs, document boxes, and headers inside [WorkflowDashboard.jsx](file:///C:/Users/kumar/.gemini/antigravity/scratch/aura-estates/frontend/src/pages/WorkflowDashboard.jsx) with translucent backdrops (`bg-white/50 backdrop-blur-md` in light mode, `dark:bg-stone-900/40` in dark mode) layered over a radial mesh gradient to match the website theme.
- [x] **Role Passcode Gates**: Gated access to both the **Site Engineer** and **Builder Admin** sections of the Casa AI panel behind passcode authentication prompts (`engineer123` and `admin123`).
- [x] **Back Navigation Controls**: Integrated a visible `← Back to Home` control in the dashboard header to allow easy return navigation.

---

### 🔒 Concurrency & Data Isolation
- [x] **React Error Boundary Shield**: Integrated [ErrorBoundary.jsx](file:///C:/Users/kumar/.gemini/antigravity/scratch/aura-estates/frontend/src/components/ErrorBoundary.jsx) and wrapped the root component tree to isolate rendering exceptions and prevent total page crashes.
- [x] **Owner Data Scoping (Zero Leakage)**: Secured the ledger and booking controllers in the Express backend. Non-admin users are strictly restricted to querying records matched with their specific token payload (`req.user.userId`), preventing cross-user data leakage.

---

### 💬 Unrestricted CasaBot Chat Widget
- [x] **Unrestricted Answering Bot**: Enhanced the chatbot instructions in the backend routing to allow the bot to answer any developer query (code, math, logic) while preserving its CasaEstate persona. Raised output limits to 800 tokens for comprehensive detail.
- [x] **Hardcoded Server Key**: Removed the settings gear and manual API key inputs from the widget. The bot now authenticates using the secure backend environment variable key.

---

### ⚙️ Python Event-Driven Swarm Backend
- [x] **FastAPI Microservice Architecture**: Created `casa_ai_backend/` containing SQLAlchemy databases, schemas, and async pub-sub swarm triggers (`agents.py` and `event_bus.py`) to manage site delays and compliance ledger audits in the background.

---

### 💎 Footer Realignment
- [x] **Detailed Footer Layout**: Replaced the simple footer link strip with a detailed, four-column structure highlighting RERA credentials, operations gateways, and Google Gemini integrations.
