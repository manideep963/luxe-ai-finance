
import { 
  HomeIcon, 
  LineChartIcon, 
  WalletIcon, 
  CreditCardIcon, 
  TrendingUpIcon, 
  MessageSquareIcon, 
  SearchIcon
} from "lucide-react";
import { Link } from "react-router-dom";

const navigationItems = [
  { name: "Home", icon: HomeIcon, path: "/" },
  { name: "Analytics", icon: LineChartIcon, path: "/analytics" },
  { name: "Wallet", icon: WalletIcon, path: "/wallet" },
  { name: "Transactions", icon: CreditCardIcon, path: "/transactions" },
  { name: "Markets", icon: TrendingUpIcon, path: "/markets" },
  { name: "AI Assistant", icon: MessageSquareIcon, path: "/ai-assistant" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-midnight flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0D1119] border-r border-white/10">
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
        <nav className="px-2">
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
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Top Navigation */}
        <nav className="glass-card sticky top-0 z-50 px-6 py-4 flex items-center justify-end border-b border-white/10">
          <div className="flex items-center space-x-4">
            <button className="p-2 hover-glow rounded-lg">
              <MessageSquareIcon className="w-5 h-5 text-white/70 hover:text-white transition-colors" />
            </button>
            <div className="glass-card px-4 py-2 rounded-full flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon to-purple" />
              <span className="text-white/90">John Doe</span>
            </div>
          </div>
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
