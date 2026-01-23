import React from 'react';
import { Shield, Lock, AlertTriangle } from 'lucide-react';

/**
 * Security Classification Levels
 * Based on US Intelligence Community classification system
 */
export type ClassificationLevel = 
  | 'UNCLASS' 
  | 'CUI' 
  | 'SECRET' 
  | 'TOP_SECRET' 
  | 'TS_SCI';

/**
 * Handling Caveats
 * Special handling instructions for classified information
 */
export type Caveat = 
  | 'NOFORN'           // No Foreign Nationals
  | 'REL_TO'           // Releasable To (requires releasability list)
  | 'ORCON'            // Originator Controlled
  | 'PROPIN'           // Caution - Proprietary Information Involved
  | 'FISA'             // Foreign Intelligence Surveillance Act
  | 'SPECIAL_ACCESS';  // Special Access Required

export interface SecurityBadgeProps {
  /** Classification level */
  level: ClassificationLevel;
  
  /** Handling caveats */
  caveats?: Caveat[];
  
  /** Countries releasable to (used with REL_TO caveat) */
  releasability?: string[]; // e.g., ['USA', 'GBR', 'AUS']
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Show full text vs abbreviation */
  showFullText?: boolean;
  
  /** Show icon */
  showIcon?: boolean;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * SecurityBadge Component
 * 
 * Displays security classification level with appropriate visual styling
 * per DoD and Intelligence Community standards.
 * 
 * @example
 * <SecurityBadge level="SECRET" />
 * <SecurityBadge level="SECRET" caveats={['NOFORN']} size="lg" />
 * <SecurityBadge level="TOP_SECRET" caveats={['REL_TO']} releasability={['USA', 'GBR']} />
 */
export function SecurityBadge({
  level,
  caveats = [],
  releasability = [],
  size = 'md',
  showFullText = false,
  showIcon = true,
  className = '',
}: SecurityBadgeProps) {
  
  // Classification level configuration
  const levelConfig = {
    UNCLASS: {
      short: 'U',
      full: 'UNCLASSIFIED',
      color: 'bg-green-700 text-white border-green-600',
      icon: Shield,
      description: 'Information that is not classified and approved for public release',
    },
    CUI: {
      short: 'CUI',
      full: 'CONTROLLED UNCLASSIFIED',
      color: 'bg-yellow-600 text-black border-yellow-500',
      icon: AlertTriangle,
      description: 'Controlled Unclassified Information - requires protection but not classified',
    },
    SECRET: {
      short: 'S',
      full: 'SECRET',
      color: 'bg-orange-600 text-white border-orange-500',
      icon: Lock,
      description: 'Unauthorized disclosure could cause serious damage to national security',
    },
    TOP_SECRET: {
      short: 'TS',
      full: 'TOP SECRET',
      color: 'bg-red-600 text-white border-red-500',
      icon: Lock,
      description: 'Unauthorized disclosure could cause exceptionally grave damage to national security',
    },
    TS_SCI: {
      short: 'TS/SCI',
      full: 'TOP SECRET / SENSITIVE COMPARTMENTED INFORMATION',
      color: 'bg-red-800 text-white border-yellow-400 border-2',
      icon: Lock,
      description: 'Highest classification - compartmented intelligence information',
    },
  };

  const config = levelConfig[level];
  const Icon = config.icon;
  
  // Size configuration
  const sizeClasses = {
    sm: {
      badge: 'px-1.5 py-0.5 text-xs',
      icon: 'w-3 h-3',
      font: 'text-xs',
    },
    md: {
      badge: 'px-2 py-1 text-sm',
      icon: 'w-4 h-4',
      font: 'text-sm',
    },
    lg: {
      badge: 'px-3 py-1.5 text-base',
      icon: 'w-5 h-5',
      font: 'text-base',
    },
  };

  const sizeClass = sizeClasses[size];

  // Build caveat string
  const buildCaveatString = () => {
    if (caveats.length === 0) return '';
    
    const caveatStrings = caveats.map(caveat => {
      if (caveat === 'REL_TO' && releasability.length > 0) {
        return `REL TO ${releasability.join(', ')}`;
      }
      return caveat.replace('_', ' ');
    });
    
    return '//' + caveatStrings.join('//');
  };

  const caveatString = buildCaveatString();
  const displayText = showFullText ? config.full : config.short;
  const fullDisplayText = `${displayText}${caveatString}`;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        font-bold uppercase tracking-tight
        rounded border
        ${config.color}
        ${sizeClass.badge}
        ${sizeClass.font}
        ${className}
      `}
      title={`${config.full}${caveatString}\n\n${config.description}`}
      role="status"
      aria-label={`Classification: ${fullDisplayText}`}
    >
      {showIcon && <Icon className={sizeClass.icon} />}
      <span>{fullDisplayText}</span>
    </span>
  );
}

/**
 * Security Banner Component
 * 
 * Displays page-level classification banner (typically at top and bottom of page)
 * per DoD 5200.01 marking requirements.
 * 
 * @example
 * <SecurityBanner level="SECRET" caveats={['NOFORN']} />
 */
export function SecurityBanner({
  level,
  caveats = [],
  releasability = [],
  position = 'top',
}: SecurityBadgeProps & { position?: 'top' | 'bottom' }) {
  const levelConfig = {
    UNCLASS: 'bg-green-700 text-white',
    CUI: 'bg-yellow-600 text-black',
    SECRET: 'bg-orange-600 text-white',
    TOP_SECRET: 'bg-red-600 text-white',
    TS_SCI: 'bg-red-800 text-white',
  };

  const buildFullText = () => {
    let text = level.replace('_', '/');
    
    if (caveats.length > 0) {
      const caveatStrings = caveats.map(caveat => {
        if (caveat === 'REL_TO' && releasability.length > 0) {
          return `REL TO ${releasability.join(', ')}`;
        }
        return caveat.replace('_', ' ');
      });
      text += '//' + caveatStrings.join('//');
    }
    
    return text;
  };

  return (
    <div
      className={`
        w-full py-2 px-4
        ${levelConfig[level]}
        text-center font-black uppercase tracking-widest
        ${position === 'top' ? 'border-b-4' : 'border-t-4'}
        border-current
      `}
      role="banner"
      aria-label={`Page classification: ${buildFullText()}`}
    >
      {buildFullText()}
    </div>
  );
}

/**
 * Classified Panel Component
 * 
 * Wrapper component that adds classification marking to panel headers
 * 
 * @example
 * <ClassifiedPanel level="SECRET" title="Target Information">
 *   <TargetDetails />
 * </ClassifiedPanel>
 */
export function ClassifiedPanel({
  level,
  caveats = [],
  releasability = [],
  title,
  children,
  className = '',
}: SecurityBadgeProps & {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-lg ${className}`}>
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="font-black uppercase text-sm text-white tracking-tight">
          {title}
        </h2>
        <SecurityBadge 
          level={level} 
          caveats={caveats}
          releasability={releasability}
          size="sm"
        />
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

/**
 * Hook to check if user has required clearance
 * 
 * @param requiredLevel - The classification level required
 * @returns boolean - Whether user has sufficient clearance
 */
export function useHasClearance(requiredLevel: ClassificationLevel): boolean {
  // TODO: Implement actual user clearance check from auth context
  // For now, return true for development
  
  // This should check:
  // 1. User's clearance level
  // 2. Active clearance (not expired)
  // 3. Need-to-know for compartments (if TS/SCI)
  
  return true;
}

/**
 * Component wrapper that hides content if user lacks clearance
 * 
 * @example
 * <RestrictedContent level="SECRET">
 *   <SensitiveTargetData />
 * </RestrictedContent>
 */
export function RestrictedContent({
  level,
  children,
  fallback = null,
}: {
  level: ClassificationLevel;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const hasClearance = useHasClearance(level);
  
  if (!hasClearance) {
    return (
      <>
        {fallback || (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 text-center">
            <Lock className="w-8 h-8 mx-auto mb-3 text-slate-500" />
            <p className="text-slate-400 font-semibold">
              Insufficient Clearance
            </p>
            <p className="text-slate-500 text-sm mt-1">
              This content requires {level} clearance
            </p>
          </div>
        )}
      </>
    );
  }
  
  return <>{children}</>;
}

/**
 * Classification level comparison utility
 * 
 * @param userLevel - User's clearance level
 * @param requiredLevel - Required clearance level
 * @returns boolean - Whether user level meets or exceeds required level
 */
export function meetsClassificationLevel(
  userLevel: ClassificationLevel,
  requiredLevel: ClassificationLevel
): boolean {
  const hierarchy = {
    UNCLASS: 0,
    CUI: 1,
    SECRET: 2,
    TOP_SECRET: 3,
    TS_SCI: 4,
  };
  
  return hierarchy[userLevel] >= hierarchy[requiredLevel];
}

/**
 * Get highest classification from array of levels
 * 
 * @param levels - Array of classification levels
 * @returns ClassificationLevel - Highest classification
 */
export function getHighestClassification(
  levels: ClassificationLevel[]
): ClassificationLevel {
  const hierarchy = {
    UNCLASS: 0,
    CUI: 1,
    SECRET: 2,
    TOP_SECRET: 3,
    TS_SCI: 4,
  };
  
  let highest: ClassificationLevel = 'UNCLASS';
  let highestValue = 0;
  
  for (const level of levels) {
    if (hierarchy[level] > highestValue) {
      highest = level;
      highestValue = hierarchy[level];
    }
  }
  
  return highest;
}
