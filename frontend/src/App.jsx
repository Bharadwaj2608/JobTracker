import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import AddJob from './pages/AddJob';
import EditJob from './pages/EditJob';
import AiCoach from './pages/AiCoach';
import ResumeAnalyser from './pages/ResumeAnalyzer';
// import Login from './pages/Login';
import AuthCallback from './pages/AuthCallBack';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading...</p>
      </div>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-surface-800 dark:text-white',
              style: { borderRadius: '12px', fontFamily: 'Plus Jakarta Sans' },
            }}
          />
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route path="ai-coach" element={<AiCoach />} />
              <Route path="resume-analyser" element={<ResumeAnalyser />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="jobs" element={<Jobs />} />
              <Route path="jobs/add" element={<AddJob />} />
              <Route path="jobs/edit/:id" element={<EditJob />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
