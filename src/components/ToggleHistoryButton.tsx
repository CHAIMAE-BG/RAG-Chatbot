
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';

interface ToggleHistoryButtonProps {
  onToggle: (visible: boolean) => void;
  isVisible: boolean;
}

const ToggleHistoryButton = ({ onToggle, isVisible }: ToggleHistoryButtonProps) => {
  const { t } = useTranslation();
  
  const handleToggle = () => {
    onToggle(!isVisible);
  };
  
  // Only render the button when history is hidden to show the button to reveal it
  if (isVisible) {
    return null;
  }
  
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex items-center gap-1 h-8 px-2 rounded-full fixed left-4 top-20 z-10"
      onClick={handleToggle}
      title={t("chat.showHistory")}
    >
      <Eye size={16} />
    </Button>
  );
};

export default ToggleHistoryButton;
