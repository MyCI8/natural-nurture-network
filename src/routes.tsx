
import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
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
import ManageNewsArticles from "./pages/ManageNewsArticles";
import ManageNewsVideos from "./pages/ManageNewsVideos";
import ManageLatestVideos from "./pages/ManageLatestVideos";
import EditNews from "./pages/EditNews";
import Auth from "./pages/Auth";
import ManageUsers from "./pages/ManageUsers";
import EditUser from "./pages/EditUser";
import EditSymptom from "./pages/EditSymptom";
import Explore from "./pages/Explore";
import ExploreDetail from "./pages/ExploreDetail";
import ManageVideos from "./pages/ManageVideos";
import EditVideo from "./pages/EditVideo";
import UserProfile from "./pages/UserProfile";
import Symptoms from "./pages/Symptoms";
import SymptomDetail from "./pages/SymptomDetail";

// Settings pages
import SettingsProfile from "./pages/settings/Profile";
import SettingsSecurity from "./pages/settings/Security";
import SettingsNotifications from "./pages/settings/Notifications";
import SettingsPrivacy from "./pages/settings/Privacy";

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="explore">
          <Route index element={<Explore />} />
          <Route path=":id" element={<ExploreDetail />} />
        </Route>
        <Route path="experts" element={<Experts />} />
        <Route path="experts/:id" element={<ExpertProfile />} />
        <Route path="remedies" element={<Remedies />} />
        <Route path="ingredients" element={<Ingredients />} />
        <Route path="symptoms" element={<Symptoms />} />
        <Route path="symptoms/:id" element={<SymptomDetail />} />
        <Route path="news" element={<News />} />
        <Route path="news/:id" element={<NewsArticle />} />
        <Route path="news/videos/:id" element={<EditVideo />} />
        <Route path="users/:id" element={<UserProfile />} />
        
        {/* Settings Routes */}
        <Route path="settings">
          <Route path="profile" element={<SettingsProfile />} />
          <Route path="security" element={<SettingsSecurity />} />
          <Route path="notifications" element={<SettingsNotifications />} />
          <Route path="privacy" element={<SettingsPrivacy />} />
        </Route>
        
        <Route path="admin" element={<Admin />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users">
            <Route index element={<ManageUsers />} />
            <Route path=":id" element={<EditUser />} />
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
            <Route path="articles" element={<ManageNewsArticles />} />
            <Route path="videos" element={<ManageNewsVideos />} />
            <Route path="latest" element={<ManageLatestVideos />} />
            <Route path=":id" element={<EditNews />} />
            <Route path="videos/:id" element={<EditVideo />} />
          </Route>
          <Route path="videos">
            <Route index element={<ManageVideos />} />
            <Route path=":id" element={<EditVideo />} />
          </Route>
          <Route path="symptoms">
            <Route index element={<ManageSymptoms />} />
            <Route path=":id" element={<EditSymptom />} />
          </Route>
        </Route>
        <Route path="auth" element={<Auth />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </RouterRoutes>
  );
};

export default Routes;
