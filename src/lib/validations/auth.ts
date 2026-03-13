import { z } from 'zod/v4';

export const loginSchema = z.object({
  email: z.email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

export const registerSchema = z.object({
  // Данные организации
  organizationName: z.string().min(2, 'Введите название организации'),
  inn: z.string().min(10, 'ИНН должен содержать 10 или 12 цифр').max(12),
  // Данные пользователя
  email: z.email('Введите корректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
  firstName: z.string().min(1, 'Введите имя'),
  lastName: z.string().min(1, 'Введите фамилию'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
