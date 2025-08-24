import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Search from "@/pages/search";
import RegisterLot from "@/pages/register-lot";
import Community from "@/pages/community";
import Rewards from "@/pages/rewards";
import Sidebar from "@/components/layout/sidebar";
import MobileNav from "@/components/layout/mobile-nav";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={Search} />
      <Route path="/register-lot" component={RegisterLot} />
      <Route path="/community" component={Community} />
      <Route path="/rewards" component={Rewards} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [currentUser] = useState({
    id: "demo-user",
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    initials: "NV",
    points: 1250,
    tier: "silver"
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <div className="flex min-h-screen">
            <Sidebar currentUser={currentUser} />
            <main className="flex-1 flex flex-col min-h-screen">
              <Router />
            </main>
          </div>
          <MobileNav />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
