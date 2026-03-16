import React from "react";
import { Task, Priority, Category } from "@/src/types";
import { CheckCircle2, Circle, Trash2, Clock, Tag, Share2, Database, Layout, MessageSquare, BarChart3, Timer } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onJoin?: (id: string) => void;
  onClick?: (task: Task) => void;
}

const priorityConfig: Record<Priority, { color: string, bg: string, border: string, label: string }> = {
  low: { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', label: 'Baixa' },
  medium: { color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200', label: 'Média' },
  high: { color: 'text-slate-900', bg: 'bg-slate-200', border: 'border-slate-300', label: 'Alta' },
};

const categoryLabels: Record<Category, string> = {
  trabalho: 'Trabalho',
  estudos: 'Estudos',
  pessoal: 'Pessoal',
  saude: 'Saúde',
  outros: 'Outros',
};

const sourceIcons: Record<string, React.ElementType> = {
  'google-sheets': Database,
  'trello': Layout,
  'notion': Database,
  'asana': Layout,
  'hubspot': BarChart3,
  'slack': MessageSquare,
  'local': CheckCircle2
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onJoin, onClick }) => {
  const priority = priorityConfig[task.priority];
  const SourceIcon = sourceIcons[task.source || 'local'] || Share2;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onClick?.(task)}
      className={cn(
        "bg-card rounded-xl border border-border p-4 group transition-all hover:shadow-md cursor-pointer",
        task.completed && "opacity-60",
        task.inProgress && "border-slate-900/20 bg-slate-50/30"
      )}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={cn(
            "mt-1 transition-colors shrink-0",
            task.completed ? "text-slate-900" : "text-slate-300 hover:text-slate-600"
          )}
        >
          {task.completed ? <CheckCircle2 className="w-5 h-5 fill-slate-100" /> : <Circle className="w-5 h-5" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className={cn(
              "font-medium text-slate-900 truncate text-sm sm:text-base",
              task.completed && "line-through text-slate-400"
            )}>
              {task.title}
            </h3>
            <span className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-tight",
              priority.color, priority.bg, priority.border
            )}>
              {priority.label}
            </span>
            {task.inProgress && !task.completed && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white uppercase tracking-tight">
                Em andamento
              </span>
            )}
            {task.source && task.source !== 'local' && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-tight flex items-center gap-1">
                <SourceIcon className="w-2.5 h-2.5" />
                {task.source.replace('-', ' ')}
              </span>
            )}
            {task.timerIsRunning && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500 text-white uppercase tracking-tight flex items-center gap-1 animate-pulse shadow-sm">
                <Timer className="w-2.5 h-2.5" />
                {Math.floor((task.timerSeconds ?? 1500) / 60)}:{(task.timerSeconds ?? 1500) % 60 < 10 ? '0' : ''}{(task.timerSeconds ?? 1500) % 60}
              </span>
            )}
            {!task.timerIsRunning && task.timerSeconds !== undefined && task.timerSeconds < 1500 && task.timerSeconds > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-tight flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {Math.floor(task.timerSeconds / 60)}:{task.timerSeconds % 60 < 10 ? '0' : ''}{task.timerSeconds % 60}
              </span>
            )}
          </div>
          
          <p className={cn(
            "text-xs sm:text-sm text-slate-500 mb-3 line-clamp-2",
            task.completed && "line-through opacity-50"
          )}>
            {task.description || 'Sem descrição'}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-[10px] sm:text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                <span>{categoryLabels[task.category]}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(task.createdAt).toLocaleDateString('pt-BR')}</span>
              </div>
              {task.totalTimeSpent && (
                <div className="flex items-center gap-1 text-emerald-600 font-bold">
                  <Timer className="w-3 h-3" />
                  <span>{Math.floor(task.totalTimeSpent / 60)}m {task.totalTimeSpent % 60}s</span>
                </div>
              )}
            </div>

            {!task.completed && !task.inProgress && onJoin && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-7 text-[10px] px-2 font-bold uppercase tracking-wider"
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin(task.id);
                }}
              >
                Iniciar
              </Button>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="h-8 w-8 text-slate-300 hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
};
