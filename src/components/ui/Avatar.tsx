/**
 * Shared Avatar component - replaces 17+ duplicated avatar implementations
 * Supports initials, images, and various sizes/colors
 */

interface AvatarProps {
  /** Person's first name (used for initials) */
  firstName?: string;
  /** Person's last name (used for initials) */
  lastName?: string;
  /** Full name (alternative to firstName/lastName) */
  name?: string;
  /** Image URL (if available) */
  src?: string;
  /** Size variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** Color variant (for initials) */
  color?: 'indigo' | 'blue' | 'green' | 'purple' | 'pink' | 'amber' | 'gray';
  /** Additional CSS classes */
  className?: string;
  /** Alt text for image (defaults to name) */
  alt?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const colorClasses = {
  indigo: 'bg-gradient-to-br from-indigo-400 to-purple-500',
  blue: 'bg-gradient-to-br from-blue-400 to-indigo-500',
  green: 'bg-gradient-to-br from-emerald-400 to-teal-500',
  purple: 'bg-gradient-to-br from-purple-400 to-pink-500',
  pink: 'bg-gradient-to-br from-pink-400 to-rose-500',
  amber: 'bg-gradient-to-br from-amber-400 to-orange-500',
  gray: 'bg-gradient-to-br from-gray-400 to-slate-500',
};

/**
 * Get initials from name parts
 */
function getInitials(firstName?: string, lastName?: string, fullName?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (fullName) {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  }
  if (firstName) {
    return firstName.slice(0, 2).toUpperCase();
  }
  return '??';
}

/**
 * Generate a consistent color based on name (so same person always gets same color)
 */
function getColorFromName(name: string): keyof typeof colorClasses {
  const colors = Object.keys(colorClasses) as Array<keyof typeof colorClasses>;
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({
  firstName,
  lastName,
  name,
  src,
  size = 'sm',
  color,
  className = '',
  alt,
}: AvatarProps) {
  const initials = getInitials(firstName, lastName, name);
  const fullName = name || [firstName, lastName].filter(Boolean).join(' ') || 'User';
  const computedColor = color || getColorFromName(fullName);
  const altText = alt || fullName;

  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center font-medium`;

  if (src) {
    return (
      <img
        src={src}
        alt={altText}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={(e) => {
          // Fallback to initials if image fails to load
          e.currentTarget.style.display = 'none';
          e.currentTarget.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  return (
    <div
      className={`${baseClasses} ${colorClasses[computedColor]} text-white shadow-sm ${className}`}
      aria-label={altText}
      role="img"
    >
      {initials}
    </div>
  );
}

/**
 * Avatar with image fallback to initials
 */
export function AvatarWithFallback({
  firstName,
  lastName,
  name,
  src,
  size = 'sm',
  color,
  className = '',
  alt,
}: AvatarProps) {
  const initials = getInitials(firstName, lastName, name);
  const fullName = name || [firstName, lastName].filter(Boolean).join(' ') || 'User';
  const computedColor = color || getColorFromName(fullName);
  const altText = alt || fullName;

  if (src) {
    return (
      <div className={`relative ${sizeClasses[size]} ${className}`}>
        <img
          src={src}
          alt={altText}
          className={`${sizeClasses[size]} rounded-full object-cover`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling;
            if (fallback) fallback.classList.remove('hidden');
          }}
        />
        <div
          className={`hidden ${sizeClasses[size]} rounded-full flex items-center justify-center font-medium ${colorClasses[computedColor]} text-white shadow-sm`}
          aria-label={altText}
          role="img"
        >
          {initials}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center font-medium ${colorClasses[computedColor]} text-white shadow-sm ${className}`}
      aria-label={altText}
      role="img"
    >
      {initials}
    </div>
  );
}

export default Avatar;
