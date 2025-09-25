
import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Calendar, User, Plus, Trash2, Edit2, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ChatItem {
  id: string;
  title: string;
  date: string;
  preview?: string;
  unread?: boolean;
}

interface ChatHistoryProps {
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  activeConversationId?: string;
  onToggleHistory?: (visible: boolean) => void;
  showToggleButton?: boolean;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  onSelectConversation, 
  onNewConversation, 
  activeConversationId,
  onToggleHistory,
  showToggleButton = false
}) => {
  const [conversations, setConversations] = useState<ChatItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [editTitle, setEditTitle] = useState('');
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Charger les conversations depuis Supabase
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations();
      
      // Mettre en place l'abonnement realtime pour les nouvelles conversations
      const channel = supabase
        .channel('custom-all-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'conversations', filter: `user_id=eq.${user.id}` },
          () => {
            fetchConversations();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isAuthenticated, user]);

  const fetchConversations = async () => {
    try {
      if (!user) return;
      
      setIsLoading(true);
      
      // Obtenir toutes les conversations de l'utilisateur
      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id, 
          title, 
          created_at, 
          updated_at,
          messages!messages_conversation_id_fkey (
            id,
            content,
            created_at,
            is_user
          )
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      if (conversationsData) {
        const formattedConversations: ChatItem[] = conversationsData.map(conv => {
          // Trier les messages par date pour obtenir le plus récent
          const sortedMessages = conv.messages && conv.messages.length > 0 
            ? [...conv.messages].sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )
            : [];
          
          const latestMessage = sortedMessages.length > 0 ? sortedMessages[0] : null;
          
          // Formater la date en français
          const date = new Date(conv.updated_at);
          const formattedDate = new Intl.DateTimeFormat('fr-FR', { 
            day: 'numeric', 
            month: 'short' 
          }).format(date);
          
          return {
            id: conv.id,
            title: conv.title || t('chat.newConversation'),
            date: formattedDate,
            preview: latestMessage ? latestMessage.content : t('chat.noMessages'),
          };
        });
        
        setConversations(formattedConversations);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
      toast({
        title: t("common.error"),
        description: t("chat.errorLoadingConversations"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConversation = async () => {
    try {
      if (!isAuthenticated) {
        toast({
          title: t("chat.loginRequired"),
          description: t("chat.loginToCreate"),
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('conversations')
        .insert([
          { user_id: user?.id, title: t('chat.newConversation') }
        ])
        .select();
        
      if (error) throw error;
      
      toast({
        title: t("chat.conversationCreated"),
        description: t("chat.conversationCreatedDescription"),
      });
      
      // Informer le parent qu'une nouvelle conversation a été créée
      onNewConversation();
      
      await fetchConversations();
      
    } catch (error) {
      console.error('Erreur lors de la création de la conversation:', error);
      toast({
        title: t("common.error"),
        description: t("chat.errorCreatingConversation"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: t("chat.conversationDeleted"),
        description: t("chat.conversationDeletedDescription"),
      });
      
      // Mettre à jour la liste des conversations
      setConversations(prevConversations => 
        prevConversations.filter(conv => conv.id !== id)
      );
      
      // Si la conversation active est supprimée, créer une nouvelle conversation
      if (activeConversationId === id) {
        onNewConversation();
      }
      
    } catch (error) {
      console.error('Erreur lors de la suppression de la conversation:', error);
      toast({
        title: t("common.error"),
        description: t("chat.errorDeletingConversation"),
        variant: "destructive",
      });
    }
  };

  const handleRenameConversation = (id: string, title: string) => {
    setEditingConversationId(id);
    setEditTitle(title);
    setIsDialogOpen(true);
  };

  const submitRenameConversation = async () => {
    if (!editingConversationId || !editTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('conversations')
        .update({ title: editTitle })
        .eq('id', editingConversationId);

      if (error) throw error;

      toast({
        title: t("chat.conversationRenamed"),
        description: t("chat.conversationRenamedDescription"),
      });

      // Mettre à jour la liste locale
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === editingConversationId 
            ? { ...conv, title: editTitle } 
            : conv
        )
      );

      // Fermer le dialogue
      setIsDialogOpen(false);
      setEditingConversationId(null);
      setEditTitle('');
      
    } catch (error) {
      console.error('Erreur lors du renommage de la conversation:', error);
      toast({
        title: t("common.error"),
        description: t("chat.errorRenamingConversation"),
        variant: "destructive",
      });
    }
  };

  // Filtrer les conversations en fonction du terme de recherche
  const filteredConversations = conversations.filter(chat => 
    chat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (chat.preview && chat.preview.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-gray-50 rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">{t("chat.history")}</h2>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-gray-200"
              onClick={handleCreateConversation}
              title={t("chat.newConversation")}
            >
              <Plus size={18} />
            </Button>
            {showToggleButton && onToggleHistory && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-200"
                onClick={() => onToggleHistory(false)}
                title={t("chat.hideHistory")}
              >
                <EyeOff size={18} />
              </Button>
            )}
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder={t("common.search")}
            className="pl-9 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1">
            <Calendar size={14} />
            <span>{t("common.date")}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1">
            <User size={14} />
            <span>{t("common.name")}</span>
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">{t("common.loading")}</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 mb-2">{t("chat.noConversations")}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mx-auto"
              onClick={handleCreateConversation}
            >
              <Plus size={16} className="mr-1" /> 
              {t("chat.newConversation")}
            </Button>
          </div>
        ) : (
          <div className="p-2">
            {filteredConversations.map((chat) => (
              <div
                key={chat.id}
                className={`p-3 mb-1 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors group ${
                  activeConversationId === chat.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => onSelectConversation(chat.id)}
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-sm">{chat.title}</h3>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 mr-1">{chat.date}</span>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical size={14} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameConversation(chat.id, chat.title);
                          }}
                        >
                          <Edit2 size={14} className="mr-2" />
                          {t("chat.renameConversation")}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-red-600 focus:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(chat.id);
                          }}
                        >
                          <Trash2 size={14} className="mr-2" />
                          {t("chat.deleteConversation")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                {chat.preview && (
                  <p className="text-xs text-gray-500 mt-1 truncate">{chat.preview}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Dialog de renommage */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("chat.renameConversation")}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder={t("chat.conversationTitle")}
              className="w-full"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button 
              onClick={submitRenameConversation}
              disabled={!editTitle.trim()}
            >
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatHistory;
