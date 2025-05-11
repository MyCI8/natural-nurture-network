
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import TopHeader from './layout/TopHeader';
import BottomNav from './layout/BottomNav';
import MainSidebar from './layout/MainSidebar';
import RightSection from './layout/RightSection';
import { useIsMobile } from '@/hooks/use-mobile';

// Auth context and provider implementation
interface AuthContextType {
  session: Session | null;
  user: any | null;
  profile: any | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  isLoading: true
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUserData() {
      setIsLoading(true);
      
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        setUser(session.user);
        
        // Fetch the user's profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setProfile(profileData);
      }
      
      setIsLoading(false);
    }
    
    loadUserData();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setProfile(profileData);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return (
    <AuthContext.Provider value={{ session, user, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Layout component that will be the default export
const Layout = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for desktop view */}
      {!isMobile && <MainSidebar />}
      
      {/* Mobile-specific components */}
      {isMobile && <TopHeader />}
      
      {/* Main content area */}
      <main className="flex-1 flex flex-col">
        <Navbar />
        
        <div className="flex-1 pt-16 pb-16 md:pb-0 md:pl-16 lg:pl-64 xl:pl-64">
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </div>
        
        {/* Mobile navigation */}
        {isMobile && <BottomNav />}
      </main>
      
      {/* Right section */}
      <RightSection />
    </div>
  );
};

export default Layout;
