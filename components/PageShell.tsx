import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function PageShell({ children, title, subtitle }: PageShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-lg text-white shadow-sm">
            ✓
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Booking Buddy</p>
            <p className="text-xs text-slate-500">Find a time that works</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-6">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
