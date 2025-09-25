
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'client';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin, isClient, loading } = useAuth();

  if (loading) {
    // Afficher un écran de chargement pendant la vérification de l'authentification
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Vérifier les rôles si nécessaire
  if (requiredRole === 'admin' && !isAdmin) {
    return <Navigate to="/chat" />;
  }

  if (requiredRole === 'client' && !isClient && !isAdmin) {
    // Rediriger les visiteurs vers la page d'accueil
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
