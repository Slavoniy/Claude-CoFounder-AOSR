'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type ColumnDef } from '@tanstack/react-table';
import { useToast } from '@/hooks/useToast';

interface WorkItem {
  id: string;
  projectCipher: string;
  name: string;
  description: string | null;
  ksiNode: { code: string; name: string };
  _count: { workRecords: number };
  createdAt: string;
}

export function useWorkItems(contractId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: workItems = [], isLoading } = useQuery<WorkItem[]>({
    queryKey: ['work-items', contractId],
    queryFn: async () => {
      const res = await fetch(`/api/contracts/${contractId}/work-items`);
      const json = await res.json();
      return json.success ? json.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: {
      projectCipher: string;
      name: string;
      description?: string;
      ksiNodeId: string;
    }) => {
      const res = await fetch(`/api/contracts/${contractId}/work-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-items', contractId] });
      toast({ title: 'Вид работ добавлен' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const columns: ColumnDef<WorkItem>[] = [
    {
      accessorKey: 'projectCipher',
      header: 'Шифр',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.projectCipher}</span>
      ),
    },
    {
      accessorKey: 'name',
      header: 'Наименование работы',
    },
    {
      accessorKey: 'ksiNode',
      header: 'КСИ',
      cell: ({ row }) => (
        <span className="text-sm">
          <span className="font-mono text-muted-foreground">{row.original.ksiNode.code}</span>
          {' '}
          {row.original.ksiNode.name}
        </span>
      ),
    },
    {
      accessorKey: '_count.workRecords',
      header: 'Записи',
      cell: ({ row }) => row.original._count.workRecords,
    },
  ];

  return { workItems, columns, isLoading, createMutation };
}
