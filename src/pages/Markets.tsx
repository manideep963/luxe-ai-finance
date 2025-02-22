
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { StarIcon, LineChartIcon, CandlestickChartIcon, NewspaperIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Using the public API key since it's already exposed in the frontend
const GEMINI_API_KEY = 'AIzaSyDlGusr3wiukIQx0p_Fu4t0EFXC8HpzevE';

export default function Markets() {
  const [activeTab, setActiveTab] = useState<"stocks" | "crypto">("stocks");
  const [marketNews, setMarketNews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const getMarketNews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Generate 3 latest important financial market news headlines for ${activeTab} in 2024. Only return the array of headlines, no additional text or formatting.`
              }]
            }]
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch market news');
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        let newsText = data.candidates[0].content.parts[0].text;
        // Clean up the response to ensure it's valid JSON
        newsText = newsText.replace(/```json\n|\n```|```/g, '');
        try {
          const newsArray = JSON.parse(newsText);
          setMarketNews(Array.isArray(newsArray) ? newsArray : [newsText]);
        } catch (e) {
          // If JSON parsing fails, split by newlines and clean up
          const newsArray = newsText.split('\n').filter(line => line.trim());
          setMarketNews(newsArray);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching market news:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch market news. Please try again later.",
      });
      setMarketNews([
        "Market data temporarily unavailable",
        "Please try again in a few moments",
        "We're working to restore the service"
      ]);
    } finally {
      setIsLoading(false);
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <NewspaperIcon className="w-6 h-6 text-neon" />
              <h2 className="text-xl font-semibold text-white">Latest Market News</h2>
            </div>
            {isLoading && (
              <div className="text-sm text-white/60">Fetching latest news...</div>
            )}
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
            <h3 className="text-xl font-semibold text-white mb-4">Market Overview</h3>
            <p className="text-white/60">
              {activeTab === "stocks" 
                ? "Track major indices and stock performance"
                : "Monitor cryptocurrency market trends"}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
