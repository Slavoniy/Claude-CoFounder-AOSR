'use client';

import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { formatDate } from '@/utils/format';
import { WORK_RECORD_STATUS_LABELS } from '@/utils/constants';
import type { ColumnDef } from '@tanstack/react-table';
import type { WorkRecordItem } from './useWorkRecords';

interface Props {
  workRecords: WorkRecordItem[];
  onDelete: (id: string) => void;
}

const columns: ColumnDef<WorkRecordItem>[] = [
  {
    accessorKey: 'date',
    header: 'Дата',
    cell: ({ row }) => <span className="text-sm">{formatDate(row.original.date)}</span>,
  },
  {
    accessorKey: 'location',
    header: 'Место',
    cell: ({ row }) => (
      <span className="text-sm max-w-[200px] truncate block">{row.original.location}</span>
    ),
  },
  {
    id: 'workItem',
    header: 'Вид работ',
    cell: ({ row }) => (
      <div className="text-sm">
        <span className="font-mono">{row.original.workItem.cipher}</span>{' '}
        <span className="text-muted-foreground">{row.original.workItem.name}</span>
      </div>
    ),
  },
  {
    id: 'author',
    header: 'Автор',
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.author.lastName} {row.original.author.firstName[0]}.
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => (
      <StatusBadge
        status={row.original.status}
        label={WORK_RECORD_STATUS_LABELS[row.original.status]}
      />
    ),
  },
  {
    id: 'writeoffs',
    header: 'Мат.',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original._count.writeoffs}</span>
    ),
  },
];

export function WorkRecordsTable({ workRecords, onDelete }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columnsWithActions: ColumnDef<WorkRecordItem>[] = [
    ...columns,
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={() => setDeleteId(row.original.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columnsWithActions} data={workRecords} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Удалить запись о работе?"
        description="Списанные материалы будут возвращены на остаток."
        onConfirm={() => {
          if (deleteId) {
            onDelete(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </>
  );
}
