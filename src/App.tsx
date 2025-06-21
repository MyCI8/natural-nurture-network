
import { Toaster } from "sonner";
import Routes from "./routes";
import ScrollToTop from "./components/layout/ScrollToTop";

function App() {
  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" />
      <Routes />
    </>
  );
}

export default App;
