/**
 * PageHeader Component
 *
 * Reusable header with background image support for pages.
 * Images should be placed in /public/images/headers/
 */

import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  image?: string; // Path to image in /public/images/headers/
  gradient?: string; // CSS gradient as fallback
  children?: ReactNode; // Action buttons
  compact?: boolean;
}

// Default gradients for different page types
export const PAGE_GRADIENTS = {
  dashboard: 'from-indigo-600 via-purple-600 to-indigo-800',
  people: 'from-blue-600 via-blue-700 to-indigo-800',
  giving: 'from-emerald-600 via-teal-600 to-emerald-800',
  prayer: 'from-rose-600 via-pink-600 to-rose-800',
  calendar: 'from-amber-500 via-orange-500 to-amber-700',
  groups: 'from-violet-600 via-purple-600 to-violet-800',
  agents: 'from-cyan-600 via-blue-600 to-cyan-800',
  integrations: 'from-slate-600 via-gray-700 to-slate-800',
  lifeApps: 'from-indigo-500 via-purple-500 to-pink-500',
  accounting: 'from-green-600 via-emerald-600 to-teal-700',
  attendance: 'from-sky-600 via-blue-600 to-sky-800',
  volunteers: 'from-orange-500 via-amber-500 to-orange-700',
};

export function PageHeader({
  title,
  subtitle,
  icon,
  image,
  gradient = PAGE_GRADIENTS.dashboard,
  children,
  compact = false,
}: PageHeaderProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-xl ${compact ? 'mb-4' : 'mb-8'}`}
    >
      {/* Background */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${gradient}`}
        style={
          image
            ? {
                backgroundImage: `linear-gradient(to right, rgba(79, 70, 229, 0.9), rgba(124, 58, 237, 0.85)), url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      />

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-2xl" />
      </div>

      {/* Content */}
      <div className={`relative ${compact ? 'px-6 py-6' : 'px-8 py-10'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {icon && (
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl text-white">
                {icon}
              </div>
            )}
            <div>
              <h1 className={`font-bold text-white ${compact ? 'text-xl' : 'text-2xl md:text-3xl'}`}>
                {title}
              </h1>
              {subtitle && (
                <p className={`text-white/80 ${compact ? 'text-sm' : 'text-base'} mt-1`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {children && (
            <div className="flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Smaller variant for sub-pages
 */
export function PageHeaderCompact({
  title,
  subtitle,
  icon,
  gradient,
  children,
}: Omit<PageHeaderProps, 'compact'>) {
  return (
    <PageHeader
      title={title}
      subtitle={subtitle}
      icon={icon}
      gradient={gradient}
      compact
    >
      {children}
    </PageHeader>
  );
}

export default PageHeader;
