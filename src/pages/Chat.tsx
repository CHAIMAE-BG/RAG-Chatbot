
import React, { useState, useEffect } from 'react';
import ChatHistory from '@/components/ChatHistory';
import DocumentViewer from '@/components/DocumentViewer';
import ChatInterface from '@/components/ChatInterface';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import ToggleHistoryButton from '@/components/ToggleHistoryButton';

const Chat = () => {
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>(undefined);
  const [hasDocument, setHasDocument] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [showDocument, setShowDocument] = useState(true);
  const [refreshHistory, setRefreshHistory] = useState(0);
  const [documentViewerKey, setDocumentViewerKey] = useState(0);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (activeConversationId && user) {
      checkDocumentExists();
    } else {
      setHasDocument(false);
    }
  }, [activeConversationId, user]);

  const checkDocumentExists = async () => {
    if (!activeConversationId) {
      setHasDocument(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('documents')
        .select('id')
        .eq('conversation_id', activeConversationId)
        .limit(1);

      if (error) throw error;
      
      const documentExists = data && data.length > 0;
      setHasDocument(documentExists);
      
      // Afficher automatiquement la section 2 s'il y a un document
      if (documentExists) {
        setShowDocument(true);
      }
    } catch (error) {
      console.error('Error checking document existence:', error);
      setHasDocument(false);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const handleNewConversation = () => {
    setActiveConversationId(undefined);
    setHasDocument(false);
  };

  const handleFileUpload = (fileName: string) => {
    // Forcer la vérification de l'existence du document
    setTimeout(() => {
      checkDocumentExists();
    }, 500);
  };

  const handleFileUploaded = (fileName: string, conversationId: string) => {
    console.log('File uploaded:', fileName, 'to conversation:', conversationId);
    
    // Mettre à jour immédiatement la conversation active si nécessaire
    if (!activeConversationId || activeConversationId !== conversationId) {
      setActiveConversationId(conversationId);
    }
    
    // Forcer immédiatement la mise à jour du document viewer
    setHasDocument(true);
    setShowDocument(true);
    setDocumentViewerKey(prev => prev + 1);
    
    // Forcer le rafraîchissement de l'historique
    setRefreshHistory(prev => prev + 1);
    
    // Vérifier l'existence du document après un court délai pour confirmation
    setTimeout(() => {
      checkDocumentExists();
    }, 100);
  };

  const handleToggleHistory = (visible: boolean) => {
    setShowHistory(visible);
  };

  const handleToggleDocument = (visible: boolean) => {
    setShowDocument(visible);
  };

  const handleConversationCreated = (conversationId: string) => {
    console.log('New conversation created:', conversationId);
    
    // Mettre à jour immédiatement la conversation active
    setActiveConversationId(conversationId);
    
    // Forcer le rafraîchissement de l'historique immédiatement
    setRefreshHistory(prev => prev + 1);
    
    // Vérifier s'il y a un document après un court délai
    setTimeout(() => {
      checkDocumentExists();
    }, 100);
  };

  return (
    <div className="min-h-screen flex flex-col pt-[4.5rem]">
      <div className="flex-1 p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 h-[calc(100vh-10rem)] relative">
          {showHistory && (
            <div className="lg:col-span-3 h-full">
              <ChatHistory 
                onSelectConversation={handleSelectConversation}
                onNewConversation={handleNewConversation}
                activeConversationId={activeConversationId}
                onToggleHistory={handleToggleHistory}
                showToggleButton={true}
                key={refreshHistory}
              />
            </div>
          )}
          
          {!showHistory && (
            <ToggleHistoryButton 
              onToggle={handleToggleHistory} 
              isVisible={showHistory} 
            />
          )}
          
          {hasDocument && showDocument ? (
            <div className={`${showHistory ? 'lg:col-span-9' : 'lg:col-span-12'} grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 h-full`}>
              <div className="h-full">
                <DocumentViewer 
                  conversationId={activeConversationId} 
                  key={documentViewerKey}
                />
              </div>
              
              <div className="h-full">
                <ChatInterface 
                  activeConversationId={activeConversationId}
                  onNewConversation={handleNewConversation}
                  onFileUpload={handleFileUpload}
                  onConversationCreated={handleConversationCreated}
                  onFileUploaded={handleFileUploaded}
                  hasDocument={hasDocument}
                  showDocument={showDocument}
                  onToggleDocument={handleToggleDocument}
                />
              </div>
            </div>
          ) : (
            <div className={`${showHistory ? 'lg:col-span-9' : 'lg:col-span-12'} h-full`}>
              <ChatInterface 
                activeConversationId={activeConversationId}
                onNewConversation={handleNewConversation}
                onFileUpload={handleFileUpload}
                onConversationCreated={handleConversationCreated}
                onFileUploaded={handleFileUploaded}
                hasDocument={hasDocument}
                showDocument={showDocument}
                onToggleDocument={handleToggleDocument}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
