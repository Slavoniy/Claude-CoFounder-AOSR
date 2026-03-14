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

export enum WorkRecordStatus {
  DRAFT = 'DRAFT',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

export enum MaterialDocType {
  PASSPORT = 'PASSPORT',
  CERTIFICATE = 'CERTIFICATE',
  PROTOCOL = 'PROTOCOL',
  OTHER = 'OTHER',
}

export enum PhotoEntityType {
  WORK_RECORD = 'WORK_RECORD',
  MATERIAL = 'MATERIAL',
  REMARK = 'REMARK',
  WORK_ITEM = 'WORK_ITEM',
}
