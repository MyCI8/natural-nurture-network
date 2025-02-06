import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/Home";
import AdminDashboard from "@/pages/AdminDashboard";
import ManageExperts from "@/pages/ManageExperts";
import EditExpert from "@/pages/EditExpert";
import ExpertProfile from "@/pages/ExpertProfile";
import ManageRemedies from "@/pages/ManageRemedies";
import EditRemedy from "@/pages/EditRemedy";
import ManageNews from "@/pages/ManageNews";
import EditNews from "@/pages/EditNews";
import ManageIngredients from "@/pages/ManageIngredients";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/manage-experts" element={<ManageExperts />} />
            <Route path="/admin/manage-experts/:id" element={<EditExpert />} />
            <Route path="/admin/manage-experts/new" element={<EditExpert />} />
            <Route path="/admin/manage-remedies" element={<ManageRemedies />} />
            <Route path="/admin/manage-remedies/:id" element={<EditRemedy />} />
            <Route path="/admin/manage-remedies/new" element={<EditRemedy />} />
            <Route path="/admin/manage-news" element={<ManageNews />} />
            <Route path="/admin/manage-news/:id" element={<EditNews />} />
            <Route path="/admin/manage-news/new" element={<EditNews />} />
            <Route path="/admin/manage-ingredients" element={<ManageIngredients />} />
            <Route path="/experts/:id" element={<ExpertProfile />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;