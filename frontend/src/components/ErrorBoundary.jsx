import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 pointer-events-none" />
          <div className="relative z-10 max-w-lg w-full bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-3xl p-8 text-center shadow-2xl space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-3xl mx-auto shadow-lg shadow-red-500/5 animate-pulse">
              ⚠️
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-extrabold uppercase tracking-wider font-display text-white">System Recovery Shield</h2>
              <p className="text-xs text-slate-400 font-medium">An unexpected runtime thread collision was intercepted. Website operations remain secure.</p>
            </div>
            <div className="bg-black/50 border border-slate-800 rounded-xl p-4 font-mono text-[10px] text-left max-h-[150px] overflow-y-auto text-red-400 space-y-2">
              <p className="font-bold">&gt; Error: {this.state.error?.message || 'Unknown Exception'}</p>
              {this.state.errorInfo?.componentStack && (
                <pre className="text-[8px] text-slate-500 overflow-x-auto whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-white hover:bg-slate-100 text-slate-950 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Return to Safety
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-slate-850 hover:bg-slate-800 border border-slate-750 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all"
              >
                Reload App
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
