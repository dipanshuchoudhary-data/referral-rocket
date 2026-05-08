import { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";
import { MobileTabBar } from "@/components/mobile-tabbar";

export function AppShell({ children, max = "max-w-6xl" }: { children: ReactNode; max?: string }) {
  return (
    <div className="min-h-screen bg-muted/20 pb-20 lg:pb-0">
      <SiteHeader />
      <main className={`mx-auto ${max} px-4 py-6 md:py-8`}>{children}</main>
      <MobileTabBar />
    </div>
  );
}

export function PageHeader({ title, subtitle, icon: Icon, accent, action }: { title: string; subtitle?: string; icon?: any; accent?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {accent && <p className="text-xs font-semibold uppercase tracking-wider text-primary">{accent}</p>}
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold md:text-3xl">
          {Icon && <Icon className="h-7 w-7 text-primary" />} {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
