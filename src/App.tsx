import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Admin from "@/pages/Admin";
import ManageRemedies from "@/pages/ManageRemedies";
import EditRemedy from "@/pages/EditRemedy";
import ManageIngredients from "@/pages/ManageIngredients";
import IngredientDetail from "@/pages/IngredientDetail";
import ManageNews from "@/pages/ManageNews";
import EditNews from "@/pages/EditNews";
import ManageExperts from "@/pages/ManageExperts";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/remedies" element={<ManageRemedies />} />
          <Route path="/admin/remedies/:id" element={<EditRemedy />} />
          <Route path="/admin/ingredients" element={<ManageIngredients />} />
          <Route path="/admin/ingredients/:id" element={<IngredientDetail />} />
          <Route path="/admin/news" element={<ManageNews />} />
          <Route path="/admin/news/:id" element={<EditNews />} />
          <Route path="/admin/manage-experts" element={<ManageExperts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;