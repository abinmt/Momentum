import { ReactNode, useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveLayoutProps {
  children: ReactNode;
  mobileHeader?: ReactNode;
  desktopHeader?: ReactNode;
  mobileFooter?: ReactNode;
  desktopSidebar?: ReactNode;
  className?: string;
}

interface ViewportInfo {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  deviceType: 'mobile' | 'tablet' | 'desktop';
  displayMode: 'browser' | 'standalone' | 'minimal-ui' | 'fullscreen';
}

export default function ResponsiveLayout({
  children,
  mobileHeader,
  desktopHeader,
  mobileFooter,
  desktopSidebar,
  className = ''
}: ResponsiveLayoutProps) {
  const isMobile = useIsMobile();
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: window.innerWidth,
    height: window.innerHeight,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait',
    deviceType: 'mobile',
    displayMode: 'browser'
  });

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Determine device type based on screen size and user agent
      let deviceType: ViewportInfo['deviceType'] = 'desktop';
      if (width < 768) {
        deviceType = 'mobile';
      } else if (width < 1024) {
        deviceType = 'tablet';
      }
      
      // Check display mode
      let displayMode: ViewportInfo['displayMode'] = 'browser';
      if (window.matchMedia('(display-mode: standalone)').matches) {
        displayMode = 'standalone';
      } else if (window.matchMedia('(display-mode: minimal-ui)').matches) {
        displayMode = 'minimal-ui';
      } else if (window.matchMedia('(display-mode: fullscreen)').matches) {
        displayMode = 'fullscreen';
      }
      
      setViewport({
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait',
        deviceType,
        displayMode
      });
    };

    // Update on resize
    window.addEventListener('resize', updateViewport);
    
    // Update on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(updateViewport, 100); // Delay to get correct dimensions
    });
    
    // Initial update
    updateViewport();

    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
    };
  }, []);

  // CSS custom properties for responsive design
  const cssProperties = {
    '--viewport-width': `${viewport.width}px`,
    '--viewport-height': `${viewport.height}px`,
    '--safe-area-inset-top': 'env(safe-area-inset-top, 0px)',
    '--safe-area-inset-right': 'env(safe-area-inset-right, 0px)',
    '--safe-area-inset-bottom': 'env(safe-area-inset-bottom, 0px)',
    '--safe-area-inset-left': 'env(safe-area-inset-left, 0px)',
  } as React.CSSProperties;

  const containerClasses = [
    'min-h-screen',
    'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500',
    // PWA safe area support
    'pt-[env(safe-area-inset-top)]',
    'pr-[env(safe-area-inset-right)]',
    'pb-[env(safe-area-inset-bottom)]',
    'pl-[env(safe-area-inset-left)]',
    // Display mode specific styles
    viewport.displayMode === 'standalone' ? 'pwa-standalone' : '',
    viewport.displayMode === 'fullscreen' ? 'pwa-fullscreen' : '',
    className
  ].filter(Boolean).join(' ');

  // Mobile Layout
  if (isMobile || viewport.deviceType === 'mobile') {
    return (
      <div 
        className={containerClasses}
        style={cssProperties}
        data-viewport-width={viewport.width}
        data-viewport-height={viewport.height}
        data-orientation={viewport.orientation}
        data-display-mode={viewport.displayMode}
      >
        {/* Mobile Header */}
        {mobileHeader && (
          <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
            {mobileHeader}
          </header>
        )}
        
        {/* Main Content */}
        <main className={`flex-1 ${mobileFooter ? 'pb-20' : ''}`}>
          {children}
        </main>
        
        {/* Mobile Footer/Navigation */}
        {mobileFooter && (
          <footer className="fixed bottom-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-t border-white/10">
            {mobileFooter}
          </footer>
        )}
      </div>
    );
  }

  // Desktop/Tablet Layout
  return (
    <div 
      className={containerClasses}
      style={cssProperties}
      data-viewport-width={viewport.width}
      data-viewport-height={viewport.height}
      data-orientation={viewport.orientation}
      data-display-mode={viewport.displayMode}
    >
      {/* Desktop Header */}
      {desktopHeader && (
        <header className="sticky top-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
          {desktopHeader}
        </header>
      )}
      
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        {desktopSidebar && (
          <aside className="w-64 bg-black/20 backdrop-blur-sm border-r border-white/10 overflow-y-auto">
            {desktopSidebar}
          </aside>
        )}
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

// Hook for viewport information
export function useViewportInfo() {
  const [viewport, setViewport] = useState<ViewportInfo>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    orientation: 'portrait',
    deviceType: 'mobile',
    displayMode: 'browser'
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateViewport = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let deviceType: ViewportInfo['deviceType'] = 'desktop';
      if (width < 768) {
        deviceType = 'mobile';
      } else if (width < 1024) {
        deviceType = 'tablet';
      }
      
      let displayMode: ViewportInfo['displayMode'] = 'browser';
      if (window.matchMedia('(display-mode: standalone)').matches) {
        displayMode = 'standalone';
      }
      
      setViewport({
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait',
        deviceType,
        displayMode
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  return viewport;
}

// Responsive breakpoints hook
export function useResponsiveBreakpoint() {
  const [breakpoint, setBreakpoint] = useState('sm');

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < 640) setBreakpoint('xs');
      else if (width < 768) setBreakpoint('sm');
      else if (width < 1024) setBreakpoint('md');
      else if (width < 1280) setBreakpoint('lg');
      else if (width < 1536) setBreakpoint('xl');
      else setBreakpoint('2xl');
    };

    updateBreakpoint();
    window.addEventListener('resize', updateBreakpoint);
    
    return () => window.removeEventListener('resize', updateBreakpoint);
  }, []);

  return {
    breakpoint,
    isXS: breakpoint === 'xs',
    isSM: breakpoint === 'sm',
    isMD: breakpoint === 'md',
    isLG: breakpoint === 'lg',
    isXL: breakpoint === 'xl',
    is2XL: breakpoint === '2xl',
    isMobile: ['xs', 'sm'].includes(breakpoint),
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint)
  };
}