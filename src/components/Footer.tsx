
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { FileText, Lock, BookOpen } from 'lucide-react';

const Footer = () => {
  const { t } = useTranslation();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-100 py-2 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center md:justify-between items-center gap-4">
          {/* About */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 text-sm flex items-center gap-1"
              onClick={() => setActiveDialog('about')}
            >
              <BookOpen className="h-4 w-4 mr-1" />
              {t("footer.about.title")}
            </Button>
            <Dialog open={activeDialog === 'about'} onOpenChange={(open) => setActiveDialog(open ? 'about' : null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t("footer.about.title")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <h4 className="text-lg font-medium">{t("footer.about.features")}</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t("footer.about.feature1")}</li>
                    <li>{t("footer.about.feature2")}</li>
                    <li>{t("footer.about.feature3")}</li>
                    <li>{t("footer.about.feature4")}</li>
                  </ul>
                  
                  <Separator className="my-4" />
                  
                  <h4 className="text-lg font-medium">{t("footer.about.supportedFormats")}</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-100 text-blue-800 p-2 rounded text-center">PDF</div>
                    <div className="bg-blue-100 text-blue-800 p-2 rounded text-center">DOCX</div>
                    <div className="bg-blue-100 text-blue-800 p-2 rounded text-center">TXT</div>
                    <div className="bg-blue-100 text-blue-800 p-2 rounded text-center">CSV</div>
                    <div className="bg-blue-100 text-blue-800 p-2 rounded text-center">PPT</div>
                    <div className="bg-blue-100 text-blue-800 p-2 rounded text-center">XLS</div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Privacy */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 text-sm flex items-center gap-1"
              onClick={() => setActiveDialog('privacy')}
            >
              <Lock className="h-4 w-4 mr-1" />
              {t("footer.privacy.title")}
            </Button>
            <Dialog open={activeDialog === 'privacy'} onOpenChange={(open) => setActiveDialog(open ? 'privacy' : null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t("footer.privacy.title")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <h4 className="text-lg font-medium">{t("footer.privacy.dataSecurity")}</h4>
                  <p>{t("footer.privacy.securityDetails")}</p>
                  
                  <h4 className="text-lg font-medium">{t("footer.privacy.authentication")}</h4>
                  <p>{t("footer.privacy.authDetails")}</p>
                  
                  <h4 className="text-lg font-medium">{t("footer.privacy.conversations")}</h4>
                  <p>{t("footer.privacy.conversationDetails")}</p>
                  
                  <h4 className="text-lg font-medium">{t("footer.privacy.documents")}</h4>
                  <p>{t("footer.privacy.documentDetails")}</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Terms */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-600 text-sm flex items-center gap-1"
              onClick={() => setActiveDialog('terms')}
            >
              <FileText className="h-4 w-4 mr-1" />
              {t("footer.terms.title")}
            </Button>
            <Dialog open={activeDialog === 'terms'} onOpenChange={(open) => setActiveDialog(open ? 'terms' : null)}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t("footer.terms.title")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <h4 className="text-lg font-medium">{t("footer.terms.userRules")}</h4>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>{t("footer.terms.rule1")}</li>
                    <li>{t("footer.terms.rule2")}</li>
                    <li>{t("footer.terms.rule3")}</li>
                    <li>{t("footer.terms.rule4")}</li>
                  </ul>
                  
                  <h4 className="text-lg font-medium">{t("footer.terms.ethics")}</h4>
                  <p>{t("footer.terms.ethicsDetails")}</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Copyright */}
          <div className="text-gray-500 text-xs">
            &copy; {currentYear} {t("footer.copyright")}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
