import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionOrThrow } from '@/lib/auth-utils';
import { updateProjectSchema } from '@/lib/validations/project';
import { successResponse, errorResponse } from '@/utils/api';

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getSessionOrThrow();

    const project = await db.project.findFirst({
      where: {
        id: params.projectId,
        organizationId: session.user.organizationId,
      },
      include: {
        _count: { select: { contracts: true } },
      },
    });

    if (!project) {
      return errorResponse('Проект не найден', 404);
    }

    return successResponse(project);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка получения проекта:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getSessionOrThrow();
    const body = await req.json();
    const parsed = updateProjectSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Ошибка валидации', 400, parsed.error.issues);
    }

    // Проверка что проект принадлежит организации
    const existing = await db.project.findFirst({
      where: { id: params.projectId, organizationId: session.user.organizationId },
    });
    if (!existing) {
      return errorResponse('Проект не найден', 404);
    }

    const project = await db.project.update({
      where: { id: params.projectId },
      data: parsed.data,
    });

    return successResponse(project);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка обновления проекта:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}
