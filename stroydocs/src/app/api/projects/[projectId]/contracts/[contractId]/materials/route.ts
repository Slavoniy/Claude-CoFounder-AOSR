import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionOrThrow } from '@/lib/auth-utils';
import { createMaterialSchema } from '@/lib/validations/material';
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

    const materials = await db.material.findMany({
      where: { contractId: params.contractId },
      include: {
        _count: { select: { documents: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Добавляем вычисляемые поля
    const result = materials.map((m) => ({
      ...m,
      remaining: m.quantityReceived - m.quantityUsed,
      hasCertificate: m._count.documents > 0,
    }));

    return successResponse(result);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка получения материалов:', error);
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
    const parsed = createMaterialSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Ошибка валидации', 400, parsed.error.issues);
    }

    const { invoiceDate, ...rest } = parsed.data;

    const material = await db.material.create({
      data: {
        ...rest,
        invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
        contractId: params.contractId,
      },
    });

    return successResponse(material);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка создания материала:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}
