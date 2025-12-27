import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FinancialProvider } from "@/contexts/FinancialContext";
import AppLayout from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import Companies from "@/pages/Companies";
import BankAccounts from "@/pages/BankAccounts";
import Categories from "@/pages/Categories";
import CreditCards from "@/pages/CreditCards";
import ServiceProviders from "@/pages/ServiceProviders";
import Transactions from "@/pages/Transactions";
import NewTransaction from "@/pages/NewTransaction";
import Reports from "@/pages/Reports";
import Alerts from "@/pages/Alerts";
import MonthClosing from "@/pages/MonthClosing";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <FinancialProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/empresas" element={<Companies />} />
              <Route path="/contas" element={<BankAccounts />} />
              <Route path="/categorias" element={<Categories />} />
              <Route path="/cartoes" element={<CreditCards />} />
              <Route path="/prestadores" element={<ServiceProviders />} />
              <Route path="/lancamentos" element={<Transactions />} />
              <Route path="/lancamentos/novo" element={<NewTransaction />} />
              <Route path="/relatorios" element={<Reports />} />
              <Route path="/alertas" element={<Alerts />} />
              <Route path="/fechamento" element={<MonthClosing />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </FinancialProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
