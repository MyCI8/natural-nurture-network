import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/experts" element={<Experts />} />
        <Route path="/experts/:id" element={<ExpertProfile />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/:slug" element={<NewsArticle />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/manage-experts" element={<ManageExperts />} />
        <Route path="/admin/manage-experts/:id" element={<EditExpert />} />
        <Route path="/admin/manage-news" element={<ManageNews />} />
        <Route path="/admin/manage-news/:id" element={<EditNews />} />
        <Route path="/admin/manage-remedies" element={<ManageRemedies />} />
        <Route path="/admin/manage-remedies/:id" element={<EditRemedy />} />
        <Route path="/admin/manage-ingredients" element={<ManageIngredients />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;