import { useState, useEffect } from 'react';
import { User, Settings, Bell, Download, Wifi, WifiOff, Plus, Menu, X, RefreshCw, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useAdvancedPWA } from '@/hooks/useAdvancedPWA';
import { Link } from 'wouter';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  title?: string;
  onAddHabit?: () => void;
  showAddButton?: boolean;
  className?: string;
}

export default function Header({ 
  title = "Your Habits", 
  onAddHabit,
  showAddButton = true,
  className = ""
}: HeaderProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    updateAvailable,
    canInstall,
    isOnline,
    networkSpeed,
    updateServiceWorker,
    installApp
  } = useAdvancedPWA();

  // Close menu on outside click
  useEffect(() => {
    if (isMenuOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('.header-menu')) {
          setIsMenuOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMenuOpen]);

  const getNetworkIcon = () => {
    const iconSize = isMobile ? "w-3 h-3" : "w-4 h-4";
    
    if (!isOnline) return <WifiOff className={`${iconSize} text-red-400`} />;
    
    switch (networkSpeed) {
      case 'fast':
        return <Wifi className={`${iconSize} text-green-400`} />;
      case 'medium':
        return <Wifi className={`${iconSize} text-yellow-400`} />;
      case 'slow':
        return <Wifi className={`${iconSize} text-orange-400`} />;
      default:
        return <Wifi className={`${iconSize} text-blue-400`} />;
    }
  };

  const ActionButtons = () => (
    <div className="flex items-center space-x-2">
      {/* PWA Status Indicators */}
      <div className="flex items-center space-x-1">
        {/* Network Status */}
        <div className="flex items-center space-x-1 px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
          {getNetworkIcon()}
          {!isOnline && (
            <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
              Offline
            </Badge>
          )}
        </div>

        {/* Update Available */}
        {updateAvailable && (
          <Button
            size="sm"
            onClick={updateServiceWorker}
            className="bg-blue-600/90 hover:bg-blue-700 text-white px-3 py-1 h-8 text-xs backdrop-blur-sm"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Update
          </Button>
        )}

        {/* Install PWA */}
        {canInstall && (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              console.log('Install button clicked');
              const result = await installApp();
              console.log('Install result:', result);
            }}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-3 py-1 h-8 text-xs backdrop-blur-sm transition-all duration-200"
          >
            <Smartphone className="w-3 h-3 mr-1" />
            Install
          </Button>
        )}
      </div>

      {/* Add Habit Button */}
      {showAddButton && onAddHabit && (
        <Button
          onClick={onAddHabit}
          className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-4 py-2 h-10 font-medium backdrop-blur-sm transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      )}
    </div>
  );

  const UserMenu = () => (
    <div className="relative header-menu">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center space-x-2 text-white hover:bg-white/10 p-2 rounded-full"
      >
        <Avatar className="w-8 h-8 border-2 border-white/30">
          <AvatarImage src={user?.profileImageUrl || ""} alt="Profile" />
          <AvatarFallback className="bg-white/20 text-white text-sm">
            {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        {!isMobile && (
          <span className="text-sm font-medium hidden sm:block">
            {user?.firstName || 'User'}
          </span>
        )}
      </Button>

      {/* Dropdown Menu */}
      {isMenuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl shadow-xl border border-white/20 dark:border-gray-600/20 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-600/50">
            <div className="flex items-center space-x-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={user?.profileImageUrl || ""} alt="Profile" />
                <AvatarFallback className="bg-indigo-500 text-white">
                  {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {user?.firstName || 'User'} {user?.lastName || ''}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>

          <div className="py-2">
            <Link href="/profile">
              <button
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </button>
            </Link>

            <Link href="/settings">
              <button
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </Link>

            {/* Notifications Badge */}
            <Link href="/notifications">
              <button
                className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
                <Badge className="ml-auto bg-red-500 text-white text-xs px-1">
                  2
                </Badge>
              </button>
            </Link>
          </div>

          <div className="border-t border-gray-200/50 dark:border-gray-600/50 py-2">
            <a
              href="/api/logout"
              className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>Sign Out</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );

  // Mobile Header
  if (isMobile) {
    return (
      <header className={`sticky top-0 z-40 bg-black/20 backdrop-blur-md border-b border-white/10 ${className}`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Title */}
          <h1 className="text-xl font-bold text-white truncate flex-1">
            {title}
          </h1>

          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            {/* Network Status - Always visible on mobile */}
            <div className="flex items-center space-x-1 px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
              {getNetworkIcon()}
              {!isOnline && (
                <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
                  Offline
                </Badge>
              )}
            </div>

            {/* PWA Status */}
            <div className="flex items-center space-x-1">
              {/* Update */}
              {updateAvailable && (
                <Button
                  size="sm"
                  onClick={updateServiceWorker}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 h-7 text-xs"
                >
                  <RefreshCw className="w-3 h-3" />
                </Button>
              )}

              {/* Install */}
              {canInstall && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    console.log('Mobile install button clicked');
                    const result = await installApp();
                    console.log('Mobile install result:', result);
                  }}
                  className="border-white/30 text-white hover:bg-white/10 px-2 py-1 h-7 text-xs"
                >
                  <Smartphone className="w-3 h-3" />
                </Button>
              )}
            </div>

            {/* Add Button */}
            {showAddButton && onAddHabit && (
              <Button
                onClick={onAddHabit}
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 h-8"
              >
                <Plus className="w-4 h-4" />
              </Button>
            )}

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </header>
    );
  }

  // Desktop Header
  return (
    <header className={`sticky top-0 z-40 bg-black/20 backdrop-blur-md border-b border-white/10 ${className}`}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Title */}
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-white">
            {title}
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          <ActionButtons />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}

// Export a simplified header for pages that don't need all features
export function SimpleHeader({ 
  title, 
  showBack = false, 
  onBack 
}: { 
  title: string; 
  showBack?: boolean; 
  onBack?: () => void; 
}) {
  const isMobile = useIsMobile();
  const { updateAvailable, updateServiceWorker } = useAdvancedPWA();

  return (
    <header className="sticky top-0 z-40 bg-black/20 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          {showBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-white hover:bg-white/10 p-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
          )}
          <h1 className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>
            {title}
          </h1>
        </div>

        {updateAvailable && (
          <Button
            size="sm"
            onClick={updateServiceWorker}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 h-8 text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Update
          </Button>
        )}
      </div>
    </header>
  );
}