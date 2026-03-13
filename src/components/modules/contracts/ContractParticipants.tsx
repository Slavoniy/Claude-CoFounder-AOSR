'use client';

import { type ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/shared/DataTable';
import { formatDate } from '@/utils/format';
import type { ContractParticipantItem } from './useContract';
import type { ParticipantRole } from '@prisma/client';

const PARTICIPANT_ROLE_LABELS: Record<ParticipantRole, string> = {
  DEVELOPER: 'Застройщик',
  CONTRACTOR: 'Подрядчик',
  SUPERVISION: 'Авторский надзор',
  SUBCONTRACTOR: 'Субподрядчик',
};

interface Props {
  participants: ContractParticipantItem[];
}

export function ContractParticipants({ participants }: Props) {
  const columns: ColumnDef<ContractParticipantItem, unknown>[] = [
    {
      accessorKey: 'organization.name',
      header: 'Организация',
    },
    {
      accessorKey: 'organization.inn',
      header: 'ИНН',
    },
    {
      accessorKey: 'role',
      header: 'Роль',
      cell: ({ getValue }) => PARTICIPANT_ROLE_LABELS[getValue() as ParticipantRole],
    },
    {
      accessorKey: 'appointmentOrder',
      header: 'Приказ',
      cell: ({ getValue }) => getValue() || '—',
    },
    {
      accessorKey: 'appointmentDate',
      header: 'Дата приказа',
      cell: ({ getValue }) => getValue() ? formatDate(getValue() as string) : '—',
    },
  ];

  return <DataTable columns={columns} data={participants} />;
}
