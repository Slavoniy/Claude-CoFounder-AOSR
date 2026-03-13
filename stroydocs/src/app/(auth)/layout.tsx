import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">StroyDocs</h1>
          <p className="text-sm text-muted-foreground">
            Платформа исполнительной документации
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
