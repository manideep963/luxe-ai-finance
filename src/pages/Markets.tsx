
import { useState } from "react";
import { motion } from "framer-motion";
import { StarIcon, TrendingUpIcon, LineChartIcon, CandlestickChartIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";

export default function Markets() {
  const [activeTab, setActiveTab] = useState<"stocks" | "crypto">("stocks");

  const { data: marketData, isLoading } = useQuery({
    queryKey: ['market-data', activeTab],
    queryFn: async () => {
      // This would be replaced with real API calls
      return [];
    },
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-3xl font-bold text-white">Markets</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="glass-card">
              <StarIcon className="w-5 h-5 mr-2" />
              Watchlist
            </Button>
          </div>
        </motion.div>

        {/* Market Tabs */}
        <div className="flex space-x-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab("stocks")}
            className={`px-6 py-3 text-lg transition-all duration-300 ${
              activeTab === "stocks"
                ? "text-neon border-b-2 border-neon"
                : "text-white/60 hover:text-white"
            }`}
          >
            <LineChartIcon className="w-5 h-5 inline-block mr-2" />
            Stocks
          </button>
          <button
            onClick={() => setActiveTab("crypto")}
            className={`px-6 py-3 text-lg transition-all duration-300 ${
              activeTab === "crypto"
                ? "text-neon border-b-2 border-neon"
                : "text-white/60 hover:text-white"
            }`}
          >
            <CandlestickChartIcon className="w-5 h-5 inline-block mr-2" />
            Crypto
          </button>
        </div>

        {/* Market Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* This would be populated with real market data */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Coming Soon</h3>
            <p className="text-white/60">Market data integration in progress...</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
