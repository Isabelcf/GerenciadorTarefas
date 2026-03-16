import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { Task, ChecklistItem } from "@/src/types";
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  X, 
  Clock, 
  Tag, 
  AlertCircle,
  CheckSquare,
  Play,
  Pause,
  RotateCcw,
  Timer
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";
import { cn } from "@/src/lib/utils";

interface TaskDetailsModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTask: (task: Task) => void;
}

export function TaskDetailsModal({ task, isOpen, onClose, onUpdateTask }: TaskDetailsModalProps) {
  const [newItemText, setNewItemText] = useState('');

  if (!task) return null;

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      completed: false,
    };

    const updatedTask = {
      ...task,
      checklist: [...(task.checklist || []), newItem],
    };

    onUpdateTask(updatedTask);
    setNewItemText('');
  };

  const toggleChecklistItem = (itemId: string) => {
    const updatedChecklist = (task.checklist || []).map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    onUpdateTask({
      ...task,
      checklist: updatedChecklist,
    });
  };

  const deleteChecklistItem = (itemId: string) => {
    const updatedChecklist = (task.checklist || []).filter(item => item.id !== itemId);

    onUpdateTask({
      ...task,
      checklist: updatedChecklist,
    });
  };

  const updateChecklistItemText = (itemId: string, newText: string) => {
    const updatedChecklist = (task.checklist || []).map(item => 
      item.id === itemId ? { ...item, text: newText } : item
    );

    onUpdateTask({
      ...task,
      checklist: updatedChecklist,
    });
  };

  const toggleTimer = () => {
    onUpdateTask({
      ...task,
      timerIsRunning: !task.timerIsRunning,
      timerSeconds: task.timerSeconds ?? 1500,
      inProgress: true
    });
  };

  const resetTimer = () => {
    onUpdateTask({
      ...task,
      timerIsRunning: false,
      timerSeconds: 1500
    });
  };

  const clearTimer = () => {
    onUpdateTask({
      ...task,
      timerIsRunning: false,
      timerSeconds: undefined,
      totalTimeSpent: undefined
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatTotalTime = (seconds: number) => {
    if (!seconds) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 || parts.length === 0) parts.push(`${s}s`);
    
    return parts.join(' ');
  };

  const completedCount = (task.checklist || []).filter(item => item.completed).length;
  const totalCount = (task.checklist || []).length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider border",
              task.priority === 'high' ? "bg-red-50 text-red-700 border-red-100" :
              task.priority === 'medium' ? "bg-orange-50 text-orange-700 border-orange-100" :
              "bg-slate-50 text-slate-700 border-slate-100"
            )}>
              {task.priority === 'high' ? 'Alta Prioridade' : 
               task.priority === 'medium' ? 'Média Prioridade' : 'Baixa Prioridade'}
            </span>
            {task.inProgress && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white uppercase tracking-wider">
                Em andamento
              </span>
            )}
            {task.completed && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white uppercase tracking-wider">
                Concluída
              </span>
            )}
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">{task.title}</DialogTitle>
          <DialogDescription className="text-slate-500 mt-2">
            {task.description || 'Sem descrição detalhada.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-400 my-4">
          <div className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            <span className="capitalize">{task.category}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>Criado em {new Date(task.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Compact & Aesthetic Timer Widget */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6 flex items-center justify-between group/timer">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500",
              task.timerIsRunning ? "border-red-500 bg-red-50 animate-pulse" : "border-slate-200 bg-white"
            )}>
              <Timer className={cn("w-6 h-6", task.timerIsRunning ? "text-red-500" : "text-slate-400")} />
            </div>
            <div>
              <div className="text-2xl font-black tracking-tight tabular-nums text-slate-900 leading-none">
                {formatTime(task.timerSeconds ?? 1500)}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pomodoro</span>
                {task.totalTimeSpent && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                      Total: {formatTotalTime(task.totalTimeSpent)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              onClick={toggleTimer}
              className={cn(
                "h-9 px-4 rounded-full font-bold uppercase tracking-wider text-[10px] transition-all",
                task.timerIsRunning 
                  ? "bg-slate-900 text-white hover:bg-slate-800" 
                  : "bg-red-500 text-white hover:bg-red-600 shadow-sm"
              )}
            >
              {task.timerIsRunning ? (
                <><Pause className="w-3 h-3 mr-1.5 fill-current" /> Pausar</>
              ) : (
                <><Play className="w-3 h-3 mr-1.5 fill-current" /> Iniciar</>
              )}
            </Button>
            
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={resetTimer}
                title="Reiniciar Timer"
                className="h-8 w-8 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearTimer}
                title="Excluir Dados do Timer"
                className="h-8 w-8 rounded-full text-slate-400 hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Checklist
            </h4>
            {totalCount > 0 && (
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {completedCount}/{totalCount} ({progress}%)
              </span>
            )}
          </div>

          {totalCount > 0 && (
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-slate-900 h-full transition-all duration-500" 
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <form onSubmit={handleAddChecklistItem} className="flex gap-2">
            <Input
              placeholder="Adicionar item ao checklist..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="h-9 text-sm"
            />
            <Button type="submit" size="sm" className="h-9 px-3">
              <Plus className="w-4 h-4" />
            </Button>
          </form>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {(task.checklist || []).length === 0 ? (
              <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl">
                <p className="text-xs text-slate-400">Nenhum item no checklist ainda.</p>
              </div>
            ) : (
              (task.checklist || []).map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 group transition-colors"
                >
                  <button
                    onClick={() => toggleChecklistItem(item.id)}
                    className={cn(
                      "transition-colors shrink-0",
                      item.completed ? "text-emerald-500" : "text-slate-300 hover:text-slate-600"
                    )}
                  >
                    {item.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </button>
                  
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateChecklistItemText(item.id, e.target.value)}
                    className={cn(
                      "flex-1 bg-transparent border-none focus:ring-0 text-sm p-0",
                      item.completed && "line-through text-slate-400"
                    )}
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteChecklistItem(item.id)}
                    className="h-7 w-7 text-slate-300 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="outline" onClick={onClose} className="text-xs font-bold uppercase tracking-wider">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
