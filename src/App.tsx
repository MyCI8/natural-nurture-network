import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import Navbar from "./components/Navbar";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import ManageRemedies from "./pages/ManageRemedies";
import ManageIngredients from "./pages/ManageIngredients";
import EditRemedy from "./pages/EditRemedy";
import IngredientDetail from "./pages/IngredientDetail";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === null) {
    return null; // Loading state
  }

  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/remedies"
              element={
                <ProtectedRoute>
                  <ManageRemedies />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ingredients"
              element={
                <ProtectedRoute>
                  <ManageIngredients />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/remedies/:id"
              element={
                <ProtectedRoute>
                  <EditRemedy />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/ingredients/:id"
              element={
                <ProtectedRoute>
                  <IngredientDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;