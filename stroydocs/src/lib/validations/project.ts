import { z } from 'zod/v4';

export const createProjectSchema = z.object({
  name: z.string().min(2, 'Введите название проекта'),
  address: z.string().optional(),
  description: z.string().optional(),
  generalContractor: z.string().optional(),
  customer: z.string().optional(),
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
