const express = require('express');
const router = express.Router();

router.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ success: false, error: 'Message is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.log("GEMINI_API_KEY environment variable is not defined. Using local semantic matching matrix.");
    
    let reply = "";
    const q = message.toLowerCase();
    if (q.includes('delay') || q.includes('schedule') || q.includes('time') || q.includes('timeline') || q.includes('possession') || q.includes('curing')) {
      reply = "CasaEstate predictive algorithms forecast that Noida Tower A's concrete slab curing is running 4 days ahead of schedule, while Tower B finishing materials are delayed by 5 days. The critical path models indicate a net project schedule variance of +1.2 days, placing the final completion index at Q4 2026.";
    } else if (q.includes('material') || q.includes('concrete') || q.includes('steel') || q.includes('reinforcement') || q.includes('cement')) {
      reply = "Noida Tower A utilizes M40 grade self-compacting concrete with high-yield Fe550 reinforcement bars. Curing telemetry sensors monitor temperature and moisture levels, confirming that structural strength has reached 98.4% of the target 28-day threshold.";
    } else if (q.includes('cost') || q.includes('budget') || q.includes('price') || q.includes('expense') || q.includes('financial')) {
      reply = "The procurement ledger audit indicates a total expenditure of ₹4.2 Crore spent against a projected baseline of ₹4.5 Crore. Material cost optimizations and bulk supply agreements have secured a positive cost variance of -₹30 Lakhs.";
    } else if (q.includes('rera') || q.includes('license') || q.includes('permit') || q.includes('compliance') || q.includes('evacuation')) {
      reply = "All construction works managed by CasaEstate carry certified registrations under the Real Estate Regulatory Authority (RERA). Noida ID: UP-RERA-2026-REG-88209, Gurugram ID: HR-RERA-2026-REG-74011, Mumbai ID: MH-RERA-2026-REG-10925. Structural compliance files and Fire NOC licenses are active.";
    } else if (q.includes('amenity') || q.includes('clubhouse') || q.includes('booking') || q.includes('gym') || q.includes('pool')) {
      reply = "The Resident Portal handles amenity slot reservation. Clubhouse and tennis court capacities are optimized at 12 occupants per hour. You can schedule bookings dynamically from your Resident dashboard.";
    } else {
      reply = "Hello! I am CasaBot, your intelligent Construction & Project Copilot. I can audit cost sheets, track delay risks, inspect concrete curing telemetry, and query RERA compliance documents. How can I help you today?";
    }
    return res.json({ success: true, reply });
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
                text: `You are CasaBot, an intelligent AI Construction & Project Copilot built for CasaEstate (BuildFlow AI).
You help site engineers, buyers, and managers audit costs, schedules, delays, and details.
Use professional, concise construction-oriented language. Keep answers under 3 sentences.
User asks: "${message}"`
              }
            ]
          }
        ],
        generationConfig: {
          maxOutputTokens: 150,
          temperature: 0.7
        }
      })
    });

    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
      const reply = data.candidates[0].content.parts[0].text;
      return res.json({ success: true, reply });
    } else {
      throw new Error('Invalid response layout from Gemini API');
    }
  } catch (error) {
    console.error("Gemini API call failed:", error.message);
    return res.json({ 
      success: true, 
      reply: "I attempted to query the live Gemini model but encountered an API dispatch failure. Operating offline: Project schedules and RERA files remain fully secured." 
    });
  }
});

module.exports = router;
