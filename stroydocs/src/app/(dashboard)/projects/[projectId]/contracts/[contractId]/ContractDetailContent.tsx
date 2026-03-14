'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserPlus, ArrowLeft, Plus, Hammer, Package, ClipboardList, Camera } from 'lucide-react';
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
import { useWorkItems } from '@/components/modules/work-items/useWorkItems';
import { MaterialsTable } from '@/components/modules/materials/MaterialsTable';
import { CreateMaterialDialog } from '@/components/modules/materials/CreateMaterialDialog';
import { useMaterials } from '@/components/modules/materials/useMaterials';
import { WorkRecordsTable } from '@/components/modules/work-records/WorkRecordsTable';
import { CreateWorkRecordDialog } from '@/components/modules/work-records/CreateWorkRecordDialog';
import { useWorkRecords } from '@/components/modules/work-records/useWorkRecords';
import { PhotoGallery } from '@/components/modules/photos/PhotoGallery';
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

  const { workItems, deleteWorkItem } = useWorkItems(projectId, contractId);
  const { materials, deleteMaterial } = useMaterials(projectId, contractId);
  const { workRecords, deleteWorkRecord } = useWorkRecords(projectId, contractId);

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

  // Список видов работ для селекторов в формах
  const workItemOptions = workItems.map((wi) => ({ id: wi.id, cipher: wi.cipher, name: wi.name }));

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
        <TabsList className="flex-wrap">
          <TabsTrigger value="participants">
            Участники
            <Badge variant="secondary" className="ml-2">{contract.participants.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="subcontracts">
            Субдоговоры
            <Badge variant="secondary" className="ml-2">{contract.subContracts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="work-items">
            <Hammer className="h-3.5 w-3.5 mr-1" />
            Работы
            <Badge variant="secondary" className="ml-2">{workItems.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="materials">
            <Package className="h-3.5 w-3.5 mr-1" />
            Материалы
            <Badge variant="secondary" className="ml-2">{materials.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="work-records">
            <ClipboardList className="h-3.5 w-3.5 mr-1" />
            Записи работ
            <Badge variant="secondary" className="ml-2">{workRecords.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="photos">
            <Camera className="h-3.5 w-3.5 mr-1" />
            Фото
          </TabsTrigger>
        </TabsList>

        {/* Участники */}
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

        {/* Субдоговоры */}
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

        {/* Виды работ */}
        <TabsContent value="work-items" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreateWorkItemOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить вид работ
            </Button>
          </div>
          {workItems.length === 0 ? (
            <EmptyState title="Нет видов работ" description="Добавьте виды работ по договору" />
          ) : (
            <WorkItemsTable workItems={workItems} onDelete={deleteWorkItem} />
          )}
          <CreateWorkItemDialog
            open={createWorkItemOpen}
            onOpenChange={setCreateWorkItemOpen}
            projectId={projectId}
            contractId={contractId}
          />
        </TabsContent>

        {/* Материалы */}
        <TabsContent value="materials" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreateMaterialOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить материал
            </Button>
          </div>
          {materials.length === 0 ? (
            <EmptyState title="Нет материалов" description="Добавьте материалы по договору" />
          ) : (
            <MaterialsTable materials={materials} onDelete={deleteMaterial} />
          )}
          <CreateMaterialDialog
            open={createMaterialOpen}
            onOpenChange={setCreateMaterialOpen}
            projectId={projectId}
            contractId={contractId}
            workItems={workItemOptions}
          />
        </TabsContent>

        {/* Записи о работах */}
        <TabsContent value="work-records" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setCreateWorkRecordOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Новая запись
            </Button>
          </div>
          {workRecords.length === 0 ? (
            <EmptyState title="Нет записей" description="Создайте запись о выполненных работах" />
          ) : (
            <WorkRecordsTable workRecords={workRecords} onDelete={deleteWorkRecord} />
          )}
          <CreateWorkRecordDialog
            open={createWorkRecordOpen}
            onOpenChange={setCreateWorkRecordOpen}
            projectId={projectId}
            contractId={contractId}
            workItems={workItemOptions}
            materials={materials}
          />
        </TabsContent>

        {/* Фото-отчёты */}
        <TabsContent value="photos" className="mt-4">
          <PhotoGallery />
        </TabsContent>
      </Tabs>
    </div>
  );
}
