import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from './s3';

const BUCKET = process.env.S3_BUCKET!;

/** Загрузить файл в S3 и вернуть ключ */
export async function uploadFile(
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return key;
}

/** Получить pre-signed URL для скачивания (TTL: 1 час) */
export async function getDownloadUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  });
  return getSignedUrl(s3, command, { expiresIn: 3600 });
}

/** Удалить файл из S3 */
export async function deleteFile(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    })
  );
}

/** Получить pre-signed URL для загрузки файла в S3 (TTL: 15 мин) */
export async function generateUploadUrl(key: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(s3, command, { expiresIn: 900 });
}

/** Сформировать уникальный S3-ключ для произвольной сущности */
export function buildS3Key(orgId: string, entityType: string, fileName: string): string {
  const timestamp = Date.now();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `orgs/${orgId}/${entityType}/${timestamp}_${safeFileName}`;
}

/** Сформировать уникальный S3-ключ для документа материала */
export function buildMaterialDocKey(
  contractId: string,
  materialId: string,
  fileName: string
): string {
  const timestamp = Date.now();
  const safeFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `materials/${contractId}/${materialId}/${timestamp}_${safeFileName}`;
}
