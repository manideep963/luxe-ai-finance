import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PencilIcon, CheckIcon, XIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  change?: {
    value: number;
    trend: "up" | "down";
  };
  icon: React.ComponentType<{ className?: string }>;
  className?: string;
  onEdit?: (newValue: number) => Promise<void>;
  isEditable?: boolean;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  className,
  onEdit,
  isEditable = false
}: StatCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const handleEditStart = () => {
    setEditValue(value.replace(/[^0-9.]/g, ""));
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!onEdit) return;
    
    try {
      await onEdit(Number(editValue));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "glass-card p-6 relative overflow-hidden group",
        "border border-white/10 hover:border-neon/30 transition-all duration-300",
        className
      )}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-neon/10 to-purple/10 blur-3xl rounded-full transform translate-x-16 -translate-y-8" />
      
      <div className="flex justify-between items-start">
        <div className="space-y-2 flex-1">
          <p className="text-white/60 text-sm">{title}</p>
          
          {isEditing ? (
            <div className="flex items-center space-x-2">
              <Input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="w-32"
                autoFocus
              />
              <Button size="sm" variant="ghost" onClick={handleSave}>
                <CheckIcon className="w-4 h-4 text-green-500" />
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancel}>
                <XIcon className="w-4 h-4 text-red-500" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h3 className="text-2xl font-bold text-white">{value}</h3>
              {isEditable && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleEditStart}
                >
                  <PencilIcon className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
          
          {change && (
            <div className={cn(
              "flex items-center space-x-1 text-sm px-2 py-1 rounded-lg w-fit",
              change.trend === "up" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            )}>
              <span>{change.trend === "up" ? "+" : "-"}{Math.abs(change.value)}%</span>
            </div>
          )}
        </div>
        
        <div className="p-3 rounded-xl bg-gradient-to-br from-neon/10 to-purple/10 backdrop-blur-sm">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}
