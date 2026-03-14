import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionOrThrow } from '@/lib/auth-utils';
import { successResponse, errorResponse } from '@/utils/api';

/** Получить дерево КСИ (корневые узлы или дочерние) */
export async function GET(req: NextRequest) {
  try {
    await getSessionOrThrow();

    const { searchParams } = new URL(req.url);
    const parentId = searchParams.get('parentId');
    const search = searchParams.get('search');

    // Поиск по коду или названию
    if (search) {
      const nodes = await db.ksiNode.findMany({
        where: {
          OR: [
            { code: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
          ],
        },
        include: { parent: { select: { code: true, name: true } } },
        take: 50,
        orderBy: { code: 'asc' },
      });
      return successResponse(nodes);
    }

    // Получить дочерние узлы или корневые
    const nodes = await db.ksiNode.findMany({
      where: { parentId: parentId || null },
      include: { _count: { select: { children: true } } },
      orderBy: { code: 'asc' },
    });

    return successResponse(nodes);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка получения КСИ:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}
