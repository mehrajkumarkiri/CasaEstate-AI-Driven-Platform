import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import NotificationToast from './components/NotificationToast';
import CasaBotWidget from './components/CasaBotWidget';
import Home from './pages/Home';
import Deals from './pages/Deals';
import ProjectDetail from './pages/ProjectDetail';
import ResidentPortal from './pages/ResidentPortal';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import SiteEngineerPortal from './pages/SiteEngineerPortal';
import ClientProgressPortal from './pages/ClientProgressPortal';
import WorkflowDashboard from './pages/WorkflowDashboard';

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login but save the current location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Role not authorized, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
          <Navbar />
          <NotificationToast />
          <CasaBotWidget />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/deals" element={<Deals />} />
              <Route path="/login" element={<Login />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route 
                path="/resident" 
                element={
                  <ProtectedRoute allowedRoles={['resident', 'admin']}>
                    <ResidentPortal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/engineer" 
                element={
                  <ProtectedRoute allowedRoles={['engineer', 'admin']}>
                    <SiteEngineerPortal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/client-portal" 
                element={
                  <ProtectedRoute allowedRoles={['resident', 'engineer', 'admin']}>
                    <ClientProgressPortal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/resident-portal" 
                element={
                  <ProtectedRoute allowedRoles={['resident', 'admin']}>
                    <ResidentPortal />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/buyer-lounge" 
                element={
                  <ProtectedRoute allowedRoles={['buyer', 'resident', 'engineer', 'admin']}>
                    <ClientProgressPortal />
                  </ProtectedRoute>
                } 
              />
              <Route path="/dashboard" element={<WorkflowDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
