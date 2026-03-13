'use client';

import Link from 'next/link';
import { DataTable } from '@/components/shared/DataTable';
import { Skeleton } from '@/components/ui/skeleton';
import { useProjectsTable, type ProjectItem } from './useProjectsTable';
import { type ColumnDef } from '@tanstack/react-table';

export function ProjectsTable() {
  const { projects, columns: baseColumns, isLoading } = useProjectsTable();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  // Обернём первую колонку ссылкой
  const columns: ColumnDef<ProjectItem, unknown>[] = baseColumns.map((col, i) => {
    if (i === 0) {
      return {
        ...col,
        cell: ({ row }) => (
          <Link
            href={`/projects/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.name}
          </Link>
        ),
      };
    }
    return col;
  });

  return (
    <DataTable
      columns={columns}
      data={projects}
      searchColumn="name"
      searchPlaceholder="Поиск по названию..."
    />
  );
}
