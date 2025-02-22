
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { TrendingUpIcon, TrendingDownIcon, DollarSignIcon } from "lucide-react";

const Index = () => {
  const { toast } = useToast();

  useEffect(() => {
    toast({
      title: "Welcome back!",
      description: "Your portfolio has grown 2.3% since yesterday.",
    });
  }, []);

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
              Welcome back, John
            </h1>
            <p className="text-white/60 mt-2">Here's your financial overview</p>
          </div>
          <button className="glass-card px-6 py-3 rounded-xl hover-glow flex items-center space-x-2">
            <DollarSignIcon className="w-5 h-5 text-neon" />
            <span className="text-white">Quick Transfer</span>
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 neon-border animate-glow-pulse">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/60">Total Balance</p>
                <h3 className="text-2xl font-bold text-white mt-1">$124,578.90</h3>
              </div>
              <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded-lg">
                <TrendingUpIcon className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">+2.3%</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/60">Investments</p>
                <h3 className="text-2xl font-bold text-white mt-1">$89,340.22</h3>
              </div>
              <div className="flex items-center space-x-1 bg-red-500/20 px-2 py-1 rounded-lg">
                <TrendingDownIcon className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">-0.8%</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/60">Savings</p>
                <h3 className="text-2xl font-bold text-white mt-1">$35,238.68</h3>
              </div>
              <div className="flex items-center space-x-1 bg-green-500/20 px-2 py-1 rounded-lg">
                <TrendingUpIcon className="w-4 h-4 text-green-400" />
                <span className="text-sm text-green-400">+1.2%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">AI Insights</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-neon to-purple flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="text-white font-medium">Portfolio Optimization</h4>
                <p className="text-white/60 text-sm">Based on market analysis, consider rebalancing your tech investments.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
