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
