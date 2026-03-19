/**
 * COMPONENTE: TASKCARD (CARD DE TAREFA)
 * 
 * Este componente representa visualmente uma única tarefa na lista.
 * Ele é altamente dinâmico e muda de cor, borda e sombra baseado no status da tarefa.
 * 
 * Estilo Visual (Playful Soft UI):
 * - Cores vibrantes: Amarelo (Pendente), Roxo (Em Progresso), Verde (Concluída).
 * - Efeito 3D: Bordas inferiores grossas que simulam profundidade.
 * - Animações: Uso de Framer Motion para transições suaves e feedback de clique.
 * - Tipografia: Fontes pesadas (`font-black`) para um visual moderno e legível.
 */

import React from "react";
/* Importação de tipos para garantir que os dados da tarefa sigam o contrato definido */
import { Task, Priority, Category } from "@/src/types";
/* Importação de ícones da biblioteca Lucide-React para ilustrar o card */
import { 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Clock, 
  Tag, 
  Share2, 
  Database, 
  Layout, 
  MessageSquare, 
  BarChart3, 
  Timer 
} from "lucide-react";
/* Importação de componentes do Framer Motion para animações interativas */
import { motion } from "motion/react";
/* Utilitário para concatenar classes CSS condicionalmente */
import { cn } from "@/src/lib/utils";
/* Componente de botão customizado do projeto */
import { Button } from "@/src/components/ui/button";

/**
 * INTERFACE: TaskCardProps
 * Define as funções e dados que o componente pai (Dashboard) deve passar para este card.
 */
interface TaskCardProps {
  task: Task; /* O objeto completo da tarefa */
  onToggle: (id: string) => void; /* Função para marcar como feito/desfazer */
  onDelete: (id: string) => void; /* Função para remover a tarefa */
  onJoin?: (id: string) => void; /* Função para iniciar o foco na tarefa */
  onClick?: (task: Task) => void; /* Função para abrir o modal de detalhes */
}

/**
 * CONFIGURAÇÃO: priorityConfig
 * Define cores e rótulos para cada nível de prioridade.
 */
const priorityConfig: Record<Priority, { color: string, bg: string, border: string, label: string }> = {
  low: { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-100', label: 'Baixa' },
  medium: { color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200', label: 'Média' },
  high: { color: 'text-slate-900', bg: 'bg-slate-200', border: 'border-slate-300', label: 'Alta' },
};

/**
 * CONFIGURAÇÃO: categoryLabels
 * Traduz as chaves de categoria para nomes amigáveis em português.
 */
const categoryLabels: Record<Category, string> = {
  trabalho: 'Trabalho',
  estudos: 'Estudos',
  pessoal: 'Pessoal',
  saude: 'Saúde',
  outros: 'Outros',
};

/**
 * CONFIGURAÇÃO: sourceIcons
 * Mapeia a origem da tarefa para um ícone específico (ex: Trello, Sheets).
 */
const sourceIcons: Record<string, React.ElementType> = {
  'google-sheets': Database,
  'trello': Layout,
  'notion': Database,
  'asana': Layout,
  'hubspot': BarChart3,
  'slack': MessageSquare,
  'local': CheckCircle2
};

/**
 * COMPONENTE: TaskCard
 */
export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onJoin, onClick }) => {
  /* Identifica a configuração de prioridade e o ícone de origem */
  const priority = priorityConfig[task.priority];
  const SourceIcon = sourceIcons[task.source || 'local'] || Share2;

  return (
    /* motion.div: Container animado que reage ao hover e cliques */
    <motion.div
      layout /* Anima automaticamente quando o card muda de posição na lista */
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        /* Cor de fundo muda dinamicamente conforme o estado da tarefa */
        backgroundColor: task.completed ? "var(--color-duo-green)" : task.inProgress ? "white" : "var(--color-duo-yellow)",
      }}
      whileHover={{ y: -8 }} /* Efeito de flutuação ao passar o mouse */
      whileTap={{ y: 0, scale: 0.98 }} /* Efeito de compressão ao clicar */
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={() => onClick?.(task)}
      className={cn(
        /* Classes base de layout e estilo Soft UI */
        "relative rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-6 md:p-8 cursor-pointer transition-all duration-300",
        "border-4",
        /* Estilização condicional de bordas e sombras baseada no status */
        task.completed 
          ? "border-duo-green-dark shadow-[0_6px_0_0_#46a302] md:shadow-[0_10px_0_0_#46a302]" 
          : task.inProgress 
            ? "border-me-purple shadow-[0_6px_0_0_#7e22ce] md:shadow-[0_10px_0_0_#7e22ce]" 
            : "border-duo-yellow-dark shadow-[0_6px_0_0_#e5a500] md:shadow-[0_10px_0_0_#e5a500]"
      )}
    >
      <div className="flex items-start gap-4 md:gap-6">
        
        {/* BOTÃO CHECKBOX: Estilo "apertável" com feedback visual imediato */}
        <button
          onClick={(e) => {
            e.stopPropagation(); /* Evita que o clique no botão abra o modal de detalhes */
            onToggle(task.id);
          }}
          className={cn(
            "mt-1 w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all duration-300 border-2 md:border-4 shrink-0",
            task.completed 
              ? "bg-white border-white text-duo-green scale-110 shadow-lg" 
              : "bg-white border-slate-200 text-slate-200 hover:text-slate-400 hover:border-slate-300"
          )}
        >
          {/* Ícone muda de círculo vazio para check preenchido */}
          {task.completed ? <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" /> : <Circle className="w-6 h-6 md:w-8 md:h-8" />}
        </button>

        <div className="flex-1 min-w-0">
          {/* TÍTULO DA TAREFA: Texto em negrito pesado */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className={cn(
              "font-black text-lg sm:text-xl md:text-2xl leading-tight transition-all tracking-tight truncate",
              /* Texto fica branco se o fundo for colorido (amarelo ou verde) */
              task.completed || !task.inProgress ? "text-white" : "text-slate-900",
            )}>
              {task.title}
            </h3>
          </div>
          
          {/* DESCRIÇÃO: Limitada a 2 linhas para manter o card compacto */}
          <p className={cn(
            "text-sm md:text-base mb-4 md:mb-6 line-clamp-2 transition-all font-bold opacity-80",
            task.completed || !task.inProgress ? "text-white" : "text-slate-500",
          )}>
            {task.description || 'Nenhuma descrição adicionada para esta missão.'}
          </p>

          {/* RODAPÉ DO CARD: Categoria e Ações Rápidas */}
          <div className="flex items-center justify-between gap-2">
            {/* Tag de Categoria */}
            <div className={cn(
              "flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em]",
              task.completed || !task.inProgress ? "text-white/70" : "text-slate-400"
            )}>
              <div className="flex items-center gap-1.5 bg-black/5 px-2.5 py-1 rounded-full">
                <Tag className="w-3 h-3 md:w-4 md:h-4" />
                <span className="truncate max-w-[60px] sm:max-w-none">{categoryLabels[task.category]}</span>
              </div>
            </div>

            {/* Ações: Botão Começar e Botão Deletar */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Botão "Começar" só aparece se a tarefa estiver pendente */}
              {!task.completed && !task.inProgress && onJoin && (
                <Button 
                  variant="secondary"
                  size="sm" 
                  className="bg-white text-duo-yellow-dark hover:bg-slate-50 border-2 border-slate-100 rounded-xl font-black uppercase tracking-widest text-[8px] md:text-[10px] h-8 md:h-10 px-3 md:px-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoin(task.id);
                  }}
                >
                  Começar
                </Button>
              )}
              
              {/* Botão de Lixeira (Deletar) */}
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.id);
                }}
                className={cn(
                  "h-8 w-8 md:h-12 md:w-12 rounded-xl md:rounded-2xl transition-all",
                  task.completed || !task.inProgress
                    ? "text-white/50 hover:text-white hover:bg-white/10" 
                    : "text-slate-200 hover:text-destructive hover:bg-destructive/5"
                )}
              >
                <Trash2 className="w-4 h-4 md:w-6 md:h-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* BADGES FLUTUANTES: Indicadores de status no topo do card */}
      <div className="absolute -top-3 md:-top-4 right-4 md:right-6 flex gap-2 md:gap-3">
        {/* Badge "Em Foco" para tarefas ativas */}
        {task.inProgress && !task.completed && (
          <span className="px-3 py-1.5 md:px-4 md:py-2 bg-me-purple text-white text-[8px] md:text-[10px] font-black rounded-full uppercase tracking-widest shadow-xl border-b-2 md:border-b-4 border-purple-900">
            Foco ⚡
          </span>
        )}
        {/* Badge do Timer Pomodoro: Mostra o tempo restante se estiver rodando */}
        {task.timerIsRunning && (
          <span className="px-3 py-1.5 md:px-4 md:py-2 bg-red-500 text-white text-[8px] md:text-[10px] font-black rounded-full uppercase tracking-widest shadow-xl border-b-2 md:border-b-4 border-red-800 animate-pulse flex items-center gap-1.5 md:gap-2">
            <Timer className="w-3 h-3 md:w-4 md:h-4" />
            {Math.floor((task.timerSeconds ?? 1500) / 60)}:{(task.timerSeconds ?? 1500) % 60 < 10 ? '0' : ''}{(task.timerSeconds ?? 1500) % 60}
          </span>
        )}
      </div>
    </motion.div>
  );
};
