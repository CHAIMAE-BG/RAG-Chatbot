
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';

interface ToggleDocumentButtonProps {
  onToggle: (visible: boolean) => void;
  isVisible: boolean;
}

const ToggleDocumentButton = ({ onToggle, isVisible }: ToggleDocumentButtonProps) => {
  const { t } = useTranslation();
  
  const handleToggle = () => {
    onToggle(!isVisible);
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1 h-8 px-2 rounded-full"
      onClick={handleToggle}
      title={isVisible ? "Masquer les documents" : "Afficher les documents"}
    >
      {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      <span className="text-xs">Documents</span>
    </Button>
  );
};

export default ToggleDocumentButton;
