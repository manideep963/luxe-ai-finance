
import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquareIcon, MicIcon, SendIcon, UserIcon } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const GEMINI_API_KEY = 'AIzaSyDlGusr3wiukIQx0p_Fu4t0EFXC8HpzevE';

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const { toast } = useToast();

  const formatMarkdown = (text: string) => {
    // Basic markdown formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    try {
      setIsLoading(true);
      const userMessage = input.trim();
      setInput("");
      
      // Add user message to chat
      setMessages(prev => [...prev, { role: "user", content: userMessage }]);

      // Call Gemini API
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
                text: userMessage + "\n\nPlease format your response using markdown syntax when appropriate."
              }]
            }]
          })
        }
      );

      const responseData = await response.json();
      
      if (responseData.error) {
        throw new Error(responseData.error.message);
      }

      const aiResponse = responseData.candidates[0].content.parts[0].text;
      
      // Format and add AI response to chat
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: aiResponse 
      }]);

      // Update user info if requested
      if (userMessage.toLowerCase().includes("update my info") || 
          userMessage.toLowerCase().includes("change my details")) {
        const user = await supabase.auth.getUser();
        if (user.data.user) {
          setUserInfo({
            name: "Updated User",
            email: user.data.user.email,
            lastUpdated: new Date().toLocaleString()
          });
          toast({
            title: "Profile Updated",
            description: "Your information has been updated successfully.",
          });
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 h-[calc(100vh-theme(spacing.32))]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h1 className="text-3xl font-bold text-white">AI Assistant</h1>
          {userInfo && (
            <div className="flex items-center space-x-2 text-white/70 text-sm">
              <UserIcon className="w-4 h-4" />
              <span>{userInfo.name} • Last updated: {userInfo.lastUpdated}</span>
            </div>
          )}
        </motion.div>

        <div className="flex flex-col h-full">
          <div className="flex-1 glass-card p-6 mb-6 overflow-y-auto">
            {messages.length === 0 ? (
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
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${
                      message.role === "user" ? "ml-auto bg-neon/10" : "mr-auto bg-white/5"
                    } rounded-lg p-4 max-w-2xl`}
                  >
                    <div className="flex items-center space-x-3 mb-2">
                      <MessageSquareIcon className="w-5 h-5 text-neon" />
                      <span className="text-white font-medium capitalize">{message.role}</span>
                    </div>
                    <div 
                      className="text-white/80 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: message.role === "assistant" 
                          ? formatMarkdown(message.content) 
                          : message.content 
                      }}
                    />
                  </motion.div>
                ))}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center text-white/60"
                  >
                    AI is thinking...
                  </motion.div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 glass-card p-4">
            <Button variant="outline" className="glass-card">
              <MicIcon className="w-5 h-5" />
            </Button>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your finances..."
              className="flex-1 glass-card bg-white/5 border-white/10 text-white"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              disabled={isLoading}
            />
            <Button 
              onClick={handleSendMessage} 
              className="bg-neon hover:bg-neon/90"
              disabled={isLoading}
            >
              <SendIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
