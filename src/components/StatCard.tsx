import React from "react";
import { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
  delay?: number;
}

export const StatCard = ({ label, value, icon: Icon, color, bg, delay = 0 }: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center justify-between"
    >
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{label}</p>
        <p className="text-3xl font-bold text-foreground">{value}</p>
      </div>
      <div className={cn(bg, color, "p-3 rounded-xl")}>
        <Icon className="w-6 h-6" />
      </div>
    </motion.div>
  );
};
