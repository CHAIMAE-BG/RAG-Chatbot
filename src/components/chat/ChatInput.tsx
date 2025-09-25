import React, { useRef } from 'react';
import { Send, Mic, MicOff, Paperclip, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onFileUpload: (file: File) => void;
  onUrlSubmit: (url: string) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  onFileUpload,
  onUrlSubmit
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUrlInput, setShowUrlInput] = React.useState(false);
  const [urlValue, setUrlValue] = React.useState('');
  const { toast } = useToast();
  const { t } = useTranslation();

  const { isRecording, toggleRecording, isSupported } = useVoiceRecognition({
    onTranscription: (text) => {
      onChange(text);
    }
  });

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files.length) return;

    const file = files[0];
    if (file.size > 50 * 1024 * 1024) { // 50MB limit for all types
      toast({
        title: t("chat.fileTooLarge"),
        description: "Taille maximale: 50MB",
        variant: "destructive",
      });
      return;
    }

    onFileUpload(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    if (!urlValue.trim()) return;
    
    // Basic URL validation
    try {
      new URL(urlValue);
      onUrlSubmit(urlValue);
      setUrlValue('');
      setShowUrlInput(false);
      toast({
        title: "Lien ajouté",
        description: "Le contenu sera traité",
      });
    } catch {
      toast({
        title: "URL invalide",
        description: "Veuillez entrer une URL valide",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-4">
      {showUrlInput && (
        <div className="mb-3 flex gap-2">
          <Input
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="Entrez une URL (YouTube, site web, etc.)"
            className="flex-1"
          />
          <Button onClick={handleUrlSubmit} size="sm">
            Ajouter
          </Button>
          <Button 
            onClick={() => setShowUrlInput(false)} 
            variant="outline" 
            size="sm"
          >
            Annuler
          </Button>
        </div>
      )}
      
      <div className="flex items-end gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full h-10 w-10 flex-shrink-0"
          onClick={handleFileUploadClick}
          type="button"
          title={t("chat.uploadFile")}
        >
          <Paperclip size={18} />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="*/*"
          />
        </Button>

        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full h-10 w-10 flex-shrink-0"
          onClick={() => setShowUrlInput(!showUrlInput)}
          type="button"
          title="Ajouter un lien"
        >
          <Link size={18} />
        </Button>
        
        <div className="relative flex-1">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t("chat.typeMessage")}
            className="min-h-[60px] resize-none pr-12"
            onKeyDown={onKeyPress}
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 bottom-2 h-8 w-8"
            onClick={onSend}
            disabled={value.trim() === ''}
            type="button"
            title={t("chat.send")}
          >
            <Send size={18} className="text-brand-600" />
          </Button>
        </div>
        
        {isSupported && (
          <Button
            variant={isRecording ? "destructive" : "outline"}
            size="icon"
            className={`rounded-full h-10 w-10 flex-shrink-0 ${
              isRecording ? 'animate-pulse' : ''
            }`}
            onClick={toggleRecording}
            type="button"
            title={isRecording ? "Arrêter l'enregistrement" : "Commencer l'enregistrement"}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
