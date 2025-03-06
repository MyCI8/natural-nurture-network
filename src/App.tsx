
import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Routes from "./routes";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./App.css";
import './styles/news-article.css';

// Create router from our routes
const router = createBrowserRouter([
  {
    path: "*",
    element: <Routes />
  }
]);

function App() {
  useEffect(() => {
    console.log("App mounted");
  }, []);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
