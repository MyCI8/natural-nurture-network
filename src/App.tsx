
import { Route, Routes } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="auth" element={<Auth />} />

          {/* Admin Routes */}
          <Route path="admin/news" element={<ManageNews />} />
          <Route path="admin/news/articles" element={<ManageNewsArticles />} />
          <Route path="admin/news/videos" element={<ManageNewsVideos />} />
          <Route path="admin/news/latest" element={<ManageLatestVideos />} />
          <Route path="admin/news/settings" element={<NewsSettings />} />
          <Route path="admin/news/:id" element={<EditNews />} />
          <Route path="admin/news/new" element={<EditNews />} />
          <Route path="admin/videos" element={<ManageVideos />} />
          <Route path="admin/videos/:id" element={<EditVideo />} />
          <Route path="admin/videos/new" element={<EditVideo />} />
          
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
