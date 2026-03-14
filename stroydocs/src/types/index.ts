export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  WORKER = 'WORKER',
  CONTROLLER = 'CONTROLLER',
  CUSTOMER = 'CUSTOMER',
}

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  EXPIRED = 'EXPIRED',
}

export enum ProjectStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

export enum ContractType {
  MAIN = 'MAIN',
  SUBCONTRACT = 'SUBCONTRACT',
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  TERMINATED = 'TERMINATED',
}

export enum ParticipantRole {
  DEVELOPER = 'DEVELOPER',
  CONTRACTOR = 'CONTRACTOR',
  SUPERVISION = 'SUPERVISION',
  SUBCONTRACTOR = 'SUBCONTRACTOR',
}

// === Фаза 2 — Производство работ ===

export enum MaterialDocumentType {
  PASSPORT = 'PASSPORT',
  CERTIFICATE = 'CERTIFICATE',
  PROTOCOL = 'PROTOCOL',
}

export enum MeasurementUnit {
  PIECE = 'PIECE',
  KG = 'KG',
  TON = 'TON',
  M = 'M',
  M2 = 'M2',
  M3 = 'M3',
  L = 'L',
  SET = 'SET',
}

export enum WorkRecordStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}
