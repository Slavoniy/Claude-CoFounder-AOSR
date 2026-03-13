'use client';

import { useSession } from 'next-auth/react';
import { useQuery } from '@tanstack/react-query';
import { FolderOpen, FileText, Users, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/PageHeader';

interface DashboardStats {
  projectsCount: number;
  contractsCount: number;
  employeesCount: number;
  pendingInvitations: number;
}

export function DashboardContent() {
  const { data: session } = useSession();

  const { data: stats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      const json = await res.json();
      return json.success ? json.data : { projectsCount: 0, contractsCount: 0, employeesCount: 0, pendingInvitations: 0 };
    },
  });

  const cards = [
    { title: 'Проекты', value: stats?.projectsCount ?? 0, icon: FolderOpen },
    { title: 'Договоры', value: stats?.contractsCount ?? 0, icon: FileText },
    { title: 'Сотрудники', value: stats?.employeesCount ?? 0, icon: Users },
    { title: 'Приглашения', value: stats?.pendingInvitations ?? 0, icon: FileCheck },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Добро пожаловать${session?.user ? `, ${session.user.firstName}` : ''}`}
        description="Обзор вашей организации"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
