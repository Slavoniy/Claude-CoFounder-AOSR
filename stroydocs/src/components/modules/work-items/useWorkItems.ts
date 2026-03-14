'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { WorkItem } from '@prisma/client';
import { useToast } from '@/hooks/useToast';

export interface WorkItemWithKsi extends WorkItem {
  ksiNode: { id: string; code: string; name: string } | null;
  _count: { materials: number; workRecords: number };
}

export function useWorkItems(projectId: string, contractId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: workItems = [], isLoading } = useQuery<WorkItemWithKsi[]>({
    queryKey: ['work-items', contractId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/contracts/${contractId}/work-items`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (workItemId: string) => {
      const res = await fetch(
        `/api/projects/${projectId}/contracts/${contractId}/work-items/${workItemId}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-items', contractId] });
      toast({ title: 'Вид работ удалён' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  return { workItems, isLoading, deleteWorkItem: deleteMutation.mutate };
}
