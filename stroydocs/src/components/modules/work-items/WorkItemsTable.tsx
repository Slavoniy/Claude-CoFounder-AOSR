'use client';

import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import type { WorkItemWithKsi } from './useWorkItems';

interface Props {
  workItems: WorkItemWithKsi[];
  onDelete: (id: string) => void;
}

const columns: ColumnDef<WorkItemWithKsi>[] = [
  {
    accessorKey: 'cipher',
    header: 'Шифр',
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.cipher}</span>,
  },
  {
    accessorKey: 'name',
    header: 'Наименование работы',
  },
  {
    id: 'ksi',
    header: 'КСИ',
    cell: ({ row }) =>
      row.original.ksiNode ? (
        <span className="text-sm text-muted-foreground">
          <span className="font-mono">{row.original.ksiNode.code}</span>{' '}
          {row.original.ksiNode.name}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">—</span>
      ),
  },
  {
    accessorKey: 'unit',
    header: 'Ед. изм.',
    cell: ({ row }) => <span className="text-sm">{row.original.unit}</span>,
  },
  {
    accessorKey: 'quantity',
    header: 'Объём',
    cell: ({ row }) => <span className="font-medium">{row.original.quantity}</span>,
  },
  {
    id: 'stats',
    header: 'Связи',
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        <span>Мат: {row.original._count.materials}</span>
        <span className="mx-1">·</span>
        <span>Зап: {row.original._count.workRecords}</span>
      </div>
    ),
  },
];

export function WorkItemsTable({ workItems, onDelete }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columnsWithActions: ColumnDef<WorkItemWithKsi>[] = [
    ...columns,
    {
      id: 'actions',
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setDeleteId(row.original.id)}
          disabled={row.original._count.workRecords > 0}
          title={row.original._count.workRecords > 0 ? 'Есть записи о работах' : 'Удалить'}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <>
      <DataTable columns={columnsWithActions} data={workItems} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Удалить вид работ?"
        description="Это действие нельзя отменить."
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
