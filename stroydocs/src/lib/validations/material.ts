import { z } from 'zod/v4';

export const createMaterialSchema = z.object({
  name: z.string().min(2, 'Введите наименование материала'),
  supplier: z.string().optional(),
  invoiceNumber: z.string().optional(),
  invoiceDate: z.string().optional(),
  unit: z.enum(['PIECE', 'KG', 'TON', 'M', 'M2', 'M3', 'L', 'SET']),
  quantityReceived: z.number().positive('Количество должно быть больше 0'),
});

export const updateMaterialSchema = createMaterialSchema.partial();

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
