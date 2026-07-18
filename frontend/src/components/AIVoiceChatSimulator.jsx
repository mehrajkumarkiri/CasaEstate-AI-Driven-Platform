import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

export default function AIVoiceChatSimulator() {
  const { pushNotification } = useApp();
  const [activeTab, setActiveTab] = useState('call'); // 'call' | 'chat'
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState('Idle'); // 'Idle' | 'Calling...' | 'Connected' | 'AI speaking...'
  const [selectedProject, setSelectedProject] = useState('Noida (Casa Horizon)');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Welcome to CasaEstate AI Voice & Chat Operations Desk. Select a query or type below to audit live progress.', time: 'System Log' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [waveformBars, setWaveformBars] = useState(new Array(15).fill(4));
  const chatScrollRef = useRef(null);
  const waveformIntervalRef = useRef(null);

  // ElevenLabs & Speech States
  const [elevenLabsKey, setElevenLabsKey] = useState(localStorage.getItem('casa_elevenlabs_key') || '');
  const [selectedVoice, setSelectedVoice] = useState(localStorage.getItem('casa_elevenlabs_voice') || '21m00Tcm4TlvDq8ikWAM');
  const [showConfig, setShowConfig] = useState(false);
  const recognitionRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Handle active audio waveform simulation
  useEffect(() => {
    if (isCalling && (callStatus === 'AI speaking...' || callStatus === 'Connected')) {
      waveformIntervalRef.current = setInterval(() => {
        const baseHeight = callStatus === 'AI speaking...' ? 25 : 8;
        setWaveformBars(prev => prev.map(() => Math.floor(Math.random() * baseHeight) + 4));
      }, 100);
    } else {
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
      }
      setWaveformBars(new Array(15).fill(4));
    }
    return () => {
      if (waveformIntervalRef.current) clearInterval(waveformIntervalRef.current);
    };
  }, [isCalling, callStatus]);

  const presetQueries = [
    { label: 'Check Curing Strength', query: 'What is the concrete curing strength of Tower A?' },
    { label: 'Check Delay Risks', query: 'Are there any delays on Noida Tower B MEP and what is the net schedule variance?' },
    { label: 'Verify RERA Licenses', query: 'What are the RERA numbers for Noida, Gurugram and Mumbai?' },
    { label: 'Check Budget Audit', query: 'What is the cost variance and total spent against Noida baseline?' }
  ];

  // Speech Recognition Wrapper
  const startListening = () => {
    if (!isCalling) return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition is not supported in this browser.');
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setCallStatus('Connected');
    };

    rec.onresult = (event) => {
      const text = event.results[0][0].transcript;
      if (text.trim()) {
        submitQuery(text);
      }
    };

    rec.onerror = (e) => {
      if (e.error === 'no-speech') {
        // Restart on silence to keep the line active
        if (isCalling && callStatus === 'Connected') {
          setTimeout(() => startListening(), 1000);
        }
      } else {
        console.error('Speech recognition error:', e.error);
      }
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // TTS Voice Output
  const speakText = async (text) => {
    if (!isCalling) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (elevenLabsKey.trim()) {
      try {
        setCallStatus('AI speaking...');
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoice}`, {
          method: 'POST',
          headers: {
            'xi-api-key': elevenLabsKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_monolingual_v1',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75
            }
          })
        });

        if (!response.ok) throw new Error('ElevenLabs response error');
        
        const audioBlob = await response.blob();
        const audio = new Audio(URL.createObjectURL(audioBlob));
        audio.onended = () => {
          if (isCalling) {
            setCallStatus('Connected');
            startListening();
          }
        };
        audio.play();
        return;
      } catch (err) {
        console.error('ElevenLabs failed, using local browser fallback:', err);
        pushNotification({
          type: 'warning',
          title: 'ElevenLabs Offline',
          message: 'Defaulting to local text-to-speech synthesis.'
        });
      }
    }

    // Web Speech Synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.onstart = () => {
        setCallStatus('AI speaking...');
      };
      utter.onend = () => {
        if (isCalling) {
          setCallStatus('Connected');
          startListening();
        }
      };
      utter.onerror = () => {
        if (isCalling) {
          setCallStatus('Connected');
          startListening();
        }
      };
      window.speechSynthesis.speak(utter);
    } else {
      setCallStatus('Connected');
    }
  };

  // Call handlers
  const startCall = () => {
    setIsCalling(true);
    setCallStatus('Calling...');
    setMessages([]);
    
    setTimeout(() => {
      setCallStatus('Connected');
      pushNotification({
        type: 'info',
        title: '📞 Call Connected',
        message: 'CasaEstate AI Voice Desk is online. Speak clearly into your mic.'
      });
      
      const greeting = "Hello! I am your CasaEstate voice copilot. I can check construction delay parameters, inspect curing telemetry, or audit project cost spreadsheets. How can I help you today?";
      setMessages([{ sender: 'bot', text: `[AI Voice Response] ${greeting}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      speakText(greeting);
    }, 1500);
  };

  const endCall = () => {
    setIsCalling(false);
    setCallStatus('Idle');
    if (waveformIntervalRef.current) clearInterval(waveformIntervalRef.current);
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    
    pushNotification({
      type: 'info',
      title: '📞 Call Disconnected',
      message: 'Line released successfully.'
    });
  };

  const getMockReply = (queryText) => {
    const q = queryText.toLowerCase();
    if (q.includes('curing') || q.includes('moisture') || q.includes('strength') || q.includes('concrete')) {
      return "Noida Tower A utilizes M40 self-compacting concrete with Fe550 reinforcement bars. Telemetry sensors confirm curing has reached 98.4% of the target 28-day threshold, showing optimal moisture.";
    } else if (q.includes('delay') || q.includes('schedule') || q.includes('mep') || q.includes('variance')) {
      return "Noida Tower B MEP works are stable with a schedule variance of +1.2 days. Finishes are slightly delayed but fully cushioned by inventory reserves, keeping the overall project on track.";
    } else if (q.includes('rera') || q.includes('license') || q.includes('permit') || q.includes('number')) {
      return "RERA registration details: Noida (UP-RERA-2026-REG-88209), Gurugram (HR-RERA-2026-REG-74011), Worli Mumbai (MH-RERA-2026-REG-10925). Status: Active & Sanctioned.";
    } else if (q.includes('budget') || q.includes('cost') || q.includes('spent') || q.includes('variance') || q.includes('audit')) {
      return "Noida Tower A spent ledger stands at ₹4.2 Crore against a projected ₹4.5 Crore baseline, yielding a positive cost variance of -₹30 Lakhs due to early supplier procurement locks.";
    } else {
      return `I have logged your request regarding "${queryText}". All platforms show active RERA clearances and structural inspections are certified.`;
    }
  };

  const submitQuery = async (queryText) => {
    if (!queryText.trim()) return;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }

    if (activeTab === 'chat') {
      setMessages(prev => [...prev, { sender: 'user', text: queryText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      setLoading(true);
    } else {
      setCallStatus('AI speaking...');
      setMessages(prev => [
        ...prev,
        { sender: 'user', text: `[Voice Query] ${queryText}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }

    try {
      const activeKey = localStorage.getItem('casa_custom_gemini_key') || '';
      const response = await fetch('/api/v1/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: queryText, customApiKey: activeKey })
      });
      if (!response.ok) throw new Error('API server returned error');
      const data = await response.json();
      if (!data.reply) throw new Error('Empty reply');
      
      if (activeTab === 'call') {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: `[AI Voice Response] ${data.reply}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
        speakText(data.reply);
      } else {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: data.reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }
    } catch {
      // Offline fallback
      const reply = getMockReply(queryText);
      if (activeTab === 'call') {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: `[AI Voice Response] ${reply}`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
        speakText(reply);
      } else {
        setMessages(prev => [
          ...prev,
          { sender: 'bot', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }
    } finally {
      setTimeout(() => setLoading(false), 800);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 dark:border-stone-850 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-[10px] text-blue-400 font-mono font-bold uppercase tracking-widest">AI Agent Desk</span>
          <h2 className="text-xl font-extrabold uppercase font-display text-white mt-1">🎙️ AI Voice & Chat Assistant</h2>
          <p className="text-xs text-slate-400 mt-1">Simulate live field phone calls or chat feeds directly audited by Google Gemini AI.</p>
        </div>
        
        {/* Toggle tabs */}
        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => { setActiveTab('call'); endCall(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'call' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Voice Call
          </button>
          <button
            onClick={() => { setActiveTab('chat'); endCall(); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeTab === 'chat' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Live Chat
          </button>
        </div>
      </div>

      {/* CALL MODE SIMULATOR */}
      {activeTab === 'call' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Waveform / Ring Console (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 bg-black/30 border border-slate-800 rounded-3xl min-h-[300px] space-y-6">
            
            {/* Pulsing Core */}
            <div className="relative flex items-center justify-center">
              <div className={`absolute w-32 h-32 rounded-full border transition-all duration-700 ${
                isCalling 
                  ? callStatus === 'AI speaking...' ? 'border-emerald-500/20 bg-emerald-500/5 animate-ping' : 'border-blue-500/20 bg-blue-500/5 animate-ping'
                  : 'border-slate-800 bg-slate-900/50'
              }`} />
              <div className={`absolute w-24 h-24 rounded-full border transition-all duration-700 ${
                isCalling 
                  ? callStatus === 'AI speaking...' ? 'border-emerald-500/40 bg-emerald-500/10 scale-110' : 'border-blue-500/40 bg-blue-500/10 scale-110'
                  : 'border-slate-800 bg-slate-900/50'
              }`} />
              <div className={`w-18 h-18 rounded-full flex items-center justify-center text-2xl shadow-xl transition-all duration-500 ${
                isCalling 
                  ? callStatus === 'AI speaking...' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {isCalling ? '📞' : '🔇'}
              </div>
            </div>

            {/* Status Info */}
            <div className="text-center space-y-1">
              <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest">AI VOICE RECEIVER</p>
              <h4 className="text-lg font-black text-white uppercase tracking-tight">
                {isCalling ? callStatus : 'Line Idle'}
              </h4>
              <p className="text-[10px] text-slate-400 font-semibold">
                {isCalling ? `Connected to: ${selectedProject}` : 'Click Start to establish link'}
              </p>
            </div>

            {/* Audio Waveform Bars */}
            <div className="flex gap-1 items-end justify-center h-10 w-full px-4">
              {waveformBars.map((height, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full transition-all duration-100 ${
                    callStatus === 'AI speaking...' ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                  style={{ height: `${height * 3}px` }} 
                />
              ))}
            </div>

            {/* Call Action Button */}
            {!isCalling ? (
              <button
                onClick={startCall}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <span>📞 Initiate AI Simulated Call</span>
              </button>
            ) : (
              <button
                onClick={endCall}
                className="w-full bg-red-650 hover:bg-red-750 text-white font-bold py-3.5 px-6 rounded-2xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-500/25 flex items-center justify-center gap-2"
              >
                <span>Disconnect Line</span>
              </button>
            )}

          </div>

          {/* Queries / Live Audio Transcript (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">Operations Audit Prompts</h3>
              
              <select
                disabled={isCalling}
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="bg-black/50 border border-slate-800 text-[10px] text-slate-300 font-bold uppercase tracking-wider rounded-xl px-2 py-1 focus:outline-none"
              >
                <option value="Noida (Casa Horizon)">Noida (Casa Horizon)</option>
                <option value="Gurugram (Casa Serenity)">Gurugram (Casa Serenity)</option>
                <option value="Mumbai (Casa Pinnacle)">Mumbai (Casa Pinnacle)</option>
              </select>
            </div>

            {/* Query Chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetQueries.map((item) => (
                <button
                  key={item.label}
                  disabled={!isCalling || callStatus === 'AI speaking...'}
                  onClick={() => submitQuery(item.query)}
                  className="p-3 bg-slate-950/60 hover:bg-slate-900 border border-slate-805 hover:border-slate-700 disabled:opacity-40 rounded-xl text-left transition-all hover:shadow-sm"
                >
                  <p className="text-xs font-bold text-white leading-tight">{item.label}</p>
                  <p className="text-[9px] text-slate-500 leading-normal mt-1 truncate">{item.query}</p>
                </button>
              ))}
            </div>

            {/* Transcription Feed */}
            <div className="space-y-2">
              <h4 className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-mono">Live Call Transcription Log</h4>
              <div className="bg-black/50 border border-slate-800 rounded-2xl p-4 font-mono text-[10px] h-[150px] overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <p className="text-slate-500 italic text-center pt-8">Awaiting voice prompt transmission...</p>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className="text-left space-y-1">
                      <p className={`font-bold ${msg.sender === 'user' ? 'text-blue-400' : 'text-emerald-400'}`}>
                        {msg.sender === 'user' ? '> CLIENT_VOICE_FEED' : '> AI_VOICE_OUT'}
                      </p>
                      <p className="text-slate-350 leading-relaxed pl-3 font-semibold">{msg.text}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CHAT ASSISTANT MODE */}
      {activeTab === 'chat' && (
        <div className="flex flex-col h-[400px] border border-slate-800 rounded-3xl overflow-hidden bg-black/20">
          
          {/* Messages display */}
          <div 
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-3"
          >
            {messages.map((msg, idx) => {
              const isBot = msg.sender === 'bot';
              return (
                <div key={idx} className={`flex ${isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                    isBot 
                      ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none' 
                      : 'bg-blue-600 text-white rounded-tr-none'
                  }`}>
                    <p className="font-semibold whitespace-pre-wrap">{msg.text}</p>
                    <span className="block text-[8px] text-slate-400 dark:text-slate-500 mt-1 text-right">{msg.time}</span>
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none p-3 shadow-xs flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Quick Questions chips */}
          <div className="p-3 bg-slate-950 border-t border-slate-850 flex gap-2 overflow-x-auto scrollbar-hide">
            {presetQueries.map((item) => (
              <button
                key={item.label}
                onClick={() => submitQuery(item.query)}
                className="bg-slate-905 hover:bg-slate-800 text-[10px] font-bold text-slate-300 border border-slate-800 px-3 py-1 rounded-full whitespace-nowrap transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Chat input panel */}
          <div className="p-3 bg-slate-950 border-t border-slate-850 flex gap-2">
            <input
              type="text"
              placeholder="Ask the AI desk, e.g. What is Noida curing progress?"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (submitQuery(chatInput), setChatInput(''))}
              className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-500 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={() => { submitQuery(chatInput); setChatInput(''); }}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center justify-center transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ElevenLabs Configuration Accordion */}
      <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 text-slate-350 text-xs">
        <div className="flex justify-between items-center cursor-pointer select-none" onClick={() => setShowConfig(!showConfig)}>
          <span className="font-bold text-[10px] text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            ⚙️ ElevenLabs Voice Settings {elevenLabsKey ? '🟢 Active' : '🌐 Browser Fallback'}
          </span>
          <span className="text-[10px] text-slate-500 font-bold uppercase">{showConfig ? 'Hide' : 'Configure'}</span>
        </div>
        {showConfig && (
          <div className="mt-4 space-y-4 border-t border-slate-900 pt-4 animate-fade-in text-left">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">ElevenLabs API Key</label>
              <input
                type="password"
                placeholder="Paste your ElevenLabs API Key here..."
                value={elevenLabsKey}
                onChange={(e) => {
                  setElevenLabsKey(e.target.value);
                  localStorage.setItem('casa_elevenlabs_key', e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              />
              <p className="text-[9px] text-slate-500 mt-1">If blank, the system automatically uses the high-performance Web Speech Synthesis engine fallback.</p>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Voice Model</label>
              <select
                value={selectedVoice}
                onChange={(e) => {
                  setSelectedVoice(e.target.value);
                  localStorage.setItem('casa_elevenlabs_voice', e.target.value);
                }}
                className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
              >
                <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Female, Pleasant)</option>
                <option value="29vD33N1CtxCmqQRPOHJ">Drew (Male, Professional)</option>
                <option value="2EiwWnXF2V4jnm76CnwS">Clyde (Male, Warm)</option>
                <option value="pNInz6obpgus5TxJe5m0">Adam (Male, Deep)</option>
                <option value="piTKgcLEGmPEe24Z1eKf">Nicole (Female, Whisper)</option>
              </select>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
