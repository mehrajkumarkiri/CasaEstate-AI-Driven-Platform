# CasaEstate — Refactoring & Feature Upgrades Changelog

This document lists all modifications, design choices, and security updates introduced to the CasaEstate platform.

---

## 🎨 Focus & Branding Realignment (Problem Solving & AI-First)
*   **Aesthetics Reorientation**: Shifted the home page copy and visual layout from a generic real estate listings brochure to an **AI-First Autonomous Real Estate Platform**.
*   **Hero Upgrade**: The hero title is updated to showcase the integration of multi-agent swarm loops, predictive delay trackers, and automated RERA compliance ledgers.
*   **AIVoiceChatSimulator Integration**: Prominently embedded the voice call simulator directly on the home page client section to highlight AI-driven customer operations.

---

## 🔒 Security & Concurrency Enhancements (Multiple User Access & No Data Leakage)
1.  **React Error Boundary Shield**:
    *   Created [ErrorBoundary.jsx](file:///C:/Users/kumar/.gemini/antigravity/scratch/aura-estates/frontend/src/components/ErrorBoundary.jsx).
    *   Wrapped the main entry point in [main.jsx](file:///C:/Users/kumar/.gemini/antigravity/scratch/aura-estates/frontend/src/main.jsx) to intercept and recover from any rendering or JavaScript execution crashes without breaking the web app.
2.  **JWT Mismatch Resolution**:
    *   Aligned the default token signing secret in the authentication controller with the secret verified by the gateway middleware in [authMiddleware.js](file:///C:/Users/kumar/.gemini/antigravity/scratch/aura-estates/backend/src/middleware/authMiddleware.js).
3.  **Owner Data Scoping**:
    *   Secured bookings routes ([bookingRoutes.js](file:///C:/Users/kumar/.gemini/antigravity/scratch/aura-estates/backend/src/routes/bookingRoutes.js)) and ledger routes ([ledgerRoutes.js](file:///C:/Users/kumar/.gemini/antigravity/scratch/aura-estates/backend/src/routes/ledgerRoutes.js)) with JWT `authenticate` middleware.
    *   Enforced check in [bookingController.js](file:///C:/Users/kumar/.gemini/antigravity/scratch/aura-estates/backend/src/controllers/bookingController.js) and [ledgerController.js](file:///C:/Users/kumar/.gemini/antigravity/scratch/aura-estates/backend/src/controllers/ledgerController.js):
        *   Non-admin users can **only** query or download their own transactions (`userId === req.user.userId`).
        *   Admins retain global lookup capabilities.
        *   This guarantees zero data redundancy or leakage where User A could view User B's entries.

---

## 🌐 Dynamic Landing Portal Entry Gate (Role Routing on Opening)
*   **Entry Popup Gate**:
    *   Designed a role picker popup that mounts upon landing on `/`.
    *   Allows entering as:
        1.  **Client / Investor**: Closes popup and presents properties and AI tools.
        2.  **Resident**: Redirects to the Resident Portal login screen.
        3.  **Site Engineer**: Prompts for passcode (`engineer123`). Grants instant session and redirects to Field Console.
        4.  **Builder Admin**: Prompts for passcode (`admin123`). Grants instant session and redirects to Admin Cockpit.
*   **Client Search Bar**:
    *   Added a real-time properties search bar on the homepage to filter towers (Noida, Gurugram, Mumbai) by address, name, or status.

---

## 🎙️ AI Voice Call Desk & Operations Simulator
*   Created [AIVoiceChatSimulator.jsx](file:///C:/Users/kumar/.gemini/antigravity/scratch/aura-estates/frontend/src/components/AIVoiceChatSimulator.jsx):
    *   **Call Mode**: Renders a glowing audio waveform animation and voice-speaking logs. Simulates an operations helpline where clients query telemetry details (concrete density, RERA status, cost variance).
    *   **Chat Mode**: Simulates a WhatsApp chat.
    *   Both modes utilize the backend Gemini endpoint to generate precise answers from the latest progress telemetry.

---

## 🤖 Workflow AI Glassmorphism & Passcode Security
*   **Glassmorphic Theme**:
    *   Upgraded [WorkflowDashboard.jsx](file:///C:/Users/kumar/.gemini/antigravity/scratch/aura-estates/frontend/src/pages/WorkflowDashboard.jsx) container grids and console panels to vibrant glassmorphism designs with translucent backdrops (`backdrop-blur-md bg-white/5 border-white/10`).
*   **Role Passcode Gates**:
    *   Separated Site Engineer and Admin sections. Selecting these roles now requires `engineer123` / `admin123` passcodes.
*   **Navigation Back Button**:
    *   Integrated a clear `← Back to Home` button in the header bar and login overlay to easily navigate back.

---

## 💬 Unrestricted Gemini Chatbot Upgrade
*   **General Purpose Answering**:
    *   Upgraded [aiRoutes.js](file:///C:/Users/kumar/.gemini/antigravity/scratch/aura-estates/backend/src/routes/aiRoutes.js) prompt instructions. The bot can now answer **any** question, including coding, history, and math, while holding its persona.
    *   Increased response tokens limit from 150 to 800 to enable detailed logs.
*   **Custom Client Keys Settings**:
    *   Upgraded [CasaBotWidget.jsx](file:///C:/Users/kumar/.gemini/antigravity/scratch/aura-estates/frontend/src/components/CasaBotWidget.jsx). Added a settings gear button enabling users to configure their own Gemini API key in `localStorage` which is dynamically sent in requests.
    *   Added simple Markdown rendering to parse generated code blocks (` ``` `) in chat bubbles.

---

## 💎 Footer Overhaul
*   Replaced the simple footer link strip with a detailed, four-column structure highlighting **AI Core Services**, **Operational Access Portals**, **RERA registrations**, and **Google Gemini** backend engine integrations.
