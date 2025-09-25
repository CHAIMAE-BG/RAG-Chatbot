
import React from 'react';
import ChatMessages from '@/components/chat/ChatMessages';
import ChatInput from '@/components/chat/ChatInput';
import { useChat } from '@/hooks/useChat';
import { useTranslation } from 'react-i18next';
import ToggleDocumentButton from '@/components/ToggleDocumentButton';

interface ChatInterfaceProps {
  activeConversationId?: string;
  onNewConversation?: () => void;
  onFileUpload?: (fileName: string) => void;
  onConversationCreated?: (conversationId: string) => void;
  onFileUploaded?: (fileName: string, conversationId: string) => void;
  hasDocument?: boolean;
  showDocument?: boolean;
  onToggleDocument?: (visible: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  activeConversationId, 
  onNewConversation,
  onFileUpload,
  onConversationCreated,
  onFileUploaded,
  hasDocument,
  showDocument,
  onToggleDocument
}) => {
  const { t } = useTranslation();
  const {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    handleSendMessage,
    handleKeyPress,
    handleFileUpload,
    handleUrlSubmit
  } = useChat({
    activeConversationId,
    onNewConversation,
    onConversationCreated,
    onFileUploaded
  });

  const handleFile = async (file: File) => {
    const conversationId = await handleFileUpload(file);
    if (conversationId && onFileUpload) {
      onFileUpload(file.name);
    }
  };

  const handleUrl = async (url: string) => {
    await handleUrlSubmit(url);
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl border border-gray-200 relative">
      <div className="p-4 border-b border-gray-200 flex-shrink-0 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{t("chat.title")}</h2>
        {hasDocument && onToggleDocument && (
          <ToggleDocumentButton 
            onToggle={onToggleDocument} 
            isVisible={showDocument || false} 
          />
        )}
      </div>
      
      {/* Messages - Prend tout l'espace disponible sauf la barre de saisie */}
      <div className="flex-1 overflow-hidden pb-32">
        <ChatMessages messages={messages} isLoading={isLoading} />
      </div>
      
      {/* Barre de saisie sticky en bas - reste visible dans cette section */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 z-50 rounded-b-xl mt-auto">
        <ChatInput
          value={newMessage}
          onChange={setNewMessage}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          onFileUpload={handleFile}
          onUrlSubmit={handleUrl}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
