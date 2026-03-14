import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionOrThrow } from '@/lib/auth-utils';
import { createWorkRecordSchema } from '@/lib/validations/work-record';
import { successResponse, errorResponse } from '@/utils/api';

/** Проверка доступа к договору */
async function verifyContractAccess(contractId: string, organizationId: string) {
  return db.contract.findFirst({
    where: { id: contractId, project: { organizationId } },
  });
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { contractId: string } }
) {
  try {
    const session = await getSessionOrThrow();
    const contract = await verifyContractAccess(params.contractId, session.user.organizationId);
    if (!contract) return errorResponse('Договор не найден', 404);

    const records = await db.workRecord.findMany({
      where: { contractId: params.contractId },
      include: {
        workItem: {
          select: {
            id: true,
            projectCipher: true,
            name: true,
            ksiNode: { select: { code: true, name: true } },
          },
        },
        writeoffs: {
          include: {
            material: { select: { id: true, name: true, unit: true } },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return successResponse(records);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка получения записей о работах:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { contractId: string } }
) {
  try {
    const session = await getSessionOrThrow();
    const contract = await verifyContractAccess(params.contractId, session.user.organizationId);
    if (!contract) return errorResponse('Договор не найден', 404);

    const body = await req.json();
    const parsed = createWorkRecordSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Ошибка валидации', 400, parsed.error.issues);
    }

    const { writeoffs, ...recordData } = parsed.data;

    // Проверка что вид работ принадлежит договору
    const workItem = await db.workItem.findFirst({
      where: { id: recordData.workItemId, contractId: params.contractId },
    });
    if (!workItem) return errorResponse('Вид работ не найден в данном договоре', 404);

    // Проверяем остатки материалов перед списанием
    if (writeoffs?.length) {
      for (const wo of writeoffs) {
        const material = await db.material.findFirst({
          where: { id: wo.materialId, contractId: params.contractId },
        });
        if (!material) {
          return errorResponse(`Материал ${wo.materialId} не найден`, 404);
        }
        const remaining = material.quantityReceived - material.quantityUsed;
        if (wo.quantity > remaining) {
          return errorResponse(
            `Недостаточно материала "${material.name}": остаток ${remaining}, запрошено ${wo.quantity}`,
            400
          );
        }
      }
    }

    // Создаём запись и списания в одной транзакции
    const record = await db.$transaction(async (tx) => {
      const created = await tx.workRecord.create({
        data: {
          date: new Date(recordData.date),
          location: recordData.location,
          description: recordData.description,
          normative: recordData.normative,
          workItemId: recordData.workItemId,
          contractId: params.contractId,
        },
      });

      // Создаём списания и обновляем остатки
      if (writeoffs?.length) {
        for (const wo of writeoffs) {
          await tx.materialWriteoff.create({
            data: {
              quantity: wo.quantity,
              workRecordId: created.id,
              materialId: wo.materialId,
            },
          });
          await tx.material.update({
            where: { id: wo.materialId },
            data: { quantityUsed: { increment: wo.quantity } },
          });
        }
      }

      // Возвращаем с включениями
      return tx.workRecord.findUnique({
        where: { id: created.id },
        include: {
          workItem: {
            select: {
              projectCipher: true,
              name: true,
              ksiNode: { select: { code: true, name: true } },
            },
          },
          writeoffs: {
            include: { material: { select: { name: true, unit: true } } },
          },
        },
      });
    });

    return successResponse(record);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка создания записи о работе:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}
