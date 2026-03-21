export const STATUS_CONFIG = {
  applied: {
    label: 'Applied',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  screening: {
    label: 'Screening',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    dot: 'bg-yellow-500',
  },
  interview: {
    label: 'Interview',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    dot: 'bg-purple-500',
  },
  offer: {
    label: 'Offer',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    dot: 'bg-orange-500',
  },
  approved: {
    label: 'Approved ✓',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    dot: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    dot: 'bg-red-500',
  },
  withdrawn: {
    label: 'Withdrawn',
    color: 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400',
    dot: 'bg-gray-400',
  },
};

export const PRIORITY_CONFIG = {
  low: { label: 'Low', color: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
  medium: { label: 'Medium', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  high: { label: 'High', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
};

export const JOB_TYPE_CONFIG = {
  'full-time': { label: 'Full-time' },
  'part-time': { label: 'Part-time' },
  contract: { label: 'Contract' },
  internship: { label: 'Internship' },
  freelance: { label: 'Freelance' },
};

export const SOURCE_CONFIG = {
  linkedin: { label: 'LinkedIn' },
  indeed: { label: 'Indeed' },
  glassdoor: { label: 'Glassdoor' },
  'company-website': { label: 'Company Website' },
  referral: { label: 'Referral' },
  other: { label: 'Other' },
};

export const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || { label: status, color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };

export const getPriorityConfig = (priority) =>
  PRIORITY_CONFIG[priority] || { label: priority, color: 'bg-gray-100 text-gray-600' };
