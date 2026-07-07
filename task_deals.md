# CasaEstate Refactoring Task Checklist — All Tasks Complete ✅

## 🎨 Visual & Theme Fixes
- `[x]` In Navbar.jsx, style "Casa" branding with text-amber-700 dark:text-amber-400 (muted bronze/amber).
- `[x]` In Navbar.jsx, style "Estate" with text-stone-600 dark:text-stone-400.
- `[x]` In Navbar.jsx, adjust layout gap columns and widths to prevent overlap.
- `[x]` In Navbar.jsx, set permanent solid white/stone backdrop matching active colors to fix tree image blending and header overlapping.
- `[x]` In Home.jsx, remove Browse Properties, Our Story, Contact links from image background top bar.
- `[x]` In Home.jsx, remove "Book a Viewing" hero overlay container entirely to resolve navbar collision.
- `[x]` In Home.jsx, fix bottom left blueprint drawing container strokes for visibility in both light & dark themes.
- `[x]` In Home.jsx, change Select Your Desired Path card backgrounds from invalid bg-stone-850 to bg-stone-800 and set visible text-stone-300 colors.
- `[x]` In Deals.jsx, fix Select Tower Portfolio inactive cards to use valid dark:bg-stone-900 and high contrast text (text-slate-900 / dark:text-white).
- `[x]` In Deals.jsx, change invalid stone-955 metrics card bg to valid bg-stone-900/95 to prevent white card text invisibility.

## 🤖 Feature 1: B2B Wholesale Negotiation desk
- `[x]` In ProjectDetail.jsx, embed B2B Wholesale Desk panel drawer.
- `[x]` Build interactive chat terminal UI with console styled text typing animation.
- `[x]` Implement local offer evaluation rules against project inventories.

## 📄 Feature 2: Allotment Letter Endpoints & Ledger Persistence
- `[x]` Create backend route POST /api/v1/negotiations/finalize.
- `[x]` Create backend controller to save transaction logs to Ledger and reserve Units.

## 📊 Feature 3: Predictive Cockpit Dashboard
- `[x]` Update AdminDashboard.jsx to show live inventory scarcity index.
- `[x]` Render simulated recommendation alerts based on B2B wholesaling margin bounds.

## 🚀 Second Batch Fixes (Real-Time Interactive Enhancements)
- `[x]` Dynamic landing blueprints: left layout drawing updates dynamically as you scroll the carousel.
- `[x]` High-contrast navigation arrows: corrected hover colors to avoid buttons becoming invisible.
- `[x]` Real-time SMS OTP Simulator: return OTP in the API payload and display slide-down SMS toaster on the UI screen.
- `[x]` Active Deals page:
  - `[x]` Preselected unit lock trigger: Book Allotment automatically constructs valid RERA unit states.
  - `[x]` Interactive blueprint maps: Blueprint Map buttons open beautiful custom SVG blueprints for Noida, Gurugram, and Mumbai.
  - `[x]` Real-time tour schedulers: Book a Viewing opens a dedicated scheduling modal submitting viewing slots directly to the backend database.
  - `[x]` Legible Booking Wizard: replaced invalid bg-stone-850 cards in BookingForm.jsx with standard bg-stone-800 cards.
- `[x]` Fire safety drill map: Download Evacuation Plan button displays interactive emergency escape floorplans with download PDF options.
- `[x]` Working legal footer: Terms, Privacy, and RERA links trigger sleek legal documentation modals on click.
