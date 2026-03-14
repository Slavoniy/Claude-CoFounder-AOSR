'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/shared/DataTable';
import { useWorkItems } from './useWorkItems';

interface Props {
  contractId: string;
}

export function WorkItemsTable({ contractId }: Props) {
  const { workItems, columns, isLoading } = useWorkItems(contractId);

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <DataTable
      columns={columns}
      data={workItems}
      searchPlaceholder="Поиск по работам..."
      searchColumn="name"
    />
  );
}
