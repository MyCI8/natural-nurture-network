
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import ManageExperts from "./pages/ManageExperts";
import ManageRemedies from "./pages/ManageRemedies";
import ManageIngredients from "./pages/ManageIngredients";
import ManageSymptoms from "./pages/ManageSymptoms";
import EditExpert from "./pages/EditExpert";
import EditRemedy from "./pages/EditRemedy";
import IngredientDetail from "./pages/IngredientDetail";
import ExpertProfile from "./pages/ExpertProfile";
import Experts from "./pages/Experts";
import Remedies from "./pages/Remedies";
import Ingredients from "./pages/Ingredients";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import ManageNews from "./pages/ManageNews";
import EditNews from "./pages/EditNews";
import Auth from "./pages/Auth";
import ManageUsers from "./pages/ManageUsers";
import EditSymptom from "./pages/EditSymptom";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="experts" element={<Experts />} />
          <Route path="experts/:id" element={<ExpertProfile />} />
          <Route path="remedies" element={<Remedies />} />
          <Route path="ingredients" element={<Ingredients />} />
          <Route path="news" element={<News />} />
          <Route path="news/:id" element={<NewsArticle />} />
          <Route path="admin" element={<Admin />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users">
              <Route index element={<ManageUsers />} />
              <Route path="new" element={<ManageUsers />} />
            </Route>
            <Route path="manage-experts/*" element={<ManageExperts />} />
            <Route path="remedies">
              <Route index element={<ManageRemedies />} />
              <Route path="edit/:id" element={<EditRemedy />} />
            </Route>
            <Route path="ingredients">
              <Route index element={<ManageIngredients />} />
              <Route path=":id" element={<IngredientDetail />} />
            </Route>
            <Route path="news">
              <Route index element={<ManageNews />} />
              <Route path=":id" element={<EditNews />} />
            </Route>
            <Route path="symptoms">
              <Route index element={<ManageSymptoms />} />
              <Route path=":id" element={<EditSymptom />} />
            </Route>
          </Route>
          <Route path="auth" element={<Auth />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
