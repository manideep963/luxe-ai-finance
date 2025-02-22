
import { motion } from "framer-motion";
import { BotIcon, BrainCircuitIcon, TrendingUpIcon } from "lucide-react";

interface FinancialData {
  monthly_salary: number;
  total_savings: number;
  monthly_expenditure: number;
}

interface AIInsightsProps {
  financialData?: FinancialData;
}

export function AIInsights({ financialData }: AIInsightsProps) {
  if (!financialData) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center space-x-2">
          <BotIcon className="w-5 h-5 text-neon" />
          <h2 className="text-xl font-semibold text-white">AI Insights</h2>
        </div>
        <p className="text-white/60 mt-4">Loading financial insights...</p>
      </div>
    );
  }

  const savingsRate = ((financialData.total_savings / financialData.monthly_salary) * 100).toFixed(1);
  const expenseRatio = ((financialData.monthly_expenditure / financialData.monthly_salary) * 100).toFixed(1);

  const insights = [
    {
      title: "Savings Analysis",
      description: `Your savings rate is ${savingsRate}% of your monthly income. ${
        parseFloat(savingsRate) < 20 
          ? "Consider increasing your savings to reach the recommended 20% target."
          : "Great job maintaining a healthy savings rate!"
      }`,
      icon: TrendingUpIcon,
    },
    {
      title: "Expense Management",
      description: `Your monthly expenses are ${expenseRatio}% of your income. ${
        parseFloat(expenseRatio) > 70
          ? "Try to reduce expenses to maintain financial health."
          : "You're managing your expenses well!"
      }`,
      icon: BrainCircuitIcon,
    },
  ];

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
