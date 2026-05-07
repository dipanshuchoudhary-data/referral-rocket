import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/use-role";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Search, CheckCircle2, XCircle, Trophy, IndianRupee, Users, Clock,
  ShieldCheck, Wallet, Eye, MoreHorizontal, TrendingUp,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin")({ component: AdminPanel });

type AdminReferral = {
  id: string; referrer_id: string; referee_name: string; referee_phone: string; referee_email: string | null;
  property_type: string | null; area: string | null; notes: string | null;
  status: "pending" | "verified" | "booked" | "rejected";
  payout_status: string; reward_amount: number; admin_note: string | null;
  created_at: string; verified_at: string | null; booked_at: string | null; paid_at: string | null;
  profiles?: { full_name: string | null; email: string | null; phone: string | null; referral_code: string };
};

function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useRole();
  const nav = useNavigate();
  const [referrals, setReferrals] = useState<AdminReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"all" | "pending" | "verified" | "booked" | "rejected">("pending");
  const [selected, setSelected] = useState<AdminReferral | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (authLoading || roleLoading) return;
    if (!user) nav({ to: "/auth" });
    else if (!isAdmin) nav({ to: "/dashboard" });
  }, [user, isAdmin, authLoading, roleLoading, nav]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("referrals")
      .select("*, profiles:referrer_id(full_name, email, phone, referral_code)")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setReferrals((data as any) ?? []);
  };

  useEffect(() => { if (isAdmin) load(); }, [isAdmin]);

  const updateStatus = async (id: string, status: AdminReferral["status"]) => {
    const { error } = await supabase.from("referrals").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked as ${status}`);
    load();
  };

  const updatePayout = async (id: string, payout_status: string) => {
    const patch: any = { payout_status };
    if (payout_status === "paid") patch.paid_at = new Date().toISOString();
    const { error } = await supabase.from("referrals").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Payout ${payout_status}`);
    load();
  };

  const saveNote = async () => {
    if (!selected) return;
    const { error } = await supabase.from("referrals").update({ admin_note: note }).eq("id", selected.id);
    if (error) return toast.error(error.message);
    toast.success("Note saved");
    setSelected(null); setNote("");
    load();
  };

  const stats = useMemo(() => ({
    total: referrals.length,
    pending: referrals.filter(r => r.status === "pending").length,
    verified: referrals.filter(r => r.status === "verified").length,
    booked: referrals.filter(r => r.status === "booked").length,
    payable: referrals.filter(r => r.payout_status === "unpaid" && r.reward_amount > 0).reduce((s, r) => s + Number(r.reward_amount), 0),
    paid: referrals.filter(r => r.payout_status === "paid").reduce((s, r) => s + Number(r.reward_amount), 0),
  }), [referrals]);

  const filtered = useMemo(() => {
    let list = referrals;
    if (tab !== "all") list = list.filter(r => r.status === tab);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      list = list.filter(r =>
        r.referee_name.toLowerCase().includes(s) ||
        r.referee_phone.includes(s) ||
        (r.referee_email?.toLowerCase().includes(s)) ||
        (r.profiles?.full_name?.toLowerCase().includes(s)) ||
        (r.profiles?.referral_code?.toLowerCase().includes(s))
      );
    }
    return list;
  }, [referrals, q, tab]);

  if (authLoading || roleLoading || !isAdmin) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">Admin</p>
            </div>
            <h1 className="font-display text-3xl font-bold md:text-4xl">Operations panel</h1>
            <p className="text-sm text-muted-foreground">Verify, reject and pay out referrals.</p>
          </div>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search name, phone, code…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
        </div>

        {/* KPIs */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <KPI icon={Users} label="Total" value={stats.total} />
          <KPI icon={Clock} label="Pending" value={stats.pending} tone="warning" />
          <KPI icon={CheckCircle2} label="Verified" value={stats.verified} tone="success" />
          <KPI icon={Trophy} label="Booked" value={stats.booked} tone="primary" />
          <KPI icon={Wallet} label="Owed" value={`₹${stats.payable.toLocaleString("en-IN")}`} tone="warning" />
          <KPI icon={IndianRupee} label="Paid" value={`₹${stats.paid.toLocaleString("en-IN")}`} tone="success" />
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="mt-6">
          <TabsList>
            <TabsTrigger value="pending">Pending {stats.pending > 0 && <Badge variant="secondary" className="ml-2">{stats.pending}</Badge>}</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="booked">Booked</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-4">
            <Card className="overflow-hidden" style={{ boxShadow: "var(--shadow-soft)" }}>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referee</TableHead>
                      <TableHead>Referrer</TableHead>
                      <TableHead className="hidden md:table-cell">Property</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payout</TableHead>
                      <TableHead className="text-right">Reward</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">Loading…</TableCell></TableRow>
                    ) : filtered.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="py-12 text-center text-muted-foreground">No referrals</TableCell></TableRow>
                    ) : filtered.map(r => (
                      <TableRow key={r.id}>
                        <TableCell>
                          <div className="font-medium">{r.referee_name}</div>
                          <div className="text-xs text-muted-foreground">{r.referee_phone}</div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{r.profiles?.full_name || "—"}</div>
                          <div className="font-mono text-xs text-muted-foreground">{r.profiles?.referral_code}</div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div>{r.property_type}</div>
                          <div className="text-xs text-muted-foreground">{r.area}</div>
                        </TableCell>
                        <TableCell><StatusBadge status={r.status} /></TableCell>
                        <TableCell>
                          {r.reward_amount > 0 ? (
                            <Select value={r.payout_status} onValueChange={(v) => updatePayout(r.id, v)}>
                              <SelectTrigger className="h-8 w-[120px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                                <SelectItem value="processing">Processing</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : <span className="text-xs text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell className="text-right font-semibold">₹{Number(r.reward_amount).toLocaleString("en-IN")}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => { setSelected(r); setNote(r.admin_note || ""); }}>
                                <Eye className="mr-2 h-4 w-4" /> View details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {r.status !== "verified" && <DropdownMenuItem onClick={() => updateStatus(r.id, "verified")}><CheckCircle2 className="mr-2 h-4 w-4 text-success" /> Mark verified</DropdownMenuItem>}
                              {r.status !== "booked" && <DropdownMenuItem onClick={() => updateStatus(r.id, "booked")}><Trophy className="mr-2 h-4 w-4 text-primary" /> Mark booked</DropdownMenuItem>}
                              {r.status !== "rejected" && <DropdownMenuItem onClick={() => updateStatus(r.id, "rejected")} className="text-destructive"><XCircle className="mr-2 h-4 w-4" /> Reject</DropdownMenuItem>}
                              {r.status !== "pending" && <DropdownMenuItem onClick={() => updateStatus(r.id, "pending")}><Clock className="mr-2 h-4 w-4" /> Move to pending</DropdownMenuItem>}
                              {r.reward_amount > 0 && r.payout_status !== "paid" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => updatePayout(r.id, "paid")}>
                                    <IndianRupee className="mr-2 h-4 w-4" /> Mark paid
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail dialog */}
        <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
          <DialogContent className="max-w-lg">
            {selected && (
              <>
                <DialogHeader>
                  <DialogTitle>{selected.referee_name}</DialogTitle>
                  <DialogDescription>Referral details and admin notes</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <Row label="Phone" value={selected.referee_phone} />
                  <Row label="Email" value={selected.referee_email || "—"} />
                  <Row label="Looking for" value={`${selected.property_type || "—"}${selected.area ? ` • ${selected.area}` : ""}`} />
                  <Row label="Referrer" value={`${selected.profiles?.full_name || "—"} (${selected.profiles?.referral_code})`} />
                  <Row label="Referrer phone" value={selected.profiles?.phone || "—"} />
                  <Row label="Submitted" value={new Date(selected.created_at).toLocaleString("en-IN")} />
                  {selected.verified_at && <Row label="Verified" value={new Date(selected.verified_at).toLocaleString("en-IN")} />}
                  {selected.booked_at && <Row label="Booked" value={new Date(selected.booked_at).toLocaleString("en-IN")} />}
                  {selected.paid_at && <Row label="Paid" value={new Date(selected.paid_at).toLocaleString("en-IN")} />}
                  {selected.notes && (
                    <div>
                      <div className="text-xs text-muted-foreground">Referrer notes</div>
                      <div className="mt-1 rounded-md bg-muted p-3">{selected.notes}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-medium">Admin note</div>
                    <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal note…" className="mt-1" />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
                  <Button onClick={saveNote}>Save note</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function KPI({ icon: Icon, label, value, tone = "default" }: { icon: any; label: string; value: any; tone?: "default" | "success" | "warning" | "primary" }) {
  const colors = {
    default: "bg-muted text-muted-foreground",
    success: "bg-success/10 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    primary: "bg-primary/10 text-primary",
  } as const;
  return (
    <Card className="p-4" style={{ boxShadow: "var(--shadow-soft)" }}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors[tone]}`}><Icon className="h-4 w-4" /></div>
      </div>
      <p className="mt-1.5 font-display text-2xl font-bold">{value}</p>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: AdminReferral["status"] }) {
  const cfg = {
    pending: { label: "Pending", cls: "bg-muted text-muted-foreground border-border" },
    verified: { label: "Verified", cls: "bg-success/15 text-success border-success/30" },
    booked: { label: "Booked", cls: "bg-primary/15 text-primary border-primary/30" },
    rejected: { label: "Rejected", cls: "bg-destructive/15 text-destructive border-destructive/30" },
  }[status];
  return <Badge variant="outline" className={cfg.cls}>{cfg.label}</Badge>;
}
