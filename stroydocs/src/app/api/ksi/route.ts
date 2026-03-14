import { db } from '@/lib/db';
import { getSessionOrThrow } from '@/lib/auth-utils';
import { successResponse, errorResponse } from '@/utils/api';

export async function GET() {
  try {
    await getSessionOrThrow();

    // КСИ — глобальный справочник, фильтрация по организации не нужна
    const nodes = await db.ksiNode.findMany({
      orderBy: [{ level: 'asc' }, { code: 'asc' }],
    });

    return successResponse(nodes);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error('Ошибка получения КСИ:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}
