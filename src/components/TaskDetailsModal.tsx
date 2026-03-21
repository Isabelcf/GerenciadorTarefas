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

import React, { useState, useRef } from 'react';
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
  Timer,
  MessageSquare,
  History,
  Paperclip,
  Link as LinkIcon,
  Send,
  X
} from "lucide-react";
/* Importação de componentes de UI base do design system */
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Separator } from "@/src/components/ui/separator";
/* Importação do sistema de notificações Toast */
import { toast } from 'sonner';
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
  /* ESTADO: Texto temporário para o campo de novo comentário */
  const [newCommentText, setNewCommentText] = useState('');
  /* ESTADO: Anexos temporários para o novo comentário */
  const [attachments, setAttachments] = useState<{ name: string; url: string; type: string }[]>([]);
  /* ESTADO: Aba ativa (Checklist, Comentários ou Histórico) */
  const [activeTab, setActiveTab] = useState<'checklist' | 'comments' | 'history'>('checklist');
  /* REF: Referência para o input de arquivo oculto */
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* Se não houver tarefa selecionada, o modal não deve renderizar nada */
  if (!task) return null;

  /**
   * FUNÇÃO: addHistoryEntry
   * Adiciona um registro ao histórico da tarefa.
   */
  const addHistoryEntry = (action: string, details?: string) => {
    const newEntry = {
      id: crypto.randomUUID(),
      action,
      timestamp: Date.now(),
      details
    };
    return [...(task.history || []), newEntry];
  };

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

    /* Atualiza a tarefa com o novo checklist e histórico */
    const updatedTask = {
      ...task,
      checklist: [...(task.checklist || []), newItem],
      history: addHistoryEntry('Sub-tarefa adicionada', `"${newItem.text}"`)
    };

    onUpdateTask(updatedTask);
    setNewItemText(''); /* Limpa o campo de texto */
  };

  /**
   * FUNÇÃO: toggleChecklistItem
   * Marca ou desmarca um item específico do checklist.
   */
  const toggleChecklistItem = (itemId: string) => {
    const item = (task.checklist || []).find(i => i.id === itemId);
    const updatedChecklist = (task.checklist || []).map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    onUpdateTask({
      ...task,
      checklist: updatedChecklist,
      history: addHistoryEntry(
        item?.completed ? 'Sub-tarefa reaberta' : 'Sub-tarefa concluída', 
        `"${item?.text}"`
      )
    });
  };

  /**
   * FUNÇÃO: deleteChecklistItem
   * Remove um item do checklist.
   */
  const deleteChecklistItem = (itemId: string) => {
    const item = (task.checklist || []).find(i => i.id === itemId);
    const updatedChecklist = (task.checklist || []).filter(item => item.id !== itemId);

    onUpdateTask({
      ...task,
      checklist: updatedChecklist,
      history: addHistoryEntry('Sub-tarefa removida', `"${item?.text}"`)
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
   * UTILITÁRIO: renderTextWithLinks
   * Detecta URLs em um texto e as transforma em links clicáveis.
   */
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, i) => {
      if (part.match(urlRegex)) {
        return (
          <a 
            key={i} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-me-purple hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  /**
   * FUNÇÃO: handleFileClick
   * Aciona o seletor de arquivos oculto.
   */
  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * FUNÇÃO: handleFileChange
   * Processa o arquivo selecionado e adiciona uma referência ao comentário.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newAttachment = {
          name: file.name,
          url: base64String,
          type: file.type
        };
        
        setAttachments(prev => [...prev, newAttachment]);
        
        if (isImage) {
          toast.success(`Imagem "${file.name}" anexada! 📸`);
        } else {
          toast.success(`Arquivo "${file.name}" anexado! 📎`);
        }
      };
      reader.readAsDataURL(file);
      
      /* Limpa o input para permitir selecionar o mesmo arquivo novamente se necessário */
      e.target.value = '';
    }
  };

  /**
   * FUNÇÃO: removeAttachment
   * Remove um anexo da lista temporária.
   */
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * FUNÇÃO: handleAddLink
   * Solicita uma URL ao usuário e a insere no comentário.
   */
  const handleAddLink = () => {
    const url = window.prompt("Insira a URL do link (ex: https://google.com):");
    if (url) {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      setNewCommentText(prev => prev + (prev ? ' ' : '') + formattedUrl + ' ');
    }
  };

  /**
   * FUNÇÃO: handleAddComment
   * Adiciona um novo comentário ou nota à tarefa.
   */
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() && attachments.length === 0) return;

    const newComment = {
      id: crypto.randomUUID(),
      text: newCommentText.trim(),
      createdAt: Date.now(),
      author: 'Você',
      attachments: attachments.length > 0 ? attachments : undefined
    };

    onUpdateTask({
      ...task,
      comments: [...(task.comments || []), newComment],
      history: addHistoryEntry('Comentário adicionado')
    });

    /* Simulação: Refletir comentário no board de integração */
    if (task.source && task.source !== 'local') {
      toast.info(`Nota sincronizada com ${task.source.toUpperCase()}! 🔄`, {
        description: "Seu comentário foi refletido no board de origem."
      });
      console.log(`[Sync] Refletindo comentário na tarefa ${task.id} (${task.source}): ${newComment.text}`);
    }

    setNewCommentText('');
    setAttachments([]);
  };

  /**
   * FUNÇÃO: toggleTimer
   * Inicia ou pausa o cronômetro Pomodoro.
   */
  const toggleTimer = () => {
    if (task.completed) return; /* Bloqueia se concluída */

    const isStarting = !task.timerIsRunning;
    onUpdateTask({
      ...task,
      timerIsRunning: isStarting,
      timerSeconds: task.timerSeconds ?? 1500, /* 25 minutos por padrão */
      inProgress: true, /* Garante que a tarefa esteja marcada como ativa */
      history: addHistoryEntry(isStarting ? 'Timer iniciado' : 'Timer pausado')
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
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-hidden rounded-[2rem] sm:rounded-[3rem] border-4 border-slate-200 p-0 shadow-2xl">
        {/* Container de Scroll Interno: Garante que a barra de rolagem não ultrapasse as bordas arredondadas */}
        <div className="overflow-y-auto overflow-x-hidden max-h-[90vh] p-6 sm:p-10 pr-4 sm:pr-8 custom-scrollbar">
        
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
              <span className="text-[8px] sm:text-[10px] font-black px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-me-purple text-white uppercase tracking-[0.2em] border-b-4 border-me-purple-dark shadow-lg">
                Em Foco
              </span>
            )}
            {/* Badge de Status: Concluída */}
            {task.completed && (
              <span className="text-[8px] sm:text-[10px] font-black px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-duo-green text-white uppercase tracking-[0.2em] border-b-4 border-duo-green-dark shadow-lg">
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
        <div className={cn(
          "bg-white border-4 border-slate-200 border-b-[8px] sm:border-b-[12px] rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 mb-8 sm:mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 group/timer transition-all hover:border-slate-300",
          task.completed && "opacity-80 grayscale-[0.5]"
        )}>
          <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto">
            {/* Círculo Visual do Timer */}
            <div className={cn(
              "w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2rem] border-4 flex items-center justify-center transition-all duration-500 shadow-xl sm:shadow-2xl shrink-0",
              task.timerIsRunning ? "border-red-500 bg-red-50 animate-pulse" : "border-slate-200 bg-white",
              task.completed && "border-slate-300 bg-slate-50"
            )}>
              <Timer className={cn("w-8 h-8 sm:w-12 sm:h-12", task.timerIsRunning ? "text-red-500" : "text-slate-200")} />
            </div>
            <div className="flex-1">
              {/* Display do Tempo Restante ou Tempo Total */}
              <div className="text-3xl sm:text-5xl font-black tracking-tighter tabular-nums text-slate-900 leading-none italic">
                {task.completed ? formatTotalTime(task.totalTimeSpent ?? 0) : formatTime(task.timerSeconds ?? 1500)}
              </div>
              <div className="flex flex-col gap-1 mt-2 sm:mt-3">
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                  {task.completed ? 'Tempo Total Investido' : 'Modo Foco Pomodoro'}
                </span>
                {/* Tempo Total Acumulado (apenas se não estiver concluída, pois já aparece no display principal se estiver) */}
                {!task.completed && task.totalTimeSpent && (
                  <span className="text-[8px] sm:text-[10px] font-black text-duo-green uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                    <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4" /> Esforço: {formatTotalTime(task.totalTimeSpent)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* CONTROLES DO TIMER: Botões grandes e táteis */}
          {!task.completed && (
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
                  disabled={task.completed}
                  title="Reiniciar Timer"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl text-slate-300 hover:text-slate-900 hover:bg-slate-100 border-2 border-transparent hover:border-slate-200 disabled:opacity-30"
                >
                  <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={clearTimer}
                  disabled={task.completed}
                  title="Limpar Dados do Timer"
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl text-slate-300 hover:text-red-500 hover:bg-red-50 border-2 border-transparent hover:border-red-100 disabled:opacity-30"
                >
                  <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator className="my-6 sm:my-10 bg-slate-100 h-1 rounded-full" />

        {/* NAVEGAÇÃO DE ABAS: Checklist, Comentários, Histórico */}
        <div className="flex items-center gap-2 sm:gap-4 mb-8 sm:mb-10 overflow-x-auto pb-2 no-scrollbar">
            <button
            onClick={() => setActiveTab('checklist')}
            className={cn(
              "px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-2 sm:border-4 border-b-4 sm:border-b-8 shrink-0",
              activeTab === 'checklist' 
                ? "bg-me-blue text-white border-me-blue-dark shadow-lg" 
                : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
            )}
          >
            Checklist
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={cn(
              "px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-2 sm:border-4 border-b-4 sm:border-b-8 shrink-0",
              activeTab === 'comments' 
                ? "bg-me-purple text-white border-me-purple-dark shadow-lg" 
                : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
            )}
          >
            Notas & Links
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-2 sm:border-4 border-b-4 sm:border-b-8 shrink-0",
              activeTab === 'history' 
                ? "bg-slate-900 text-white border-black shadow-lg" 
                : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
            )}
          >
            Histórico
          </button>
        </div>

        {/* CONTEÚDO DINÂMICO BASEADO NA ABA ATIVA */}
        {activeTab === 'checklist' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            {!task.completed && (
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
                  className="h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded-xl sm:rounded-[1.5rem] shadow-[0_4px_0_0_#38bdf8] sm:shadow-[0_8px_0_0_#38bdf8] active:shadow-none active:translate-y-[4px] sm:active:translate-y-[8px]"
                >
                  <Plus className="w-6 h-6 sm:w-8 sm:h-8" />
                </Button>
              </form>
            )}

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
                      disabled={task.completed}
                      className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border-2 sm:border-4 flex items-center justify-center transition-all shrink-0 shadow-sm sm:shadow-md",
                        item.completed ? "bg-duo-green border-duo-green-dark text-white" : "bg-white border-slate-200 text-transparent hover:border-slate-300"
                      )}
                    >
                      <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
                    </button>
                    
                    {/* Edição de Texto do Item */}
                    <input
                      type="text"
                      value={item.text}
                      readOnly={task.completed}
                      onChange={(e) => updateChecklistItemText(item.id, e.target.value)}
                      className={cn(
                        "flex-1 bg-transparent border-none focus:ring-0 text-base sm:text-lg font-black p-0 text-slate-800",
                        item.completed && "line-through text-slate-400"
                      )}
                    />

                    {/* Botão de Excluir Sub-tarefa */}
                    {!task.completed && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteChecklistItem(item.id)}
                        className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-2xl text-slate-200 hover:text-red-500 hover:bg-red-50 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all border-2 border-transparent hover:border-red-100"
                      >
                        <Trash2 className="w-4 h-4 sm:w-6 sm:h-6" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ABA DE COMENTÁRIOS E NOTAS */}
        {activeTab === 'comments' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 sm:gap-4 uppercase italic tracking-tighter px-2 sm:px-4">
              <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-me-purple" />
              Notas & Comentários
            </h4>

            {/* INPUT PARA NOVO COMENTÁRIO */}
            <form onSubmit={handleAddComment} className="flex flex-col gap-4">
              <div className="relative">
                <textarea
                  placeholder="Adicione uma nota, link ou observação..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full min-h-[120px] p-4 sm:p-6 text-base sm:text-lg rounded-[1.5rem] sm:rounded-[2rem] border-2 sm:border-4 border-slate-200 border-b-4 sm:border-b-8 focus:border-me-purple transition-all resize-none outline-none"
                />
                
                {/* PREVIEW DE ANEXOS */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-xl border-2 border-slate-100 mt-2">
                    {attachments.map((att, index) => (
                      <div key={index} className="relative group">
                        {att.type.startsWith('image/') ? (
                          <img 
                            src={att.url} 
                            alt={att.name} 
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border-2 border-white shadow-sm"
                          />
                        ) : (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center bg-white rounded-lg border-2 border-white shadow-sm p-1">
                            <Paperclip className="w-6 h-6 text-slate-400" />
                            <span className="text-[8px] text-center truncate w-full font-bold text-slate-500">{att.name}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*,application/pdf,text/plain"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full text-slate-300 hover:text-me-purple hover:bg-me-purple/5"
                    title="Anexar Arquivo"
                    onClick={handleFileClick}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full text-slate-300 hover:text-me-purple hover:bg-me-purple/5"
                    title="Adicionar Link"
                    onClick={handleAddLink}
                  >
                    <LinkIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <Button 
                type="submit" 
                variant="default" 
                className="h-12 sm:h-16 rounded-xl sm:rounded-[1.5rem] font-black uppercase tracking-widest bg-me-purple hover:bg-purple-700 border-b-4 sm:border-b-8 border-me-purple-dark shadow-lg"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> Salvar Nota
              </Button>
            </form>

            {/* LISTA DE COMENTÁRIOS */}
            <div className="space-y-4 sm:space-y-6 max-h-[400px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
              {(task.comments || []).length === 0 ? (
                <div className="py-10 sm:py-16 text-center border-4 border-dashed border-slate-100 rounded-[2rem] sm:rounded-[3rem] bg-slate-50/30">
                  <p className="text-base sm:text-lg font-bold text-slate-300 italic">Nenhuma nota registrada.</p>
                </div>
              ) : (
                [...(task.comments || [])].reverse().map((comment) => (
                  <div key={comment.id} className="bg-white border-2 sm:border-4 border-slate-100 border-b-4 sm:border-b-8 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs font-black text-me-purple uppercase tracking-widest">{comment.author}</span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400">{new Date(comment.createdAt).toLocaleString('pt-BR')}</span>
                      </div>
                    <p className="text-sm sm:text-base font-bold text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {renderTextWithLinks(comment.text)}
                    </p>
                    
                    {/* RENDERIZAÇÃO DE ANEXOS NO COMENTÁRIO */}
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-3 mt-4">
                        {comment.attachments.map((att, index) => (
                          <div key={index} className="max-w-full">
                            {att.type.startsWith('image/') ? (
                              <div className="relative rounded-[1.5rem] overflow-hidden border-4 border-slate-50 shadow-sm group">
                                <img 
                                  src={att.url} 
                                  alt={att.name} 
                                  className="max-w-full max-h-[300px] object-contain cursor-pointer hover:scale-105 transition-transform"
                                  onClick={() => window.open(att.url, '_blank')}
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <p className="text-[10px] text-white font-bold truncate">{att.name}</p>
                                </div>
                              </div>
                            ) : (
                              <a 
                                href={att.url} 
                                download={att.name}
                                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border-2 border-slate-100 transition-colors group"
                              >
                                <Paperclip className="w-5 h-5 text-me-purple group-hover:scale-110 transition-transform" />
                                <span className="text-xs font-bold text-slate-600">{att.name}</span>
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ABA DE HISTÓRICO */}
        {activeTab === 'history' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 sm:gap-4 uppercase italic tracking-tighter px-2 sm:px-4">
              <History className="w-6 h-6 sm:w-8 sm:h-8 text-slate-900" />
              Histórico de Atividades
            </h4>

            <div className="relative space-y-6 sm:space-y-8 before:absolute before:inset-0 before:ml-5 sm:before:ml-7 before:-translate-x-px before:h-full before:w-1 before:bg-slate-100 before:rounded-full px-2 sm:px-4">
              {(task.history || []).length === 0 ? (
                <div className="py-10 sm:py-16 text-center border-4 border-dashed border-slate-100 rounded-[2rem] sm:rounded-[3rem] bg-slate-50/30 ml-10 sm:ml-14">
                  <p className="text-base sm:text-lg font-bold text-slate-300 italic">Nenhuma atividade registrada ainda.</p>
                </div>
              ) : (
                [...(task.history || [])].reverse().map((entry) => (
                  <div key={entry.id} className="relative flex items-start gap-4 sm:gap-6 ml-2 sm:ml-4">
                    <div className="absolute left-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white border-4 border-slate-200 flex items-center justify-center z-10">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-slate-400" />
                    </div>
                    <div className="flex-1 pt-0.5 sm:pt-1 ml-8 sm:ml-10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4 mb-1">
                        <span className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-tight">{entry.action}</span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400">{new Date(entry.timestamp).toLocaleString('pt-BR')}</span>
                      </div>
                      {entry.details && (
                        <p className="text-[10px] sm:text-xs font-bold text-slate-500 italic">{entry.details}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

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
      </div>
    </DialogContent>
    </Dialog>
  );
}
