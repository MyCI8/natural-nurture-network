
import { Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { LazyComponent } from "./components/layout/LazyRoutes";
import Layout from "./components/Layout";

// Lazy load pages for better performance
import { lazy } from 'react';

const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ManageExperts = lazy(() => import("./pages/ManageExperts"));
const ManageRemedies = lazy(() => import("./pages/ManageRemedies"));
const ManageIngredients = lazy(() => import("./pages/ManageIngredients"));
const ManageHealthConcerns = lazy(() => import("./pages/ManageHealthConcerns"));
const EditExpert = lazy(() => import("./pages/EditExpert"));
const EditRemedy = lazy(() => import("./pages/EditRemedy"));
const IngredientDetail = lazy(() => import("./pages/IngredientDetail"));
const ExpertProfile = lazy(() => import("./pages/ExpertProfile"));
const Experts = lazy(() => import("./pages/Experts"));
const Remedies = lazy(() => import("./pages/Remedies"));
const RemedyDetail = lazy(() => import("./pages/RemedyDetail"));
const CreateRemedy = lazy(() => import("./pages/CreateRemedy"));
const Ingredients = lazy(() => import("./pages/Ingredients"));
const News = lazy(() => import("./pages/News"));
const NewsArticle = lazy(() => import("./pages/NewsArticle"));
const ManageNews = lazy(() => import("./pages/ManageNews"));
const ManageNewsArticles = lazy(() => import("./pages/ManageNewsArticles"));
const ManageNewsVideos = lazy(() => import("./pages/ManageNewsVideos"));
const ManageLatestVideos = lazy(() => import("./pages/ManageLatestVideos"));
const EditNews = lazy(() => import("./pages/EditNews"));
const Auth = lazy(() => import("./pages/Auth"));
const ManageUsers = lazy(() => import("./pages/ManageUsers"));
const EditUser = lazy(() => import("./pages/EditUser"));
const EditHealthConcern = lazy(() => import("./pages/EditHealthConcern"));
const Explore = lazy(() => import("./pages/Explore"));
const ExploreDetail = lazy(() => import("./pages/ExploreDetail"));
const ManageVideos = lazy(() => import("./pages/ManageVideos"));
const EditVideo = lazy(() => import("./pages/EditVideo"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const HealthConcerns = lazy(() => import("./pages/HealthConcerns"));
const HealthConcernDetail = lazy(() => import("./pages/HealthConcernDetail"));
const Post = lazy(() => import("./pages/Post"));

// Settings pages
const SettingsProfile = lazy(() => import("./pages/settings/Profile"));
const SettingsSecurity = lazy(() => import("./pages/settings/Security"));
const SettingsNotifications = lazy(() => import("./pages/settings/Notifications"));
const SettingsPrivacy = lazy(() => import("./pages/settings/Privacy"));

const Routes = () => {
  return (
    <RouterRoutes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LazyComponent><Home /></LazyComponent>} />
        <Route path="post" element={<LazyComponent><Post /></LazyComponent>} />
        <Route path="explore">
          <Route index element={<LazyComponent><Explore /></LazyComponent>} />
          <Route path=":id" element={<LazyComponent><ExploreDetail /></LazyComponent>} />
        </Route>
        <Route path="experts" element={<LazyComponent><Experts /></LazyComponent>} />
        <Route path="experts/:id" element={<LazyComponent><ExpertProfile /></LazyComponent>} />
        <Route path="remedies">
          <Route index element={<LazyComponent><Remedies /></LazyComponent>} />
          <Route path=":id" element={<LazyComponent><RemedyDetail /></LazyComponent>} />
          <Route path="create" element={<LazyComponent><CreateRemedy /></LazyComponent>} />
        </Route>
        <Route path="ingredients" element={<LazyComponent><Ingredients /></LazyComponent>} />
        <Route path="health-concerns" element={<LazyComponent><HealthConcerns /></LazyComponent>} />
        <Route path="health-concerns/:id" element={<LazyComponent><HealthConcernDetail /></LazyComponent>} />
        <Route path="news" element={<LazyComponent><News /></LazyComponent>} />
        <Route path="news/:id" element={<LazyComponent><NewsArticle /></LazyComponent>} />
        <Route path="news/videos/:id" element={<LazyComponent><EditVideo /></LazyComponent>} />
        <Route path="users/:id" element={<LazyComponent><UserProfile /></LazyComponent>} />
        
        {/* Settings Routes */}
        <Route path="settings">
          <Route path="profile" element={<LazyComponent><SettingsProfile /></LazyComponent>} />
          <Route path="security" element={<LazyComponent><SettingsSecurity /></LazyComponent>} />
          <Route path="notifications" element={<LazyComponent><SettingsNotifications /></LazyComponent>} />
          <Route path="privacy" element={<LazyComponent><SettingsPrivacy /></LazyComponent>} />
        </Route>
        
        <Route path="admin" element={<LazyComponent><Admin /></LazyComponent>}>
          <Route index element={<LazyComponent><AdminDashboard /></LazyComponent>} />
          <Route path="users">
            <Route index element={<LazyComponent><ManageUsers /></LazyComponent>} />
            <Route path=":id" element={<LazyComponent><EditUser /></LazyComponent>} />
          </Route>
          <Route path="experts">
            <Route index element={<LazyComponent><ManageExperts /></LazyComponent>} />
            <Route path=":id" element={<LazyComponent><EditExpert /></LazyComponent>} />
            <Route path="new" element={<LazyComponent><EditExpert /></LazyComponent>} />
          </Route>
          <Route path="remedies">
            <Route index element={<LazyComponent><ManageRemedies /></LazyComponent>} />
            <Route path="edit/:id" element={<LazyComponent><EditRemedy /></LazyComponent>} />
          </Route>
          <Route path="health-concerns">
            <Route index element={<LazyComponent><ManageHealthConcerns /></LazyComponent>} />
            <Route path=":id" element={<LazyComponent><EditHealthConcern /></LazyComponent>} />
            <Route path="new" element={<LazyComponent><EditHealthConcern /></LazyComponent>} />
          </Route>
          <Route path="ingredients">
            <Route index element={<LazyComponent><ManageIngredients /></LazyComponent>} />
            <Route path=":id" element={<LazyComponent><IngredientDetail /></LazyComponent>} />
          </Route>
          <Route path="news">
            <Route index element={<LazyComponent><ManageNews /></LazyComponent>} />
            <Route path="articles" element={<LazyComponent><ManageNewsArticles /></LazyComponent>} />
            <Route path="videos" element={<LazyComponent><ManageNewsVideos /></LazyComponent>} />
            <Route path="latest" element={<LazyComponent><ManageLatestVideos /></LazyComponent>} />
            <Route path=":id" element={<LazyComponent><EditNews /></LazyComponent>} />
            <Route path="videos/:id" element={<LazyComponent><EditVideo /></LazyComponent>} />
          </Route>
          <Route path="videos">
            <Route index element={<LazyComponent><ManageVideos /></LazyComponent>} />
            <Route path=":id" element={<LazyComponent><EditVideo /></LazyComponent>} />
          </Route>
        </Route>
        
        {/* Redirect old symptoms routes to health-concerns */}
        <Route path="symptoms" element={<Navigate to="/health-concerns" replace />} />
        <Route path="symptoms/:id" element={<Navigate to="/health-concerns" replace />} />
        
        <Route path="auth" element={<LazyComponent><Auth /></LazyComponent>} />
        <Route path="*" element={<LazyComponent><NotFound /></LazyComponent>} />
      </Route>
    </RouterRoutes>
  );
};

export default Routes;
