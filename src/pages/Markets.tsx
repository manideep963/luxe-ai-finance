
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StarIcon, LineChartIcon, CandlestickChartIcon, NewspaperIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function Markets() {
  const [activeTab, setActiveTab] = useState<"stocks" | "crypto">("stocks");
  const [marketNews, setMarketNews] = useState<string[]>([]);

  const getMarketNews = async () => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate 3 latest important financial market news headlines for ${activeTab}. Format as JSON array of strings.`
              }]
            }]
          })
        }
      );

      const data = await response.json();
      const newsText = data.candidates[0].content.parts[0].text;
      const newsArray = JSON.parse(newsText.replace(/```json\n|\n```/g, ''));
      setMarketNews(newsArray);
    } catch (error) {
      console.error('Error fetching market news:', error);
    }
  };

  useEffect(() => {
    getMarketNews();
  }, [activeTab]);

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

        {/* Latest News Section */}
        <div className="glass-card p-6">
          <div className="flex items-center space-x-2 mb-6">
            <NewspaperIcon className="w-6 h-6 text-neon" />
            <h2 className="text-xl font-semibold text-white">Latest Market News</h2>
          </div>
          <div className="space-y-4">
            {marketNews.map((news, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass-card p-4 hover:border-neon/30 transition-all duration-300"
              >
                <p className="text-white/80">{news}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Market Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Coming Soon</h3>
            <p className="text-white/60">Market data integration in progress...</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
