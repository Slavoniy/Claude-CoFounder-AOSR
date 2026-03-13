import type { UserRole, ProjectStatus, ContractStatus } from '@prisma/client';

/** Русские названия ролей пользователей */
export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Администратор',
  MANAGER: 'Менеджер',
  WORKER: 'Работник',
  CONTROLLER: 'Контролёр',
  CUSTOMER: 'Заказчик',
};

/** Русские названия статусов проектов */
export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  ACTIVE: 'Активный',
  COMPLETED: 'Завершён',
  ARCHIVED: 'Архив',
};

/** Русские названия статусов договоров */
export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: 'Черновик',
  ACTIVE: 'Действующий',
  COMPLETED: 'Исполнен',
  TERMINATED: 'Расторгнут',
};

/** Цвета статусов по спецификации */
export const STATUS_COLORS = {
  success: 'bg-green-100 text-green-800',  // подписано / утверждено
  danger: 'bg-red-100 text-red-800',       // отклонено
  warning: 'bg-yellow-100 text-yellow-800', // на проверке
  neutral: 'bg-gray-100 text-gray-800',    // черновик / в работе
} as const;
