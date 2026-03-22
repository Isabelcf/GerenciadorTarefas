import React from "react";
import { Filter } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "../contexts/LanguageContext";

export const EmptyState = () => {
  const { t } = useLanguage();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-20 flex flex-col items-center justify-center text-muted-foreground text-center"
    >
      <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mb-4">
        <Filter className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-medium text-foreground">{t('noTasksFound')}</h3>
      <p className="text-sm max-w-[250px] mt-1">
        {t('startByAddingTask')}
      </p>
    </motion.div>
  );
};
