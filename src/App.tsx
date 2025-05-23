
import { Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import Home from "./pages/Home";
import ManageNews from "./pages/ManageNews";
import ManageNewsArticles from "./pages/ManageNewsArticles";
import ManageNewsVideos from "./pages/ManageNewsVideos";
import ManageLatestVideos from "./pages/ManageLatestVideos";
import NewsSettings from "./pages/NewsSettings";
import EditNews from "./pages/EditNews";
import EditVideo from "./pages/EditVideo";
import ManageVideos from "./pages/ManageVideos";
import Auth from "./pages/Auth";
import ManageExperts from "./pages/ManageExperts";
import EditExpert from "./pages/EditExpert";
import NotFound from "./pages/NotFound";
import News from "./pages/News";
import NewsArticle from "./pages/NewsArticle";
import Explore from "./pages/Explore";
import ExploreDetail from "./pages/ExploreDetail";
import Post from "./pages/Post";
import Symptoms from "./pages/Symptoms";
import Symptomsz from "./pages/Symptomsz";
import SymptomDetail from "./pages/SymptomDetail";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import ManageRemedies from "./pages/ManageRemedies";
import ManageIngredients from "./pages/ManageIngredients";
import ManageSymptoms from "./pages/ManageSymptoms";
import IngredientDetail from "./pages/IngredientDetail";
import EditRemedy from "./pages/EditRemedy";
import EditSymptom from "./pages/EditSymptom";
import Experts from "./pages/Experts";
import ExpertProfile from "./pages/ExpertProfile";
import Remedies from "./pages/Remedies";
import RemedyDetail from "./pages/RemedyDetail";
import Ingredients from "./pages/Ingredients";
import ManageUsers from "./pages/ManageUsers";
import EditUser from "./pages/EditUser";
import UserProfile from "./pages/UserProfile";

// Settings pages
import SettingsProfile from "./pages/settings/Profile";
import SettingsSecurity from "./pages/settings/Security";
import SettingsNotifications from "./pages/settings/Notifications";
import SettingsPrivacy from "./pages/settings/Privacy";

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="auth" element={<Auth />} />
          <Route path="post" element={<Post />} />
          
          <Route path="news">
            <Route index element={<News />} />
            <Route path=":id" element={<NewsArticle />} />
            <Route path="videos/:id" element={<EditVideo />} />
          </Route>
          
          <Route path="explore">
            <Route index element={<Explore />} />
            <Route path=":id" element={<ExploreDetail />} />
          </Route>
          
          <Route path="symptoms">
            <Route index element={<Symptoms />} />
            <Route path=":id" element={<SymptomDetail />} />
          </Route>
          
          <Route path="symptomsz" element={<Symptomsz />} />
          
          <Route path="experts">
            <Route index element={<Experts />} />
            <Route path=":id" element={<ExpertProfile />} />
          </Route>
          
          <Route path="remedies">
            <Route index element={<Remedies />} />
            <Route path=":id" element={<RemedyDetail />} />
          </Route>
          
          <Route path="ingredients" element={<Ingredients />} />
          <Route path="users/:id" element={<UserProfile />} />
          
          {/* Settings Routes */}
          <Route path="settings">
            <Route path="profile" element={<SettingsProfile />} />
            <Route path="security" element={<SettingsSecurity />} />
            <Route path="notifications" element={<SettingsNotifications />} />
            <Route path="privacy" element={<SettingsPrivacy />} />
          </Route>

          {/* Admin Routes */}
          <Route path="admin" element={<Admin />}>
            <Route index element={<AdminDashboard />} />
            <Route path="news">
              <Route index element={<ManageNews />} />
              <Route path="articles" element={<ManageNewsArticles />} />
              <Route path="videos" element={<ManageNewsVideos />} />
              <Route path="latest" element={<ManageLatestVideos />} />
              <Route path=":id" element={<EditNews />} />
              <Route path="new" element={<EditNews />} />
              <Route path="videos/:id" element={<EditVideo />} />
            </Route>
            <Route path="videos">
              <Route index element={<ManageVideos />} />
              <Route path=":id" element={<EditVideo />} />
              <Route path="new" element={<EditVideo />} />
            </Route>
            <Route path="users">
              <Route index element={<ManageUsers />} />
              <Route path=":id" element={<EditUser />} />
            </Route>
            <Route path="experts">
              <Route index element={<ManageExperts />} />
              <Route path=":id" element={<EditExpert />} />
              <Route path="new" element={<EditExpert />} />
            </Route>
            <Route path="remedies">
              <Route index element={<ManageRemedies />} />
              <Route path="edit/:id" element={<EditRemedy />} />
            </Route>
            <Route path="ingredients">
              <Route index element={<ManageIngredients />} />
              <Route path=":id" element={<IngredientDetail />} />
            </Route>
            <Route path="symptoms">
              <Route index element={<ManageSymptoms />} />
              <Route path=":id" element={<EditSymptom />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
