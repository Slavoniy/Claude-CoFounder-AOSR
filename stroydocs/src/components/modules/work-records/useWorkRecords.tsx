'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { useToast } from '@/hooks/useToast';
import { WORK_RECORD_STATUS_LABELS, MEASUREMENT_UNIT_LABELS } from '@/utils/constants';
import { formatDate } from '@/utils/format';
import type { WorkRecordStatus, MeasurementUnit } from '@prisma/client';

interface WorkRecord {
  id: string;
  date: string;
  location: string;
  description: string | null;
  normative: string | null;
  status: WorkRecordStatus;
  workItem: {
    id: string;
    projectCipher: string;
    name: string;
    ksiNode: { code: string; name: string };
  };
  writeoffs: Array<{
    id: string;
    quantity: number;
    material: { id: string; name: string; unit: MeasurementUnit };
  }>;
}

export function useWorkRecords(contractId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: records = [], isLoading } = useQuery<WorkRecord[]>({
    queryKey: ['work-records', contractId],
    queryFn: async () => {
      const res = await fetch(`/api/contracts/${contractId}/work-records`);
      const json = await res.json();
      return json.success ? json.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      date: string;
      location: string;
      description?: string;
      normative?: string;
      workItemId: string;
      writeoffs?: Array<{ materialId: string; quantity: number }>;
    }) => {
      const res = await fetch(`/api/contracts/${contractId}/work-records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-records', contractId] });
      queryClient.invalidateQueries({ queryKey: ['materials', contractId] });
      toast({ title: 'Запись о работе создана' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const columns: ColumnDef<WorkRecord>[] = [
    {
      accessorKey: 'date',
      header: 'Дата',
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: 'workItem.projectCipher',
      header: 'Шифр',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.workItem.projectCipher}</span>
      ),
    },
    {
      accessorKey: 'workItem.name',
      header: 'Вид работ',
    },
    {
      accessorKey: 'location',
      header: 'Место',
    },
    {
      accessorKey: 'normative',
      header: 'Норматив',
      cell: ({ row }) => row.original.normative || '—',
    },
    {
      accessorKey: 'status',
      header: 'Статус',
      cell: ({ row }) => {
        const status = row.original.status;
        const colorMap: Record<WorkRecordStatus, string> = {
          DRAFT: 'bg-gray-100 text-gray-800',
          IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
          COMPLETED: 'bg-blue-100 text-blue-800',
          ACCEPTED: 'bg-green-100 text-green-800',
          REJECTED: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colorMap[status]}`}>
            {WORK_RECORD_STATUS_LABELS[status]}
          </span>
        );
      },
    },
    {
      id: 'writeoffs',
      header: 'Материалы',
      cell: ({ row }) => {
        const count = row.original.writeoffs.length;
        if (count === 0) return '—';
        return (
          <span className="text-sm">
            {row.original.writeoffs.map((w) => (
              `${w.material.name}: ${w.quantity} ${MEASUREMENT_UNIT_LABELS[w.material.unit]}`
            )).join(', ')}
          </span>
        );
      },
    },
  ];

  return { records, columns, isLoading, createMutation };
}
