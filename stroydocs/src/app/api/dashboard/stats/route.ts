import { db } from '@/lib/db';
import { getSessionOrThrow } from '@/lib/auth-utils';
import { successResponse, errorResponse } from '@/utils/api';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getSessionOrThrow();
    const orgId = session.user.organizationId;

    const [
      projectsCount, contractsCount, employeesCount, pendingInvitations,
      workItemsCount, materialsCount, workRecordsCount, photosCount,
    ] = await Promise.all([
      db.project.count({ where: { organizationId: orgId } }),
      db.contract.count({ where: { project: { organizationId: orgId } } }),
      db.user.count({ where: { organizationId: orgId, isActive: true } }),
      db.invitation.count({ where: { organizationId: orgId, status: 'PENDING' } }),
      db.workItem.count({ where: { contract: { project: { organizationId: orgId } } } }),
      db.material.count({ where: { contract: { project: { organizationId: orgId } } } }),
      db.workRecord.count({ where: { author: { organizationId: orgId } } }),
      db.photo.count({ where: { author: { organizationId: orgId } } }),
    ]);

    return successResponse({
      projectsCount, contractsCount, employeesCount, pendingInvitations,
      workItemsCount, materialsCount, workRecordsCount, photosCount,
    });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка получения статистики:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}
