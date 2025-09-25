
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  usersCount: number;
  filesCount: number;
  conversationsCount: number;
  messagesCount: number;
  filesByType: Array<{ name: string; value: number; }>;
  filesByUser: Array<{ name: string; count: number; }>;
}

// Interface pour représenter la structure exacte des données retournées par la RPC
interface DashboardStatsRawResponse {
  users_count: number;
  files_count: number;
  conversations_count: number;
  messages_count: number;
  files_by_type: Array<{ type_name: string; count: number; }>;
  files_by_user: Array<{ user_id: string; user_name: string; count: number; }>;
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  try {
    // Utilise la fonction RPC existante pour un seul appel réseau
    const { data, error } = await supabase.rpc('get_dashboard_stats');
    
    if (error) {
      console.error('Error fetching dashboard stats:', error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error('No data returned from dashboard stats RPC');
    }
    
    // Si la réponse est un tableau avec un seul élément, prenons le premier élément
    const responseData = Array.isArray(data) ? data[0] : data;
    
    // Cast explicite de data en DashboardStatsRawResponse pour que TypeScript reconnaisse la structure
    const typedData = responseData as unknown as DashboardStatsRawResponse;
    
    // Transforme les données au format attendu par le composant Dashboard
    return {
      usersCount: typedData.users_count || 0,
      filesCount: typedData.files_count || 0,
      conversationsCount: typedData.conversations_count || 0,
      messagesCount: typedData.messages_count || 0,
      filesByType: (typedData.files_by_type || []).map((item) => ({
        name: item.type_name || 'Unknown',
        value: item.count || 0,
      })),
      filesByUser: (typedData.files_by_user || []).map((item) => ({
        name: item.user_name || 'Unknown',
        count: item.count || 0,
      })),
    };
  } catch (error) {
    console.error('Unexpected error in fetchDashboardStats:', error);
    throw error;
  }
}
