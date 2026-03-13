import type { UserRole } from '@prisma/client';
import { ROLE_LABELS } from './constants';

/** Формирование полного ФИО */
export function formatFullName(user: {
  lastName: string;
  firstName: string;
  middleName?: string | null;
}) {
  const parts = [user.lastName, user.firstName];
  if (user.middleName) parts.push(user.middleName);
  return parts.join(' ');
}

/** Форматирование даты в русской локали */
export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Форматирование ИНН (с пробелами для читаемости) */
export function formatInn(inn: string) {
  return inn;
}

/** Получить русское название роли */
export function formatRole(role: UserRole) {
  return ROLE_LABELS[role] || role;
}
