/**
 * COMPONENTE: REPORTSVIEW (VISÃO DE RELATÓRIOS)
 * 
 * Este componente fornece relatórios detalhados sobre o tempo gasto em missões.
 * Permite filtrar por período (Dia, Semana, Mês, Ano) e visualizar o tempo por categoria.
 * Também inclui uma lista de tarefas com busca para ver o tempo individual de cada demanda.
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Clock, 
  Target, 
  Calendar, 
  Search, 
  ChevronRight,
  TrendingUp,
  PieChart as PieChartIcon,
  ArrowRight
} from 'lucide-react';
import { 
  format, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfYear, 
  endOfYear, 
  isWithinInterval,
  subDays,
  subWeeks,
  subMonths,
  subYears
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Task, Category } from '@/src/types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface ReportsViewProps {
  tasks: Task[];
  onOpenTask: (task: Task) => void;
}

type Period = 'day' | 'week' | 'month' | 'year';

export function ReportsView({ tasks, onOpenTask }: ReportsViewProps) {
  const { theme, palette } = useTheme();
  const { t } = useLanguage();
  const [period, setPeriod] = useState<Period>('day');
  const [searchTerm, setSearchTerm] = useState('');

  /* CÁLCULO: Intervalo de tempo baseado no período selecionado */
  const interval = useMemo(() => {
    const now = new Date();
    switch (period) {
      case 'day':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'year':
        return { start: startOfYear(now), end: endOfYear(now) };
    }
  }, [period]);

  /* CÁLCULO: Filtragem de sessões de tempo dentro do intervalo */
  const reportData = useMemo(() => {
    const categoryStats: Record<string, { duration: number; sessions: number }> = {};
    let totalDuration = 0;
    let totalSessions = 0;

    tasks.forEach(task => {
      const taskSessions = task.timeLog?.filter(session => 
        isWithinInterval(new Date(session.startTime), interval)
      ) || [];

      if (taskSessions.length > 0) {
        const taskDuration = taskSessions.reduce((acc, s) => acc + s.duration, 0);
        totalDuration += taskDuration;
        totalSessions += taskSessions.length;

        if (!categoryStats[task.category]) {
          categoryStats[task.category] = { duration: 0, sessions: 0 };
        }
        categoryStats[task.category].duration += taskDuration;
        categoryStats[task.category].sessions += taskSessions.length;
      }
    });

    return {
      totalDuration,
      totalSessions,
      categories: Object.entries(categoryStats)
        .map(([name, stats]) => ({ name, ...stats }))
        .sort((a, b) => b.duration - a.duration)
    };
  }, [tasks, interval]);

  /* CÁLCULO: Lista de tarefas filtrada para busca individual */
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(task => {
        const duration = task.timeLog?.reduce((acc, s) => acc + s.duration, 0) || 0;
        return { ...task, totalDuration: duration };
      })
      .sort((a, b) => b.totalDuration - a.totalDuration);
  }, [tasks, searchTerm]);

  /* UTILITÁRIO: Formatação de segundos para HH:MM:SS */
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
  };

  return (
    <div className="space-y-10 pb-20">
      {/* CABEÇALHO DA SEÇÃO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-foreground tracking-tighter italic uppercase">{t('focusReports')}</h2>
          <p className="text-foreground-muted font-bold text-xl italic mt-2">{t('analyzeProductivity')}</p>
        </div>

        {/* SELETOR DE PERÍODO */}
        <div className="bg-card p-2 rounded-[2rem] border-2 border-border shadow-[0_6px_0_0_var(--shadow)] flex gap-2">
          {(['day', 'week', 'month', 'year'] as Period[]).map((p) => (
            <Button
              key={p}
              variant={period === p ? "me" : "ghost"}
              size="sm"
              onClick={() => setPeriod(p)}
              className={cn(
                "rounded-2xl font-black uppercase tracking-widest text-[10px] px-6 h-10 transition-all",
                period === p ? "shadow-[0_4px_0_0_var(--primary-dark)]" : "text-foreground-muted hover:bg-background"
              )}
            >
              {p === 'day' ? t('today') : p === 'week' ? t('week') : p === 'month' ? t('month') : t('year')}
            </Button>
          ))}
        </div>
      </div>

      {/* CARDS DE RESUMO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-8 rounded-[2.5rem] border-4 border-border border-b-[10px] border-b-shadow shadow-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-background shadow-lg border-b-4 border-primary-dark">
              <Clock className="w-6 h-6" />
            </div>
            <span className="font-black text-foreground-muted uppercase tracking-widest text-xs">{t('totalTime')}</span>
          </div>
          <p className="text-4xl font-black text-foreground tracking-tighter">{formatDuration(reportData.totalDuration)}</p>
          <p className="text-foreground-muted font-bold italic mt-2">{t('dedicatedInPeriod')}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-8 rounded-[2.5rem] border-4 border-border border-b-[10px] border-b-shadow shadow-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center text-background shadow-lg border-b-4 border-accent-dark">
              <Target className="w-6 h-6" />
            </div>
            <span className="font-black text-foreground-muted uppercase tracking-widest text-xs">{t('focusSessionsCount')}</span>
          </div>
          <p className="text-4xl font-black text-foreground tracking-tighter">{reportData.totalSessions}</p>
          <p className="text-foreground-muted font-bold italic mt-2">{t('timesDedicated')}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-8 rounded-[2.5rem] border-4 border-border border-b-[10px] border-b-shadow shadow-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center text-background shadow-lg border-b-4 border-secondary-dark">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="font-black text-foreground-muted uppercase tracking-widest text-xs">{t('topCategory')}</span>
          </div>
          <p className="text-4xl font-black text-foreground tracking-tighter truncate">
            {reportData.categories[0]?.name || '---'}
          </p>
          <p className="text-foreground-muted font-bold italic mt-2">{t('highestPriority')}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card p-8 sm:p-10 rounded-[3rem] border-4 border-border border-b-[12px] border-b-shadow shadow-2xl"
        >
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-black text-foreground flex items-center gap-4 italic uppercase tracking-tighter">
              <PieChartIcon className="w-8 h-8 text-primary" />
              {t('byCategory')}
            </h3>
          </div>

          <div className="space-y-6">
            {reportData.categories.length > 0 ? (
              reportData.categories.map((cat, idx) => (
                <div key={cat.name} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="font-black text-foreground text-lg">{t(cat.name) !== cat.name ? t(cat.name) : cat.name}</span>
                    <span className="font-bold text-foreground-muted italic">{formatDuration(cat.duration)}</span>
                  </div>
                  <div className="h-4 bg-background rounded-full overflow-hidden border-2 border-border shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(cat.duration / reportData.totalDuration) * 100}%` }}
                      className={cn(
                        "h-full rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]",
                        idx === 0 ? "bg-primary" : idx === 1 ? "bg-accent" : "bg-secondary"
                      )}
                    />
                  </div>
                  <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest">
                    {cat.sessions} {t('focusSessionsLabel')}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-foreground-muted font-bold italic text-lg">{t('noDataPeriod')}</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card p-8 sm:p-10 rounded-[3rem] border-4 border-border border-b-[12px] border-b-shadow shadow-2xl flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black text-foreground flex items-center gap-4 italic uppercase tracking-tighter">
              <BarChart3 className="w-8 h-8 text-accent" />
              {t('searchByDemand')}
            </h3>
          </div>

          <div className="relative mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
            <Input 
              placeholder={t('filterPlaceholder')} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-background rounded-2xl border-2 border-border focus-visible:ring-accent font-bold text-foreground"
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4 max-h-[400px]">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div 
                  key={task.id}
                  onClick={() => onOpenTask(task)}
                  className="group p-5 bg-background hover:bg-card rounded-2xl border-2 border-border hover:border-accent transition-all cursor-pointer flex items-center justify-between shadow-sm hover:shadow-md"
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <h4 className="font-black text-foreground truncate group-hover:text-accent transition-colors">{task.title}</h4>
                    <p className="text-[10px] font-black text-foreground-muted uppercase tracking-widest mt-1">{t(task.category) !== task.category ? t(task.category) : task.category}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-foreground">{formatDuration(task.totalDuration)}</p>
                    <p className="text-[9px] font-bold text-foreground-muted italic">{t('totalTime')}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-foreground-muted ml-4 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <p className="text-foreground-muted font-bold italic">{t('noMissionsFound')}</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t-2 border-border">
            <p className="text-xs font-bold text-foreground-muted italic text-center">
              {t('clickToSeeDetails')}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
