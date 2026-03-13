import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionOrThrow } from '@/lib/auth-utils';
import { createProjectSchema } from '@/lib/validations/project';
import { successResponse, errorResponse } from '@/utils/api';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where = {
      organizationId: session.user.organizationId,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { address: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(status && { status: status as 'ACTIVE' | 'COMPLETED' | 'ARCHIVED' }),
    };

    const projects = await db.project.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        _count: { select: { contracts: true } },
      },
    });

    return successResponse(projects);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка получения проектов:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();
    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Ошибка валидации', 400, parsed.error.issues);
    }

    const project = await db.project.create({
      data: {
        ...parsed.data,
        organizationId: session.user.organizationId,
      },
    });

    return successResponse(project);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка создания проекта:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}
