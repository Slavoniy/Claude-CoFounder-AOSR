import { NextRequest } from 'next/server';
import { hash } from 'bcryptjs';
import { db } from '@/lib/db';
import { registerSchema } from '@/lib/validations/auth';
import { successResponse, errorResponse } from '@/utils/api';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Ошибка валидации', 400, parsed.error.issues);
    }

    const { organizationName, inn, email, password, firstName, lastName } = parsed.data;

    // Проверка уникальности email
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return errorResponse('Пользователь с таким email уже существует', 409);
    }

    // Проверка уникальности ИНН
    const existingOrg = await db.organization.findUnique({ where: { inn } });
    if (existingOrg) {
      return errorResponse('Организация с таким ИНН уже зарегистрирована', 409);
    }

    const passwordHash = await hash(password, 12);

    // Создание организации и администратора в транзакции
    const result = await db.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: organizationName,
          inn,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          role: 'ADMIN',
          organizationId: organization.id,
        },
      });

      return { organization, user };
    });

    return successResponse({
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
      },
      organization: {
        id: result.organization.id,
        name: result.organization.name,
        inn: result.organization.inn,
      },
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}
