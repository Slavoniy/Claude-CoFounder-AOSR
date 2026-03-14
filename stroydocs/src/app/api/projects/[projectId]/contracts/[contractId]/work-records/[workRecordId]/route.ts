import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionOrThrow } from '@/lib/auth-utils';
import { updateWorkRecordSchema } from '@/lib/validations/work-record';
import { successResponse, errorResponse } from '@/utils/api';

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string; contractId: string; workRecordId: string } }
) {
  try {
    const session = await getSessionOrThrow();

    const project = await db.project.findFirst({
      where: { id: params.projectId, organizationId: session.user.organizationId },
    });
    if (!project) return errorResponse('Проект не найден', 404);

    const workRecord = await db.workRecord.findFirst({
      where: { id: params.workRecordId },
      include: {
        workItem: { select: { id: true, cipher: true, name: true } },
        author: { select: { id: true, firstName: true, lastName: true } },
        writeoffs: {
          include: {
            material: { select: { id: true, name: true, unit: true } },
          },
        },
      },
    });
    if (!workRecord) return errorResponse('Запись не найдена', 404);

    return successResponse(workRecord);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка получения записи о работе:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { projectId: string; contractId: string; workRecordId: string } }
) {
  try {
    const session = await getSessionOrThrow();

    const project = await db.project.findFirst({
      where: { id: params.projectId, organizationId: session.user.organizationId },
    });
    if (!project) return errorResponse('Проект не найден', 404);

    const body = await req.json();
    const parsed = updateWorkRecordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Ошибка валидации', 400, parsed.error.issues);
    }

    const { date, ...rest } = parsed.data;

    const workRecord = await db.workRecord.update({
      where: { id: params.workRecordId },
      data: {
        ...rest,
        ...(date && { date: new Date(date) }),
      },
      include: {
        workItem: { select: { id: true, cipher: true, name: true } },
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    return successResponse(workRecord);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка обновления записи о работе:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { projectId: string; contractId: string; workRecordId: string } }
) {
  try {
    const session = await getSessionOrThrow();

    const project = await db.project.findFirst({
      where: { id: params.projectId, organizationId: session.user.organizationId },
    });
    if (!project) return errorResponse('Проект не найден', 404);

    // Транзакция: реверсирование списаний + удаление записи
    await db.$transaction(async (tx) => {
      const writeoffs = await tx.materialWriteoff.findMany({
        where: { workRecordId: params.workRecordId },
      });

      // Реверсируем списание материалов
      for (const wo of writeoffs) {
        await tx.material.update({
          where: { id: wo.materialId },
          data: { quantityUsed: { decrement: wo.quantity } },
        });
      }

      await tx.workRecord.delete({ where: { id: params.workRecordId } });
    });

    return successResponse({ deleted: true });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка удаления записи о работе:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}
