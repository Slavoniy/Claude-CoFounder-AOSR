import { z } from 'zod/v4';

export const writeoffItemSchema = z.object({
  materialId: z.string().min(1, 'Выберите материал'),
  quantity: z.number().positive('Количество должно быть больше 0'),
});

export const createWorkRecordSchema = z.object({
  workItemId: z.string().min(1, 'Выберите вид работ'),
  date: z.string().min(1, 'Выберите дату'),
  location: z.string().min(1, 'Введите место проведения работ'),
  description: z.string().min(2, 'Введите описание'),
  standard: z.string().optional(),
  writeoffs: z.array(writeoffItemSchema).optional(),
});

export const updateWorkRecordSchema = z.object({
  date: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
  standard: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']).optional(),
});

export type WriteoffItem = z.infer<typeof writeoffItemSchema>;
export type CreateWorkRecordInput = z.infer<typeof createWorkRecordSchema>;
export type UpdateWorkRecordInput = z.infer<typeof updateWorkRecordSchema>;
