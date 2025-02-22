
import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareIcon, MicIcon, SendIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AIAssistant() {
  const [message, setMessage] = useState("");

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    // This would integrate with Gemini API
    setMessage("");
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 h-[calc(100vh-theme(spacing.32))]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-3xl font-bold text-white">AI Assistant</h1>
        </motion.div>

        {/* Chat Area */}
        <div className="flex flex-col h-full">
          <div className="flex-1 glass-card p-6 mb-6 overflow-y-auto">
            {/* Welcome Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 rounded-lg p-4 max-w-2xl mx-auto"
            >
              <div className="flex items-center space-x-3 mb-2">
                <MessageSquareIcon className="w-6 h-6 text-neon" />
                <span className="text-white font-medium">AI Assistant</span>
              </div>
              <p className="text-white/80">
                Hello! I'm your AI financial assistant. I can help you with:
              </p>
              <ul className="mt-2 space-y-1 text-white/60">
                <li>• Analyzing your spending patterns</li>
                <li>• Providing investment recommendations</li>
                <li>• Answering financial questions</li>
                <li>• Creating budget plans</li>
              </ul>
            </motion.div>
          </div>

          {/* Input Area */}
          <div className="flex items-center space-x-4 glass-card p-4">
            <Button variant="outline" className="glass-card">
              <MicIcon className="w-5 h-5" />
            </Button>
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about your finances..."
              className="flex-1 glass-card bg-white/5 border-white/10 text-white"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} className="bg-neon hover:bg-neon/90">
              <SendIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
