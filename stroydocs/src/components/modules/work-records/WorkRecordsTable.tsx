'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/shared/DataTable';
import { useWorkRecords } from './useWorkRecords';

interface Props {
  contractId: string;
}

export function WorkRecordsTable({ contractId }: Props) {
  const { records, columns, isLoading } = useWorkRecords(contractId);

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <DataTable
      columns={columns}
      data={records}
      searchPlaceholder="Поиск по записям..."
      searchColumn="location"
    />
  );
}
