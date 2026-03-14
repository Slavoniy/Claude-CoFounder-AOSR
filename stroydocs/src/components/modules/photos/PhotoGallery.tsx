'use client';

import { useState } from 'react';
import { Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { formatDate } from '@/utils/format';
import { usePhotos, type PhotoItem } from './usePhotos';

interface Props {
  entityType?: string;
  entityId?: string;
}

export function PhotoGallery({ entityType, entityId }: Props) {
  const { photos, isLoading, deletePhoto } = usePhotos(entityType, entityId);
  const [previewPhoto, setPreviewPhoto] = useState<PhotoItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-md" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">Нет фотографий</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group relative aspect-square rounded-md overflow-hidden border cursor-pointer hover:ring-2 hover:ring-primary"
            onClick={() => setPreviewPhoto(photo)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.downloadUrl}
              alt={photo.fileName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteId(photo.id);
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
              {photo.author.lastName} · {formatDate(photo.createdAt)}
            </div>
          </div>
        ))}
      </div>

      {/* Полноразмерный просмотр */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {previewPhoto && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70 text-white"
                onClick={() => setPreviewPhoto(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.downloadUrl}
                alt={previewPhoto.fileName}
                className="w-full max-h-[80vh] object-contain"
              />
              <div className="p-3 text-sm text-muted-foreground">
                {previewPhoto.author.lastName} {previewPhoto.author.firstName} ·{' '}
                {formatDate(previewPhoto.createdAt)}
                {previewPhoto.gpsLat && previewPhoto.gpsLng && (
                  <span className="ml-2">
                    GPS: {previewPhoto.gpsLat.toFixed(6)}, {previewPhoto.gpsLng.toFixed(6)}
                  </span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="Удалить фото?"
        description="Это действие нельзя отменить."
        onConfirm={() => {
          if (deleteId) {
            deletePhoto(deleteId);
            setDeleteId(null);
          }
        }}
      />
    </>
  );
}
