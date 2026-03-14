'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X } from 'lucide-react';
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
import { createWorkRecordSchema, type CreateWorkRecordInput } from '@/lib/validations/work-record';
import type { MaterialWithMeta } from '@/components/modules/materials/useMaterials';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  contractId: string;
  workItems: { id: string; cipher: string; name: string }[];
  materials: MaterialWithMeta[];
}

export function CreateWorkRecordDialog({
  open, onOpenChange, projectId, contractId, workItems, materials,
}: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateWorkRecordInput>({
    resolver: zodResolver(createWorkRecordSchema),
    defaultValues: {
      workItemId: '', date: '', location: '', description: '',
      standard: '', writeoffs: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'writeoffs',
  });

  const mutation = useMutation({
    mutationFn: async (data: CreateWorkRecordInput) => {
      const res = await fetch(
        `/api/projects/${projectId}/contracts/${contractId}/work-records`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-records', contractId] });
      queryClient.invalidateQueries({ queryKey: ['materials', contractId] });
      toast({ title: 'Запись создана' });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка', description: error.message, variant: 'destructive' });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Новая запись о работе</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
          <div className="space-y-2">
            <Label>Вид работ</Label>
            <Select
              value={form.watch('workItemId')}
              onValueChange={(val) => form.setValue('workItemId', val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите вид работ" />
              </SelectTrigger>
              <SelectContent>
                {workItems.map((wi) => (
                  <SelectItem key={wi.id} value={wi.id}>
                    {wi.cipher} — {wi.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.workItemId && (
              <p className="text-xs text-destructive">{form.formState.errors.workItemId.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Дата выполнения</Label>
              <Input type="date" {...form.register('date')} />
            </div>
            <div className="space-y-2">
              <Label>Нормативный документ</Label>
              <Input placeholder="СП 70.13330.2012" {...form.register('standard')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Место проведения работ</Label>
            <Input placeholder="Блок А, оси 1-3, отм. -3.200" {...form.register('location')} />
          </div>
          <div className="space-y-2">
            <Label>Описание</Label>
            <Input
              placeholder="Бетонирование фундаментной плиты"
              {...form.register('description')}
            />
          </div>

          {/* Секция списания материалов */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Списание материалов</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => append({ materialId: '', quantity: 0 })}
              >
                <Plus className="h-4 w-4 mr-1" />
                Добавить
              </Button>
            </div>
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Select
                    value={form.watch(`writeoffs.${index}.materialId`)}
                    onValueChange={(val) => form.setValue(`writeoffs.${index}.materialId`, val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Материал" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.name} (ост: {m.remaining} {m.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Кол-во"
                  className="w-24"
                  {...form.register(`writeoffs.${index}.quantity`, { valueAsNumber: true })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => remove(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
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
