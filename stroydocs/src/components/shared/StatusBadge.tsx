import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  // Проекты
  ACTIVE: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
  ARCHIVED: 'bg-gray-100 text-gray-600',
  // Договоры
  DRAFT: 'bg-gray-100 text-gray-800',
  TERMINATED: 'bg-red-100 text-red-800',
  // Записи о работах
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  REJECTED: 'bg-red-100 text-red-800',
  // Общие
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
};

interface StatusBadgeProps {
  status: string;
  label: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium',
        statusStyles[status] || 'bg-gray-100 text-gray-800',
        className
      )}
    >
      {label}
    </span>
  );
}
