import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/use-role";
import { Button } from "@/components/ui/button";
import { Sparkles, LayoutDashboard, Shield, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  const navItem = (to: string, label: string, Icon?: any) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        path === to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      {Icon && <Icon className="h-4 w-4" />} {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}>
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Gharpayy</span>
          <span className="ml-1 hidden rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary md:inline">Refer</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {user && navItem("/dashboard", "Dashboard", LayoutDashboard)}
          {user && isAdmin && navItem("/admin", "Admin", Shield)}
          {user ? (
            <Button size="sm" variant="outline" className="ml-2" onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}>
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
              <Button asChild size="sm" className="shadow-md"><Link to="/auth">Get started</Link></Button>
            </>
          )}
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="flex flex-col gap-1 p-3">
            {user && navItem("/dashboard", "Dashboard", LayoutDashboard)}
            {user && isAdmin && navItem("/admin", "Admin", Shield)}
            {user ? (
              <Button size="sm" variant="outline" onClick={async () => { await signOut(); router.navigate({ to: "/" }); setOpen(false); }}>
                Sign out
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
                <Button asChild size="sm"><Link to="/auth">Get started</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
