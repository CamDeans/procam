import { useState, useEffect } from "react";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { useAuth } from "@/hooks/use-auth";
import { useProducts, useCreateCheckoutSession, useSubscription, useCreateBillingPortalSession } from "@/hooks/use-stripe";
import { useFeatureAccess } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import { 
  CreditCard, 
  LogOut, 
  ShieldCheck, 
  Camera, 
  ChevronRight,
  Sparkles,
  ChevronLeft,
  Grid3X3,
  Aperture,
  Sun,
  Lock,
  Mail
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SettingsView = "main" | "preferences" | "billing";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { data: products } = useProducts();
  const { data: subData } = useSubscription();
  const features = useFeatureAccess();
  const createSession = useCreateCheckoutSession();
  const createPortalSession = useCreateBillingPortalSession();
  const [view, setView] = useState<SettingsView>("main");
  
  const [defaultLens, setDefaultLens] = useState(() => localStorage.getItem("procam-lens") || "35mm");
  const [defaultGuide, setDefaultGuide] = useState(() => localStorage.getItem("procam-guide") || "rule-of-thirds");
  const [saveOriginals, setSaveOriginals] = useState(() => localStorage.getItem("procam-save-originals") !== "false");
  const [showHistogramDefault, setShowHistogramDefault] = useState(() => localStorage.getItem("procam-histogram") === "true");

  useEffect(() => {
    if (!features.isLoading) {
      if (!features.availableLenses.includes(defaultLens)) {
        setDefaultLens("35mm");
        localStorage.setItem("procam-lens", "35mm");
      }
      if (!features.availableGuides.includes(defaultGuide)) {
        setDefaultGuide("rule-of-thirds");
        localStorage.setItem("procam-guide", "rule-of-thirds");
      }
    }
  }, [features.isLoading, features.availableLenses, features.availableGuides]);

  const handleLensChange = (value: string) => {
    setDefaultLens(value);
    localStorage.setItem("procam-lens", value);
  };

  const handleGuideChange = (value: string) => {
    setDefaultGuide(value);
    localStorage.setItem("procam-guide", value);
  };

  const handleSaveOriginalsChange = (value: boolean) => {
    setSaveOriginals(value);
    localStorage.setItem("procam-save-originals", String(value));
  };

  const handleHistogramChange = (value: boolean) => {
    setShowHistogramDefault(value);
    localStorage.setItem("procam-histogram", String(value));
  };

  const handleUpgrade = (priceId: string) => {
    createSession.mutate(priceId);
  };

  const handleOpenBillingPortal = () => {
    createPortalSession.mutate();
  };

  const isSubscribed = !!subData?.subscription;

  if (view === "preferences") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="p-4 sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-white/5 pwa-safe-top">
          <div className="flex items-center gap-3">
            <HamburgerMenu />
            <button onClick={() => setView("main")} className="p-1" data-testid="button-back-settings">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-tight">Camera Preferences</h1>
          </div>
        </div>
        
        <div className="p-6 space-y-6 max-w-2xl mx-auto">
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 px-1">Defaults</h3>
            
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-white/5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Aperture size={18} className="text-zinc-400" />
                  <Label>Default Lens</Label>
                </div>
                <Select 
                  value={defaultLens} 
                  onValueChange={(val) => {
                    if (val === "85mm" && !features.canUse85mm) return;
                    handleLensChange(val);
                  }}
                >
                  <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700" data-testid="select-default-lens">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="14mm">14mm</SelectItem>
                    <SelectItem value="24mm">24mm</SelectItem>
                    <SelectItem value="35mm">35mm</SelectItem>
                    <SelectItem value="50mm">50mm</SelectItem>
                    <SelectItem value="85mm" disabled={!features.canUse85mm}>
                      <span className="flex items-center gap-2">
                        85mm
                        {!features.canUse85mm && <Lock size={12} className="text-primary/60" />}
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Grid3X3 size={18} className="text-zinc-400" />
                  <Label>Default Grid</Label>
                </div>
                <Select 
                  value={defaultGuide} 
                  onValueChange={(val) => {
                    if (val === "golden-ratio" && !features.canUseGoldenRatio) return;
                    handleGuideChange(val);
                  }}
                >
                  <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700" data-testid="select-default-guide">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700">
                    <SelectItem value="none">Off</SelectItem>
                    <SelectItem value="rule-of-thirds">Rule of Thirds</SelectItem>
                    <SelectItem value="golden-ratio" disabled={!features.canUseGoldenRatio}>
                      <span className="flex items-center gap-2">
                        Golden Ratio
                        {!features.canUseGoldenRatio && <Lock size={12} className="text-primary/60" />}
                      </span>
                    </SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="diagonal">Diagonal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
          
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 px-1">Capture</h3>
            
            <div className="p-4 rounded-xl bg-zinc-900/30 border border-white/5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="block">Save Original Photos</Label>
                  <p className="text-xs text-zinc-500 mt-1">Keep unprocessed version alongside edited photo</p>
                </div>
                <Switch 
                  checked={saveOriginals} 
                  onCheckedChange={handleSaveOriginalsChange}
                  data-testid="switch-save-originals"
                />
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Label className="block">Show Histogram</Label>
                  <p className="text-xs text-zinc-500 mt-1">Display exposure histogram by default</p>
                </div>
                <Switch 
                  checked={showHistogramDefault} 
                  onCheckedChange={handleHistogramChange}
                  data-testid="switch-histogram"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (view === "billing") {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="p-4 sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-white/5 pwa-safe-top">
          <div className="flex items-center gap-3">
            <HamburgerMenu />
            <button onClick={() => setView("main")} className="p-1" data-testid="button-back-settings">
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-tight">Billing & Payments</h1>
          </div>
        </div>
        
        <div className="p-6 space-y-6 max-w-2xl mx-auto">
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 px-1">Current Plan</h3>
            
            {isSubscribed ? (
              <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-full bg-green-500/20 text-green-500">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-green-500">ProCam+</h3>
                    <p className="text-xs text-zinc-500">Active subscription</p>
                  </div>
                </div>
                <Button 
                  variant="outline"
                  className="w-full border-zinc-700 bg-zinc-900"
                  onClick={handleOpenBillingPortal}
                  disabled={createPortalSession.isPending}
                  data-testid="button-manage-subscription"
                >
                  <CreditCard size={16} className="mr-2" />
                  {createPortalSession.isPending ? "Opening..." : "Manage Subscription"}
                </Button>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-zinc-900/50 border border-white/5">
                <p className="text-zinc-400 mb-4">You're on the free plan.</p>
                <Button 
                  onClick={() => setView("main")}
                  className="w-full bg-primary hover:bg-primary/90 text-black font-bold"
                  data-testid="button-view-plans"
                >
                  <Sparkles size={16} className="mr-2" />
                  View Pro Plans
                </Button>
              </div>
            )}
          </section>
          
          {isSubscribed && (
            <section className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 px-1">Quick Actions</h3>
              
              <div className="space-y-2">
                <button 
                  onClick={handleOpenBillingPortal}
                  disabled={createPortalSession.isPending}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 border border-transparent hover:border-white/5 transition-all"
                  data-testid="button-update-payment"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} className="text-zinc-400" />
                    <span>Update Payment Method</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-600" />
                </button>
                
                <button 
                  onClick={handleOpenBillingPortal}
                  disabled={createPortalSession.isPending}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 border border-transparent hover:border-white/5 transition-all"
                  data-testid="button-view-invoices"
                >
                  <div className="flex items-center gap-3">
                    <Sun size={18} className="text-zinc-400" />
                    <span>View Invoices</span>
                  </div>
                  <ChevronRight size={16} className="text-zinc-600" />
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="p-4 sticky top-0 z-20 bg-background/80 backdrop-blur-lg border-b border-white/5 pwa-safe-top">
        <div className="flex items-center gap-3">
          <HamburgerMenu />
          <h1 className="text-xl font-bold tracking-tight">Settings</h1>
        </div>
      </div>

      <div className="p-6 space-y-8 max-w-2xl mx-auto">
        
        <section className="space-y-4">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-white/5">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-600 flex items-center justify-center text-2xl font-bold border-2 border-white/10">
              {user?.firstName?.[0] || user?.email?.[0] || "U"}
            </div>
            <div>
              <h2 className="font-bold text-lg">{user?.firstName || "User"} {user?.lastName}</h2>
              <p className="text-sm text-zinc-500">{user?.email}</p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
           <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 px-1">Membership</h3>
           
           {!isSubscribed ? (
             <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-zinc-900 to-black p-6">
                <div className="absolute top-0 right-0 p-4 opacity-20 text-primary">
                   <Sparkles size={64} />
                </div>
                
                <h3 className="text-xl font-bold text-primary mb-2">ProCam+</h3>
                <p className="text-sm text-zinc-400 mb-4">
                   Unlock all professional features
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-6 text-xs">
                  <div className="space-y-2">
                    <h4 className="font-bold text-zinc-400 uppercase tracking-wider">Free</h4>
                    <ul className="space-y-1.5 text-zinc-500">
                      <li className="flex items-center gap-2">
                        <span className="text-zinc-600">14-50mm</span> lenses
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-zinc-600">JPEG</span> capture only
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-zinc-600">50</span> photo storage
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-zinc-600">Basic</span> grid guides
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-bold text-primary uppercase tracking-wider">ProCam+</h4>
                    <ul className="space-y-1.5 text-zinc-300">
                      <li className="flex items-center gap-2">
                        <span className="text-primary">All</span> lenses incl. 85mm
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">RAW + JPEG</span> capture
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">Unlimited</span> storage
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-primary">Golden ratio</span> + all guides
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-3">
                   {products?.map((product: any) => {
                      const prices = product.prices || [];
                      const monthlyPrice = prices.find((p: any) => p.recurring?.interval === 'month');
                      const yearlyPrice = prices.find((p: any) => p.recurring?.interval === 'year');
                      
                      if (!monthlyPrice && !yearlyPrice) return null;

                      const monthlyAmount = monthlyPrice ? monthlyPrice.unit_amount / 100 : 0;
                      const yearlyAmount = yearlyPrice ? yearlyPrice.unit_amount / 100 : 0;
                      const annualIfMonthly = monthlyAmount * 12;
                      const savings = annualIfMonthly > 0 ? Math.round(((annualIfMonthly - yearlyAmount) / annualIfMonthly) * 100) : 0;

                      return (
                         <div key={product.id} className="space-y-3">
                            {monthlyPrice && (
                               <Button 
                                  data-testid="button-upgrade-monthly"
                                  onClick={() => handleUpgrade(monthlyPrice.id)}
                                  disabled={createSession.isPending}
                                  className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 rounded-xl"
                               >
                                  {createSession.isPending ? "Processing..." : `$${monthlyAmount.toFixed(2)}/month`}
                               </Button>
                            )}
                            {yearlyPrice && (
                               <Button 
                                  data-testid="button-upgrade-yearly"
                                  onClick={() => handleUpgrade(yearlyPrice.id)}
                                  disabled={createSession.isPending}
                                  variant="outline"
                                  className="w-full border-primary/30 text-primary hover:bg-primary/10 font-bold h-12 rounded-xl"
                               >
                                  {createSession.isPending ? "Processing..." : `$${yearlyAmount.toFixed(2)}/year${savings > 0 ? ` (Save ${savings}%)` : ''}`}
                               </Button>
                            )}
                         </div>
                      );
                   })}
                </div>
             </div>
           ) : (
             <div className="p-6 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center gap-4">
                <div className="p-3 rounded-full bg-green-500/20 text-green-500">
                   <ShieldCheck size={24} />
                </div>
                <div>
                   <h3 className="font-bold text-green-500">Pro Active</h3>
                   <p className="text-xs text-zinc-500">Your subscription is active.</p>
                </div>
             </div>
           )}
        </section>

        <section className="space-y-2">
           <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 px-1">App Settings</h3>
           
           <button 
              onClick={() => setView("preferences")}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 border border-transparent hover:border-white/5 transition-all"
              data-testid="button-camera-preferences"
           >
              <div className="flex items-center gap-3">
                 <Camera size={18} className="text-zinc-400" />
                 <span>Camera Preferences</span>
              </div>
              <ChevronRight size={16} className="text-zinc-600" />
           </button>
           
           <button 
              onClick={() => setView("billing")}
              className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 border border-transparent hover:border-white/5 transition-all"
              data-testid="button-billing"
           >
              <div className="flex items-center gap-3">
                 <CreditCard size={18} className="text-zinc-400" />
                 <span>Billing & Payments</span>
              </div>
              <ChevronRight size={16} className="text-zinc-600" />
           </button>
           <a
              href="mailto:support@procam.cloud"
              className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900/30 hover:bg-zinc-900/50 border border-transparent hover:border-white/5 transition-all"
           >
              <div className="flex items-center gap-3">
                 <Mail size={18} className="text-zinc-400" />
                 <span>Contact Support</span>
              </div>
              <span className="text-sm text-zinc-500">support@procam.cloud</span>
           </a>
        </section>

        <Button 
           variant="outline" 
           onClick={() => logout()}
           className="w-full border-zinc-800 bg-transparent hover:bg-zinc-900 text-zinc-400 hover:text-white h-12"
           data-testid="button-logout"
        >
           <LogOut size={16} className="mr-2" /> Log Out
        </Button>

      </div>
    </div>
  );
}
