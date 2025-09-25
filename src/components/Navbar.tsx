
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, MessageCircle, Globe, LogIn, UserPlus, LogOut, LineChart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, signOut } = useAuth();
  const { t } = useTranslation();
  const { direction } = useLanguage();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setIsMenuOpen(false);
  };

  // Extraire les initiales du nom d'utilisateur
  const getUserInitials = () => {
    if (!user) return 'U';
    
    const firstName = user.user_metadata?.first_name || '';
    const lastName = user.user_metadata?.last_name || '';
    
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    
    return 'U';
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 w-full px-4 py-3 md:px-6 lg:px-8 bg-white/80 backdrop-blur-sm border-b border-gray-100`}>
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <span className="text-brand-600 font-bold text-2xl">RAG</span>
          <span className="font-poppins font-bold text-xl">{t('common.appName')}</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="animated-link font-medium flex items-center gap-2">
            <Home size={18} />
            <span>{t('nav.home')}</span>
          </Link>
          <Link to="/chat" className="animated-link font-medium flex items-center gap-2">
            <MessageCircle size={18} />
            <span>{t('nav.chat')}</span>
          </Link>
          {isAdmin && (
            <Link to="/dashboard" className="animated-link font-medium flex items-center gap-2">
              <LineChart size={18} />
              <span>{t('nav.dashboard')}</span>
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <LanguageSelector />
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-brand-100 text-brand-800">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {user?.user_metadata?.first_name && user?.user_metadata?.last_name 
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                    : t('auth.account')}
                </DropdownMenuLabel>
                <DropdownMenuItem disabled className="text-sm opacity-70">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LineChart className="mr-2 h-4 w-4" />
                    <span>{t('nav.dashboard')}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('auth.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hover-scale flex items-center gap-1"
                onClick={() => navigate('/login')}
              >
                <LogIn size={18} />
                <span>{t('auth.login')}</span>
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="hover-scale flex items-center gap-1"
                onClick={() => navigate('/register')}
              >
                <UserPlus size={18} />
                <span>{t('auth.register')}</span>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-brand-100 text-brand-800 text-xs">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  {user?.user_metadata?.first_name && user?.user_metadata?.last_name 
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                    : t('auth.account')}
                </DropdownMenuLabel>
                <DropdownMenuItem disabled className="text-sm opacity-70">
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <LineChart className="mr-2 h-4 w-4" />
                    <span>{t('nav.dashboard')}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('auth.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg p-4 pt-2 animate-fade-in">
          <div className="flex flex-col space-y-3">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <Home size={18} />
              <span>{t('nav.home')}</span>
            </Link>
            <Link 
              to="/chat" 
              className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md"
              onClick={() => setIsMenuOpen(false)}
            >
              <MessageCircle size={18} />
              <span>{t('nav.chat')}</span>
            </Link>
            {isAdmin && (
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-md"
                onClick={() => setIsMenuOpen(false)}
              >
                <LineChart size={18} />
                <span>{t('nav.dashboard')}</span>
              </Link>
            )}

            <div className="pt-2 border-t border-gray-200">
              <LanguageSelector />
            </div>
            
            <div className="flex flex-col space-y-2 pt-2">
              {!isAuthenticated && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      navigate('/login');
                      setIsMenuOpen(false);
                    }}
                  >
                    <LogIn size={18} />
                    {t('auth.login')}
                  </Button>
                  <Button 
                    size="sm" 
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      navigate('/register');
                      setIsMenuOpen(false);
                    }}
                  >
                    <UserPlus size={18} />
                    {t('auth.register')}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
