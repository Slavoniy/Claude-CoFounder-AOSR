'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { useToast } from '@/hooks/useToast';
import { MEASUREMENT_UNIT_LABELS } from '@/utils/constants';
import type { MeasurementUnit, MaterialDocumentType } from '@prisma/client';

interface MaterialDoc {
  id: string;
  type: MaterialDocumentType;
  fileName: string;
}

interface Material {
  id: string;
  name: string;
  supplier: string | null;
  invoiceNumber: string | null;
  invoiceDate: string | null;
  unit: MeasurementUnit;
  quantityReceived: number;
  quantityUsed: number;
  documents: MaterialDoc[];
  _count: { writeoffs: number };
}

export function useMaterials(contractId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: materials = [], isLoading } = useQuery<Material[]>({
    queryKey: ['materials', contractId],
    queryFn: async () => {
      const res = await fetch(`/api/contracts/${contractId}/materials`);
      const json = await res.json();
      return json.success ? json.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      supplier?: string;
      invoiceNumber?: string;
      invoiceDate?: string;
      unit: string;
      quantityReceived: number;
    }) => {
      const res = await fetch(`/api/contracts/${contractId}/materials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', contractId] });
      toast({ title: 'Материал добавлен' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const columns: ColumnDef<Material>[] = [
    {
      accessorKey: 'name',
      header: 'Наименование',
    },
    {
      accessorKey: 'supplier',
      header: 'Поставщик',
      cell: ({ row }) => row.original.supplier || '—',
    },
    {
      accessorKey: 'invoiceNumber',
      header: 'Накладная',
      cell: ({ row }) => row.original.invoiceNumber || '—',
    },
    {
      id: 'quantity',
      header: 'Получено',
      cell: ({ row }) => {
        const m = row.original;
        return `${m.quantityReceived} ${MEASUREMENT_UNIT_LABELS[m.unit]}`;
      },
    },
    {
      id: 'remaining',
      header: 'Остаток',
      cell: ({ row }) => {
        const m = row.original;
        const remaining = m.quantityReceived - m.quantityUsed;
        const isLow = remaining < m.quantityReceived * 0.1;
        return (
          <span className={isLow ? 'font-medium text-orange-600' : ''}>
            {remaining} {MEASUREMENT_UNIT_LABELS[m.unit]}
          </span>
        );
      },
    },
    {
      id: 'docs',
      header: 'Документы',
      cell: ({ row }) => {
        const count = row.original.documents.length;
        if (count === 0) {
          return <span className="text-sm text-orange-600">⚠ Нет сертификата</span>;
        }
        return <span className="text-sm text-green-600">{count} док.</span>;
      },
    },
  ];

  return { materials, columns, isLoading, createMutation };
}
