const express = require('express');
const router = express.Router();

// Helper to generate offline response
function getOfflineResponse(message) {
  const q = message.toLowerCase();
  if (q.includes('delay') || q.includes('schedule') || q.includes('time') || q.includes('timeline') || q.includes('possession') || q.includes('curing')) {
    return "CasaEstate predictive algorithms forecast that Noida Tower A's concrete slab curing is running 4 days ahead of schedule, while Tower B finishing materials are delayed by 5 days. The critical path models indicate a net project schedule variance of +1.2 days, placing the final completion index at Q4 2026.";
  } else if (q.includes('material') || q.includes('concrete') || q.includes('steel') || q.includes('reinforcement') || q.includes('cement')) {
    return "Noida Tower A utilizes M40 grade self-compacting concrete with high-yield Fe550 reinforcement bars. Curing telemetry sensors monitor temperature and moisture levels, confirming that structural strength has reached 98.4% of the target 28-day threshold.";
  } else if (q.includes('cost') || q.includes('budget') || q.includes('price') || q.includes('expense') || q.includes('financial')) {
    return "The procurement ledger audit indicates a total expenditure of ₹4.2 Crore spent against a projected baseline of ₹4.5 Crore. Material cost optimizations and bulk supply agreements have secured a positive cost variance of -₹30 Lakhs.";
  } else if (q.includes('rera') || q.includes('license') || q.includes('permit') || q.includes('compliance') || q.includes('evacuation')) {
    return "All construction works managed by CasaEstate carry certified registrations under the Real Estate Regulatory Authority (RERA). Noida ID: UP-RERA-2026-REG-88209, Gurugram ID: HR-RERA-2026-REG-74011, Mumbai ID: MH-RERA-2026-REG-10925. Structural compliance files and Fire NOC licenses are active.";
  } else if (q.includes('amenity') || q.includes('clubhouse') || q.includes('booking') || q.includes('gym') || q.includes('pool')) {
    return "The Resident Portal handles amenity slot reservation. Clubhouse and tennis court capacities are optimized at 12 occupants per hour. You can schedule bookings dynamically from your Resident dashboard.";
  } else {
    return "Hello! I am CasaBot, your intelligent Construction & Project Copilot. I can audit cost sheets, track delay risks, inspect concrete curing telemetry, and query RERA compliance documents. How can I help you today?";
  }
}

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  // Check for API key (custom or env)
  const apiKey = req.body.customApiKey || req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.log("No Gemini API key provided or found. Using offline semantic fallback.");
    return res.json({ success: true, reply: getOfflineResponse(message) });
  }

  try {
    // Call Gemini API via fetch (Node 18 native fetch is fully supported)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `You are CasaBot, an intelligent AI Construction, Project and General Purpose Copilot built for CasaEstate.
Although your core expertise is real estate, construction tracking, RERA compliance, and B2B wholesale desks, you can answer ANY questions, including general knowledge, history, code, math, or writing.

Here is the current, official Project Progress and Telemetry Report for CasaEstate projects:
1. Casa Horizon (Noida):
   - RERA Registration Number: UP-RERA-2026-REG-88209
   - Status: Under Construction, Possession Q4 2026
   - Structural concrete grade: M40 self-compacting concrete
   - Steel reinforcement: Fe550 high-yield rebars
   - Curing Telemetry: Structural strength has reached 98.4% of the target 28-day threshold. Slab curing is running 4 days ahead of schedule.
   - Delay Variance: Noida Tower A is 4 days ahead of schedule. Tower B finishing materials are delayed by 5 days. Net schedule variance is +1.2 days (LOW Risk).
   - Financial Auditing: Spent ₹4.2 Crore against a projected ₹4.5 Crore baseline. Material cost optimizations secured a positive cost variance of -₹30 Lakhs.
2. Casa Serenity (Gurugram):
   - RERA Registration Number: HR-RERA-2026-REG-74011
   - Status: Ready to Move, immediate handover.
3. Casa Pinnacle (Mumbai):
   - RERA Registration Number: MH-RERA-2026-REG-10925
   - Status: Under Construction, Possession Q2 2028.

If the user's query is about a specific project or its status (e.g. concrete grade, delays, RERA numbers, or curing strength), look up the information from the report above and respond in a highly detailed, professional, construction-oriented manner.
If the query is a general question (e.g. coding, math, general advice, history, etc.), answer it directly, comprehensively, and helpfully.

User asks: "${message}"`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7
        }
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.json({ success: true, reply });
    } else {
      console.warn("Invalid response layout from Gemini API:", JSON.stringify(data));
      throw new Error(data.error?.message || 'Invalid response layout from Gemini API');
    }
  } catch (error) {
    console.error("Gemini API call failed:", error.message);
    return res.json({ 
      success: true, 
      reply: `I attempted to query the live Gemini model but encountered an API dispatch failure (${error.message}). Operating offline fallback: ${getOfflineResponse(message)}` 
    });
  }
});

module.exports = router;
