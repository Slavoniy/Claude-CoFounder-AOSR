import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionOrThrow } from '@/lib/auth-utils';
import { createContractSchema } from '@/lib/validations/contract';
import { successResponse, errorResponse } from '@/utils/api';

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getSessionOrThrow();

    // Проверка что проект принадлежит организации
    const project = await db.project.findFirst({
      where: { id: params.projectId, organizationId: session.user.organizationId },
    });
    if (!project) {
      return errorResponse('Проект не найден', 404);
    }

    const contracts = await db.contract.findMany({
      where: { projectId: params.projectId },
      include: {
        participants: {
          include: { organization: { select: { name: true } } },
        },
        _count: { select: { subContracts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(contracts);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка получения договоров:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const session = await getSessionOrThrow();

    // Проверка что проект принадлежит организации
    const project = await db.project.findFirst({
      where: { id: params.projectId, organizationId: session.user.organizationId },
    });
    if (!project) {
      return errorResponse('Проект не найден', 404);
    }

    const body = await req.json();
    const parsed = createContractSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse('Ошибка валидации', 400, parsed.error.issues);
    }

    const { startDate, endDate, ...rest } = parsed.data;

    const contract = await db.contract.create({
      data: {
        ...rest,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        projectId: params.projectId,
      },
    });

    return successResponse(contract);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка создания договора:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}
