
import { BellIcon, WalletIcon, ChartBarIcon, LockIcon } from "lucide-react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-midnight">
      <nav className="glass-card fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold text-white">
            <span className="text-neon">Luxe</span>AI
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <button className="p-2 hover-glow rounded-lg">
            <BellIcon className="w-5 h-5 text-white" />
          </button>
          <div className="glass-card px-4 py-2 rounded-full flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-neon to-purple" />
            <span className="text-white">John Doe</span>
          </div>
        </div>
      </nav>
      
      <div className="flex h-screen pt-20">
        <aside className="glass-card fixed left-0 top-20 h-[calc(100vh-5rem)] w-20 flex flex-col items-center py-6 space-y-8">
          <button className="p-3 rounded-lg hover-glow bg-white/5">
            <ChartBarIcon className="w-6 h-6 text-neon" />
          </button>
          <button className="p-3 rounded-lg hover-glow bg-white/5">
            <WalletIcon className="w-6 h-6 text-white" />
          </button>
          <button className="p-3 rounded-lg hover-glow bg-white/5">
            <LockIcon className="w-6 h-6 text-white" />
          </button>
        </aside>
        
        <main className="flex-1 ml-20 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
