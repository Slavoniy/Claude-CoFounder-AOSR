'use client';

import { useState } from 'react';
import { Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { cn } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';
import type { MaterialWithMeta } from './useMaterials';
import { formatDate } from '@/utils/format';

interface Props {
  materials: MaterialWithMeta[];
  onDelete: (id: string) => void;
}

const columns: ColumnDef<MaterialWithMeta>[] = [
  {
    accessorKey: 'name',
    header: 'Наименование',
  },
  {
    accessorKey: 'supplier',
    header: 'Поставщик',
    cell: ({ row }) => <span className="text-sm">{row.original.supplier}</span>,
  },
  {
    accessorKey: 'invoiceNumber',
    header: 'Накладная',
    cell: ({ row }) => (
      <div className="text-sm">
        <span className="font-mono">{row.original.invoiceNumber}</span>
        {row.original.invoiceDate && (
          <span className="text-muted-foreground ml-1">
            от {formatDate(row.original.invoiceDate)}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'unit',
    header: 'Ед.',
    cell: ({ row }) => <span className="text-sm">{row.original.unit}</span>,
  },
  {
    accessorKey: 'quantityReceived',
    header: 'Получено',
    cell: ({ row }) => <span className="font-medium">{row.original.quantityReceived}</span>,
  },
  {
    accessorKey: 'quantityUsed',
    header: 'Использовано',
    cell: ({ row }) => <span>{row.original.quantityUsed}</span>,
  },
  {
    id: 'remaining',
    header: 'Остаток',
    cell: ({ row }) => (
      <span
        className={cn(
          'font-medium',
          row.original.remaining <= 0 && 'text-destructive',
          row.original.remaining > 0 && row.original.remaining < row.original.quantityReceived * 0.1 && 'text-yellow-600'
        )}
      >
        {row.original.remaining}
      </span>
    ),
  },
  {
    id: 'certificate',
    header: 'Сертификат',
    cell: ({ row }) =>
      row.original.hasCertificate ? (
        <ShieldCheck className="h-4 w-4 text-green-600" />
      ) : (
        <ShieldAlert className="h-4 w-4 text-destructive" />
      ),
  },
];

export function MaterialsTable({ materials, onDelete }: Props) {
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columnsWithActions: ColumnDef<MaterialWithMeta>[] = [
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
      <DataTable columns={columnsWithActions} data={materials} />
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Удалить материал?"
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
