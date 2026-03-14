import { z } from 'zod/v4';

export const createWorkItemSchema = z.object({
  cipher: z.string().min(1, 'Введите шифр проекта'),
  name: z.string().min(2, 'Введите наименование работы'),
  unit: z.string().min(1, 'Введите единицу измерения'),
  quantity: z.number().positive('Объём должен быть больше 0'),
  ksiNodeId: z.string().optional().nullable(),
});

export const updateWorkItemSchema = createWorkItemSchema.partial();

export type CreateWorkItemInput = z.infer<typeof createWorkItemSchema>;
export type UpdateWorkItemInput = z.infer<typeof updateWorkItemSchema>;
