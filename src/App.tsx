import { Route, Routes } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import ManageNews from "./pages/ManageNews";
import ManageNewsArticles from "./pages/ManageNewsArticles";
import ManageNewsVideos from "./pages/ManageNewsVideos";
import ManageLatestVideos from "./pages/ManageLatestVideos";
import NewsSettings from "./pages/NewsSettings";
import EditNews from "./pages/EditNews";
import EditVideo from "./pages/EditVideo";
import ManageVideos from "./pages/ManageVideos";
import Search from "./pages/Search";
import Auth from "./pages/Auth";
import Users from "./pages/Users";
import EditProfile from "./pages/EditProfile";
import ManageExperts from "./pages/ManageExperts";
import EditExpert from "./pages/EditExpert";
import ManageGeneralVideos from "./pages/ManageGeneralVideos";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import ManageLatestGeneralVideos from "./pages/ManageLatestGeneralVideos";
import ManageNewsActivity from "./pages/ManageNewsActivity";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="search" element={<Search />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="auth" element={<Auth />} />
          <Route path="users/:id" element={<Users />} />
          <Route path="users/:id/edit" element={<EditProfile />} />

          {/* Admin Routes */}
          <Route path="admin/news" element={<ManageNews />} />
          <Route path="admin/news/articles" element={<ManageNewsArticles />} />
          <Route path="admin/news/videos" element={<ManageNewsVideos />} />
          <Route path="admin/news/latest" element={<ManageLatestVideos />} />
          <Route path="admin/news/settings" element={<NewsSettings />} />
          <Route path="admin/news/:id" element={<EditNews />} />
          <Route path="admin/news/new" element={<EditNews />} />
          <Route path="admin/news/activity" element={<ManageNewsActivity />} />
          <Route path="admin/videos" element={<ManageVideos />} />
          <Route path="admin/videos/:id" element={<EditVideo />} />
          <Route path="admin/videos/new" element={<EditVideo />} />
          <Route path="admin/general-videos" element={<ManageGeneralVideos />} />
          <Route path="admin/general-videos/latest" element={<ManageLatestGeneralVideos />} />
          
          <Route path="admin/experts" element={<ManageExperts />} />
          <Route path="admin/experts/:id" element={<EditExpert />} />
          <Route path="admin/experts/new" element={<EditExpert />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
