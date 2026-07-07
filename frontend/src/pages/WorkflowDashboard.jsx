import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock construction workflow initial data
const INITIAL_WORKFLOW_STATE = {
  step1Completed: false,
  step2State: 'pending', // 'pending', 'processing', 'completed'
  step3State: 'pending', // 'pending', 'completed'
  projectMapState: 'Pending Slab Casting', // 'Pending...', 'Active Curing Phase'
  checklist: {
    steelVerification: false,
    formworkApproved: false,
    concreteSlumpCheck: false,
  },
  consoleLogs: [
    "[system_standby] Ready to accept telemetry feeds from Site Engineer..."
  ],
  documents: [
    { id: 'doc-01', title: 'UP-RERA Structural Permit', type: 'Compliance', date: '2026-06-15' },
    { id: 'doc-02', title: 'Fire NOC NOC-2026-90', type: 'Permit', date: '2026-06-28' },
  ],
  aiSummary: "The system is currently on standby. Complete and submit the Field Execution checklist to trigger autonomous AI pipeline verification."
};

// Recharts cost variance mock data
const COST_VARIANCE_DATA = [
  { name: 'Excavation', projected: 120, actual: 115 },
  { name: 'Foundation', projected: 350, actual: 360 },
  { name: 'Columns L1-3', projected: 180, actual: 172 },
  { name: 'Slab L4', projected: 240, actual: 238 },
  { name: 'MEP L1-4', projected: 150, actual: 165 },
];

// Recharts delay risk mock data
const DELAY_RISK_DATA = [
  { week: 'Wk 1', baseline: 0, actual: 0 },
  { week: 'Wk 2', baseline: 0, actual: 1 },
  { week: 'Wk 3', baseline: 0, actual: -1 },
  { week: 'Wk 4', baseline: 0, actual: 2 },
  { week: 'Wk 5', baseline: 0, actual: 1.2 },
];

// Alerts feed mock
const ALERTS_FEED = [
  { id: 'a1', time: '18:05', msg: 'System standby: Listening on channel T4-Slab.' },
  { id: 'a2', time: '18:08', msg: 'AI Engine: Analyzed concrete pour parameters. Ambient temperature 31°C.' },
  { id: 'a3', time: '18:10', msg: 'Ledger Audit: Booking fee verified for Unit A302.' },
];

export default function WorkflowDashboard({ embedMode = false, initialRole = null }) {
  const { pushNotification } = useApp();
  const [userRole, setUserRole] = useState(() => {
    if (initialRole) {
      return initialRole === 'buyer' || initialRole === 'resident' ? 'client' : initialRole;
    }
    return null;
  });
  const [authState, setAuthState] = useState({ email: '', password: '' });
  const [showLoginOverlay, setShowLoginOverlay] = useState(!embedMode && !initialRole);

  useEffect(() => {
    if (initialRole) {
      setUserRole(initialRole === 'buyer' || initialRole === 'resident' ? 'client' : initialRole);
      setShowLoginOverlay(false);
    }
  }, [initialRole]);

  // Workflow states
  const [workflow, setWorkflow] = useState(INITIAL_WORKFLOW_STATE);
  const [consoleLoading, setConsoleLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);
  const consoleEndRef = useRef(null);

  // Client alerts feed
  const [clientAlerts, setClientAlerts] = useState(ALERTS_FEED);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [workflow.consoleLogs, consoleLoading]);

  // Auth logins
  const handleMockLogin = (role) => {
    setUserRole(role);
    setShowLoginOverlay(false);
    pushNotification({
      type: 'success',
      title: '✓ Access Granted',
      message: `Signed in successfully as ${role.toUpperCase()}`
    });
  };

  const handleLogout = () => {
    setUserRole(null);
    setShowLoginOverlay(true);
    setWorkflow(INITIAL_WORKFLOW_STATE);
    setClientAlerts(ALERTS_FEED);
  };

  // Checklist updates
  const handleChecklistToggle = (item) => {
    if (userRole === 'client') return; // Client is read-only
    setWorkflow(prev => {
      const nextCheck = { ...prev.checklist, [item]: !prev.checklist[item] };
      const allDone = Object.values(nextCheck).every(val => val === true);
      return {
        ...prev,
        checklist: nextCheck,
        step1Completed: allDone
      };
    });
  };

  // Submit checklist to AI Handshake
  const triggerAIPipeline = () => {
    if (!workflow.step1Completed) {
      pushNotification({
        type: 'warning',
        title: 'Checklist Incomplete',
        message: 'Please verify all field checklists before triggering the pipeline.'
      });
      return;
    }

    setConsoleLoading(true);
    setWorkflow(prev => ({
      ...prev,
      step2State: 'processing',
      consoleLogs: [
        ...prev.consoleLogs,
        "[agent_trigger] Checklist submission detected.",
        "[neural_audit] fetching telemetry logs from Noida Tower A...",
        "[neural_audit] scanning ultrasonic reinforcement scans...",
        "[neural_audit] running concrete slump density test match..."
      ]
    }));

    // Step 2 and 3 simulation
    setTimeout(() => {
      setConsoleLoading(false);
      setWorkflow(prev => {
        const newLogs = [
          ...prev.consoleLogs,
          "[neural_audit] Concrete density verified at 2400 kg/m³.",
          "[variance_engine] variance calculation: +1.2 days delay index (LOW Risk).",
          "[agent_handshake] AI cross-department verification complete. Stage: APPROVED.",
          "[ledger_dispatch] sending digital casting certificate to compliance vault...",
          "[summary_synthesizer] re-generating client narrative update..."
        ];

        const newDocs = [
          ...prev.documents,
          { id: 'doc-03', title: 'Slab L4 Curing Compliance Certificate', type: 'Compliance', date: new Date().toISOString().split('T')[0] },
          { id: 'doc-04', title: 'provisional Slab casting invoice #104', type: 'Invoice', date: new Date().toISOString().split('T')[0] }
        ];

        const newAlert = {
          id: `a-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          msg: "AI Engine: Slab Curing phase approved & compliance invoice generated."
        };
        setClientAlerts(prevAlerts => [newAlert, ...prevAlerts]);

        return {
          ...prev,
          step2State: 'completed',
          step3State: 'completed',
          projectMapState: 'Active Curing Phase',
          documents: newDocs,
          consoleLogs: newLogs,
          aiSummary: "📊 BuildFlow AI — Noida Tower A progress report:\n\nSlab L4 Casting phase completed successfully. Real-time ultrasonic scans verify steel laying parameters. AI has recalculated critical path models; ambient concrete curing stage is active. No timeline bottlenecks or cost overruns detected."
        };
      });

      pushNotification({
        type: 'success',
        title: '🤖 Autonomous Pipeline Complete',
        message: 'AI approved casting, updated ledger records, and issued certificates.'
      });
    }, 3000);
  };

  return (
    <div className={embedMode ? "w-full text-slate-100 flex flex-col font-sans" : "pt-16 min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans"}>
      
      {/* Sleek Minimalist Login Gate */}
      {showLoginOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="text-center space-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg font-black mx-auto mb-2 shadow-lg shadow-blue-500/25">
                ⚙️
              </div>
              <h2 className="text-xl font-extrabold tracking-tight text-white uppercase font-display">Workflow AI Portal</h2>
              <p className="text-xs text-slate-400 font-medium">Log in to view autonomous Multi-Department approvals</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Judge Access Role</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { role: 'engineer', label: '🔧 Site Engineer', desc: 'Log field status' },
                    { role: 'client', label: '🏢 Client / Investor', desc: 'View reports & compliance docs' },
                    { role: 'admin', label: '📊 Admin / Builder Dashboard', desc: 'Full pipeline command panel' }
                  ].map((profile) => (
                    <button
                      key={profile.role}
                      onClick={() => handleMockLogin(profile.role)}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between text-left transition-all hover:border-slate-700 hover:shadow-md"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{profile.label}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{profile.desc}</p>
                      </div>
                      <span className="text-xs text-blue-500 font-bold">Access →</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-4 text-center">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">BuildFlow AI Sandbox Mode</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Panel */}
      {!showLoginOverlay && (
        <div className={embedMode ? "w-full flex flex-col space-y-6 text-left pt-2" : "max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col space-y-6 text-left"}>
          
          {/* Header Console */}
          {!embedMode && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-mono">Autonomous Execution Engine Active</span>
                </div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight font-display mt-0.5">Live Workflow Control Panel</h2>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] bg-slate-800 border border-slate-700 text-slate-300 font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl">
                  Role: {userRole === 'engineer' ? 'Site Engineer' : userRole === 'client' ? 'Client / Investor' : 'Administrator'}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-bold uppercase tracking-wider bg-red-950/20 text-red-400 border border-red-900/30 hover:bg-red-900/30 px-3.5 py-1.5 rounded-xl transition-all"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Grid Layout splits: 2 columns for pipeline/reports, 1 for vault & logs */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Side: Pipeline Workflow Engine (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Pipeline Sequence Map */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Stage: Tower A - Slab Casting</h3>
                
                {/* Horizontal Step sequence progress tracker */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                  
                  {/* Step 1 */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    workflow.step1Completed 
                      ? 'bg-emerald-950/20 border-emerald-900 text-emerald-300' 
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <p className="text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Step 1: Field Checklist</p>
                    <p className="text-xs font-bold text-white mb-2">Engineer Approval</p>
                    <span className="text-[10px] font-semibold">
                      {workflow.step1Completed ? '✓ Completed' : 'Pending checklists'}
                    </span>
                  </div>

                  {/* Step 2 */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    workflow.step2State === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-900 text-emerald-300'
                      : workflow.step2State === 'processing'
                      ? 'bg-blue-950/20 border-blue-900 text-blue-300 animate-pulse'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <p className="text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Step 2: AI Telemetry Handshake</p>
                    <p className="text-xs font-bold text-white mb-2">Automated Audit</p>
                    <span className="text-[10px] font-semibold">
                      {workflow.step2State === 'completed' ? '✓ AI Approved' : workflow.step2State === 'processing' ? '🤖 Verifying telemetry...' : 'Awaiting Step 1'}
                    </span>
                  </div>

                  {/* Step 3 */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    workflow.step3State === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-900 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <p className="text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Step 3: Cross-Dept Dispatch</p>
                    <p className="text-xs font-bold text-white mb-2">Deed & Compliance Ledger</p>
                    <span className="text-[10px] font-semibold">
                      {workflow.step3State === 'completed' ? '✓ Ledger Sync Complete' : 'Awaiting AI approval'}
                    </span>
                  </div>

                </div>

                {/* Sub-form splits */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
                  
                  {/* Step 1 Interactive Form */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">🔧 Field Inspection Checklist</h4>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-semibold">Site Engineer must audit and toggle all compliance parameters before concrete pouring.</p>
                    
                    <div className="space-y-2">
                      {[
                        { id: 'steelVerification', label: 'Steel Reinforcement Mesh Audited' },
                        { id: 'formworkApproved', label: 'Concrete Formwork Alignment Approved' },
                        { id: 'concreteSlumpCheck', label: 'Slump mix ratio verified in lab' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          disabled={userRole === 'client' || consoleLoading}
                          onClick={() => handleChecklistToggle(item.id)}
                          className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all ${
                            workflow.checklist[item.id]
                              ? 'bg-slate-900 text-white border-blue-500/40'
                              : 'bg-slate-950 text-slate-500 border-slate-805 hover:border-slate-800'
                          }`}
                        >
                          <span>{item.label}</span>
                          <span className="font-mono">{workflow.checklist[item.id] ? '[✓]' : '[ ]'}</span>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={triggerAIPipeline}
                      disabled={!workflow.step1Completed || consoleLoading || userRole === 'client'}
                      className="w-full btn-primary text-xs font-bold uppercase tracking-wider py-3 disabled:opacity-40"
                    >
                      {consoleLoading ? 'Processing Telemetry...' : '⚡ Trigger AI Pipeline Handshake'}
                    </button>
                  </div>

                  {/* Step 2 AI Terminal Console logs */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">🤖 AI Copilot Execution Terminal</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">Real-time trace logs from autonomous verification pipeline.</p>
                    
                    <div className="bg-black border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-left h-[180px] overflow-y-auto space-y-1.5 scrollbar-hide">
                      {workflow.consoleLogs.map((log, i) => (
                        <p key={i} className="text-slate-300">
                          <span className="text-blue-500 font-bold">&gt;</span> {log}
                        </p>
                      ))}
                      {consoleLoading && (
                        <div className="text-emerald-400 animate-pulse font-bold flex items-center gap-1.5">
                          <span>█</span> Running ultrasonic model verify...
                        </div>
                      )}
                      <div ref={consoleEndRef} />
                    </div>
                  </div>

                </div>
              </div>

              {/* Step 3 Outputs Block: Map Mutation and AI Summary text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Main Project Map Mutation status */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Structural Ledger State</span>
                    <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mt-1">Project Stage Mutation Map</h4>
                    <p className="text-[10px] text-slate-400 leading-normal mt-1 font-semibold">Automatically updates system-wide phase logs upon AI handshake.</p>
                  </div>
                  
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 my-4 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">Current Phase</p>
                      <p className="text-sm font-extrabold text-white font-mono mt-0.5">{workflow.projectMapState}</p>
                    </div>
                    <span className={`w-3.5 h-3.5 rounded-full ${
                      workflow.projectMapState === 'Active Curing Phase' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`} />
                  </div>

                  <p className="text-[10px] text-slate-500 font-bold">Ledger Block Hash: <span className="font-mono text-slate-400">0x39a1b...a912c</span></p>
                </div>

                {/* AI Progress Summary narrative block */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">Autonomous Narrative Synthesizer</span>
                    <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mt-1">Conversational AI Progress Report</h4>
                  </div>
                  
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 my-4 flex-1 flex items-center justify-center">
                    <p className="text-[11px] text-slate-350 leading-relaxed font-semibold font-sans text-left">
                      {workflow.aiSummary}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                    <span>Model: Gemini 1.5 Flash</span>
                    <span>Confidence: 99.8%</span>
                  </div>
                </div>

              </div>

              {/* Component 3: Admin Predictive Charts vs Client Timeline */}
              {userRole !== 'client' ? (
                /* Admin Dashboard view: Delay Risk & Cost Variance charts */
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">📊 Admin Predictive Analytics Console</h3>
                    <span className="text-[9px] text-blue-500 font-mono font-bold">[Live telemetry feeds]</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Cost Variance bar chart */}
                    <div className="space-y-2 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Dynamic Cost Variance (₹ Lakhs)</p>
                      <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={COST_VARIANCE_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '9px', fontWeight: 'bold' }} />
                            <YAxis stroke="#64748b" style={{ fontSize: '9px', fontWeight: 'bold' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '10px' }} />
                            <Legend style={{ fontSize: '9px' }} />
                            <Bar dataKey="projected" name="Projected Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="actual" name="Actual Cost" fill="#10b981" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Delay Risk line chart */}
                    <div className="space-y-2 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timeline Deviation Trend (Days)</p>
                      <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={DELAY_RISK_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                            <XAxis dataKey="week" stroke="#64748b" style={{ fontSize: '9px', fontWeight: 'bold' }} />
                            <YAxis stroke="#64748b" style={{ fontSize: '9px', fontWeight: 'bold' }} />
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', fontSize: '10px' }} />
                            <Legend style={{ fontSize: '9px' }} />
                            <Line type="monotone" dataKey="baseline" name="Target" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 4 }} />
                            <Line type="monotone" dataKey="actual" name="Variance" stroke="#10b981" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>
                </div>
              ) : (
                /* Client view: interactive structural timeline mapping completion milestones */
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">🏗️ Noida Tower A Completion Milestones</h3>
                  
                  <div className="relative border-l-2 border-slate-800 pl-6 ml-4 py-4 space-y-6">
                    {[
                      { title: "Foundation Casting Completed", date: "June 2026", status: "Done", icon: "✓", color: "bg-emerald-500" },
                      { title: "4th Floor Slab Casting", date: "July 2026", status: workflow.step3State === 'completed' ? "Active Curing" : "Pending checklist", icon: "🏗️", color: workflow.step3State === 'completed' ? "bg-blue-600 animate-pulse" : "bg-slate-700" },
                      { title: "MEP Installations & HVAC", date: "October 2026", status: "Scheduled", icon: "⚡", color: "bg-slate-800" },
                      { title: "Finishing & Handover", date: "December 2026", status: "Scheduled", icon: "🔑", color: "bg-slate-800" }
                    ].map((step, idx) => (
                      <div key={idx} className="relative text-left">
                        {/* Timeline Bullet */}
                        <div className={`absolute -left-9 top-0.5 w-6 h-6 rounded-full ${step.color} border-4 border-slate-900 flex items-center justify-center text-[9px] font-black text-white`}>
                          {step.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-none">{step.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-semibold">{step.date} · Status: <span className="font-bold text-blue-450">{step.status}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Side: Digital Vault & Alert streams (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Document Compliance Vault */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">📁 Digital Compliance Vault</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Ledger-secured records generated programmatically by workflow actions.</p>
                
                <div className="space-y-2 max-h-[220px] overflow-y-auto scrollbar-hide">
                  {workflow.documents.map((doc) => (
                    <div key={doc.id} className="p-3 bg-slate-950 border border-slate-805 rounded-xl flex items-center justify-between">
                      <div className="text-left">
                        <p className="text-xs font-bold text-white leading-tight">{doc.title}</p>
                        <p className="text-[9px] text-slate-500 font-semibold uppercase mt-0.5">{doc.type} · Issued {doc.date}</p>
                      </div>
                      <button
                        onClick={() => alert(`Downloading RERA ledger file ${doc.id} PDF...`)}
                        className="text-[9px] font-bold bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-750 px-2 py-1 rounded"
                      >
                        PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alert logs stream */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">🔔 Live Alert Stream</h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                <div className="space-y-3 max-h-[200px] overflow-y-auto scrollbar-hide">
                  {clientAlerts.map((alert) => (
                    <div key={alert.id} className="text-left space-y-0.5 pb-2 border-b border-slate-850 last:border-0">
                      <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold font-mono">
                        <span>[{alert.time}]</span>
                        <span className="text-blue-500">SYSTEM_ALERT</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-normal font-semibold pl-1">
                        {alert.msg}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
