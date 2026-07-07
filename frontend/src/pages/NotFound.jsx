import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <div className="relative">
        {/* Glow */}
        <div className="absolute inset-0 w-64 h-64 bg-blue-600/15 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 pointer-events-none" />
        <div className="relative glass-card p-10 sm:p-16 max-w-lg mx-auto space-y-6">
          <div className="text-7xl animate-float">🏙️</div>
          <h1 className="text-6xl font-black text-gradient-blue">404</h1>
          <h2 className="text-xl font-bold text-white">Page Not Found</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            The property you're looking for doesn't exist or has been moved.
            Let's get you back to our premium portfolio.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to="/" className="btn-primary flex-1">
              ← Back to Home
            </Link>
            <Link to="/admin" className="btn-secondary flex-1">
              View Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
