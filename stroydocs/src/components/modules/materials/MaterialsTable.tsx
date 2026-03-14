'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/shared/DataTable';
import { useMaterials } from './useMaterials';

interface Props {
  contractId: string;
}

export function MaterialsTable({ contractId }: Props) {
  const { materials, columns, isLoading } = useMaterials(contractId);

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <DataTable
      columns={columns}
      data={materials}
      searchPlaceholder="Поиск по материалам..."
      searchColumn="name"
    />
  );
}
