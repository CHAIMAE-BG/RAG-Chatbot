
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates a new conversation for a user
 * @param userId - User ID
 * @param title - Conversation title (optional)
 * @returns Promise with conversation ID
 */
export const createConversation = async (userId: string, title?: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .insert([
        { 
          user_id: userId, 
          title: title || 'Nouvelle conversation'
        }
      ])
      .select('id')
      .single();
      
    if (error) throw error;
    
    return data?.id || null;
  } catch (error) {
    console.error('Error creating conversation:', error);
    return null;
  }
};

/**
 * Adds a message to a conversation
 * @param conversationId - Conversation ID
 * @param content - Message content
 * @param isUser - Whether the message is from the user
 * @returns Promise<boolean>
 */
export const addMessage = async (
  conversationId: string, 
  content: string, 
  isUser: boolean = true
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          content: content,
          is_user: isUser
        }
      ]);
      
    if (error) throw error;
    
    // Update conversation timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
      
    return true;
  } catch (error) {
    console.error('Error adding message:', error);
    return false;
  }
};

/**
 * Gets message history for a conversation
 * @param conversationId - Conversation ID
 * @returns Promise with messages
 */
export const getConversationMessages = async (conversationId: string) => {
  try {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
      
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error retrieving messages:', error);
    return [];
  }
};

/**
 * Deletes a conversation and all its messages
 * @param conversationId - Conversation ID
 * @returns Promise<boolean>
 */
export const deleteConversation = async (conversationId: string): Promise<boolean> => {
  try {
    // First delete all messages associated with the conversation
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);
      
    if (messagesError) {
      console.error('Error deleting conversation messages:', messagesError);
      throw messagesError;
    }
    
    // Then delete the conversation itself
    const { error: conversationError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);
      
    if (conversationError) {
      console.error('Error deleting conversation:', conversationError);
      throw conversationError;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return false;
  }
};

/**
 * Renames a conversation
 * @param conversationId - Conversation ID
 * @param newTitle - New conversation title
 * @returns Promise<boolean>
 */
export const renameConversation = async (conversationId: string, newTitle: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('conversations')
      .update({ title: newTitle })
      .eq('id', conversationId);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error renaming conversation:', error);
    return false;
  }
};
