import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { motion } from "framer-motion";
import { ChevronRight, Users, Calendar, Bell, ArrowRight, Briefcase, Clock, BarChart3, Settings, Shield } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50/30">
      {/* Header with Logo and Language Switcher */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-indigo-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all duration-200"
            >
              {t('landing.getStarted')}
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-400 via-purple-500 to-pink-500 opacity-10"></div>
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t('landing.title')}
            </motion.h1>
            <motion.p 
              className="text-xl text-indigo-600/80 mb-12"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {t('landing.subtitle')}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                onClick={() => navigate("/login")}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 text-lg px-8 py-6 rounded-full group"
                size="lg"
              >
                {t('landing.getStarted')} 
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/learn-more")}
                className="border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 transition-all duration-200 text-lg px-8 py-6 rounded-full group"
                size="lg"
              >
                {t('landing.learnMore')}
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t('landing.features.title')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1: Schedule Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-indigo-100 transition-all duration-300 hover:shadow-xl hover:scale-105 p-8">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Calendar className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-indigo-900">{t('landing.features.scheduling.title')}</h3>
                <p className="text-indigo-600/80">
                  {t('landing.features.scheduling.description')}
                </p>
              </div>
            </motion.div>

            {/* Feature 2: Attendance Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-indigo-100 transition-all duration-300 hover:shadow-xl hover:scale-105 p-8">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-indigo-900">{t('landing.features.attendance.title')}</h3>
                <p className="text-indigo-600/80">
                  {t('landing.features.attendance.description')}
                </p>
              </div>
            </motion.div>

            {/* Feature 3: Notifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="group"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg border border-indigo-100 transition-all duration-300 hover:shadow-xl hover:scale-105 p-8">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Bell className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-indigo-900">{t('landing.features.notifications.title')}</h3>
                <p className="text-indigo-600/80">
                  {t('landing.features.notifications.description')}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-gradient-to-br from-indigo-500 to-purple-500">
        <div className="container mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16 text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {t('landing.benefits.title')}
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Benefit 1: Performance Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center group"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/30 transition-all duration-300 h-full">
                <div className="bg-white/20 rounded-xl p-4 w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{t('landing.benefits.analytics.title')}</h3>
                <p className="text-indigo-100">
                  {t('landing.benefits.analytics.description')}
                </p>
              </div>
            </motion.div>

            {/* Benefit 2: Simplified Management */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center group"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/30 transition-all duration-300 h-full">
                <div className="bg-white/20 rounded-xl p-4 w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{t('landing.benefits.automation.title')}</h3>
                <p className="text-indigo-100">
                  {t('landing.benefits.automation.description')}
                </p>
              </div>
            </motion.div>

            {/* Benefit 3: Hours Control */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center group"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/30 transition-all duration-300 h-full">
                <div className="bg-white/20 rounded-xl p-4 w-16 h-16 mx-auto mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{t('landing.benefits.compliance.title')}</h3>
                <p className="text-indigo-100">
                  {t('landing.benefits.compliance.description')}
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-12 text-center"
          >
            <Button
              onClick={() => navigate("/login")}
              className="bg-white text-indigo-600 hover:bg-indigo-50 transition-all duration-200 text-lg px-8 py-6 rounded-full group"
              size="lg"
            >
              {t('landing.benefits.cta')}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
