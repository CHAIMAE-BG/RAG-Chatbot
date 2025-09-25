
import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import StatsCard from '@/components/StatsCard';
import { Users, FileText, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchDashboardStats, DashboardStats } from '@/api/dashboardAPI';

// Chargement lazy des composants de graphiques lourds
const TypesPieChart = lazy(() => import('@/components/dashboard/TypesPieChart'));
const UserBarChart = lazy(() => import('@/components/dashboard/UserBarChart'));

const Dashboard = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    usersCount: 0,
    filesCount: 0,
    conversationsCount: 0,
    messagesCount: 0,
    filesByType: [],
    filesByUser: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [redirected, setRedirected] = useState(false);

  // Mémoiser la fonction fetchStats pour éviter des re-renders inutiles
  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      const dashboardStats = await fetchDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: t('common.error'),
        description: t('dashboard.errorLoading'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [t, toast]);

  useEffect(() => {
    // Check if user is admin before allowing access - but only redirect once
    if (!isAdmin && !isLoading && !redirected) {
      setRedirected(true);
      toast({
        title: t('common.error'),
        description: t('auth.adminRequired'),
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    // If we're still here and the user is admin, fetch stats
    if (isAdmin && !redirected) {
      fetchStats();
    }
  }, [isAdmin, isLoading, navigate, t, toast, redirected, fetchStats]);

  // Si user n'est pas admin, afficher un message d'accès refusé
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">{t('common.error')}</h1>
          <p className="text-gray-600 mb-8">{t('auth.adminRequired')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('nav.dashboard')}</h1>

      {/* Stats cards */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard 
          title={t('dashboard.usersCount')}
          value={isLoading ? <Skeleton className="h-8 w-16" /> : stats.usersCount}
          icon={Users}
          color="bg-blue-500"
          change={{ value: 5, positive: true }}
        />
        <StatsCard 
          title={t('dashboard.filesCount')}
          value={isLoading ? <Skeleton className="h-8 w-16" /> : stats.filesCount}
          icon={FileText}
          color="bg-green-500"
          change={{ value: 12, positive: true }}
        />
        <StatsCard 
          title={t('dashboard.conversationsCount')}
          value={isLoading ? <Skeleton className="h-8 w-16" /> : stats.conversationsCount}
          icon={MessageSquare}
          color="bg-amber-500"
          change={{ value: 8, positive: true }}
        />
        <StatsCard 
          title={t('dashboard.messagesCount')}
          value={isLoading ? <Skeleton className="h-8 w-16" /> : stats.messagesCount}
          icon={MessageSquare}
          color="bg-purple-500"
          change={{ value: 15, positive: true }}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 mb-8 md:grid-cols-2">
        {/* Files by Type - Pie Chart */}
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">{t('dashboard.filesByType')}</h2>
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <TypesPieChart data={stats.filesByType} isLoading={isLoading} />
          </Suspense>
        </div>

        {/* Files by User - Bar Chart */}
        <div className="p-6 bg-white rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">{t('dashboard.filesByUser')}</h2>
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <UserBarChart data={stats.filesByUser} isLoading={isLoading} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
