'use client';

import { useRef } from 'react';
import { Camera } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import type { PhotoEntityType } from '@prisma/client';

interface Props {
  entityType: PhotoEntityType;
  entityId: string;
  className?: string;
}

/** Кнопка для прикрепления фото к сущности (PWA камера + сжатие) */
export function PhotoAttachButton({ entityType, entityId, className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Сжатие на клиенте
      let compressedFile = file;
      try {
        const imageCompression = (await import('browser-image-compression')).default;
        compressedFile = await imageCompression(file, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
      } catch {
        // Если сжатие не удалось, загружаем оригинал
      }

      // Получаем GPS из EXIF (если доступно через geolocation API)
      let gpsLat: number | undefined;
      let gpsLng: number | undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        gpsLat = pos.coords.latitude;
        gpsLng = pos.coords.longitude;
      } catch {
        // GPS недоступен — пропускаем
      }

      // Шаг 1: создаём запись и получаем upload URL
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          entityId,
          fileName: compressedFile.name,
          mimeType: compressedFile.type,
          size: compressedFile.size,
          gpsLat,
          gpsLng,
          takenAt: new Date().toISOString(),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      // Шаг 2: загружаем файл напрямую в S3
      await fetch(json.data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': compressedFile.type },
        body: compressedFile,
      });

      return json.data.photo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
      toast({ title: 'Фото загружено' });
    },
    onError: (error: Error) => {
      toast({ title: 'Ошибка загрузки', description: error.message, variant: 'destructive' });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
      e.target.value = ''; // Сброс для повторного выбора того же файла
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className}
        disabled={uploadMutation.isPending}
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="h-4 w-4 mr-1" />
        {uploadMutation.isPending ? 'Загрузка...' : 'Фото'}
      </Button>
    </>
  );
}
