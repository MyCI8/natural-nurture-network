import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Auth from "@/pages/Auth";
import Admin from "@/pages/Admin";
import AdminDashboard from "@/pages/AdminDashboard";
import ManageExperts from "@/pages/ManageExperts";
import ManageNews from "@/pages/ManageNews";
import ManageRemedies from "@/pages/ManageRemedies";
import ManageIngredients from "@/pages/ManageIngredients";
import EditExpert from "@/pages/EditExpert";
import EditNews from "@/pages/EditNews";
import EditRemedy from "@/pages/EditRemedy";
import Experts from "@/pages/Experts";
import ExpertProfile from "@/pages/ExpertProfile";
import News from "@/pages/News";
import NewsArticle from "@/pages/NewsArticle";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            {/* Admin routes without Layout */}
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/manage-experts" element={<ManageExperts />} />
            <Route path="/admin/manage-experts/:id" element={<EditExpert />} />
            <Route path="/admin/manage-news" element={<ManageNews />} />
            <Route path="/admin/manage-news/:id" element={<EditNews />} />
            <Route path="/admin/manage-remedies" element={<ManageRemedies />} />
            <Route path="/admin/manage-remedies/:id" element={<EditRemedy />} />
            <Route path="/admin/manage-ingredients" element={<ManageIngredients />} />

            {/* Public routes with Layout */}
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/auth" element={<Layout><Auth /></Layout>} />
            <Route path="/experts" element={<Layout><Experts /></Layout>} />
            <Route path="/experts/:id" element={<Layout><ExpertProfile /></Layout>} />
            <Route path="/news" element={<Layout><News /></Layout>} />
            <Route path="/news/:slug" element={<Layout><NewsArticle /></Layout>} />
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;