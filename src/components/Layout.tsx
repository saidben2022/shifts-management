import { useNavigate, Outlet } from "react-router-dom";
import { Button } from "./ui/button";
import { useAuth } from "../context/AuthContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { LayoutDashboard, Users, Calendar, LogOut } from "lucide-react";
import "../styles/layout.css";

interface LayoutProps {
}

export default function Layout() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="layout-header border-b border-gray-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="logo-container">
                <img 
                  src="/logo.png" 
                  alt="Workers Management System" 
                  className="h-8 w-auto cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate("/dashboard")}
                />
              </div>
              <nav className="hidden md:flex ml-8 space-x-2">
                <Button
                  variant="ghost"
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/workers")}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>{t('navigation.workers')}</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => navigate("/shifts")}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>{t('navigation.shifts')}</span>
                </Button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('auth.logout')}</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-full main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
