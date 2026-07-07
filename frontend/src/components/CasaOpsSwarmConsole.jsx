import { useState, useEffect, useRef } from 'react';

export default function CasaOpsSwarmConsole({ onAuditComplete, autoTriggerKey }) {
  const [logs, setLogs] = useState([
    { time: '12:00', text: 'CasaOps Swarm Console initialized. Standby node active.' }
  ]);
  const [agentStates, setAgentStates] = useState({
    operations: 'IDLE', // 'IDLE', 'PROCESSING', 'SUCCESS'
    analyst: 'IDLE',    // 'IDLE', 'PROCESSING', 'SUCCESS'
    narrative: 'IDLE'   // 'IDLE', 'PROCESSING', 'SUCCESS'
  });
  const [running, setRunning] = useState(false);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Handle auto trigger if key changes (e.g., selecting a block)
  useEffect(() => {
    if (autoTriggerKey) {
      runSwarmAudit(`Auto-Trigger: Selection changed to ${autoTriggerKey}`);
    }
  }, [autoTriggerKey]);

  const runSwarmAudit = (triggerSource = 'Manual User Trigger') => {
    if (running) return;
    setRunning(true);
    setLogs(prev => [
      ...prev,
      { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: `⚡ Event: ${triggerSource}. Launching collaborative agent loop...` }
    ]);

    // Agent 1: Site Operations Agent
    setAgentStates(prev => ({ ...prev, operations: 'PROCESSING' }));
    setTimeout(() => {
      setAgentStates(prev => ({ ...prev, operations: 'SUCCESS', analyst: 'PROCESSING' }));
      setLogs(prev => [
        ...prev,
        { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: '🔧 Agent Alpha (Operations): Intercepted site log event. Steel laying parameters validated. Pushing raw metrics to Analyst...' }
      ]);

      // Agent 2: Financial Analyst Agent
      setTimeout(() => {
        setAgentStates(prev => ({ ...prev, analyst: 'SUCCESS', narrative: 'PROCESSING' }));
        setLogs(prev => [
          ...prev,
          { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: '📊 Agent Beta (Analyst): Calculating Delay Probability Index... delay risk matches LOW index (+1.2 days). Recalculating Cost Curve: cost variance optimized. Syncing database...' }
        ]);

        // Agent 3: Narrative Synthesizer Agent
        setTimeout(() => {
          setAgentStates(prev => ({ ...prev, narrative: 'SUCCESS' }));
          const completedLogs = [
            ...logs,
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: '🔧 Agent Alpha (Operations): Milestone checks complete.' },
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: '📊 Agent Beta (Analyst): Financial curves synced with Recharts dashboard.' },
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: '✉️ Agent Gamma (Narrative): Polished Progress Summary generated. Invoice compliance PDF generated and deposited to Vault. Dispatched SMS notification.' }
          ];
          setLogs(prev => [
            ...prev,
            { time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), text: '✉️ Agent Gamma (Narrative): Polished Progress Summary generated. Invoice compliance PDF deposited to Vault. Dispatched notifications.' }
          ]);
          setRunning(false);

          if (onAuditComplete) {
            onAuditComplete({
              delayDays: 1.2,
              costSavings: 3000000,
              summary: 'Slab L4 Casting phase completed successfully. Real-time telemetry sensors verified reinforcement scan indexes. Cost curve is optimized at -₹30 Lakhs with low delay probability.'
            });
          }
        }, 1500);

      }, 1500);

    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5 text-left font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
          <h3 className="text-xs font-black text-white uppercase tracking-wider">CasaOps Multi-Agent Swarm Console</h3>
        </div>
        <button
          onClick={() => runSwarmAudit('Manual Audit Trigger')}
          disabled={running}
          className="text-[10px] font-bold uppercase tracking-wider bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white px-3.5 py-1.5 rounded-xl transition-all"
        >
          ⚡ Run Swarm Audit
        </button>
      </div>

      {/* Network Map Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { name: '🔧 Agent Alpha', role: 'Site Operations', state: agentStates.operations },
          { name: '📊 Agent Beta', role: 'Predictive Analyst', state: agentStates.analyst },
          { name: '✉️ Agent Gamma', role: 'Narrative Synthesizer', state: agentStates.narrative }
        ].map((agent, i) => (
          <div key={i} className={`p-3 rounded-xl border flex items-center justify-between ${
            agent.state === 'PROCESSING' 
              ? 'bg-blue-950/40 border-blue-900 text-blue-400 animate-pulse'
              : agent.state === 'SUCCESS'
              ? 'bg-emerald-950/40 border-emerald-900 text-emerald-400'
              : 'bg-slate-950 border-slate-850 text-slate-500'
          }`}>
            <div className="text-[10px]">
              <p className="font-extrabold text-white">{agent.name}</p>
              <p className="text-[8px] text-slate-400 mt-0.5">{agent.role}</p>
            </div>
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-black/40">
              {agent.state}
            </span>
          </div>
        ))}
      </div>

      {/* Output Console Logs */}
      <div className="bg-black/90 border border-slate-850 rounded-2xl p-4 h-[140px] overflow-y-auto space-y-2 text-[10px] scrollbar-hide">
        {logs.map((log, i) => (
          <p key={i} className="text-slate-350 leading-relaxed">
            <span className="text-slate-500">[{log.time}]</span> {log.text}
          </p>
        ))}
        {running && (
          <div className="flex items-center gap-1.5 text-blue-400 animate-pulse">
            <span>█</span>
            <span>Running Agent collaboration loops...</span>
          </div>
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
