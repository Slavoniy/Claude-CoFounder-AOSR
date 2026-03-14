import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionOrThrow } from '@/lib/auth-utils';
import { createWorkRecordSchema } from '@/lib/validations/work-record';
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

    const workRecords = await db.workRecord.findMany({
      where: { contractId: params.contractId },
      include: {
        workItem: { select: { id: true, projectCipher: true, name: true } },

        _count: { select: { writeoffs: true } },
      },
      orderBy: { date: 'desc' },
    });

    return successResponse(workRecords);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка получения записей о работах:', error);
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
    const parsed = createWorkRecordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Ошибка валидации', 400, parsed.error.issues);
    }

    const { writeoffs = [], date, ...rest } = parsed.data;

    // Проверка остатков материалов перед списанием
    for (const wo of writeoffs) {
      const material = await db.material.findUnique({ where: { id: wo.materialId } });
      if (!material) {
        return errorResponse(`Материал не найден: ${wo.materialId}`, 400);
      }
      const remaining = material.quantityReceived - material.quantityUsed;
      if (wo.quantity > remaining) {
        return errorResponse(
          `Недостаточно материала "${material.name}": остаток ${remaining}, запрошено ${wo.quantity}`,
          400
        );
      }
    }

    // Транзакция: создание записи + списание материалов
    const workRecord = await db.$transaction(async (tx) => {
      const record = await tx.workRecord.create({
        data: {
          ...rest,
          date: new Date(date),
          contractId: params.contractId,
        },
        include: {
          workItem: { select: { id: true, projectCipher: true, name: true } },
  
        },
      });

      for (const wo of writeoffs) {
        await tx.materialWriteoff.create({
          data: {
            quantity: wo.quantity,
            workRecordId: record.id,
            materialId: wo.materialId,
          },
        });
        // Обновление использованного количества
        await tx.material.update({
          where: { id: wo.materialId },
          data: { quantityUsed: { increment: wo.quantity } },
        });
      }

      return record;
    });

    return successResponse(workRecord);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка создания записи о работе:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}
