import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/use-role";
import { Button } from "@/components/ui/button";
import {
  Sparkles, LayoutDashboard, Shield, LogOut, Menu, X, Bell, Trophy,
  Building2, Flame, Users, Gift, Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const NAV: { to: string; label: string; icon: any }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/pg", label: "Browse", icon: Building2 },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/challenges", label: "Quests", icon: Zap },
  { to: "/teams", label: "Teams", icon: Users },
  { to: "/lucky-draw", label: "Lucky", icon: Gift },
  { to: "/streak", label: "Streak", icon: Flame },
];

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();
  const router = useRouter();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { count } = await supabase
        .from("notifications").select("id", { count: "exact", head: true })
        .eq("user_id", user.id).is("read_at", null);
      setUnread(count ?? 0);
    })();
  }, [user, path]);

  const item = (to: string, label: string, Icon: any) => (
    <Link
      to={to}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        path === to ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl shadow-sm" style={{ background: "var(--gradient-hero)", boxShadow: "var(--shadow-glow)" }}>
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold tracking-tight">Gharpayy</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-0.5 lg:flex">
          {user && NAV.map((n) => item(n.to, n.label, n.icon))}
        </nav>

        <div className="hidden items-center gap-1 lg:flex">
          {user && (
            <Link to="/notifications" className="relative rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="notifications">
              <Bell className="h-5 w-5" />
              {unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{unread}</span>}
            </Link>
          )}
          {user && isAdmin && item("/admin", "Admin", Shield)}
          {user ? (
            <Button size="sm" variant="outline" className="ml-1" onClick={async () => { await signOut(); router.navigate({ to: "/" }); }}>
              <LogOut className="mr-1 h-4 w-4" /> Sign out
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
              <Button asChild size="sm" className="shadow-md"><Link to="/auth">Get started</Link></Button>
            </>
          )}
        </div>

        <button className="lg:hidden" onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background lg:hidden">
          <div className="grid grid-cols-2 gap-1 p-3">
            {user && NAV.map((n) => item(n.to, n.label, n.icon))}
            {user && item("/notifications", `Notifications${unread ? ` (${unread})` : ""}`, Bell)}
            {user && item("/earnings", "Earnings", Trophy)}
            {user && isAdmin && item("/admin", "Admin", Shield)}
          </div>
          <div className="border-t border-border/60 p-3">
            {user ? (
              <Button size="sm" variant="outline" className="w-full" onClick={async () => { await signOut(); router.navigate({ to: "/" }); setOpen(false); }}>
                Sign out
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="ghost" size="sm" className="flex-1"><Link to="/auth">Sign in</Link></Button>
                <Button asChild size="sm" className="flex-1"><Link to="/auth">Get started</Link></Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
