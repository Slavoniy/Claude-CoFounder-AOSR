import type {
  UserRole,
  ProjectStatus,
  ContractStatus,
  MaterialDocumentType,
  MeasurementUnit,
  WorkRecordStatus,
} from '@prisma/client';

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

/** Русские названия типов документов материалов */
export const MATERIAL_DOC_TYPE_LABELS: Record<MaterialDocumentType, string> = {
  PASSPORT: 'Паспорт качества',
  CERTIFICATE: 'Сертификат соответствия',
  PROTOCOL: 'Протокол испытаний',
};

/** Русские названия единиц измерения */
export const MEASUREMENT_UNIT_LABELS: Record<MeasurementUnit, string> = {
  PIECE: 'шт',
  KG: 'кг',
  TON: 'т',
  M: 'м',
  M2: 'м²',
  M3: 'м³',
  L: 'л',
  SET: 'компл',
};

/** Русские названия статусов записей о работах */
export const WORK_RECORD_STATUS_LABELS: Record<WorkRecordStatus, string> = {
  DRAFT: 'Черновик',
  IN_PROGRESS: 'В работе',
  COMPLETED: 'Выполнено',
  ACCEPTED: 'Принято',
  REJECTED: 'Отклонено',
};

/** Цвета статусов по спецификации */
export const STATUS_COLORS = {
  success: 'bg-green-100 text-green-800',  // подписано / утверждено
  danger: 'bg-red-100 text-red-800',       // отклонено
  warning: 'bg-yellow-100 text-yellow-800', // на проверке
  neutral: 'bg-gray-100 text-gray-800',    // черновик / в работе
} as const;
