'use client';

import { useSession } from 'next-auth/react';
import { Separator } from '@/components/ui/separator';
import { SidebarProfile } from './SidebarProfile';
import { SidebarNav } from './SidebarNav';
import { SidebarProjectsList } from './SidebarProjectsList';

export function Sidebar() {
  const { data: session } = useSession();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Логотип */}
      <div className="flex h-14 items-center px-4">
        <h1 className="text-lg font-bold text-primary">StroyDocs</h1>
      </div>

      <Separator />

      {/* Профиль */}
      {session?.user && (
        <>
          <div className="py-2">
            <SidebarProfile
              firstName={session.user.firstName}
              lastName={session.user.lastName}
              role={session.user.role}
            />
          </div>
          <Separator />
        </>
      )}

      {/* Навигация */}
      <div className="flex-1 overflow-y-auto py-3 space-y-4">
        <SidebarNav />
        <Separator />
        <SidebarProjectsList />
      </div>
    </aside>
  );
}
