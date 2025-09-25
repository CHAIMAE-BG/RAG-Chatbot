import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { createConversation, addMessage } from '@/utils/chatHelpers';

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface UseChatProps {
  activeConversationId?: string;
  onNewConversation?: () => void;
  onConversationCreated?: (conversationId: string) => void;
  onFileUploaded?: (fileName: string, conversationId: string) => void;
}

const API_BASE_URL = 'http://localhost:8000';

export function useChat({ 
  activeConversationId, 
  onNewConversation, 
  onConversationCreated,
  onFileUploaded 
}: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(activeConversationId);
  const [currentDocumentName, setCurrentDocumentName] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Effect to load messages from a selected conversation
  useEffect(() => {
    if (activeConversationId) {
      setConversationId(activeConversationId);
      loadConversationMessages(activeConversationId);
    } else {
      // If no active conversation, show a welcome message
      const welcomeMessage: Message = {
        id: '1',
        text: t("chat.welcomeMessage"),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setCurrentDocumentName(null); // Reset document when no conversation
    }
  }, [activeConversationId, t]);

  // Load messages from an existing conversation
  const loadConversationMessages = async (convoId: string) => {
    try {
      setIsLoading(true);
      
      // Load conversation messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convoId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Load document linked to this conversation
      const { data: documentData, error: documentError } = await supabase
        .from('documents')
        .select('name')
        .eq('conversation_id', convoId)
        .limit(1)
        .single();

      // Set document name if found (don't throw error if no document)
      if (documentData && !documentError) {
        setCurrentDocumentName(documentData.name);
        console.log('Document loaded for conversation:', documentData.name);
      } else {
        setCurrentDocumentName(null);
        console.log('No document found for this conversation');
      }

      if (messagesData) {
        const formattedMessages: Message[] = messagesData.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.is_user ? 'user' : 'bot',
          timestamp: new Date(msg.created_at),
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading conversation data:', error);
      toast({
        title: t("common.error"),
        description: t("chat.errorLoadingMessages"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewConversation = async (title: string): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const newConvoId = await createConversation(user.id, title);
      setConversationId(newConvoId || undefined);
      
      // Notify parent component about the new conversation IMMEDIATELY
      if (newConvoId && onConversationCreated) {
        onConversationCreated(newConvoId);
      }
      
      return newConvoId;
    } catch (error) {
      console.error('Error creating new conversation:', error);
      return null;
    }
  };

  const ensureConversationExists = async (title: string): Promise<string | null> => {
    // Si on a déjà une conversation active, l'utiliser
    if (conversationId) {
      return conversationId;
    }
    
    // Sinon, créer une nouvelle conversation
    const newConvoId = await createNewConversation(title);
    if (newConvoId) {
      setConversationId(newConvoId);
    }
    return newConvoId;
  };

  const callBackendChat = async (message: string): Promise<string> => {
    try {
      console.log('Calling backend with:', { 
        message, 
        use_rag: currentDocumentName ? true : false, 
        document_name: currentDocumentName 
      });

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          model: 'mistral',
          use_rag: currentDocumentName ? true : false,
          document_name: currentDocumentName
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling backend chat:', error);
      throw new Error('Erreur de connexion au serveur backend');
    }
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === '') return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    const messageToSend = newMessage;
    setNewMessage('');
    setIsLoading(true);
    
    try {
      // Save the message to the database if user is logged in
      if (user) {
        // Utiliser la conversation existante ou créer une nouvelle avec le début du message
        const msgTitle = messageToSend.length > 30 
          ? `${messageToSend.substring(0, 30)}...` 
          : messageToSend;
        
        const currentConvoId = await ensureConversationExists(msgTitle);
        
        if (currentConvoId) {
          await addMessage(currentConvoId, messageToSend, true);
        }
      }

      // Call backend API for the response
      const botReply = await callBackendChat(messageToSend);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botReply,
        sender: 'bot',
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, botMessage]);
      
      // Save bot response
      if (user && conversationId) {
        await addMessage(conversationId, botReply, false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Désolé, une erreur est survenue lors de la communication avec le serveur.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : 'Erreur de communication',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = async (file: File) => {
    toast({
      title: t("chat.uploading"),
      description: t("chat.processingFile", { fileName: file.name }),
    });

    try {
      // 1. Utiliser la conversation existante ou créer une nouvelle avec le nom du fichier
      let currentConvoId = await ensureConversationExists(file.name);

      if (!currentConvoId || !user) {
        throw new Error('Impossible de créer une conversation ou utilisateur non connecté');
      }

      // 2. Sauvegarder le fichier dans Supabase Storage
      const filePath = `${user.id}/${currentConvoId}/${file.name}`;
      console.log('Uploading file to path:', filePath);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Error uploading to Supabase Storage:', uploadError);
        throw new Error('Erreur lors de la sauvegarde du fichier');
      }

      console.log('File uploaded successfully:', uploadData);

      // 3. Sauvegarder les métadonnées du document
      const { data: docData, error: dbError } = await supabase.from('documents').insert({
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: file.size,
        storage_path: filePath,
        user_id: user.id,
        conversation_id: currentConvoId
      }).select().single();

      if (dbError) {
        console.error('Error saving document metadata:', dbError);
        throw new Error('Erreur lors de la sauvegarde des métadonnées du document');
      }

      console.log('Document metadata saved:', docData);

      // 4. Envoyer le fichier au backend pour traitement RAG et génération de mindmap
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Backend processing result:', data);
          
          // 5. Définir le document pour les futures requêtes RAG
          setCurrentDocumentName(file.name);
          console.log('Document set for RAG:', file.name);
        } else {
          console.warn('Backend upload failed but file is saved in Supabase');
          setCurrentDocumentName(file.name);
        }
      } catch (backendError) {
        console.log('Backend not available, but file is uploaded:', backendError);
        setCurrentDocumentName(file.name);
      }

      // 6. Notification immédiate au parent pour mise à jour de toutes les sections
      if (onFileUploaded) {
        onFileUploaded(file.name, currentConvoId);
      }

      // 7. Message de succès
      toast({
        title: t("chat.uploadSuccess"),
        description: `Fichier "${file.name}" téléchargé avec succès`,
      });
      
      // 8. Ajouter un message dans le chat
      const userMessage: Message = {
        id: Date.now().toString(),
        text: t("chat.uploadedDocument", { fileName: file.name }),
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // 9. Ajouter le message à la DB
      await addMessage(currentConvoId, t("chat.uploadedDocument", { fileName: file.name }), true);
      
      // 10. Réponse du bot
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: `Document "${file.name}" chargé avec succès. La mindmap sera générée automatiquement. Vous pouvez maintenant me poser des questions sur son contenu.`,
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages(prevMessages => [...prevMessages, botMessage]);
        
        // Ajouter la réponse à la DB
        addMessage(currentConvoId, botMessage.text, false);
      }, 1000);
      
      return currentConvoId;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: t("chat.uploadError"),
        description: error instanceof Error ? error.message : t("chat.uploadErrorDescription"),
        variant: "destructive",
      });
      return null;
    }
  };

  const handleUrlSubmit = async (url: string) => {
    if (!url.trim()) return;

    try {
      // 1. Utiliser la conversation existante ou créer une nouvelle avec l'URL
      const urlTitle = url.length > 50 ? `${url.substring(0, 50)}...` : url;
      let currentConvoId = await ensureConversationExists(urlTitle);

      // 2. Traiter l'URL avec le backend
      const response = await fetch(`${API_BASE_URL}/url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // 3. Définir le document pour les futures requêtes RAG
      setCurrentDocumentName(data.document_name || url);
      console.log('URL processed and set for RAG:', data.document_name || url);

      // 4. Ajouter un message dans le chat
      const userMessage: Message = {
        id: Date.now().toString(),
        text: `Lien ajouté: ${url}`,
        sender: 'user',
        timestamp: new Date(),
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // 5. Ajouter le message à la DB
      if (user && currentConvoId) {
        await addMessage(currentConvoId, `Lien ajouté: ${url}`, true);
      }
      
      // 6. Réponse du bot
      setTimeout(() => {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.message || `URL "${url}" traité avec succès. Vous pouvez maintenant me poser des questions sur son contenu.`,
          sender: 'bot',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, botMessage]);
        
        // Ajouter la réponse à la DB
        if (user && currentConvoId) {
          addMessage(currentConvoId, botMessage.text, false);
        }
      }, 1000);

      return currentConvoId;
    } catch (error) {
      console.error('Error processing URL:', error);
      toast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : "Erreur lors du traitement du lien",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    messages,
    newMessage,
    setNewMessage,
    isLoading,
    handleSendMessage,
    handleKeyPress,
    handleFileUpload,
    handleUrlSubmit
  };
}
