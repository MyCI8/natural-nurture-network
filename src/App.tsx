import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import Admin from "@/pages/Admin";
import ManageRemedies from "@/pages/ManageRemedies";
import ManageNews from "./pages/ManageNews";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/remedies" element={<ManageRemedies />} />
        <Route path="/admin/news" element={<ManageNews />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
};

export default App;