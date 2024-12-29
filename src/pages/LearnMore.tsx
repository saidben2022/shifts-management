import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { 
  Users, 
  Calendar, 
  Clock, 
  Bell, 
  ChevronRight, 
  BarChart, 
  Settings,
  CheckCircle,
  Briefcase,
  TrendingUp,
  Heart,
  Shield,
  LayoutDashboard,
  ClipboardList,
  Zap,
  FolderCheck,
  Globe
} from "lucide-react";

export default function LearnMore() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const FeatureCard = ({ title, description, details = [], icon: Icon, delay = 0 }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1
    });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay }}
        className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border border-indigo-100"
      >
        <div className="space-y-4">
          <div className="flex items-start space-x-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-lg">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-indigo-900">{title}</h3>
              <p className="text-indigo-600/80">{description}</p>
            </div>
          </div>
          {Array.isArray(details) && details.length > 0 && (
            <ul className="space-y-2 ml-14">
              {details.map((detail, index) => (
                <li key={index} className="flex items-center text-sm text-indigo-600/80">
                  <CheckCircle className="h-4 w-4 text-indigo-500 mr-2" />
                  {detail}
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    );
  };

  const StepCard = ({ number, title, description, details, icon: Icon, delay = 0 }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1
    });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, x: -50 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
        transition={{ duration: 0.6, delay }}
        className="flex items-start space-x-4 bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md border border-indigo-100"
      >
        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold">
          {number}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <Icon className="h-6 w-6 text-indigo-500" />
            <h3 className="text-xl font-semibold text-indigo-900">{title}</h3>
          </div>
          <p className="text-indigo-600/80 mb-4">{description}</p>
          <p className="text-sm text-indigo-500/70">{details}</p>
        </div>
      </motion.div>
    );
  };

  const BenefitCard = ({ icon: Icon, title, description, delay = 0 }) => {
    const [ref, inView] = useInView({
      triggerOnce: true,
      threshold: 0.1
    });

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.4, delay }}
        className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-indigo-100"
      >
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-lg inline-block mb-4">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-indigo-900">{title}</h3>
        <p className="text-indigo-600/80">{description}</p>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50/30">
      {/* Header with Logo and Language Switcher */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-indigo-100">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Hero Section */}
      <motion.div 
        className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-100"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t('learnMore.title')}
            </motion.h1>
            <motion.p 
              className="text-xl text-indigo-100 mb-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {t('learnMore.subtitle')}
            </motion.p>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={() => navigate("/login")}
                className="bg-white text-indigo-600 hover:bg-indigo-50 transition-colors duration-200"
                size="lg"
              >
                {t('learnMore.getStarted')} <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Key Features Section */}
      <motion.section 
        className="py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t('learnMore.features.title')}
            </motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={Users}
              title={t('learnMore.features.workers.title')}
              description={t('learnMore.features.workers.description')}
              details={t('learnMore.features.workers.details', { returnObjects: true })}
              delay={0.2}
            />
            <FeatureCard
              icon={Calendar}
              title={t('learnMore.features.scheduling.title')}
              description={t('learnMore.features.scheduling.description')}
              details={t('learnMore.features.scheduling.details', { returnObjects: true })}
              delay={0.3}
            />
            <FeatureCard
              icon={LayoutDashboard}
              title={t('learnMore.features.dashboard.title')}
              description={t('learnMore.features.dashboard.description')}
              details={t('learnMore.features.dashboard.details', { returnObjects: true })}
              delay={0.4}
            />
          </div>
        </div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section 
        className="py-20 bg-gray-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t('learnMore.howItWorks.title')}
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t('learnMore.howItWorks.subtitle')}
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <StepCard
              number="1"
              icon={Users}
              title={t('learnMore.howItWorks.step1.title')}
              description={t('learnMore.howItWorks.step1.description')}
              details={t('learnMore.howItWorks.step1.details')}
              delay={0.2}
            />
            <StepCard
              number="2"
              icon={Calendar}
              title={t('learnMore.howItWorks.step2.title')}
              description={t('learnMore.howItWorks.step2.description')}
              details={t('learnMore.howItWorks.step2.details')}
              delay={0.3}
            />
            <StepCard
              number="3"
              icon={ClipboardList}
              title={t('learnMore.howItWorks.step3.title')}
              description={t('learnMore.howItWorks.step3.description')}
              details={t('learnMore.howItWorks.step3.details')}
              delay={0.4}
            />
            <StepCard
              number="4"
              icon={LayoutDashboard}
              title={t('learnMore.howItWorks.step4.title')}
              description={t('learnMore.howItWorks.step4.description')}
              details={t('learnMore.howItWorks.step4.details')}
              delay={0.5}
            />
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section 
        className="py-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {t('learnMore.benefits.title')}
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-600"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {t('learnMore.benefits.subtitle')}
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <BenefitCard
              icon={Zap}
              title={t('learnMore.benefits.items.efficiency.title')}
              description={t('learnMore.benefits.items.efficiency.description')}
              delay={0.2}
            />
            <BenefitCard
              icon={FolderCheck}
              title={t('learnMore.benefits.items.organization.title')}
              description={t('learnMore.benefits.items.organization.description')}
              delay={0.3}
            />
            <BenefitCard
              icon={Settings}
              title={t('learnMore.benefits.items.flexibility.title')}
              description={t('learnMore.benefits.items.flexibility.description')}
              delay={0.4}
            />
            <BenefitCard
              icon={Globe}
              title={t('learnMore.benefits.items.accessibility.title')}
              description={t('learnMore.benefits.items.accessibility.description')}
              delay={0.5}
            />
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="py-20 bg-blue-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            className="text-3xl font-bold text-white mb-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {t('learnMore.cta.title')}
          </motion.h2>
          <motion.p 
            className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {t('learnMore.cta.description')}
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={() => navigate("/login")}
              className="bg-white text-blue-600 hover:bg-blue-50"
              size="lg"
            >
              {t('learnMore.cta.button')}
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
