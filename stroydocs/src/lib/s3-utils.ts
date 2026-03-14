import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '@/lib/s3';
import { randomUUID } from 'crypto';

const BUCKET = process.env.S3_BUCKET || 'stroydocs-files';

/** Генерация pre-signed URL для загрузки файла в S3 */
export async function generateUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 час
}

/** Генерация pre-signed URL для скачивания файла из S3 */
export async function generateDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 час
}

/** Построение S3-ключа: orgs/{orgId}/{entityType}/{uuid}-{fileName} */
export function buildS3Key(orgId: string, entityType: string, fileName: string): string {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `orgs/${orgId}/${entityType}/${randomUUID()}-${safeFileName}`;
}
