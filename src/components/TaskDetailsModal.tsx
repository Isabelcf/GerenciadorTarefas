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
import { cn, generateUUID } from "@/src/lib/utils";
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

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
/**
 * COMPONENTE AUXILIAR: ChecklistItemComponent
 * Gerencia o estado individual de cada item do checklist, incluindo o Long Press.
 */
interface ChecklistItemComponentProps {
  item: ChecklistItem;
  task: Task;
  toggleChecklistItem: (id: string) => void;
  updateChecklistItemText: (id: string, text: string) => void;
  deleteChecklistItem: (id: string) => void;
}

const ChecklistItemComponent: React.FC<ChecklistItemComponentProps> = ({ 
  item, 
  task, 
  toggleChecklistItem, 
  updateChecklistItemText, 
  deleteChecklistItem 
}) => {
  const [isLongPressing, setIsLongPressing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = () => {
    timerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      if (navigator.vibrate) navigator.vibrate(50);
    }, 500);
  };

  const endPress = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIsLongPressing(false);
  };

  return (
    <div 
      className={cn(
        "flex items-center gap-3 sm:gap-5 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 sm:border-4 border-b-4 sm:border-b-8 transition-all group relative",
        item.completed 
          ? "bg-success/5 border-success/20 border-b-success/30 opacity-70" 
          : "bg-white border-slate-200 border-b-slate-300 hover:border-slate-300"
      )}
    >
      {/* Botão de Checkbox Customizado */}
      <button
        onClick={() => toggleChecklistItem(item.id)}
        disabled={task.completed}
        className={cn(
          "w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 sm:border-4 flex items-center justify-center transition-all shrink-0 shadow-sm sm:shadow-md",
          item.completed ? "bg-success border-success-dark text-white" : "bg-white border-slate-200 text-transparent hover:border-slate-300"
        )}
      >
        <CheckCircle2 className="w-4 h-4 sm:w-6 sm:h-6" />
      </button>
      
      {/* Edição de Texto do Item com suporte a Long Press para ver texto completo */}
      <div 
        className="flex-1 min-w-0 relative"
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={startPress}
        onTouchEnd={endPress}
      >
        <input
          type="text"
          value={item.text}
          readOnly={task.completed}
          onChange={(e) => updateChecklistItemText(item.id, e.target.value)}
          className={cn(
            "w-full bg-transparent border-none focus:ring-0 text-base sm:text-lg font-black p-0 text-slate-800 truncate",
            item.completed && "line-through text-slate-400",
            isLongPressing && "whitespace-normal overflow-visible h-auto"
          )}
        />
        
        {/* Overlay de texto completo no Long Press (Mobile Friendly) */}
        {isLongPressing && (
          <div className="absolute left-0 top-full mt-2 z-50 bg-slate-900 text-white p-4 rounded-2xl text-sm font-bold shadow-2xl animate-in zoom-in-95 duration-200 max-w-[250px] break-words">
            {item.text}
          </div>
        )}
      </div>

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
  );
}

export function TaskDetailsModal({ task, isOpen, onClose, onUpdateTask }: TaskDetailsModalProps) {
  const { theme, palette } = useTheme();
  const { t, language } = useLanguage();
  /* ESTADO: Texto temporário para o campo de nova sub-tarefa */
  const [newItemText, setNewItemText] = useState('');
  /* ESTADO: Texto temporário para o campo de novo comentário */
  const [newCommentText, setNewCommentText] = useState('');
  /* ESTADO: Anexos temporários para o novo comentário */
  const [attachments, setAttachments] = useState<{ name: string; url: string; type: string }[]>([]);
  /* ESTADO: Aba ativa (Checklist, Comentários, Histórico ou Foco) */
  const [activeTab, setActiveTab] = useState<'checklist' | 'comments' | 'history' | 'focus'>('checklist');
  /* REF: Referência para o input de arquivo oculto */
  const fileInputRef = useRef<HTMLInputElement>(null);
  /* REF: Referência para o input de arquivo da tarefa principal */
  const taskFileInputRef = useRef<HTMLInputElement>(null);

  /* Se não houver tarefa selecionada, o modal não deve renderizar nada */
  if (!task) return null;

  /**
   * FUNÇÃO: addHistoryEntry
   * Adiciona um registro ao histórico da tarefa.
   */
  const addHistoryEntry = (action: string, details?: string) => {
    const newEntry = {
      id: generateUUID(),
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
      id: generateUUID(), /* Gera um ID único para o novo item */
      text: newItemText.trim(),
      completed: false,
    };

    /* Atualiza a tarefa com o novo checklist e histórico */
    const updatedTask = {
      ...task,
      checklist: [...(task.checklist || []), newItem],
      history: addHistoryEntry(t('subtaskAdded'), `"${newItem.text}"`)
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
        item?.completed ? t('subtaskReopened') : t('subtaskCompleted'), 
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
      history: addHistoryEntry(t('subtaskRemoved'), `"${item?.text}"`)
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
            className="text-accent hover:underline break-all"
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
          toast.success(t('imageAttachedToast', { name: file.name }));
        } else {
          toast.success(t('fileAttachedToast', { name: file.name }));
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
    const url = window.prompt(t('enterUrlPrompt'));
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
      id: generateUUID(),
      text: newCommentText.trim(),
      createdAt: Date.now(),
      author: t('you'),
      attachments: attachments.length > 0 ? attachments : undefined
    };

    onUpdateTask({
      ...task,
      comments: [...(task.comments || []), newComment],
      history: addHistoryEntry(t('commentAdded'))
    });

    /* Simulação: Refletir comentário no board de integração */
    if (task.source && task.source !== 'local') {
      toast.info(t('syncNoteToast', { source: task.source.toUpperCase() }), {
        description: t('syncNoteDesc')
      });
      console.log(`[Sync] Refletindo comentário na tarefa ${task.id} (${task.source}): ${newComment.text}`);
    }

    setNewCommentText('');
    setAttachments([]);
  };

  /**
   * FUNÇÃO: handleTaskFileChange
   * Adiciona um anexo diretamente à missão.
   */
  const handleTaskFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newAttachment = {
          name: file.name,
          url: base64String,
          type: file.type
        };
        
        onUpdateTask({
          ...task,
          attachments: [...(task.attachments || []), newAttachment],
          history: addHistoryEntry(t('attachmentAdded'), file.name)
        });
        
        toast.success(t('fileAttachedToMissionToast', { name: file.name }));
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  /**
   * FUNÇÃO: handleAddTaskLink
   * Adiciona um link diretamente à missão.
   */
  const handleAddTaskLink = () => {
    const url = window.prompt(t('enterUrlPrompt'));
    if (url) {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      const newAttachment = {
        name: url.replace(/^https?:\/\//, '').split('/')[0],
        url: formattedUrl,
        type: 'url'
      };
      
      onUpdateTask({
        ...task,
        attachments: [...(task.attachments || []), newAttachment],
        history: addHistoryEntry(t('linkAddedToMission'), formattedUrl)
      });
      
      toast.success(t('linkAddedToMissionToast'));
    }
  };

  /**
   * FUNÇÃO: removeTaskAttachment
   * Remove um anexo da missão.
   */
  const removeTaskAttachment = (index: number) => {
    const updatedAttachments = (task.attachments || []).filter((_, i) => i !== index);
    onUpdateTask({
      ...task,
      attachments: updatedAttachments,
      history: addHistoryEntry(t('attachmentRemoved'))
    });
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
      timerSeconds: (task.timerSeconds && task.timerSeconds > 0) ? task.timerSeconds : 1500,
      inProgress: true, /* Garante que a tarefa esteja marcada como ativa */
      history: addHistoryEntry(isStarting ? t('timerStarted') : t('timerPaused'))
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
      <DialogContent className="sm:max-w-[600px] w-[95vw] max-h-[90vh] overflow-hidden rounded-[2rem] sm:rounded-[3rem] border-4 border-border p-0 shadow-2xl bg-card">
        {/* Container de Scroll Interno: Garante que a barra de rolagem não ultrapasse as bordas arredondadas */}
        <div className="overflow-y-auto overflow-x-hidden max-h-[90vh] p-6 sm:p-10 pr-4 sm:pr-8 custom-scrollbar">
        
        {/* CABEÇALHO: Status, Prioridade e Título */}
        <DialogHeader className="space-y-4 sm:space-y-6">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* Badge de Prioridade com cores temáticas */}
            <span className={cn(
              "text-[8px] sm:text-[10px] font-black px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl uppercase tracking-[0.2em] border-2 border-b-4",
              task.priority === 'high' ? "bg-red-50 text-red-600 border-red-200" :
              task.priority === 'medium' ? "bg-secondary/10 text-secondary-dark border-secondary/20" :
              "bg-background text-foreground-muted border-border"
            )}>
              {task.priority === 'high' ? t('critical') : 
               task.priority === 'medium' ? t('important') : t('lightPriority')}
            </span>
            {/* Badge de Status: Em Foco */}
            {task.inProgress && (
              <span className="text-[8px] sm:text-[10px] font-black px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-accent text-white tracking-[0.2em] border-b-4 border-accent-dark shadow-lg">
                {t('inFocus')}
              </span>
            )}
            {/* Badge de Status: Concluída */}
            {task.completed && (
              <span className="text-[8px] sm:text-[10px] font-black px-3 sm:px-5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-primary text-white tracking-[0.2em] border-b-4 border-primary-dark shadow-lg">
                {t('completedBadge')}
              </span>
            )}
          </div>

          <DialogTitle className="text-2xl sm:text-4xl font-black text-foreground tracking-tighter italic uppercase">{task.title}</DialogTitle>
          
          {/* DESCRIÇÃO: Card com fundo suave e borda 3D */}
          <div className="space-y-4">
            <DialogDescription className="text-foreground-muted font-bold text-base sm:text-xl leading-relaxed bg-background p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-border italic">
              {task.description || t('noDetails')}
            </DialogDescription>

            {/* ANEXOS DA MISSÃO */}
            <div className="flex flex-wrap gap-3 px-2">
              {(task.attachments || []).map((att, index) => (
                <div key={index} className="group relative flex items-center gap-3 bg-white border-2 border-slate-100 rounded-2xl p-3 pr-4 shadow-sm hover:border-primary transition-all animate-in zoom-in-95 duration-200">
                  {att.type.startsWith('image/') ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100">
                      <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                    </div>
                  ) : att.type === 'url' ? (
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <LinkIcon className="w-5 h-5 text-accent" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                      <Paperclip className="w-5 h-5 text-slate-400" />
                    </div>
                  )}
                  
                  <div className="flex flex-col min-w-0">
                    <a 
                      href={att.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-black text-slate-700 hover:text-primary truncate max-w-[120px]"
                    >
                      {att.name}
                    </a>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                      {att.type === 'url' ? t('externalLink') : t('file')}
                    </span>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-lg text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeTaskAttachment(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}

              {/* Botões para adicionar novos anexos à missão */}
              <div className="flex gap-2">
                <input 
                  type="file" 
                  ref={taskFileInputRef} 
                  onChange={handleTaskFileChange} 
                  className="hidden" 
                  accept="image/*,application/pdf,text/plain"
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-2xl border-2 border-dashed border-slate-200 text-slate-300 hover:text-primary hover:border-primary hover:bg-primary/5"
                  onClick={() => taskFileInputRef.current?.click()}
                  title={t('attachFile')}
                >
                  <Plus className="w-5 h-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-2xl border-2 border-dashed border-slate-200 text-slate-300 hover:text-accent hover:border-accent hover:bg-accent/5"
                  onClick={handleAddTaskLink}
                  title={t('addLink')}
                >
                  <LinkIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* METADADOS: Categoria e Data de Criação */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-8 text-[10px] sm:text-xs font-black text-slate-400 my-6 sm:my-8 px-2 sm:px-4">
          <div className="flex items-center gap-2 bg-slate-100 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
            <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="uppercase tracking-widest">{task.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="uppercase tracking-widest">{t('startedAt')} {new Date(task.createdAt).toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES')}</span>
          </div>
        </div>

        {/* WIDGET: TIMER POMODORO (Estilo Hardware/Widget) */}
        <div className={cn(
          "bg-card border-4 border-border border-b-[8px] sm:border-b-[12px] rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-8 mb-8 sm:mb-10 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 group/timer transition-all hover:border-border shadow-xl sm:shadow-2xl",
          task.completed && "opacity-80 grayscale-[0.5]"
        )}>
          <div className="flex items-center gap-4 sm:gap-8 w-full sm:w-auto">
            {/* Círculo Visual do Timer */}
            <div className={cn(
              "w-16 h-16 sm:w-24 sm:h-24 rounded-2xl sm:rounded-[2rem] border-4 flex items-center justify-center transition-all duration-500 shadow-xl sm:shadow-2xl shrink-0",
              task.timerIsRunning ? "border-red-500 bg-red-50 animate-pulse" : "border-border bg-card",
              task.completed && "border-border bg-background"
            )}>
              <Timer className={cn("w-8 h-8 sm:w-12 sm:h-12", task.timerIsRunning ? "text-red-500" : "text-foreground-muted")} />
            </div>
            <div className="flex-1">
              {/* Display do Tempo Restante ou Tempo Total */}
              <div className="text-3xl sm:text-5xl font-black tracking-tighter tabular-nums text-foreground leading-none italic">
                {task.completed ? formatTotalTime(task.totalTimeSpent ?? 0) : formatTime(task.timerSeconds ?? 1500)}
              </div>
              <div className="flex flex-col gap-1 mt-2 sm:mt-3">
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-foreground-muted">
                  {task.completed ? t('totalTimeInvested') : t('pomodoroFocusMode')}
                </span>
                {/* Tempo Total Acumulado (apenas se não estiver concluída, pois já aparece no display principal se estiver) */}
                {!task.completed && task.totalTimeSpent && (
                  <span className="text-[8px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2 mt-1">
                    <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4" /> {t('effort')}: {formatTotalTime(task.totalTimeSpent)}
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
                  <><Pause className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 fill-current" /> {t('pause')}</>
                ) : (
                  <><Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 fill-current" /> {t('startAction')}</>
                )}
              </Button>
              
              {/* Botões Secundários: Reset e Limpar */}
              <div className="flex items-center gap-3 sm:gap-4 justify-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={resetTimer}
                  disabled={task.completed}
                  title={t('resetTimer')}
                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl text-slate-300 hover:text-slate-900 hover:bg-slate-100 border-2 border-transparent hover:border-slate-200 disabled:opacity-30"
                >
                  <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={clearTimer}
                  disabled={task.completed}
                  title={t('clearTimerData')}
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
                ? "bg-primary text-white border-primary-dark shadow-lg" 
                : "bg-card text-foreground-muted border-border hover:border-foreground-muted"
            )}
          >
            {t('checklist')}
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={cn(
              "px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-2 sm:border-4 border-b-4 sm:border-b-8 shrink-0",
              activeTab === 'comments' 
                ? "bg-accent text-white border-accent-dark shadow-lg" 
                : "bg-card text-foreground-muted border-border hover:border-foreground-muted"
            )}
          >
            {t('notesLinks')}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              "px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-2 sm:border-4 border-b-4 sm:border-b-8 shrink-0",
              activeTab === 'history' 
                ? "bg-foreground text-background border-foreground-muted shadow-lg" 
                : "bg-card text-foreground-muted border-border hover:border-foreground-muted"
            )}
          >
            {t('history')}
          </button>
          <button
            onClick={() => setActiveTab('focus')}
            className={cn(
              "px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all border-2 sm:border-4 border-b-4 sm:border-b-8 shrink-0",
              activeTab === 'focus' 
                ? "bg-secondary text-white border-secondary-dark shadow-lg" 
                : "bg-card text-foreground-muted border-border hover:border-foreground-muted"
            )}
          >
            {t('focusSessions')}
          </button>
        </div>

        {/* CONTEÚDO DINÂMICO BASEADO NA ABA ATIVA */}
        {activeTab === 'checklist' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-2 sm:px-4">
              <h4 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 sm:gap-4 uppercase italic tracking-tighter">
                <CheckSquare className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                {t('checklist')}
              </h4>
              {/* Contador de Progresso */}
              {totalCount > 0 && (
                <span className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border-2 border-slate-100 self-start sm:self-auto">
                  {completedCount} {t('doneOf')} {totalCount} {t('completedOf')}
                </span>
              )}
            </div>

            {/* BARRA DE PROGRESSO VISUAL: Estilo Soft UI com sombra interna */}
            {totalCount > 0 && (
              <div className="w-full bg-slate-100 h-4 sm:h-6 rounded-full overflow-hidden border-2 sm:border-4 border-slate-200 shadow-inner">
                <div 
                  className="bg-primary h-full transition-all duration-1000 shadow-[inset_0_4px_8px_rgba(255,255,255,0.4)] relative" 
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
                  placeholder={t('nextStep')}
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  className="h-12 sm:h-16 text-base sm:text-lg rounded-xl sm:rounded-[1.5rem] border-2 sm:border-4 border-slate-200 border-b-4 sm:border-b-8 focus:border-primary transition-all"
                />
                <Button 
                  type="submit" 
                  variant="me" 
                  size="icon" 
                  className="h-12 w-12 sm:h-16 sm:w-16 shrink-0 rounded-xl sm:rounded-[1.5rem] shadow-[0_4px_0_0_var(--primary-dark)] sm:shadow-[0_8px_0_0_var(--primary-dark)] active:shadow-none active:translate-y-[4px] sm:active:translate-y-[8px]"
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
                  <p className="text-base sm:text-lg font-bold text-slate-300 italic">{t('noStepsDefined')}</p>
                </div>
              ) : (
                (task.checklist || []).map((item) => (
                  <ChecklistItemComponent 
                    key={item.id} 
                    item={item} 
                    task={task} 
                    toggleChecklistItem={toggleChecklistItem}
                    updateChecklistItemText={updateChecklistItemText}
                    deleteChecklistItem={deleteChecklistItem}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* ABA DE COMENTÁRIOS E NOTAS */}
        {activeTab === 'comments' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 sm:gap-4 uppercase italic tracking-tighter px-2 sm:px-4">
              <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-accent" />
              {t('notesLinks')}
            </h4>

            {/* INPUT PARA NOVO COMENTÁRIO */}
            <form onSubmit={handleAddComment} className="flex flex-col gap-4">
              <div className="relative">
                <textarea
                  placeholder={t('addNotePlaceholder')}
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="w-full min-h-[120px] p-4 sm:p-6 text-base sm:text-lg rounded-[1.5rem] sm:rounded-[2rem] border-2 sm:border-4 border-slate-200 border-b-4 sm:border-b-8 focus:border-accent transition-all resize-none outline-none"
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
                    className="rounded-full text-slate-300 hover:text-accent hover:bg-accent/5"
                    title={t('attachFile')}
                    onClick={handleFileClick}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full text-slate-300 hover:text-accent hover:bg-accent/5"
                    title={t('addLink')}
                    onClick={handleAddLink}
                  >
                    <LinkIcon className="w-5 h-5" />
                  </Button>
                </div>
              </div>
              <Button 
                type="submit" 
                variant="default" 
                className="h-12 sm:h-16 rounded-xl sm:rounded-[1.5rem] font-black uppercase tracking-widest bg-accent hover:bg-accent-dark border-b-4 sm:border-b-8 border-accent-dark shadow-lg"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" /> {t('saveNote')}
              </Button>
            </form>

            {/* LISTA DE COMENTÁRIOS */}
            <div className="space-y-4 sm:space-y-6 max-h-[400px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
              {(task.comments || []).length === 0 ? (
                <div className="py-10 sm:py-16 text-center border-4 border-dashed border-slate-100 rounded-[2rem] sm:rounded-[3rem] bg-slate-50/30">
                  <p className="text-base sm:text-lg font-bold text-slate-300 italic">{t('noNotes')}</p>
                </div>
              ) : (
                [...(task.comments || [])].reverse().map((comment) => (
                  <div key={comment.id} className="bg-white border-2 sm:border-4 border-slate-100 border-b-4 sm:border-b-8 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] sm:text-xs font-black text-accent uppercase tracking-widest">{comment.author}</span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400">{new Date(comment.createdAt).toLocaleString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES')}</span>
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
                                <Paperclip className="w-5 h-5 text-accent group-hover:scale-110 transition-transform" />
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
              {t('historyTitle')}
            </h4>

            <div className="relative space-y-6 sm:space-y-8 before:absolute before:inset-0 before:ml-5 sm:before:ml-7 before:-translate-x-px before:h-full before:w-1 before:bg-slate-100 before:rounded-full px-2 sm:px-4 max-h-[400px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
              {(task.history || []).length === 0 ? (
                <div className="py-10 sm:py-16 text-center border-4 border-dashed border-slate-100 rounded-[2rem] sm:rounded-[3rem] bg-slate-50/30 ml-10 sm:ml-14">
                  <p className="text-base sm:text-lg font-bold text-slate-300 italic">{t('noHistory')}</p>
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
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400">{new Date(entry.timestamp).toLocaleString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES')}</span>
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

        {/* ABA DE SESSÕES DE FOCO */}
        {activeTab === 'focus' && (
          <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h4 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-3 sm:gap-4 uppercase italic tracking-tighter px-2 sm:px-4">
              <Timer className="w-6 h-6 sm:w-8 sm:h-8 text-success" />
              {t('focusSessionsTitle')}
            </h4>

            <div className="space-y-4 px-2 sm:px-4 max-h-[400px] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
              {(task.timeLog || []).length === 0 ? (
                <div className="py-10 sm:py-16 text-center border-4 border-dashed border-slate-100 rounded-[2rem] sm:rounded-[3rem] bg-slate-50/30">
                  <p className="text-base sm:text-lg font-bold text-slate-300 italic">{t('noFocusSessions')}</p>
                </div>
              ) : (
                [...(task.timeLog || [])].reverse().map((session, idx) => (
                  <div key={idx} className="bg-white border-2 sm:border-4 border-slate-100 border-b-4 sm:border-b-8 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center text-success">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-800">
                          {new Date(session.startTime).toLocaleDateString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES')}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {new Date(session.startTime).toLocaleTimeString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES', { hour: '2-digit', minute: '2-digit' })} - {new Date(session.endTime).toLocaleTimeString(language === 'pt' ? 'pt-BR' : language === 'en' ? 'en-US' : 'es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-success italic">
                        {Math.floor(session.duration / 60)}m {session.duration % 60}s
                      </p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('duration')}</p>
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
            {t('closeCenter')}
          </Button>
        </div>
      </div>
    </DialogContent>
    </Dialog>
  );
}
