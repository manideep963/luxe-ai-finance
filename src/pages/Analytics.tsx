
import { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuitIcon, CalendarIcon, TrendingUpIcon, WalletIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { AnalyticsChart } from "@/components/stats/AnalyticsChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type TimeFrame = "1D" | "7D" | "1M" | "6M" | "1Y";

export default function Analytics() {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>("7D");
  
  const { data: aiInsights } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: async () => {
      // In a real app, this would call your AI service
      return [
        {
          type: "warning",
          title: "Spending Alert",
          message: "Your entertainment expenses increased by 20% this month. Consider budgeting!",
        },
        {
          type: "success",
          title: "Savings Opportunity",
          message: "You've spent less on groceries this week. Keep up the savings!",
        },
      ];
    },
  });

  const timeFrames: TimeFrame[] = ["1D", "7D", "1M", "6M", "1Y"];

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-3xl font-bold text-white"
          >
            Financial Analytics
          </motion.h1>

          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-white/60" />
            <div className="flex bg-white/5 rounded-lg p-1">
              {timeFrames.map((frame) => (
                <Button
                  key={frame}
                  variant="ghost"
                  className={`px-3 py-1 text-sm ${
                    selectedTimeFrame === frame
                      ? "bg-neon/20 text-neon"
                      : "text-white/60 hover:text-white"
                  }`}
                  onClick={() => setSelectedTimeFrame(frame)}
                >
                  {frame}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <WalletIcon className="w-6 h-6 text-neon" />
                <h3 className="text-xl font-semibold text-white">Spending Breakdown</h3>
              </div>
            </div>
            <AnalyticsChart type="spending" timeFrame={selectedTimeFrame} />
          </motion.div>

          {/* Income Trends */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <TrendingUpIcon className="w-6 h-6 text-neon" />
                <h3 className="text-xl font-semibold text-white">Income Trends</h3>
              </div>
            </div>
            <AnalyticsChart type="income" timeFrame={selectedTimeFrame} />
          </motion.div>
        </div>

        {/* AI Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center space-x-2 mb-6">
            <BrainCircuitIcon className="w-6 h-6 text-neon" />
            <h3 className="text-xl font-semibold text-white">AI-Powered Insights</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {aiInsights?.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white/5 rounded-lg p-4 ${
                  insight.type === "warning" ? "border-l-4 border-yellow-500" : "border-l-4 border-green-500"
                }`}
              >
                <h4 className="text-white font-medium mb-2">{insight.title}</h4>
                <p className="text-white/60 text-sm">{insight.message}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
