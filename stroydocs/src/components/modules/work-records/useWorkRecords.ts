'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { WorkRecordStatus } from '@prisma/client';
import { useToast } from '@/hooks/useToast';

export interface WorkRecordItem {
  id: string;
  date: string;
  location: string;
  description: string;
  standard: string | null;
  status: WorkRecordStatus;
  workItem: { id: string; cipher: string; name: string };
  author: { id: string; firstName: string; lastName: string };
  _count: { writeoffs: number };
}

export function useWorkRecords(projectId: string, contractId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workRecords = [], isLoading } = useQuery<WorkRecordItem[]>({
    queryKey: ['work-records', contractId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/contracts/${contractId}/work-records`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (workRecordId: string) => {
      const res = await fetch(
        `/api/projects/${projectId}/contracts/${contractId}/work-records/${workRecordId}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-records', contractId] });
      queryClient.invalidateQueries({ queryKey: ['materials', contractId] });
      toast({ title: 'Запись удалена' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: WorkRecordStatus }) => {
      const res = await fetch(
        `/api/projects/${projectId}/contracts/${contractId}/work-records/${id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-records', contractId] });
      toast({ title: 'Статус обновлён' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  return {
    workRecords,
    isLoading,
    deleteWorkRecord: deleteMutation.mutate,
    updateStatus: updateStatusMutation.mutate,
  };
}
