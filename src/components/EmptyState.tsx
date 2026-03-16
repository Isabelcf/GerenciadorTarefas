import React from "react";
import { Filter } from "lucide-react";
import { motion } from "motion/react";

export const EmptyState = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="py-20 flex flex-col items-center justify-center text-zinc-400 text-center"
    >
      <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-4">
        <Filter className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-medium text-zinc-900">Nenhuma tarefa encontrada</h3>
      <p className="text-sm max-w-[250px] mt-1">
        Comece adicionando uma nova tarefa usando o formulário ao lado.
      </p>
    </motion.div>
  );
};
