import { HomeIcon, LineChartIcon, CreditCardIcon, TrendingUpIcon, MessageSquareIcon, SearchIcon, LogInIcon, Settings2Icon, UserRoundIcon, BellIcon, SunIcon, MoonIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
const navigationItems = [{
  name: "Home",
  icon: HomeIcon,
  path: "/"
}, {
  name: "Analytics",
  icon: LineChartIcon,
  path: "/analytics"
}, {
  name: "Transactions",
  icon: CreditCardIcon,
  path: "/transactions"
}, {
  name: "Markets",
  icon: TrendingUpIcon,
  path: "/markets"
}, {
  name: "Upcoming Bills",
  icon: BellIcon,
  path: "/bills"
}, {
  name: "AI Assistant",
  icon: MessageSquareIcon,
  path: "/ai-assistant"
}];
const DashboardLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<{
    email: string;
    full_name: string;
  } | null>(null);
  const [editedProfile, setEditedProfile] = useState({
    email: "",
    full_name: ""
  });
  useEffect(() => {
    checkAuthStatus();
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        fetchUserProfile();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserProfile(null);
      }
    });
  }, []);
  const checkAuthStatus = async () => {
    const {
      data: {
        session
      }
    } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    if (session) {
      fetchUserProfile();
    }
  };
  const fetchUserProfile = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        const {
          data,
          error
        } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error) throw error;
        setUserProfile(data);
        setEditedProfile({
          email: data.email || '',
          full_name: data.full_name || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };
  const handleUpdateProfile = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Update email in auth if it changed
      if (editedProfile.email !== userProfile?.email) {
        const {
          error: emailError
        } = await supabase.auth.updateUser({
          email: editedProfile.email
        });
        if (emailError) throw emailError;
      }

      // Update profile information
      const {
        error: profileError
      } = await supabase.from('profiles').update({
        email: editedProfile.email,
        full_name: editedProfile.full_name,
        updated_at: new Date().toISOString()
      }).eq('id', user.id);
      if (profileError) throw profileError;
      setUserProfile({
        ...userProfile!,
        email: editedProfile.email,
        full_name: editedProfile.full_name
      });
      setIsEditingProfile(false);
      toast({
        title: "Success",
        description: "Profile updated successfully"
      });
      await fetchUserProfile();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message
      });
    }
  };
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('light-mode');
  };
  const handleSignOut = async () => {
    try {
      const {
        error
      } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Signed out successfully",
        description: "Come back soon!"
      });
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message
      });
    }
  };
  const handleSignInClick = () => {
    navigate("/auth");
  };
  return <div className="min-h-screen bg-midnight flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0D1119] border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold">
            <span className="text-neon">FORTUNA</span>
            <span className="text-white"></span>
          </h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input type="text" placeholder="Search features..." className="w-full glass-input pl-10 py-2.5 text-sm" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 flex-1">
          {navigationItems.map(item => <Link key={item.name} to={item.path} className="flex items-center space-x-3 px-4 py-3 mb-1 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200">
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>)}
        </nav>

        {/* Bottom Section with Settings and User Profile */}
        <div className="px-2 py-4 border-t border-white/10">
          <Button onClick={toggleDarkMode} variant="ghost" className="w-full flex items-center justify-start space-x-3 px-4 py-3 mb-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5">
            {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            <span className="text-sm font-medium">
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </Button>
          
          {isAuthenticated ? <>
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full flex items-center justify-start space-x-3 px-4 py-3 mb-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5">
                    <Settings2Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">Settings</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>User Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-gradient-to-r from-neon to-purple">
                        <UserRoundIcon className="w-12 h-12 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{userProfile?.full_name}</h3>
                        <p className="text-sm text-muted-foreground">{userProfile?.email}</p>
                      </div>
                    </div>
                    {isEditingProfile ? <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-1 block">Full Name</label>
                          <Input value={editedProfile.full_name} onChange={e => setEditedProfile(prev => ({
                      ...prev,
                      full_name: e.target.value
                    }))} placeholder="Full Name" />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Email</label>
                          <Input type="email" value={editedProfile.email} onChange={e => setEditedProfile(prev => ({
                      ...prev,
                      email: e.target.value
                    }))} placeholder="Email" />
                        </div>
                        <div className="flex space-x-2">
                          <Button onClick={handleUpdateProfile}>Save Changes</Button>
                          <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                        </div>
                      </div> : <div className="space-y-2">
                        <h4 className="text-sm font-medium">Account Settings</h4>
                        <div className="space-y-1">
                          <Button variant="outline" className="w-full justify-start" onClick={() => setIsEditingProfile(true)}>
                            <UserRoundIcon className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                          <Button variant="outline" className="w-full justify-start">
                            <Settings2Icon className="w-4 h-4 mr-2" />
                            Preferences
                          </Button>
                        </div>
                      </div>}
                  </div>
                </DialogContent>
              </Dialog>
              
              <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/5">
                <div className="p-2 rounded-full bg-gradient-to-r from-neon to-purple flex items-center justify-center">
                  <UserRoundIcon className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{userProfile?.full_name}</p>
                  <p className="text-xs text-white/60">{userProfile?.email}</p>
                </div>
              </div>

              <Button variant="ghost" onClick={handleSignOut} className="w-full flex items-center justify-start space-x-3 px-4 py-3 mt-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5">
                <LogInIcon className="w-5 h-5" />
                <span className="text-sm font-medium">Sign Out</span>
              </Button>
            </> : <Button variant="ghost" onClick={handleSignInClick} className="w-full flex items-center justify-start space-x-3 px-4 py-3 mb-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5">
              <LogInIcon className="w-5 h-5" />
              <span className="text-sm font-medium">Sign In</span>
            </Button>}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Navigation */}
        <nav className="glass-card sticky top-0 z-50 px-6 py-4 flex items-center justify-end border-b border-white/10">
          {isAuthenticated ? <Button variant="outline" className="glass-input hover:bg-white/10 flex items-center space-x-2" onClick={handleSignOut}>
              <LogInIcon className="w-4 h-4" />
              <span>Sign Out</span>
            </Button> : <Button variant="outline" className="glass-input hover:bg-white/10 flex items-center space-x-2" onClick={handleSignInClick}>
              <LogInIcon className="w-4 h-4" />
              <span>Sign In</span>
            </Button>}
        </nav>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>;
};
export default DashboardLayout;