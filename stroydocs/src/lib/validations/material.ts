import { z } from 'zod/v4';

export const createMaterialSchema = z.object({
  name: z.string().min(2, 'Введите наименование материала'),
  supplier: z.string().min(1, 'Введите поставщика'),
  invoiceNumber: z.string().min(1, 'Введите номер накладной'),
  invoiceDate: z.string().optional(),
  unit: z.string().min(1, 'Введите единицу измерения'),
  quantityReceived: z.number().positive('Количество должно быть больше 0'),
  workItemId: z.string().optional().nullable(),
});

export const updateMaterialSchema = createMaterialSchema.partial();

export const createMaterialDocumentSchema = z.object({
  type: z.enum(['PASSPORT', 'CERTIFICATE', 'PROTOCOL', 'OTHER']),
  name: z.string().min(1, 'Введите название документа'),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().positive(),
});

export type CreateMaterialInput = z.infer<typeof createMaterialSchema>;
export type UpdateMaterialInput = z.infer<typeof updateMaterialSchema>;
export type CreateMaterialDocumentInput = z.infer<typeof createMaterialDocumentSchema>;
