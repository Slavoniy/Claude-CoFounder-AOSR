'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectItem {
  id: string;
  name: string;
}

export function SidebarProjectsList() {
  const pathname = usePathname();

  const { data: projects } = useQuery<ProjectItem[]>({
    queryKey: ['sidebar-projects'],
    queryFn: async () => {
      const res = await fetch('/api/projects?limit=5');
      const json = await res.json();
      return json.success ? json.data : [];
    },
  });

  if (!projects?.length) return null;

  return (
    <div className="px-2">
      <p className="mb-1 px-3 text-xs font-medium text-muted-foreground uppercase">
        Проекты
      </p>
      <div className="space-y-0.5">
        {projects.map((project) => {
          const isActive = pathname === `/projects/${project.id}`;
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <FolderOpen className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{project.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
