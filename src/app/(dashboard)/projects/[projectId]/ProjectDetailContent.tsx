'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useProject } from '@/components/modules/projects/useProject';
import { PROJECT_STATUS_LABELS } from '@/utils/constants';
import { ProjectContractsTab } from './ProjectContractsTab';

interface Props {
  projectId: string;
}

export function ProjectDetailContent({ projectId }: Props) {
  const { project, isLoading } = useProject(projectId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!project) {
    return <p className="text-muted-foreground">Проект не найден</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <PageHeader title={project.name} />
          <StatusBadge
            status={project.status}
            label={PROJECT_STATUS_LABELS[project.status]}
          />
        </div>
        {project.address && (
          <p className="mt-1 text-sm text-muted-foreground">{project.address}</p>
        )}
        {project.description && (
          <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
        )}
        <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
          {project.generalContractor && (
            <span>Генподрядчик: <strong>{project.generalContractor}</strong></span>
          )}
          {project.customer && (
            <span>Заказчик: <strong>{project.customer}</strong></span>
          )}
        </div>
      </div>

      <Tabs defaultValue="contracts">
        <TabsList>
          <TabsTrigger value="contracts">
            Договоры
            <Badge variant="secondary" className="ml-2">{project._count.contracts}</Badge>
          </TabsTrigger>
          <TabsTrigger value="stats">Статистика</TabsTrigger>
          <TabsTrigger value="documents">Документы</TabsTrigger>
        </TabsList>
        <TabsContent value="contracts" className="mt-4">
          <ProjectContractsTab projectId={projectId} />
        </TabsContent>
        <TabsContent value="stats" className="mt-4">
          <p className="text-sm text-muted-foreground">
            Статистика проекта будет доступна позже.
          </p>
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <p className="text-sm text-muted-foreground">
            Документы будут доступны в Фазе 3.
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
