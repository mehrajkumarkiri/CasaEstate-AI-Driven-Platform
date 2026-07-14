import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function CasaBotWidget() {
  const { pushNotification } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hello! I am CasaBot, your intelligent Construction & Project Copilot. I can answer ANY questions (coding, calculations, general queries) using Gemini AI. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');

    // Append user message
    const userMsg = {
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();
      
      const botMsg = {
        sender: 'bot',
        text: data.reply || "I encountered an issue verifying the structural database logs. Please verify connection.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      // Mock Fallback
      setTimeout(() => {
        let reply = "";
        const q = text.toLowerCase();
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

        setMessages((prev) => [...prev, {
          sender: 'bot',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  const chips = [
    "Predict Delay Risks",
    "Tower A Cost Audit",
    "Show RERA License",
    "Write a quick python script"
  ];

  // Helper to format messages with simple code block styling
  const renderMessageText = (text) => {
    if (text.includes('```')) {
      const parts = text.split('```');
      return parts.map((part, index) => {
        if (index % 2 === 1) {
          // It's a code block
          const lines = part.trim().split('\n');
          const lang = lines[0].length < 10 ? lines[0] : '';
          const code = lang ? lines.slice(1).join('\n') : lines.join('\n');
          return (
            <pre key={index} className="bg-slate-900 text-emerald-400 p-3 rounded-lg overflow-x-auto my-2 font-mono text-[10px] text-left">
              {lang && <span className="text-[8px] text-slate-500 uppercase block mb-1">{lang}</span>}
              <code>{code}</code>
            </pre>
          );
        }
        return <p key={index} className="whitespace-pre-line">{part}</p>;
      });
    }
    return <p className="whitespace-pre-line">{text}</p>;
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] text-left">
      {/* Pulse Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all relative group animate-bounce"
        >
          {/* Pulsing online indicator */}
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          
          {/* Tooltip */}
          <span className="absolute right-16 bg-slate-950 text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md pointer-events-none">
            CasaBot Copilot Online
          </span>
        </button>
      )}

      {/* Chat Drawer Popup */}
      {isOpen && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-[360px] sm:w-[380px] h-[500px] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
          
          {/* Chat Header */}
          <div className="bg-slate-900 p-4 flex items-center justify-between text-white border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-sm font-bold relative">
                🤖
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border border-slate-900 rounded-full" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider leading-none">CasaBot Copilot</h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">Gemini AI Integrated</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950/60"
          >
            {messages.map((m, i) => {
              const isBot = m.sender === 'bot';
              return (
                <div key={i} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    isBot
                      ? 'bg-white dark:bg-slate-800 text-slate-855 dark:text-slate-100 border border-slate-100 dark:border-slate-800/80 rounded-tl-none'
                      : 'bg-blue-600 text-white rounded-tr-none'
                  }`}>
                    <div className="font-semibold">{renderMessageText(m.text)}</div>
                    <span className={`block text-[8px] mt-1 text-right ${isBot ? 'text-slate-400' : 'text-blue-200'}`}>
                      {m.time}
                    </span>
                  </div>
                </div>
              );
            })}
            
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-150 dark:border-slate-800 rounded-2xl rounded-tl-none p-3 shadow-xs flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick-action chips */}
          <div className="p-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto scrollbar-hide">
            {chips.map((c) => (
              <button
                key={c}
                onClick={() => handleSendMessage(c)}
                className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-[10px] font-bold text-slate-650 dark:text-slate-355 border border-slate-205 dark:border-slate-755 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
              >
                {c}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <input
              type="text"
              placeholder="Ask anything, e.g. delay risk, write a script..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-800 dark:text-white placeholder-slate-400 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => handleSendMessage()}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-xs transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
