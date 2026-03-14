'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserPlus, ArrowLeft, Hammer, Package, ClipboardList, Camera } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useContract } from '@/components/modules/contracts/useContract';
import { ContractParticipants } from '@/components/modules/contracts/ContractParticipants';
import { AddParticipantDialog } from '@/components/modules/contracts/AddParticipantDialog';
import { WorkItemsTable } from '@/components/modules/work-items/WorkItemsTable';
import { CreateWorkItemDialog } from '@/components/modules/work-items/CreateWorkItemDialog';
import { MaterialsTable } from '@/components/modules/materials/MaterialsTable';
import { CreateMaterialDialog } from '@/components/modules/materials/CreateMaterialDialog';
import { WorkRecordsTable } from '@/components/modules/work-records/WorkRecordsTable';
import { CreateWorkRecordDialog } from '@/components/modules/work-records/CreateWorkRecordDialog';
import { PhotoGallery } from '@/components/modules/photos/PhotoGallery';
import { PhotoAttachButton } from '@/components/modules/photos/PhotoAttachButton';
import { CONTRACT_STATUS_LABELS } from '@/utils/constants';
import { formatDate } from '@/utils/format';

interface Props {
  projectId: string;
  contractId: string;
}

export function ContractDetailContent({ projectId, contractId }: Props) {
  const { contract, isLoading } = useContract(projectId, contractId);
  const [addParticipantOpen, setAddParticipantOpen] = useState(false);
  const [createWorkItemOpen, setCreateWorkItemOpen] = useState(false);
  const [createMaterialOpen, setCreateMaterialOpen] = useState(false);
  const [createWorkRecordOpen, setCreateWorkRecordOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!contract) {
    return <p className="text-muted-foreground">Договор не найден</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="mb-2 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Назад к проекту
        </Link>
        <div className="flex items-center gap-3">
          <PageHeader title={`${contract.number} — ${contract.name}`} />
          <StatusBadge
            status={contract.status}
            label={CONTRACT_STATUS_LABELS[contract.status]}
          />
          <Badge variant="outline">
            {contract.type === 'MAIN' ? 'Основной' : 'Субдоговор'}
          </Badge>
        </div>
        <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
          {contract.startDate && <span>Начало: {formatDate(contract.startDate)}</span>}
          {contract.endDate && <span>Окончание: {formatDate(contract.endDate)}</span>}
          {contract.parent && (
            <span>
              Родительский договор:{' '}
              <Link
                href={`/projects/${projectId}/contracts/${contract.parent.id}`}
                className="text-primary hover:underline"
              >
                {contract.parent.number}
              </Link>
            </span>
          )}
        </div>
      </div>

      <Tabs defaultValue="participants">
        <TabsList>
          <TabsTrigger value="participants">
            Участники
            <Badge variant="secondary" className="ml-2">{contract.participants.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="subcontracts">
            Субдоговоры
            <Badge variant="secondary" className="ml-2">{contract.subContracts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="work-items">
            <Hammer className="mr-1 h-3.5 w-3.5" />
            Виды работ
          </TabsTrigger>
          <TabsTrigger value="materials">
            <Package className="mr-1 h-3.5 w-3.5" />
            Материалы
          </TabsTrigger>
          <TabsTrigger value="work-records">
            <ClipboardList className="mr-1 h-3.5 w-3.5" />
            Записи о работах
          </TabsTrigger>
          <TabsTrigger value="photos">
            <Camera className="mr-1 h-3.5 w-3.5" />
            Фото
          </TabsTrigger>
        </TabsList>
        <TabsContent value="participants" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setAddParticipantOpen(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              Добавить участника
            </Button>
          </div>
          {contract.participants.length === 0 ? (
            <EmptyState title="Нет участников" description="Добавьте участников договора" />
          ) : (
            <ContractParticipants participants={contract.participants} />
          )}
          <AddParticipantDialog
            open={addParticipantOpen}
            onOpenChange={setAddParticipantOpen}
            projectId={projectId}
            contractId={contractId}
          />
        </TabsContent>
        <TabsContent value="subcontracts" className="mt-4">
          {contract.subContracts.length === 0 ? (
            <EmptyState title="Нет субдоговоров" />
          ) : (
            <div className="space-y-2">
              {contract.subContracts.map((sub) => (
                <Link
                  key={sub.id}
                  href={`/projects/${projectId}/contracts/${sub.id}`}
                  className="block rounded-md border p-3 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{sub.number}</p>
                      <p className="text-sm text-muted-foreground">{sub.name}</p>
                    </div>
                    <StatusBadge
                      status={sub.status}
                      label={CONTRACT_STATUS_LABELS[sub.status]}
                    />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Фаза 2 — Виды работ */}
        <TabsContent value="work-items" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreateWorkItemOpen(true)}>
              <Hammer className="mr-2 h-4 w-4" />
              Добавить вид работ
            </Button>
          </div>
          <WorkItemsTable contractId={contractId} />
          <CreateWorkItemDialog
            open={createWorkItemOpen}
            onOpenChange={setCreateWorkItemOpen}
            contractId={contractId}
          />
        </TabsContent>

        {/* Фаза 2 — Материалы */}
        <TabsContent value="materials" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreateMaterialOpen(true)}>
              <Package className="mr-2 h-4 w-4" />
              Добавить материал
            </Button>
          </div>
          <MaterialsTable contractId={contractId} />
          <CreateMaterialDialog
            open={createMaterialOpen}
            onOpenChange={setCreateMaterialOpen}
            contractId={contractId}
          />
        </TabsContent>

        {/* Фаза 2 — Записи о работах */}
        <TabsContent value="work-records" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreateWorkRecordOpen(true)}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Создать запись
            </Button>
          </div>
          <WorkRecordsTable contractId={contractId} />
          <CreateWorkRecordDialog
            open={createWorkRecordOpen}
            onOpenChange={setCreateWorkRecordOpen}
            contractId={contractId}
          />
        </TabsContent>

        {/* Фаза 2 — Фото-отчёты */}
        <TabsContent value="photos" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <PhotoAttachButton entityType="WORK_ITEM" entityId={contractId} />
          </div>
          <PhotoGallery />
        </TabsContent>
      </Tabs>
    </div>
  );
}
