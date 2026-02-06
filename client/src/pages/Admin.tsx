import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import {
  ArrowLeft,
  Download,
  FileText,
  MessageSquare,
  DollarSign,
  Users,
  CreditCard,
  AlertCircle,
  Shield,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const API = {
  me: "/api/admin/me",
  config: "/api/admin/config",
  metrics: "/api/admin/metrics",
  announcements: "/api/admin/announcements",
  withdrawals: "/api/admin/withdrawals",
  logs: "/api/admin/logs",
  tax: "/api/admin/tax",
  reportsCsv: "/api/admin/reports/csv",
  reportsPdf: "/api/admin/reports/pdf",
};

function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  return fetch(url, { credentials: "include", ...options }).then((r) => {
    if (r.status === 401) throw new Error("Unauthorized");
    if (r.status === 403) throw new Error("Forbidden");
    if (!r.ok) throw new Error(r.statusText);
    return r.headers.get("content-type")?.includes("json") ? r.json() : r.text();
  });
}

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementBody, setAnnouncementBody] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawReason, setWithdrawReason] = useState("");
  const [taxFullName, setTaxFullName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [taxAddress, setTaxAddress] = useState("");
  const [taxCountry, setTaxCountry] = useState("");

  const me = useQuery({
    queryKey: [API.me],
    queryFn: () => fetchApi<{ email: string; role: string; canEditConfig: boolean }>(API.me),
    retry: false,
    enabled: !!user,
  });

  const config = useQuery({
    queryKey: [API.config],
    queryFn: () => fetchApi<any>(API.config),
    enabled: !!user && !me.isError,
  });

  const metrics = useQuery({
    queryKey: [API.metrics],
    queryFn: () => fetchApi<any>(API.metrics),
    enabled: !!user && !me.isError,
  });

  const announcements = useQuery({
    queryKey: [API.announcements],
    queryFn: () => fetchApi<{ data: any[] }>(API.announcements),
    enabled: !!user && !me.isError,
  });

  const withdrawals = useQuery({
    queryKey: [API.withdrawals],
    queryFn: () => fetchApi<{ data: any[] }>(API.withdrawals),
    enabled: !!user && !me.isError,
  });

  const tax = useQuery({
    queryKey: [API.tax],
    queryFn: () => fetchApi<any>(API.tax),
    enabled: !!user && !me.isError,
  });

  useEffect(() => {
    if (!authLoading && !user) setLocation("/login");
  }, [authLoading, user, setLocation]);

  useEffect(() => {
    if (tax.data) {
      setTaxFullName(tax.data.fullName ?? "");
      setTaxId(tax.data.taxId ?? "");
      setTaxAddress(tax.data.address ?? "");
      setTaxCountry(tax.data.country ?? "");
    }
  }, [tax.data]);

  const createAnnouncement = useMutation({
    mutationFn: (body: { title: string; body: string }) =>
      fetch(API.announcements, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API.announcements] });
      setAnnouncementTitle("");
      setAnnouncementBody("");
    },
  });

  const createWithdrawal = useMutation({
    mutationFn: (body: { amountCents: number; reason?: string }) =>
      fetch(API.withdrawals, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [API.withdrawals] });
      setWithdrawAmount("");
      setWithdrawReason("");
    },
  });

  const confirmAdmin = useMutation({
    mutationFn: (id: string) =>
      fetch(`${API.withdrawals}/${id}/confirm-admin`, { method: "POST", credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API.withdrawals] }),
  });

  const confirmPartner = useMutation({
    mutationFn: (id: string) =>
      fetch(`${API.withdrawals}/${id}/confirm-partner`, { method: "POST", credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API.withdrawals] }),
  });

  const executeWithdrawal = useMutation({
    mutationFn: (id: string) =>
      fetch(`${API.withdrawals}/${id}/execute`, { method: "POST", credentials: "include" }).then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API.withdrawals] }),
  });

  const saveTax = useMutation({
    mutationFn: (body: any) =>
      fetch(API.tax, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [API.tax] }),
  });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (me.isError || me.data?.role === "unknown") {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
        <AlertCircle className="text-amber-500 mb-4" size={48} />
        <h1 className="text-xl font-bold mb-2">Access denied</h1>
        <p className="text-zinc-500 mb-6">Admin or partner access required.</p>
        <Button variant="outline" onClick={() => setLocation("/")} className="border-zinc-700">
          <ArrowLeft size={16} className="mr-2" /> Back to app
        </Button>
      </div>
    );
  }

  const cfg = config.data ?? {};
  const m = metrics.data ?? {};
  const splitData = [
    { name: "Admin / Lead", value: cfg.splitAdminPct ?? 35, color: "#eab308" },
    { name: "Partner", value: cfg.splitPartnerPct ?? 35, color: "#22c55e" },
    { name: "Scaling & dev", value: cfg.splitScalingPct ?? 30, color: "#3b82f6" },
  ];
  const firstYearPct = cfg.firstYearPayoutPct ?? 10;
  const mrrDollars = ((m.mrrCents ?? 0) / 100).toFixed(2);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/80 backdrop-blur p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/")}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-lg font-bold">Admin Portal</h1>
            <p className="text-xs text-zinc-500" title="Metrics and reports for partner/investor feedback (turnover, sales at scale).">
              {me.data?.role === "admin" ? "Admin" : "Investor / Founder"} · {me.data?.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={API.reportsCsv} download className="inline-flex" style={{ color: "inherit" }}>
            <Button variant="outline" size="sm" className="border-zinc-700">
              <Download size={14} className="mr-1" /> CSV
            </Button>
          </a>
          <a href={API.reportsPdf} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
            <Button variant="outline" size="sm" className="border-zinc-700">
              <FileText size={14} className="mr-1" /> PDF
            </Button>
          </a>
        </div>
      </header>

      <main className="p-4 max-w-5xl mx-auto space-y-6 pb-12">
        <p className="text-sm text-zinc-500">
          Metrics and reports for partner and investor feedback: turnover, sales at scale. Use CSV/PDF to share.
        </p>
        {/* First year notice */}
        <Card className="bg-amber-500/10 border-amber-500/30">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-200">
              <strong>First-year payout policy:</strong> Only {firstYearPct}% of each portion (Admin, Partner) is paid out to admin and partner in the app’s first year. The remaining 90% stays for scaling and future planning. Override requires dual email confirmation (admin + partner).
            </p>
          </CardContent>
        </Card>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900/50 border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <Users size={16} /> Total users
              </div>
              <p className="text-2xl font-bold mt-1">{m.totalUsers ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <CreditCard size={16} /> Subscriptions
              </div>
              <p className="text-2xl font-bold mt-1">{Number(m.usersWithSubscription ?? 0) + Number(m.trialingSubscriptions ?? 0)}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <DollarSign size={16} /> MRR
              </div>
              <p className="text-2xl font-bold mt-1">${mrrDollars}</p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900/50 border-white/10">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-zinc-500 text-sm">Revenue split</div>
              <p className="text-sm mt-1">{cfg.splitAdminPct ?? 35}% / {cfg.splitPartnerPct ?? 35}% / {cfg.splitScalingPct ?? 30}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Pie chart: revenue split */}
        <Card className="bg-zinc-900/50 border-white/10">
          <CardHeader>
            <CardTitle className="text-base">Revenue split (Admin / Partner / Scaling)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={splitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {splitData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => `${v}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="announcements" className="w-full">
          <TabsList className="bg-zinc-900 border border-white/10">
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="tax">Tax details</TabsTrigger>
          </TabsList>

          <TabsContent value="announcements" className="space-y-4 mt-4">
            {me.data?.canEditConfig && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-black">
                    <MessageSquare size={16} className="mr-2" /> New announcement
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Add announcement</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        className="bg-zinc-800 border-zinc-700 mt-1"
                        value={announcementTitle}
                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                        placeholder="Title"
                      />
                    </div>
                    <div>
                      <Label>Body</Label>
                      <textarea
                        className="w-full min-h-[120px] rounded-md bg-zinc-800 border border-zinc-700 p-2 mt-1 text-sm"
                        value={announcementBody}
                        onChange={(e) => setAnnouncementBody(e.target.value)}
                        placeholder="Message for investors/founders"
                      />
                    </div>
                    <Button
                      onClick={() => createAnnouncement.mutate({ title: announcementTitle, body: announcementBody })}
                      disabled={!announcementTitle.trim() || !announcementBody.trim() || createAnnouncement.isPending}
                    >
                      Post
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <div className="space-y-2">
              {(announcements.data?.data ?? []).map((a: any) => (
                <Card key={a._id} className="bg-zinc-900/50 border-white/10">
                  <CardContent className="pt-4">
                    <h4 className="font-medium">{a.title}</h4>
                    <p className="text-sm text-zinc-500 mt-1">{a.body}</p>
                    <p className="text-xs text-zinc-600 mt-2">By {a.authorEmail} · {new Date(a.createdAt).toLocaleString()}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="withdrawals" className="space-y-4 mt-4">
            {me.data?.canEditConfig && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-primary text-black">
                    <DollarSign size={16} className="mr-2" /> Request withdrawal
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle>Create withdrawal request</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-zinc-500">Requires dual confirmation (admin + partner) before execution.</p>
                  <div className="space-y-4">
                    <div>
                      <Label>Amount (cents)</Label>
                      <Input
                        type="number"
                        className="bg-zinc-800 border-zinc-700 mt-1"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="e.g. 10000"
                      />
                    </div>
                    <div>
                      <Label>Reason (optional)</Label>
                      <Input
                        className="bg-zinc-800 border-zinc-700 mt-1"
                        value={withdrawReason}
                        onChange={(e) => setWithdrawReason(e.target.value)}
                        placeholder="Reason"
                      />
                    </div>
                    <Button
                      onClick={() =>
                        createWithdrawal.mutate({
                          amountCents: parseInt(withdrawAmount, 10) || 0,
                          reason: withdrawReason || undefined,
                        })
                      }
                      disabled={!withdrawAmount || createWithdrawal.isPending}
                    >
                      Create request
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <div className="space-y-2">
              {(withdrawals.data?.data ?? []).map((w: any) => (
                <Card key={w._id} className="bg-zinc-900/50 border-white/10">
                  <CardContent className="pt-4 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{(w.amountCents / 100).toFixed(2)} USD</p>
                      <p className="text-xs text-zinc-500">{w.requestedByEmail} · {w.status}</p>
                    </div>
                    <div className="flex gap-2">
                      {w.status === "pending" && me.data?.canEditConfig && (
                        <Button size="sm" variant="outline" onClick={() => confirmAdmin.mutate(w._id)} disabled={confirmAdmin.isPending}>
                          Confirm (admin)
                        </Button>
                      )}
                      {w.status === "pending" && me.data?.role === "partner" && (
                        <Button size="sm" variant="outline" onClick={() => confirmPartner.mutate(w._id)} disabled={confirmPartner.isPending}>
                          Confirm (partner)
                        </Button>
                      )}
                      {w.status === "admin_confirmed" && me.data?.role === "partner" && (
                        <Button size="sm" variant="outline" onClick={() => confirmPartner.mutate(w._id)} disabled={confirmPartner.isPending}>
                          Confirm (partner)
                        </Button>
                      )}
                      {w.status === "partner_confirmed" && me.data?.canEditConfig && (
                        <Button size="sm" variant="outline" onClick={() => confirmAdmin.mutate(w._id)} disabled={confirmAdmin.isPending}>
                          Confirm (admin)
                        </Button>
                      )}
                      {w.status === "dual_confirmed" && me.data?.canEditConfig && (
                        <Button size="sm" className="bg-primary text-black" onClick={() => executeWithdrawal.mutate(w._id)} disabled={executeWithdrawal.isPending}>
                          Execute
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tax" className="space-y-4 mt-4">
            <Card className="bg-zinc-900/50 border-white/10">
              <CardHeader>
                <CardTitle className="text-base">Tax details (for payouts)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Full name</Label>
                  <Input
                    className="bg-zinc-800 border-zinc-700 mt-1"
                    value={taxFullName}
                    onChange={(e) => setTaxFullName(e.target.value)}
                    placeholder="Legal name"
                  />
                </div>
                <div>
                  <Label>Tax ID</Label>
                  <Input
                    className="bg-zinc-800 border-zinc-700 mt-1"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    placeholder="SSN / EIN / VAT"
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input
                    className="bg-zinc-800 border-zinc-700 mt-1"
                    value={taxAddress}
                    onChange={(e) => setTaxAddress(e.target.value)}
                    placeholder="Address"
                  />
                </div>
                <div>
                  <Label>Country</Label>
                  <Input
                    className="bg-zinc-800 border-zinc-700 mt-1"
                    value={taxCountry}
                    onChange={(e) => setTaxCountry(e.target.value)}
                    placeholder="Country"
                  />
                </div>
                <Button
                  onClick={() =>
                    saveTax.mutate({
                      fullName: taxFullName,
                      taxId: taxId || undefined,
                      address: taxAddress || undefined,
                      country: taxCountry || undefined,
                    })
                  }
                  disabled={saveTax.isPending}
                >
                  Save tax details
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <p className="text-center text-xs text-zinc-600 pt-4">
          ProCam — Professional Mobile Photography · <a href="mailto:support@procam.cloud" className="underline">support@procam.cloud</a>
        </p>
      </main>
    </div>
  );
}
