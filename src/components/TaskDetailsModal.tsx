/**
 * COMPONENTE: TASKDETAILSMODAL (MODAL DE DETALHES DA TAREFA)
 * 
 * Este modal é o "Centro de Comando" de uma tarefa específica.
 * Ele permite gerenciar o checklist de sub-tarefas e controlar o Timer Pomodoro.
 * 
 * Funcionalidades principais:
 * - Visualização detalhada da tarefa (título, descrição, prioridade, categoria).
 * - Timer Pomodoro integrado com persistência de tempo gasto.
 * - Checklist interativo com barra de progresso dinâmica.
 * - Edição em tempo real de itens do checklist.
 * 
 * Estilo Visual (Playful Soft UI):
 * - Cantos arredondados generosos (`rounded-[2.5rem]`).
 * - Bordas 3D (`border-b-8`) em elementos de destaque como o widget de timer.
 * - Animações de pulso e transições suaves para feedback de estado.
 * - Barra de progresso com gradiente e sombra interna.
 */

import React, { useState } from 'react';
/* Importação de componentes de diálogo do Radix UI estilizados para o projeto */
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
/* Importação de tipos para garantir a estrutura correta dos dados */
import { Task, ChecklistItem } from "@/src/types";
/* Importação de ícones da biblioteca Lucide-React para ilustrar ações e estados */
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Trash2, 
  Clock, 
  Tag, 
  CheckSquare,
  Play,
  Pause,
  RotateCcw,
  Timer
} from "lucide-react";
/* Importação de componentes de UI base do design system */
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";
/* Utilitário para manipulação inteligente de classes CSS */
import { cn } from "@/src/lib/utils";

/**
 * INTERFACE: TaskDetailsModalProps
 * Define os dados e funções que o modal precisa para operar.
 */
interface TaskDetailsModalProps {
  task: Task | null; /* A tarefa selecionada ou null se fechado */
  isOpen: boolean; /* Controla a visibilidade do modal */
  onClose: () => void; /* Função para fechar o modal */
  onUpdateTask: (task: Task) => void; /* Função para salvar alterações na tarefa */
}

/**
 * COMPONENTE: TaskDetailsModal
 */
export function TaskDetailsModal({ task, isOpen, onClose, onUpdateTask }: TaskDetailsModalProps) {
  /* ESTADO: Texto temporário para o campo de nova sub-tarefa */
  const [newItemText, setNewItemText] = useState('');

  /* Se não houver tarefa selecionada, o modal não deve renderizar nada */
  if (!task) return null;

  /**
   * FUNÇÃO: handleAddChecklistItem
   * Adiciona um novo item à lista de sub-tarefas.
   */
  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(), /* Gera um ID único para o novo item */
      text: newItemText.trim(),
      completed: false,
    };

    /* Atualiza a tarefa com o novo checklist */
    const updatedTask = {
      ...task,
      checklist: [...(task.checklist || []), newItem],
    };

    onUpdateTask(updatedTask);
    setNewItemText(''); /* Limpa o campo de texto */
  };

  /**
   * FUNÇÃO: toggleChecklistItem
   * Marca ou desmarca um item específico do checklist.
   */
  const toggleChecklistItem = (itemId: string) => {
    const updatedChecklist = (task.checklist || []).map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    onUpdateTask({
      ...task,
      checklist: updatedChecklist,
    });
  };

  /**
   * FUNÇÃO: deleteChecklistItem
   * Remove um item do checklist.
   */
  const deleteChecklistItem = (itemId: string) => {
    const updatedChecklist = (task.checklist || []).filter(item => item.id !== itemId);

    onUpdateTask({
      ...task,
      checklist: updatedChecklist,
    });
  };

  /**
   * FUNÇÃO: updateChecklistItemText
   * Permite editar o texto de uma sub-tarefa já existente.
   */
  const updateChecklistItemText = (itemId: string, newText: string) => {
    const updatedChecklist = (task.checklist || []).map(item => 
      item.id === itemId ? { ...item, text: newText } : item
    );

    onUpdateTask({
      ...task,
      checklist: updatedChecklist,
    });
  };

  /**
   * FUNÇÃO: toggleTimer
   * Inicia ou pausa o cronômetro Pomodoro.
   */
  const toggleTimer = () => {
    onUpdateTask({
      ...task,
      timerIsRunning: !task.timerIsRunning,
      timerSeconds: task.timerSeconds ?? 1500, /* 25 minutos por padrão */
      inProgress: true /* Garante que a tarefa esteja marcada como ativa */
    });
  };

  /**
   * FUNÇÃO: resetTimer
   * Reinicia o cronômetro para os 25 minutos iniciais.
   */
  const resetTimer = () => {
    onUpdateTask({
      ...task,
      timerIsRunning: false,
      timerSeconds: 1500
    });
  };

  /**
   * FUNÇÃO: clearTimer
   * Remove completamente os dados do timer da tarefa.
   */
  const clearTimer = () => {
    onUpdateTask({
      ...task,
      timerIsRunning: false,
      timerSeconds: undefined,
      totalTimeSpent: undefined
    });
  };

  /**
   * UTILITÁRIO: formatTime
   * Converte segundos em formato legível (ex: 25:00).
   */
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  /**
   * UTILITÁRIO: formatTotalTime
   * Formata o tempo total acumulado em horas, minutos e segundos.
   */
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

  /* CÁLCULOS DE PROGRESSO: Para a barra visual e contador */
  const completedCount = (task.checklist || []).filter(item => item.completed).length;
  const totalCount = (task.checklist || []).length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* CONTEÚDO DO MODAL: Estilizado com bordas grossas e cantos arredondados */}
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-y-auto rounded-[2rem] sm:rounded-[3rem] border-4 border-slate-200 p-6 sm:p-10 shadow-2xl">
        
        {/* CABEÇALHO: Status, Prioridade e Título */}
        <DialogHeader className="space-y-4 sm:space-y-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Badge de Prioridade com cores temáticas */}
            <span className={cn(
              "text-[8px] sm:text-[10px] font-black px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl uppercase tracking-[0.2em] border-2 border-b-4",
              task.priority === 'high' ? "bg-red-50 text-red-600 border-red-200" :
              task.priority === 'medium' ? "bg-duo-yellow/10 text-duo-yellow-dark border-duo-yellow/20" :
              "bg-slate-50 text-slate-600 border-slate-200"
            )}>
              {task.priority === 'high' ? '🔥 Crítica' : 
               task.priority === 'medium' ? '⚡ Importante' : '🍃 Leve'}
            </span>
            {/* Badge de Status: Em Foco */}
            {task.inProgress && (
              <span className="text-[8px] sm:text-[10px] font-black px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-me-purple text-white uppercase tracking-[0.2em] border-b-4 border-purple-900 shadow-lg">
                Em Foco
              </span>
            )}
            {/* Badge de Status: Concluída */}
            {task.completed && (
              <span className="text-[8px] sm:text-[10px] font-black px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-duo-green text-white uppercase tracking-[0.2em] border-b-4 border-green-800 shadow-lg">
                Concluída
              </span>
            )}
          </div>

          <DialogTitle className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter italic uppercase">{task.title}</DialogTitle>
          
          {/* DESCRIÇÃO: Card com fundo suave e borda 3D */}
          <DialogDescription className="text-slate-600 font-bold text-base sm:text-xl leading-relaxed bg-slate-50 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-slate-100 italic">
            {task.description || 'Nenhum detalhe adicional foi registrado para esta missão.'}
          </DialogDescription>
        </DialogHeader>

        {/* METADADOS: Categoria e Data de Criação */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-[10px] sm:text-xs font-black text-slate-400 my-6 sm:my-8 px-2 sm:px-4">
          <div className="flex items-center gap-2 bg-slate-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="uppercase tracking-widest">{task.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="uppercase tracking-widest">Iniciada em {new Date(task.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* WIDGET: TIMER POMODORO (Estilo Hardware/Widget) */}
        <div className="bg-white border-4 border-slate-200 border-b-[8px] sm:border-b-[12px] rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 mb-8 sm:mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 group/timer transition-all hover:border-slate-300">
          <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto">
            {/* Círculo Visual do Timer */}
            <div className={cn(
              "w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2rem] border-4 flex items-center justify-center transition-all duration-500 shadow-xl sm:shadow-2xl shrink-0",
              task.timerIsRunning ? "border-red-500 bg-red-50 animate-pulse" : "border-slate-200 bg-white"
            )}>
              <Timer className={cn("w-8 h-8 sm:w-12 sm:h-12", task.timerIsRunning ? "text-red-500" : "text-slate-200")} />
            </div>
            <div className="flex-1">
              {/* Display do Tempo Restante */}
              <div className="text-3xl sm:text-5xl font-black tracking-tighter tabular-nums text-slate-900 leading-none italic">
                {formatTime(task.timerSeconds ?? 1500)}
              </div>
              <div className="flex flex-col gap-1 mt-2 sm:mt-3">
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Modo Foco Pomodoro</span>
                {/* Tempo Total Acumulado */}
                {task.totalTimeSpent && (
                  <span className="text-[8px] sm:text-[10px] font-black text-duo-green uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                    <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4" /> Esforço: {formatTotalTime(task.totalTimeSpent)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CONTROLES DO TIMER: Botões grandes e táteis */}
          <div className="flex flex-col gap-3 sm:gap-4 w-full sm:w-auto">
            <Button 
              size="lg" 
              onClick={toggleTimer}
              variant={task.timerIsRunning ? "default" : "duo"}
              className={cn(
                "h-12 sm:h-16 px-6 sm:px-10 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all shadow-lg sm:shadow-xl",
                task.timerIsRunning && "bg-slate-900 hover:bg-slate-800 border-b-4 sm:border-b-8 border-slate-950"
              )}
            >
              {task.timerIsRunning ? (
                <><Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 fill-current" /> Pausar</>
              ) : (
                <><Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 fill-current" /> Iniciar</>
              )}
            </Button>
            
            {/* Botões Secundários: Reset e Limpar */}
            <div className="flex items-center gap-3 sm:gap-4 justify-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={resetTimer}
                title="Reiniciar Timer"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl text-slate-300 hover:text-slate-900 hover:bg-slate-100 border-2 border-transparent hover:border-slate-200"
              >
                <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearTimer}
                title="Limpar Dados do Timer"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-red-100"
              >
                <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-6 sm:my-10 bg-slate-100 h-1 rounded-full" />

        {/* SEÇÃO: CHECKLIST DA MISSÃO (Sub-tarefas) */}
        <div className="space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 sm:px-4">
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 sm:gap-4 uppercase italic tracking-tighter">
              <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-me-blue" />
              Checklist
            </h4>
            {/* Contador de Progresso */}
            {totalCount > 0 && (
              <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-slate-100 self-start sm:self-auto">
                {completedCount} de {totalCount} Concluídos
              </span>
            )}
          </div>

          {/* BARRA DE PROGRESSO VISUAL: Estilo Soft UI com sombra interna */}
          {totalCount > 0 && (
            <div className="w-full bg-slate-100 h-4 sm:h-6 rounded-full overflow-hidden border-2 sm:border-4 border-slate-200 shadow-inner">
              <div 
                className="bg-me-blue h-full transition-all duration-1000 shadow-[inset_0_4px_8px_rgba(255,255,255,0.4)] relative" 
                style={{ width: `${progress}%` }}
              >
                {/* Efeito de brilho na barra de progresso */}
                <div className="absolute top-0 left-0 w-full h-1 bg-white/20" />
              </div>
            </div>
          )}

          {/* INPUT PARA NOVA SUB-TAREFA */}
          <form onSubmit={handleAddChecklistItem} className="flex gap-2 sm:gap-4">
            <Input
              placeholder="Próximo passo?"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="h-12 sm:h-16 text-base sm:text-lg rounded-xl sm:rounded-[1.5rem] border-2 sm:border-4 border-slate-200 border-b-4 sm:border-b-8 focus:border-me-blue transition-all"
            />
            <Button 
              type="submit" 
              variant="me" 
              size="icon" 
              className="h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded-xl sm:rounded-[1.5rem] shadow-[0_4px_0_0_#1e40af] sm:shadow-[0_8px_0_0_#1e40af] active:shadow-none active:translate-y-[4px] sm:active:translate-y-[8px]"
            >
              <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
            </Button>
          </form>

          {/* LISTA DE ITENS DO CHECKLIST */}
          <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
            {(task.checklist || []).length === 0 ? (
              /* Estado Vazio do Checklist */
              <div className="py-10 sm:py-16 text-center border-4 border-dashed border-slate-100 rounded-[2rem] sm:rounded-[3rem] bg-slate-50/30">
                <p className="text-base sm:text-lg font-bold text-slate-300 italic">Nenhum passo definido.</p>
              </div>
            ) : (
              (task.checklist || []).map((item) => (
                <div 
                  key={item.id} 
                  className={cn(
                    "flex items-center gap-3 sm:gap-5 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 sm:border-4 border-b-4 sm:border-b-8 transition-all group",
                    item.completed 
                      ? "bg-duo-green/5 border-duo-green/20 border-b-duo-green/30 opacity-70" 
                      : "bg-white border-slate-200 border-b-slate-300 hover:border-slate-300"
                  )}
                >
                  {/* Botão de Checkbox Customizado */}
                  <button
                    onClick={() => toggleChecklistItem(item.id)}
                    className={cn(
                      "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 sm:border-4 flex items-center justify-center transition-all shrink-0 shadow-sm sm:shadow-md",
                      item.completed ? "bg-duo-green border-green-800 text-white" : "bg-white border-slate-200 text-transparent hover:border-slate-300"
                    )}
                  >
                    <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>
                  
                  {/* Edição de Texto do Item */}
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => updateChecklistItemText(item.id, e.target.value)}
                    className={cn(
                      "flex-1 bg-transparent border-none focus:ring-0 text-base sm:text-lg font-black p-0 text-slate-800",
                      item.completed && "line-through text-slate-400"
                    )}
                  />

                  {/* Botão de Excluir Sub-tarefa */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteChecklistItem(item.id)}
                    className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl text-slate-200 hover:text-red-500 hover:bg-red-50 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all border-2 border-transparent hover:border-red-100"
                  >
                    <Trash2 className="w-4 h-4 sm:w-6 sm:h-6" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* RODAPÉ DO MODAL: Botão de Fechar */}
        <div className="mt-8 sm:mt-12 flex justify-center">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onClose} 
            className="rounded-xl sm:rounded-[1.5rem] px-10 sm:px-16 h-12 sm:h-16 font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[10px] sm:text-xs border-2 sm:border-4 border-b-4 sm:border-b-8 border-slate-200 hover:bg-slate-50 active:translate-y-[4px] sm:active:translate-y-[8px] active:shadow-none transition-all"
          >
            Fechar Centro
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
