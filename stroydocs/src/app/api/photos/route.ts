import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSessionOrThrow } from '@/lib/auth-utils';
import { generateUploadUrl, getDownloadUrl, buildS3Key } from '@/lib/s3-utils';
import { successResponse, errorResponse } from '@/utils/api';
import { z } from 'zod/v4';

const createPhotoSchema = z.object({
  entityType: z.enum(['WORK_RECORD', 'MATERIAL', 'REMARK', 'WORK_ITEM']),
  entityId: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().positive(),
  gpsLat: z.number().optional(),
  gpsLng: z.number().optional(),
  takenAt: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');

    const where: Record<string, unknown> = {
      author: { organizationId: session.user.organizationId },
    };
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    const photos = await db.photo.findMany({
      where,
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const result = await Promise.all(
      photos.map(async (p) => ({
        ...p,
        downloadUrl: await getDownloadUrl(p.s3Key),
      }))
    );

    return successResponse(result);
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка получения фото:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionOrThrow();

    const body = await req.json();
    const parsed = createPhotoSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse('Ошибка валидации', 400, parsed.error.issues);
    }

    const s3Key = buildS3Key(session.user.organizationId, 'photos', parsed.data.fileName);

    const photo = await db.photo.create({
      data: {
        s3Key,
        fileName: parsed.data.fileName,
        mimeType: parsed.data.mimeType,
        size: parsed.data.size,
        entityType: parsed.data.entityType,
        entityId: parsed.data.entityId,
        gpsLat: parsed.data.gpsLat,
        gpsLng: parsed.data.gpsLng,
        takenAt: parsed.data.takenAt ? new Date(parsed.data.takenAt) : null,
        authorId: session.user.id,
      },
    });

    const uploadUrl = await generateUploadUrl(s3Key, parsed.data.mimeType);

    return successResponse({ photo, uploadUrl });
  } catch (error) {
    if (error instanceof NextResponse) return error;
    console.error('Ошибка создания фото:', error);
    return errorResponse('Внутренняя ошибка сервера', 500);
  }
}
