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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/useToast';
import { createMaterialSchema, type CreateMaterialInput } from '@/lib/validations/material';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  contractId: string;
  workItems?: { id: string; cipher: string; name: string }[];
}

export function CreateMaterialDialog({ open, onOpenChange, projectId, contractId, workItems = [] }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateMaterialInput>({
    resolver: zodResolver(createMaterialSchema),
    defaultValues: {
      name: '', supplier: '', invoiceNumber: '', unit: '',
      quantityReceived: 0, workItemId: null,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateMaterialInput) => {
      const res = await fetch(`/api/projects/${projectId}/contracts/${contractId}/materials`, {
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
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Новый материал</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="space-y-2">
            <Label>Наименование материала</Label>
            <Input placeholder="Бетон В25 (М350)" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Поставщик</Label>
              <Input {...form.register('supplier')} />
              {form.formState.errors.supplier && (
                <p className="text-xs text-destructive">{form.formState.errors.supplier.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Единица измерения</Label>
              <Input placeholder="м³" {...form.register('unit')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Номер накладной</Label>
              <Input placeholder="ТН-2024-0156" {...form.register('invoiceNumber')} />
            </div>
            <div className="space-y-2">
              <Label>Дата накладной</Label>
              <Input type="date" {...form.register('invoiceDate')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Количество получено</Label>
            <Input
              type="number"
              step="0.01"
              {...form.register('quantityReceived', { valueAsNumber: true })}
            />
            {form.formState.errors.quantityReceived && (
              <p className="text-xs text-destructive">{form.formState.errors.quantityReceived.message}</p>
            )}
          </div>
          {workItems.length > 0 && (
            <div className="space-y-2">
              <Label>Привязка к виду работ (необязательно)</Label>
              <Select
                value={form.watch('workItemId') || ''}
                onValueChange={(val) => form.setValue('workItemId', val || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Без привязки" />
                </SelectTrigger>
                <SelectContent>
                  {workItems.map((wi) => (
                    <SelectItem key={wi.id} value={wi.id}>
                      {wi.cipher} — {wi.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Добавление...' : 'Добавить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
