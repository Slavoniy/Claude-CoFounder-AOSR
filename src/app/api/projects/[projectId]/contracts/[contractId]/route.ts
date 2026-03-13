import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionOrThrow } from '@/lib/auth-utils';
import { updateContractSchema } from '@/lib/validations/contract';
import { successResponse, errorResponse } from '@/utils/api';

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string; contractId: string } }
) {
  try {
    const session = await getSessionOrThrow();

    // Проверка через проект
    const project = await db.project.findFirst({
      where: { id: params.projectId, organizationId: session.user.organizationId },
    });
    if (!project) return errorResponse('Проект не найден', 404);

    const contract = await db.contract.findFirst({
      where: { id: params.contractId, projectId: params.projectId },
      include: {
        participants: {
          include: { organization: { select: { id: true, name: true, inn: true } } },
        },
        subContracts: {
          include: { _count: { select: { subContracts: true } } },
        },
        parent: { select: { id: true, number: true, name: true } },
      },
    });

    if (!contract) return errorResponse('Договор не найден', 404);

    return successResponse(contract);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка получения договора:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}

export async function PUT(
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
    const parsed = updateContractSchema.safeParse(body);
    if (!parsed.success) return errorResponse('Ошибка валидации', 400, parsed.error.issues);

    const { startDate, endDate, ...rest } = parsed.data;

    const contract = await db.contract.update({
      where: { id: params.contractId },
      data: {
        ...rest,
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    return successResponse(contract);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка обновления договора:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}
