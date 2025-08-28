// src/utils/dateFormatter.ts

/**
 * Format date string to a readable format (e.g., "Jan 15, 2023")
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Format date string to include time (e.g., "Jan 15, 2023, 3:45 PM")
 * @param dateString ISO date string
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  });
};

/**
 * Format date to relative time (e.g., "2 days ago")
 * @param dateString ISO date string
 * @returns Relative time string
 */
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffMonths / 12);
  
  if (diffYears > 0) {
    return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;
  }
  if (diffMonths > 0) {
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  }
  if (diffDays > 0) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }
  if (diffHours > 0) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffMins > 0) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  }
  return 'Just now';
};
