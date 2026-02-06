import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Pages
import NotFound from "@/pages/not-found";
import CameraPage from "@/pages/Camera";
import GalleryPage from "@/pages/Gallery";
import SettingsPage from "@/pages/Settings";
import TipsPage from "@/pages/Tips";
import InstallPage from "@/pages/Install";
import LoginPage from "@/pages/Login";
import CheckoutSuccessPage from "@/pages/checkout-success";
import CheckoutCancelPage from "@/pages/checkout-cancel";
import AdminPage from "@/pages/Admin";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!user) {
    // Redirect logic handled in useEffect usually, but for render safety:
    setTimeout(() => setLocation("/login"), 0);
    return null;
  }

  return <Component />;
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      
      {/* Protected Routes */}
      <Route path="/">
        {user ? <CameraPage /> : <LoginPage />}
      </Route>
      <Route path="/camera">
        <ProtectedRoute component={CameraPage} />
      </Route>
      <Route path="/gallery">
        <ProtectedRoute component={GalleryPage} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={SettingsPage} />
      </Route>
      <Route path="/tips">
        <ProtectedRoute component={TipsPage} />
      </Route>
      <Route path="/install">
        <ProtectedRoute component={InstallPage} />
      </Route>
      <Route path="/admin">
        <ProtectedRoute component={AdminPage} />
      </Route>
      
      {/* Checkout Handling */}
      <Route path="/checkout/success" component={CheckoutSuccessPage} />
      <Route path="/checkout/cancel" component={CheckoutCancelPage} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
