'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Material } from '@prisma/client';
import { useToast } from '@/hooks/useToast';

export interface MaterialWithMeta extends Material {
  workItem: { id: string; cipher: string; name: string } | null;
  _count: { documents: number };
  remaining: number;
  hasCertificate: boolean;
}

export function useMaterials(projectId: string, contractId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: materials = [], isLoading } = useQuery<MaterialWithMeta[]>({
    queryKey: ['materials', contractId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/contracts/${contractId}/materials`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (materialId: string) => {
      const res = await fetch(
        `/api/projects/${projectId}/contracts/${contractId}/materials/${materialId}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials', contractId] });
      toast({ title: 'Материал удалён' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  return { materials, isLoading, deleteMaterial: deleteMutation.mutate };
}
