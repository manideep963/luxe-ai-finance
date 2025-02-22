
import { 
  HomeIcon, 
  LineChartIcon, 
  CreditCardIcon, 
  TrendingUpIcon, 
  MessageSquareIcon, 
  SearchIcon,
  LogInIcon,
  Settings2Icon,
  UserRoundIcon,
  BellIcon,
  SunIcon,
  MoonIcon
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const navigationItems = [
  { name: "Home", icon: HomeIcon, path: "/" },
  { name: "Analytics", icon: LineChartIcon, path: "/analytics" },
  { name: "Transactions", icon: CreditCardIcon, path: "/transactions" },
  { name: "Markets", icon: TrendingUpIcon, path: "/markets" },
  { name: "Upcoming Bills", icon: BellIcon, path: "/bills" },
  { name: "AI Assistant", icon: MessageSquareIcon, path: "/ai-assistant" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('light-mode');
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "Come back soon!",
      });
      
      navigate("/auth");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-midnight flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0D1119] border-r border-white/10 flex flex-col">
        {/* Logo */}
        <div className="px-6 py-8">
          <h1 className="text-2xl font-bold">
            <span className="text-neon">Finance</span>
            <span className="text-white">AI</span>
          </h1>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search features..."
              className="w-full glass-input pl-10 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-2 flex-1">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center space-x-3 px-4 py-3 mb-1 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Bottom Section with Settings and User Profile */}
        <div className="px-2 py-4 border-t border-white/10">
          <Button
            onClick={toggleDarkMode}
            variant="ghost"
            className="w-full flex items-center justify-start space-x-3 px-4 py-3 mb-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5"
          >
            {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            <span className="text-sm font-medium">
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </Button>
          
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start space-x-3 px-4 py-3 mb-2 rounded-lg text-white/60 hover:text-white hover:bg-white/5"
              >
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
                    <h3 className="text-lg font-semibold">John Doe</h3>
                    <p className="text-sm text-muted-foreground">john@example.com</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Account Settings</h4>
                  <div className="space-y-1">
                    <Button variant="outline" className="w-full justify-start">
                      <UserRoundIcon className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings2Icon className="w-4 h-4 mr-2" />
                      Preferences
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-white/5">
            <div className="p-2 rounded-full bg-gradient-to-r from-neon to-purple flex items-center justify-center">
              <UserRoundIcon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">John Doe</p>
              <p className="text-xs text-white/60">john@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Navigation */}
        <nav className="glass-card sticky top-0 z-50 px-6 py-4 flex items-center justify-end border-b border-white/10">
          <Button
            variant="outline"
            className="glass-input hover:bg-white/10 flex items-center space-x-2"
            onClick={handleSignOut}
          >
            <LogInIcon className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </nav>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
