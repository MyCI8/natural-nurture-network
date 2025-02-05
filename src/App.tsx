
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import Admin from "@/pages/Admin";
import ManageRemedies from "@/pages/ManageRemedies";
import ManageNews from "./pages/ManageNews";
import ManageIngredients from "@/pages/ManageIngredients";
import IngredientDetail from "@/pages/IngredientDetail";
import Index from "@/pages/Index";
import EditRemedy from "@/pages/EditRemedy";
import EditNews from "@/pages/EditNews";
import NewsArticle from "@/pages/NewsArticle";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/remedies" element={<ManageRemedies />} />
        <Route path="/admin/remedies/:id" element={<EditRemedy />} />
        <Route path="/admin/news" element={<ManageNews />} />
        <Route path="/admin/news/:id" element={<EditNews />} />
        <Route path="/admin/ingredients" element={<ManageIngredients />} />
        <Route path="/admin/ingredients/:id" element={<IngredientDetail />} />
        <Route path="/news/:id" element={<NewsArticle />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;
