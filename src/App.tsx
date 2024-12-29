import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Workers from "./pages/Workers";
import Shifts from "./pages/Shifts";
import LearnMore from "./pages/LearnMore";
import Layout from './components/Layout';
import { Toaster } from './components/ui/toaster';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CalendarPortal } from './components/CalendarPortal';
import "./styles/datepicker.css";
import './styles/calendar.css';
import './styles/calendar-portal.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Private Route wrapper component
const PrivateRoute = () => {
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyAuth = async () => {
      const isValid = await checkAuthStatus();
      if (!isValid) {
        navigate('/login', { state: { from: location.pathname } });
      }
    };
    verifyAuth();
  }, [location.pathname]);

  return isAuthenticated ? <Outlet /> : null;
};

function App() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const publicPaths = ['/', '/login', '/register', '/learn-more'];
    if (isAuthenticated && location.pathname === '/login') {
      // If authenticated and on login page, redirect to dashboard
      navigate('/dashboard');
    }
  }, [isAuthenticated, location.pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/learn-more" element={<LearnMore />} />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/workers" element={<Workers />} />
              <Route path="/shifts" element={<Shifts />} />
            </Route>
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
        <CalendarPortal />
      </div>
    </QueryClientProvider>
  );
}

export default App;
