import { ReactNode, useMemo } from 'react';
import { useResponsiveBreakpoint } from '@/components/ResponsiveLayout';

interface AdaptiveGridProps {
  children: ReactNode[];
  minItemWidth?: number;
  maxColumns?: number;
  gap?: number;
  className?: string;
  priority?: 'density' | 'readability' | 'touch';
}

export default function AdaptiveGrid({
  children,
  minItemWidth = 280,
  maxColumns = 6,
  gap = 16,
  className = '',
  priority = 'touch'
}: AdaptiveGridProps) {
  const { breakpoint, isMobile, isTablet, isDesktop } = useResponsiveBreakpoint();

  const gridConfig = useMemo(() => {
    // Mobile-first approach with touch optimization
    if (isMobile) {
      return {
        columns: priority === 'density' ? 2 : 1,
        gap: gap * 0.75,
        itemSize: priority === 'density' ? 'compact' : 'comfortable'
      };
    }
    
    // Tablet configuration
    if (isTablet) {
      const viewportWidth = window.innerWidth;
      const availableWidth = viewportWidth - (gap * 3); // Account for margins
      const itemsPerRow = Math.floor(availableWidth / minItemWidth);
      
      return {
        columns: Math.min(Math.max(itemsPerRow, 2), 4),
        gap,
        itemSize: 'comfortable'
      };
    }
    
    // Desktop configuration
    if (isDesktop) {
      const viewportWidth = window.innerWidth;
      const availableWidth = viewportWidth - (gap * 5); // Account for margins and sidebar
      const itemsPerRow = Math.floor(availableWidth / minItemWidth);
      
      return {
        columns: Math.min(Math.max(itemsPerRow, 3), maxColumns),
        gap,
        itemSize: priority === 'density' ? 'compact' : 'comfortable'
      };
    }
    
    // Fallback
    return {
      columns: 3,
      gap,
      itemSize: 'comfortable'
    };
  }, [breakpoint, minItemWidth, maxColumns, gap, priority, isMobile, isTablet, isDesktop]);

  // Dynamic grid styles
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridConfig.columns}, 1fr)`,
    gap: `${gridConfig.gap}px`,
    width: '100%'
  };

  // Container classes based on configuration
  const containerClasses = [
    'adaptive-grid',
    `grid-${gridConfig.itemSize}`,
    `grid-cols-${gridConfig.columns}`,
    isMobile ? 'mobile-grid' : '',
    isTablet ? 'tablet-grid' : '',
    isDesktop ? 'desktop-grid' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div 
      className={containerClasses}
      style={gridStyles}
      data-columns={gridConfig.columns}
      data-breakpoint={breakpoint}
      data-priority={priority}
    >
      {children.map((child, index) => (
        <div 
          key={index}
          className={`grid-item ${gridConfig.itemSize === 'compact' ? 'compact' : 'comfortable'}`}
          style={{
            minHeight: isMobile && priority === 'touch' ? '120px' : '80px'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

// Masonry grid for variable height items
export function AdaptiveMasonry({
  children,
  columns,
  gap = 16,
  className = ''
}: {
  children: ReactNode[];
  columns?: number;
  gap?: number;
  className?: string;
}) {
  const { isMobile, isTablet } = useResponsiveBreakpoint();
  
  const columnCount = useMemo(() => {
    if (columns) return columns;
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  }, [columns, isMobile, isTablet]);

  // Distribute items across columns
  const columnWrappers = useMemo(() => {
    const columns = Array.from({ length: columnCount }, () => [] as ReactNode[]);
    
    children.forEach((child, index) => {
      columns[index % columnCount].push(
        <div key={index} style={{ marginBottom: gap }}>
          {child}
        </div>
      );
    });
    
    return columns;
  }, [children, columnCount, gap]);

  return (
    <div className={`adaptive-masonry ${className}`}>
      <div 
        className="masonry-container"
        style={{
          display: 'flex',
          gap: `${gap}px`,
          alignItems: 'flex-start'
        }}
      >
        {columnWrappers.map((column, index) => (
          <div 
            key={index}
            className="masonry-column"
            style={{ 
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {column}
          </div>
        ))}
      </div>
    </div>
  );
}

// Responsive card container
export function ResponsiveCards({
  children,
  cardSize = 'medium',
  className = ''
}: {
  children: ReactNode[];
  cardSize?: 'small' | 'medium' | 'large';
  className?: string;
}) {
  const { isMobile, isTablet } = useResponsiveBreakpoint();
  
  const getSizeClasses = () => {
    const mobile = isMobile;
    const tablet = isTablet;
    
    switch (cardSize) {
      case 'small':
        return {
          mobile: 'grid-cols-2 gap-2',
          tablet: 'grid-cols-3 gap-3',
          desktop: 'grid-cols-4 gap-4'
        };
      case 'large':
        return {
          mobile: 'grid-cols-1 gap-4',
          tablet: 'grid-cols-2 gap-4',
          desktop: 'grid-cols-3 gap-6'
        };
      default:
        return {
          mobile: 'grid-cols-1 gap-3',
          tablet: 'grid-cols-2 gap-4',
          desktop: 'grid-cols-3 gap-4'
        };
    }
  };
  
  const sizeClasses = getSizeClasses();
  const gridClass = isMobile ? sizeClasses.mobile : 
                    isTablet ? sizeClasses.tablet : 
                    sizeClasses.desktop;
  
  return (
    <div className={`grid ${gridClass} ${className}`}>
      {children}
    </div>
  );
}