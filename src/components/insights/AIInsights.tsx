
import { motion } from "framer-motion";
import { BotIcon, BrainCircuitIcon, TrendingUpIcon } from "lucide-react";

const insights = [
  {
    title: "Savings Opportunity",
    description: "Based on your spending patterns, you could save an additional $420 monthly by optimizing your subscriptions.",
    icon: TrendingUpIcon,
  },
  {
    title: "Investment Suggestion",
    description: "Your risk profile suggests a 60/40 split between stocks and bonds would be optimal.",
    icon: BrainCircuitIcon,
  },
];

export function AIInsights() {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <BotIcon className="w-5 h-5 text-neon" />
        <h2 className="text-xl font-semibold text-white">AI Insights</h2>
      </div>
      
      <div className="grid gap-4">
        {insights.map((insight, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="glass-card p-4 hover:border-neon/30 transition-all duration-300"
          >
            <div className="flex space-x-4">
              <div className="p-2 rounded-full bg-gradient-to-br from-neon/10 to-purple/10">
                <insight.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">{insight.title}</h3>
                <p className="text-white/60 text-sm">{insight.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
