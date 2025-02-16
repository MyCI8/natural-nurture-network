
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Leaf, LogOut, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<boolean>(false);
  const navigate = useNavigate();

  const { data: isAdmin } = useQuery({
    queryKey: ["userRole"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('check_is_admin');
      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      return data || false;
    },
    enabled: !!session,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Remedies", path: "/remedies", protected: true },
    { name: "News", path: "/news" },
    { name: "Videos", path: "/videos" },
    { name: "Symptoms", path: "/symptoms" },
    { name: "Experts", path: "/experts" },
    { name: "Shopping List", path: "/shopping", protected: true },
  ];

  const filteredMenuItems = menuItems.filter(item => !item.protected || session);

  return (
    <nav className="bg-white/70 backdrop-blur-sm shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold text-text">BetterTogether</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center"
                onClick={() => navigate("/admin")}
              >
                <Shield className="h-4 w-4" />
                <span className="sr-only">Admin Dashboard</span>
              </Button>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-text-light hover:text-primary p-2 rounded-md"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-16 bg-white shadow-lg border-t min-w-[200px] max-w-fit">
            <div className="px-4 py-2 space-y-1">
              {filteredMenuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="block px-3 py-2 text-text-light hover:text-primary hover:bg-primary-light rounded-md text-right"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {session ? (
                <button
                  onClick={() => {
                    handleSignOut();
                    setIsOpen(false);
                  }}
                  className="w-full text-right px-3 py-2 text-text-light hover:text-primary hover:bg-primary-light rounded-md"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/auth"
                  className="block px-3 py-2 text-text-light hover:text-primary hover:bg-primary-light rounded-md text-right"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
