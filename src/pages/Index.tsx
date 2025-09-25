
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { MessageCircle, Book, ArrowRight, FileText, PenTool, FileSpreadsheet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Footer from '@/components/Footer';

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const supportedFileTypes = [
    { extension: 'PDF', className: 'bg-blue-700 text-white' },
    { extension: 'DOCX', className: 'bg-blue-600 text-white' },
    { extension: 'PPT', className: 'bg-blue-500 text-white' },
    { extension: 'XLS', className: 'bg-blue-400 text-white' },
    { extension: 'TXT', className: 'bg-blue-300 text-gray-700' },
    { extension: 'CSV', className: 'bg-blue-200 text-gray-700' },
  ];

  const features = [
    {
      icon: <FileText className="h-8 w-8 text-blue-600" />,
      title: t("home.feature1Title"),
      description: t("home.feature1Desc")
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-blue-600" />,
      title: t("home.feature2Title"),
      description: t("home.feature2Desc")
    },
    {
      icon: <PenTool className="h-8 w-8 text-blue-600" />,
      title: t("home.feature3Title"),
      description: t("home.feature3Desc") 
    },
    {
      icon: <FileSpreadsheet className="h-8 w-8 text-blue-600" />,
      title: t("home.feature4Title"),
      description: t("home.feature4Desc")
    }
  ];

  const userCategories = [
    {
      icon: <Book className="h-10 w-10 text-blue-600" />,
      title: t("home.studentTitle"),
      description: t("home.studentDesc"),
      buttonText: t("home.signUpFree"),
      onClick: () => navigate('/register')
    },
    {
      icon: <MessageCircle className="h-10 w-10 text-blue-600" />,
      title: t("home.researcherTitle"),
      description: t("home.researcherDesc"),
      buttonText: t("home.exploreMore"),
      onClick: () => navigate('/chat')
    },
    {
      icon: <FileText className="h-10 w-10 text-blue-600" />,
      title: t("home.proTitle"),
      description: t("home.proDesc"),
      buttonText: t("home.startTrial"),
      onClick: () => navigate('/chat')
    }
  ];

  return (
    <div className="flex flex-col min-h-screen pt-16">
      {/* Hero Section */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-purple-50 to-white relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
            >
              {t("home.title")}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-lg text-gray-600 mb-10"
            >
              {t("home.subtitle")}
            </motion.p>
            
            {/* Chat Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative mx-auto max-w-2xl mb-12"
            >
              <Input
                placeholder={t("chat.typeMessage")}
                className="pr-12 py-6 text-base rounded-xl shadow-md"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigate('/chat');
                  }
                }}
              />
              <Button
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg"
                size="sm"
                onClick={() => navigate('/chat')}
              >
                <ArrowRight size={18} />
              </Button>
            </motion.div>
            
            {/* File Upload Area */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 max-w-2xl mx-auto bg-white"
              onClick={() => navigate('/chat')}
            >
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <FileText className="h-12 w-12 text-blue-700" />
                  <div className="absolute -right-1 -bottom-1 h-5 w-5 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">+</span>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-medium mb-4">{t("home.compatibleFiles")}</h3>
              
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {supportedFileTypes.map((type, index) => (
                  <div 
                    key={index} 
                    className={`text-xs font-medium px-3 py-1 rounded-md ${type.className}`}
                  >
                    {type.extension}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="text-center"
              >
                <div className="mx-auto mb-3">{feature.icon}</div>
                <h3 className="font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* User Categories */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-12">{t("home.forAllUsers")}</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            {t("home.adaptiveSystem")}
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {userCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col h-full"
              >
                <div className="mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{category.title}</h3>
                <p className="text-gray-600 mb-6 flex-grow">{category.description}</p>
                <Button 
                  variant="outline" 
                  className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
                  onClick={category.onClick}
                >
                  {category.buttonText}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-b from-white to-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">{t("home.readyToRevolve")}</h2>
            <p className="text-gray-600 mb-8">
              {t("home.startToday")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="px-8"
                onClick={() => navigate('/chat')}
              >
                {t("home.startNow")}
              </Button>
              <Button 
                variant="outline" 
                className="px-8"
                onClick={() => navigate('/register')}
              >
                {t("home.discoverSolution")}
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default Index;
