'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatRole } from '@/utils/format';
import type { UserRole } from '@prisma/client';

interface SidebarProfileProps {
  firstName: string;
  lastName: string;
  role: UserRole;
}

export function SidebarProfile({ firstName, lastName, role }: SidebarProfileProps) {
  const initials = `${lastName[0]}${firstName[0]}`.toUpperCase();

  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <p className="truncate text-sm font-medium">{lastName} {firstName}</p>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
          {formatRole(role)}
        </Badge>
      </div>
    </div>
  );
}
