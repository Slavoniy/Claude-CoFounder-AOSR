import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionOrThrow } from '@/lib/auth-utils';
import { createWorkItemSchema } from '@/lib/validations/work-item';
import { successResponse, errorResponse } from '@/utils/api';

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string; contractId: string } }
) {
  try {
    const session = await getSessionOrThrow();

    const project = await db.project.findFirst({
      where: { id: params.projectId, organizationId: session.user.organizationId },
    });
    if (!project) return errorResponse('Проект не найден', 404);

    const workItems = await db.workItem.findMany({
      where: { contractId: params.contractId },
      include: {
        ksiNode: { select: { id: true, code: true, name: true } },
        _count: { select: { workRecords: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(workItems);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка получения видов работ:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string; contractId: string } }
) {
  try {
    const session = await getSessionOrThrow();

    const project = await db.project.findFirst({
      where: { id: params.projectId, organizationId: session.user.organizationId },
    });
    if (!project) return errorResponse('Проект не найден', 404);

    const body = await req.json();
    const parsed = createWorkItemSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Ошибка валидации', 400, parsed.error.issues);
    }

    const workItem = await db.workItem.create({
      data: {
        ...parsed.data,
        contractId: params.contractId,
      },
      include: {
        ksiNode: { select: { id: true, code: true, name: true } },
      },
    });

    return successResponse(workItem);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка создания вида работ:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}
