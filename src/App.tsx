import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TradeModalProvider } from "@/contexts/TradeModalContext";
import { TradesProvider } from "@/contexts/TradesContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { TradeModal } from "@/components/trades/TradeModal";
import Dashboard from "./pages/Dashboard";
import Trades from "./pages/Trades";
import Analytics from "./pages/Analytics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TradesProvider>
        <TradeModalProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/trades" element={<Trades />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
            <TradeModal />
          </BrowserRouter>
        </TradeModalProvider>
      </TradesProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
