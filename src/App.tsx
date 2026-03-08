import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>

      <Toaster />
      <Sonner />

      {/* IMPORTANT: tell router the GitHub repo base path */}
      <BrowserRouter basename="/grounded-readiness-ai">

        <Routes>

          {/* Homepage */}
          <Route path="/" element={<Index />} />

          {/* 404 page */}
          <Route path="*" element={<NotFound />} />

        </Routes>

      </BrowserRouter>

    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
