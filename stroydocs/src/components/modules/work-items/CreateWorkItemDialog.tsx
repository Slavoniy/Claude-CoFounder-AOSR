'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { KsiTreeSelect } from '@/components/shared/KsiTreeSelect';
import { useToast } from '@/hooks/useToast';
import { createWorkItemSchema, type CreateWorkItemInput } from '@/lib/validations/work-item';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  contractId: string;
}

export function CreateWorkItemDialog({ open, onOpenChange, projectId, contractId }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateWorkItemInput>({
    resolver: zodResolver(createWorkItemSchema),
    defaultValues: { cipher: '', name: '', unit: '', quantity: 0, ksiNodeId: null },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateWorkItemInput) => {
      const res = await fetch(`/api/projects/${projectId}/contracts/${contractId}/work-items`, {
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
      toast({ title: 'Вид работ создан' });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новый вид работ</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Шифр проекта</Label>
              <Input placeholder="КЖ-01" {...form.register('cipher')} />
              {form.formState.errors.cipher && (
                <p className="text-xs text-destructive">{form.formState.errors.cipher.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Единица измерения</Label>
              <Input placeholder="м³" {...form.register('unit')} />
              {form.formState.errors.unit && (
                <p className="text-xs text-destructive">{form.formState.errors.unit.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Наименование работы</Label>
            <Input placeholder="Устройство монолитного фундамента" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Объём</Label>
            <Input
              type="number"
              step="0.01"
              {...form.register('quantity', { valueAsNumber: true })}
            />
            {form.formState.errors.quantity && (
              <p className="text-xs text-destructive">{form.formState.errors.quantity.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Раздел КСИ (необязательно)</Label>
            <KsiTreeSelect
              value={form.watch('ksiNodeId') ?? null}
              onChange={(id) => form.setValue('ksiNodeId', id)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Создание...' : 'Создать'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
