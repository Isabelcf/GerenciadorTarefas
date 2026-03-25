/**
 * PÁGINA: DASHBOARD PRINCIPAL
 * 
 * Esta página é o coração da aplicação TaskFlow. 
 * Ela gerencia a visualização, criação, filtragem e sincronização de tarefas.
 * Inclui uma barra lateral de navegação, um cabeçalho com ações rápidas,
 * estatísticas de progresso gamificadas e uma lista de tarefas estilo "Jornada".
 * 
 * Funcionalidades principais:
 * - Listagem de tarefas com animações (Framer Motion).
 * - Filtros por status (Todas, Pendentes, Em Foco, Concluídas).
 * - Busca em tempo real.
 * - Timer Pomodoro integrado que atualiza o tempo gasto em cada tarefa.
 * - Sincronização com APIs externas (Trello, Google Sheets).
 * - Persistência de dados local (LocalStorage).
 */

import React, { useState, useEffect, useMemo } from 'react';
/* Importação de ícones da biblioteca Lucide-React para uma interface visual rica */
import { 
  Plus, 
  Search, 
  List as ListIcon,
  LayoutGrid,
  User,
  Settings,
  Bell,
  Menu,
  Calendar as CalendarIcon,
  LayoutDashboard,
  CheckSquare,
  Filter,
  LogOut,
  Share2, 
  RefreshCw, 
  Timer,
  Target,
  Rocket,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Clock,
  ChevronLeft,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
/* Importação de componentes da biblioteca Framer Motion para animações fluidas */
import { motion, AnimatePresence } from 'motion/react';
/* Importação de componentes de gráficos Recharts */
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend,
  AreaChart,
  Area,
  LineChart,
  Line
} from 'recharts';
/* Importação do sistema de notificações Toast */
import { Toaster, toast } from 'sonner';
/* Importação do hook de navegação para transições entre páginas */
import { useNavigate } from 'react-router-dom';
/* Importação de tipos TypeScript para garantir segurança no desenvolvimento */
import { Task, TaskFormData, FilterStatus, Notification } from '@/src/types';
/* Importação de componentes customizados do projeto */
import { TaskForm } from '@/src/components/TaskForm';
import { TaskCard } from '@/src/components/TaskCard';
import { TaskDetailsModal } from '@/src/components/TaskDetailsModal';
import { IntegrationsModal } from '@/src/components/IntegrationsModal';
import { NotificationPopover } from "@/src/components/NotificationPopover";
import { ReportsView } from '@/src/components/ReportsView';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
/* Importação de utilitários e componentes de UI base (Shadcn/UI style) */
import { cn, generateUUID } from '@/src/lib/utils';
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
  subYears,
  eachDayOfInterval,
  eachMonthOfInterval,
  isSameDay,
  isSameMonth
} from "date-fns";
import { ptBR, enUS, es as esLocale } from 'date-fns/locale';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/src/components/ui/dialog';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
} from '@/src/components/ui/tabs';
import { Separator } from '@/src/components/ui/separator';

/**
 * COMPONENTE DASHBOARD
 * Gerencia todo o estado da tela principal.
 */
export default function Dashboard() {
  const { theme, palette } = useTheme();
  const { t, language } = useLanguage();
  /* Hook para navegação programática */
  const navigate = useNavigate();
  
  /**
   * ESTADO: LISTA DE TAREFAS
   * Inicializa vazia e busca do servidor no carregamento.
   */
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  
  /* ESTADO: Termo de busca digitado pelo usuário */
  const [search, setSearch] = useState('');
  
  /* ESTADO: Filtro de status selecionado (all, pending, in-progress, completed) */
  const [filter, setFilter] = useState<FilterStatus>('all');
  
  /* ESTADO: Controle de abertura do modal de criação de tarefa */
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  /* ESTADO: Tarefa selecionada para visualização detalhada */
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  /* ESTADO: Controle de abertura do modal de detalhes */
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  /* ESTADO: Controle de abertura do modal de integrações */
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);
  
  /* ESTADO: Notificações */
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('taskflow_notifications');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved) as Notification[];
      /* Limpeza: Remove notificações de tarefas externas mockadas que não existem mais */
      return parsed.filter(n => !n.link?.startsWith('external-task'));
    } catch (e) {
      return [];
    }
  });
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  
  /* ESTADO: Indica se uma sincronização está em andamento */
  const [isSyncing, setIsSyncing] = useState(false);
  
  /* ESTADO: Modo de visualização da lista (Lista ou Grade) */
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  /* ESTADO: Controle do menu mobile */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  /* ESTADO: Seção ativa na barra lateral */
  const [activeSection, setActiveSection] = useState<'dashboard' | 'my-tasks' | 'reports'>('dashboard');
  
  /* ESTADO: Controle da barra lateral minimizada */
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  /* ESTADO: Nome do usuário para personalização da interface */
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || 'User';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  /* EFEITO: Persistência de Notificações */
  useEffect(() => {
    localStorage.setItem('taskflow_notifications', JSON.stringify(notifications));
  }, [notifications]);

  /* EFEITO: Verificação de Feriados */
  useEffect(() => {
    const holidays2026 = [
      { date: '2026-01-01', name: t('h_anoNovo') },
      { date: '2026-02-17', name: t('h_carnaval') },
      { date: '2026-04-03', name: t('h_sextaSanta') },
      { date: '2026-04-05', name: t('h_pascoa') },
      { date: '2026-04-21', name: t('h_tiradentes') },
      { date: '2026-05-01', name: t('h_diaTrabalho') },
      { date: '2026-06-04', name: t('h_corpusChristi') },
      { date: '2026-09-07', name: t('h_independencia') },
      { date: '2026-10-12', name: t('h_nossaSenhora') },
      { date: '2026-11-02', name: t('h_finados') },
      { date: '2026-11-15', name: t('h_proclamacao') },
      { date: '2026-12-25', name: t('h_natal') },
    ];

    const today = new Date();
    const todayStr = format(today, 'yyyy-MM-dd');
    
    /* Véspera de Feriado */
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

    const holidayToday = holidays2026.find(h => h.date === todayStr);
    const holidayTomorrow = holidays2026.find(h => h.date === tomorrowStr);

    if (holidayToday) {
      const holidayId = `holiday-${todayStr}`;
      if (!notifications.some(n => n.id === holidayId)) {
        addNotification({
          title: t('holidayTodayTitle'),
          message: t('holidayTodayMessage').replace('{holiday}', holidayToday.name),
          type: 'holiday'
        });
        toast.info(t('holidayTodayToast').replace('{holiday}', holidayToday.name));
      }
    }

    if (holidayTomorrow) {
      const eveId = `eve-${tomorrowStr}`;
      if (!notifications.some(n => n.id === eveId)) {
        addNotification({
          title: t('holidayEveTitle'),
          message: t('holidayEveMessage').replace('{holiday}', holidayTomorrow.name),
          type: 'holiday'
        });
        toast.info(t('holidayEveToast').replace('{holiday}', holidayTomorrow.name));
      }
    }
  }, [t]);

  /**
   * FUNÇÃO: ADICIONAR NOTIFICAÇÃO
   * Centraliza a criação de notificações reais.
   */
  const addNotification = (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      id: generateUUID(),
      createdAt: Date.now(),
      read: false,
      ...data
    };
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearAllNotifications = () => {
    setNotifications([]);
    setIsNotificationsOpen(false);
  };

  const handleRemoveNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  /**
   * FUNÇÃO: CLIQUE NA NOTIFICAÇÃO
   * Abre a tarefa relacionada se houver um link.
   */
  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
    
    if (notification.link) {
      const taskToOpen = tasks.find(t => t.id === notification.link);
      if (taskToOpen) {
        openTaskDetails(taskToOpen);
        setIsNotificationsOpen(false);
      }
    }
  };

  /**
   * EFEITO: BUSCA DADOS DO USUÁRIO E TAREFAS
   * Executado ao carregar a página para validar o token e carregar as informações.
   */
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        /* 1. Busca dados do perfil */
        const userRes = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (userRes.ok) {
          const userData = await userRes.json();
          const name = userData.user.fullName || userData.user.username;
          setUserName(name);
          localStorage.setItem('userName', name);
        } else if (userRes.status === 401 || userRes.status === 403) {
          handleLogout();
          return;
        }

        /* 2. Busca tarefas do usuário */
        const tasksRes = await fetch('/api/tasks', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData.tasks);
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error(t('genericError'));
      } finally {
        setIsLoadingTasks(false);
      }
    };
    
    fetchData();
  }, [navigate, t]);

  /**
   * FUNÇÃO: LOGOUT
   * Limpa as credenciais e redireciona para a tela de login.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    toast.success(t('logoutSuccessToast') || 'Sessão encerrada com segurança.');
    navigate('/login');
  };

  /* EFEITO: MOTOR DO TIMER POMODORO */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      let taskToSync: Task | null = null;

      setTasks(prevTasks => {
        let changed = false;
        const newTasks = prevTasks.map(task => {
          if (task.timerIsRunning && !task.completed) {
            changed = true;
            const currentSeconds = task.timerSeconds ?? 1500;
            const nextSeconds = currentSeconds - 1;
            const nextTotalSpent = (task.totalTimeSpent ?? 0) + 1;
            
            let newTimeLog = task.timeLog || [];
            const lastSession = newTimeLog[newTimeLog.length - 1];
            
            if (lastSession && (now - lastSession.endTime) < 5000) {
              const updatedSession = {
                ...lastSession,
                endTime: now,
                duration: lastSession.duration + 1
              };
              newTimeLog = [...newTimeLog.slice(0, -1), updatedSession];
            } else {
              const newSession = {
                id: generateUUID(),
                startTime: now - 1000,
                endTime: now,
                duration: 1
              };
              newTimeLog = [...newTimeLog, newSession];
            }

            if (nextSeconds <= 0) {
              const finishedTask = { 
                ...task, 
                timerSeconds: 1500, // Reseta para 25 minutos para a próxima sessão
                timerIsRunning: false,
                inProgress: false, // Sessão concluída, sai do estado "Em Foco" para permitir reiniciar do card
                totalTimeSpent: nextTotalSpent,
                timeLog: newTimeLog
              };
              taskToSync = finishedTask;
              return finishedTask;
            }
            
            return { 
              ...task, 
              timerSeconds: nextSeconds,
              totalTimeSpent: nextTotalSpent,
              timeLog: newTimeLog
            };
          }
          return task;
        });
        
        return changed ? newTasks : prevTasks;
      });

      // Executa efeitos colaterais fora do updater do estado
      if (taskToSync) {
        const task = taskToSync as Task;
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {}); // Silencia erro de autoplay
        } catch (e) {}

        toast.info(t('pomodoroFinishedToast').replace('{task}', task.title));
        
        addNotification({
          title: t('timerFinishedTitle'),
          message: t('timerFinishedMessage').replace('{task}', task.title),
          type: 'system',
          link: task.id
        });

        const token = localStorage.getItem('token');
        fetch(`/api/tasks/${task.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(task)
        }).catch(e => console.error('Erro ao sincronizar timer:', e));
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [t]);

  /* EFEITO: SINCRONIZAÇÃO PERIÓDICA DO TIMER (Debounced) */
  useEffect(() => {
    const activeTask = tasks.find(t => t.timerIsRunning);
    if (!activeTask) return;

    const timeout = setTimeout(() => {
      const token = localStorage.getItem('token');
      fetch(`/api/tasks/${activeTask.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(activeTask)
      }).catch(e => console.error('Erro ao salvar progresso do timer:', e));
    }, 5000);

    return () => clearTimeout(timeout);
  }, [tasks]);

  /**
   * EFEITO: SINCRONIZAÇÃO DE MODAL
   * Garante que se o modal de detalhes estiver aberto, ele receba as atualizações do timer em tempo real.
   */
  useEffect(() => {
    if (selectedTask) {
      const currentTask = tasks.find(t => t.id === selectedTask.id);
      if (currentTask && (
        currentTask.timerSeconds !== selectedTask.timerSeconds || 
        currentTask.timerIsRunning !== selectedTask.timerIsRunning ||
        currentTask.totalTimeSpent !== selectedTask.totalTimeSpent ||
        currentTask.completed !== selectedTask.completed
      )) {
        setSelectedTask(currentTask);
      }
    }
  }, [tasks, selectedTask]);

  /**
   * CÁLCULO: SAUDAÇÃO DINÂMICA
   * Retorna "Bom dia", "Boa tarde", etc, baseado no horário local.
   */
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return t('greetingMorning');
    if (hour >= 12 && hour < 18) return t('greetingAfternoon');
    if (hour >= 18 && hour <= 23) return t('greetingEvening');
    return t('greetingNight');
  }, [t]);

  /**
   * CÁLCULO: FILTRAGEM DE TAREFAS
   * Aplica busca, filtro de status e filtro de seção.
   * Recalcula apenas quando uma dessas dependências muda (useMemo).
   */
  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        /* Verifica se o título ou descrição contém o termo buscado */
        const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                             task.description.toLowerCase().includes(search.toLowerCase());
        
        /* Verifica se a tarefa corresponde ao status selecionado nas abas */
        const matchesFilter = filter === 'all' || 
                             (filter === 'pending' && !task.completed && !task.inProgress) || 
                             (filter === 'in-progress' && task.inProgress && !task.completed) ||
                             (filter === 'completed' && task.completed);
        
        /* Filtra entre tarefas globais (Dashboard) ou apenas locais (Minhas Tarefas) */
        const matchesSection = activeSection === 'dashboard' || 
                               (activeSection === 'my-tasks' && (task.source === 'local' || !task.source));
                               
        return matchesSearch && matchesFilter && matchesSection;
      })
      .sort((a, b) => b.createdAt - a.createdAt); /* Ordenação decrescente por data */
  }, [tasks, search, filter, activeSection]);

  /**
   * CÁLCULO: ESTATÍSTICAS
   * Calcula os números exibidos na barra de progresso.
   */
  const stats = useMemo(() => {
    const relevantTasks = tasks.filter(task => 
      activeSection === 'dashboard' || (activeSection === 'my-tasks' && (task.source === 'local' || !task.source))
    );
    
    return {
      total: relevantTasks.length,
      pending: relevantTasks.filter(t => !t.completed && !t.inProgress).length,
      inProgress: relevantTasks.filter(t => t.inProgress && !t.completed).length,
      completed: relevantTasks.filter(t => t.completed).length,
    };
  }, [tasks, activeSection]);

  /**
   * FUNÇÃO: ADICIONAR TAREFA
   * Cria um novo objeto de tarefa, salva no servidor e atualiza a lista local.
   */
  const handleAddTask = async (data: TaskFormData) => {
    const token = localStorage.getItem('token');
    const newTask: Task = {
      id: generateUUID(),
      ...data,
      completed: false,
      inProgress: data.inProgress || false,
      createdAt: Date.now(),
      source: 'local',
      history: [{
        id: generateUUID(),
        action: t('missionCreatedAction'),
        timestamp: Date.now()
      }]
    };

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      });

      if (!response.ok) throw new Error();

      setTasks(prevTasks => [newTask, ...prevTasks]);
      setIsModalOpen(false);
      toast.success(t('missionAddedToast'));
    } catch (error) {
      toast.error(t('genericError'));
    }
  };

  /**
   * FUNÇÃO: ALTERNAR CONCLUSÃO
   * Marca como concluída ou volta para pendente no servidor.
   */
  const toggleTask = async (id: string) => {
    const token = localStorage.getItem('token');
    const task = tasks.find(t_task => t_task.id === id);
    if (!task) return;

    const isCompleting = !task.completed;
    const newEntry = {
      id: generateUUID(),
      action: isCompleting ? t('missionCompletedAction') : t('missionReopenedAction'),
      timestamp: Date.now()
    };

    const updatedTask = { 
      ...task, 
      completed: isCompleting, 
      inProgress: false, 
      timerIsRunning: false,
      history: [...(task.history || []), newEntry]
    };

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedTask)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro ao alternar tarefa:', response.status, errorData);
        throw new Error(errorData.error || 'Erro ao alternar tarefa');
      }

      setTasks(prevTasks => prevTasks.map(t_task => t_task.id === id ? updatedTask : t_task));
      
      if (isCompleting) {
        toast.success(t('missionCompletedToast'));
      } else {
        toast.info(t('missionReopenedToast'));
      }
    } catch (error) {
      console.error('Erro na função toggleTask:', error);
      toast.error(t('genericError'));
    }
  };

  /**
   * FUNÇÃO: INGRESSAR NA TAREFA
   * Define o status como "Em Progresso" (Em Foco) no servidor.
   */
  const joinTask = async (id: string) => {
    const token = localStorage.getItem('token');
    const task = tasks.find(t_task => t_task.id === id);
    if (!task) return;

    const newEntry = {
      id: generateUUID(),
      action: t('missionFocusedAction'),
      timestamp: Date.now()
    };

    const updatedTask = { 
      ...task, 
      inProgress: true,
      timerIsRunning: true, // Inicia o timer automaticamente ao focar pelo card
      timerSeconds: (task.timerSeconds && task.timerSeconds > 0) ? task.timerSeconds : 1500,
      history: [...(task.history || []), newEntry]
    };

    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedTask)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro ao ingressar na tarefa:', response.status, errorData);
        throw new Error(errorData.error || 'Erro ao ingressar na tarefa');
      }

      setTasks(prevTasks => prevTasks.map(t_task => t_task.id === id ? updatedTask : t_task));
      toast.success(t('focusStartedToast'));
    } catch (error) {
      console.error('Erro na função joinTask:', error);
      toast.error(t('genericError'));
    }
  };

  /**
   * FUNÇÃO: ATUALIZAR TAREFA
   * Recebe os dados editados de uma tarefa e atualiza no servidor.
   */
  const handleUpdateTask = async (updatedTask: Task) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/tasks/${updatedTask.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedTask)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Erro ao atualizar tarefa:', response.status, errorData);
        throw new Error(errorData.error || 'Erro ao atualizar tarefa');
      }

      setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      if (selectedTask?.id === updatedTask.id) {
        setSelectedTask(updatedTask);
      }
    } catch (error) {
      console.error('Erro na função handleUpdateTask:', error);
      toast.error(t('genericError'));
    }
  };

  /**
   * FUNÇÃO: ABRIR DETALHES
   * Prepara o estado e abre o modal de visualização detalhada.
   */
  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  /**
   * FUNÇÃO: SINCRONIZAR INTEGRAÇÕES
   * Chama a API do backend para buscar tarefas do Trello/Sheets.
   */
  const handleSync = async () => {
    setIsSyncing(true);
    const token = localStorage.getItem('token');
    try {
      /* Recupera as chaves de API salvas no navegador */
      const savedKeys = localStorage.getItem('taskflow_api_keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};

      const response = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ apiKeys }),
      });
      
      if (!response.ok) throw new Error(t('syncFailed'));
      
      const data = await response.json();
      const integratedTasks = data.tasks as Task[];
      
      /* Verifica se existe pelo menos uma chave de API com valor preenchido */
      const hasActiveIntegration = apiKeys && Object.values(apiKeys).some((config: any) => 
        Object.values(config).some((val: any) => typeof val === 'string' && val.trim().length > 0)
      );

      /* Detectar novas missões e comentários para notificar o usuário */
      integratedTasks.forEach(externalTask => {
        const existingTask = tasks.find(t_task => t_task.id === externalTask.id);
        
        /* Se a tarefa é nova (não existia localmente) */
        if (!existingTask) {
          addNotification({
            title: t('newMissionTitle').replace('{source}', externalTask.source?.toUpperCase() || ''),
            message: t('newMissionMessage').replace('{task}', externalTask.title),
            type: 'integration',
            link: externalTask.id
          });
        }
        /* Se a tarefa já existia, verifica se há novos comentários */
        else if (externalTask.comments) {
          const newComments = externalTask.comments.filter(
            extComm => !existingTask.comments?.some(existComm => existComm.id === extComm.id)
          );

          if (newComments.length > 0) {
            addNotification({
              title: t('newCommentTitle').replace('{source}', externalTask.source?.toUpperCase() || ''),
              message: t('newCommentMessage').replace('{author}', newComments[0].author).replace('{task}', externalTask.title),
              type: 'interaction',
              link: externalTask.id
            });
          }
        }
      });

      /* Mescla as tarefas locais com as vindas das integrações */
      setTasks(prev => {
        const localOnly = prev.filter(t_task => t_task.source === 'local' || !t_task.source);
        return [...localOnly, ...integratedTasks];
      });
      
      if (integratedTasks.length > 0) {
        toast.success(t('syncSuccessToast').replace('{count}', String(integratedTasks.length)));

        /* Notificação Real: Sincronização */
        addNotification({
          title: t('syncFinishedTitle'),
          message: t('syncFinishedMessage').replace('{count}', String(integratedTasks.length)),
          type: 'integration'
        });
      } else {
        /* Se não houver tarefas novas (ou nenhuma integração), apenas avisa que está tudo em dia */
        toast.success(t('syncSuccessToast').replace('{count}', '0'));
      }
    } catch (error) {
      console.error("Erro de sincronização:", error);
      toast.error(t('syncConnectionError'));
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * FUNÇÃO: EXCLUIR TAREFA
   * Remove permanentemente uma tarefa no servidor.
   */
  const deleteTask = async (id: string) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error();

      setTasks(prevTasks => prevTasks.filter(t_task => t_task.id !== id));
      toast.success(t('missionRemovedToast'));
    } catch (error) {
      toast.error(t('genericError'));
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground font-sans overflow-x-hidden">
      {/* Componente de notificações global */}
      <Toaster position="top-right" richColors />
      
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR: Navegação lateral fixa no desktop */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-[60] bg-card border-r border-border p-8 transform transition-all duration-300 ease-in-out shrink-0",
          isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0",
          isSidebarCollapsed ? "md:w-24 md:px-4" : "w-72"
        )}>
          {/* Botão Minimizar Sidebar (Desktop/Tablet) */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute -right-4 top-20 z-[60] bg-card border border-border rounded-full shadow-sm hidden md:flex hover:bg-background"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            <ChevronLeft className={cn("w-4 h-4 text-slate-400 transition-transform", isSidebarCollapsed && "rotate-180")} />
          </Button>

          {/* Botão Fechar Mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 md:hidden rounded-xl"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Plus className="w-6 h-6 text-slate-400 rotate-45" />
          </Button>

          {/* Logo e Nome do App */}
          <div className={cn("flex items-center gap-4 mb-12 transition-all", isSidebarCollapsed && !isMobileMenuOpen && "justify-center")}>
            <div className="w-10 h-10 bg-foreground rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <CheckSquare className="text-background w-6 h-6" />
            </div>
            {(!isSidebarCollapsed || isMobileMenuOpen) && <h1 className="text-xl font-black tracking-tighter text-foreground">TASKFLOW</h1>}
          </div>

          {/* Links de Navegação */}
          <nav className="space-y-1 flex-1">
            <NavItem 
              icon={LayoutDashboard} 
              label={t('dashboard')} 
              active={activeSection === 'dashboard'} 
              collapsed={isSidebarCollapsed && !isMobileMenuOpen}
              onClick={() => { setActiveSection('dashboard'); setIsMobileMenuOpen(false); }} 
            />
            <NavItem 
              icon={CheckSquare} 
              label={t('tasks')} 
              active={activeSection === 'my-tasks'} 
              collapsed={isSidebarCollapsed && !isMobileMenuOpen}
              onClick={() => { setActiveSection('my-tasks'); setIsMobileMenuOpen(false); }} 
            />
            <NavItem 
              icon={BarChart3} 
              label={t('reports')} 
              active={activeSection === 'reports'} 
              collapsed={isSidebarCollapsed && !isMobileMenuOpen}
              onClick={() => { setActiveSection('reports'); setIsMobileMenuOpen(false); }} 
            />
            <NavItem icon={CalendarIcon} label={t('calendar')} collapsed={isSidebarCollapsed && !isMobileMenuOpen} onClick={() => navigate('/calendar')} />
            <NavItem icon={Share2} label={t('integrations')} collapsed={isSidebarCollapsed && !isMobileMenuOpen} onClick={() => { setIsIntegrationsModalOpen(true); setIsMobileMenuOpen(false); }} />
          </nav>

          {/* Rodapé da Sidebar com Perfil do Usuário */}
          <div className={cn("pt-4 transition-all", isSidebarCollapsed && !isMobileMenuOpen && "flex flex-col items-center")}>
            <Separator className="mb-6" />
            <div 
              onClick={() => navigate('/profile')}
              className={cn(
                "group flex items-center gap-3 p-2 rounded-2xl hover:bg-background cursor-pointer transition-all border-2 border-transparent hover:border-border",
                isSidebarCollapsed && !isMobileMenuOpen && "justify-center"
              )}
            >
              <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center shadow-md text-white shrink-0">
                <User className="w-4 h-4" />
              </div>
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate group-hover:text-accent transition-colors text-foreground">{userName}</p>
                  <p className="text-[9px] font-bold text-foreground-muted uppercase tracking-widest">{t('profile')}</p>
                </div>
              )}
            </div>
            
            {/* Botão de Sair */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className={cn(
                "w-full mt-2 justify-start text-foreground-muted hover:text-destructive hover:bg-destructive/5 rounded-xl font-bold h-9",
                isSidebarCollapsed && !isMobileMenuOpen && "justify-center px-0"
              )}
            >
              <LogOut className={cn("w-3.5 h-3.5", (!isSidebarCollapsed || isMobileMenuOpen) && "mr-2")} />
              {(!isSidebarCollapsed || isMobileMenuOpen) && t('logout')}
            </Button>
          </div>
        </aside>

        {/* Overlay para fechar menu mobile ou recolher sidebar ao clicar fora */}
        {(isMobileMenuOpen || !isSidebarCollapsed) && (
          <div 
            className={cn(
              "fixed inset-0 bg-slate-900/20 backdrop-blur-md z-[55] transition-all duration-300",
              isMobileMenuOpen ? "block" : "hidden md:block"
            )}
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsSidebarCollapsed(true);
            }}
          />
        )}

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 flex flex-col min-h-0 w-full min-w-0 md:pl-24">
          
          {/* HEADER: Barra superior com busca e ações rápidas */}
          <header className="h-16 md:h-20 bg-card border-b border-border px-3 md:px-8 flex items-center justify-between shrink-0 relative z-[50]">
            {/* Menu Mobile (Hambúrguer) */}
            <div className="flex items-center gap-3 md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-xl w-9 h-9"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </Button>
              <h1 className="text-base font-black tracking-tighter text-foreground">TASKFLOW</h1>
            </div>

            {/* Breadcrumbs (Caminho de navegação) */}
            <div className="hidden md:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-foreground-muted">
              <span className="hover:text-foreground cursor-pointer">{t('home')}</span>
              <span className="text-foreground-muted/50">/</span>
              <span className="text-foreground">
                {activeSection === 'dashboard' ? t('dashboard') : t('tasks')}
              </span>
            </div>

            {/* Ações do Cabeçalho */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Botão de Sincronização */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSync}
                disabled={isSyncing}
                className="h-9 md:h-11 px-3 md:px-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden sm:flex items-center gap-2 rounded-xl md:rounded-2xl border-2 border-border shadow-[0_3px_0_0_var(--shadow)] md:shadow-[0_4px_0_0_var(--shadow)] active:shadow-none active:translate-y-[2px] transition-all"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
                {isSyncing ? t('syncing') : t('sync')}
              </Button>
              
              {/* Notificações */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={cn(
                    "text-foreground-muted rounded-xl hover:bg-background w-9 h-9 md:w-10 md:h-10 transition-all",
                    isNotificationsOpen && "bg-background text-foreground shadow-inner"
                  )}
                >
                  <Bell className={cn("w-5 h-5 md:w-6 md:h-6", unreadNotificationsCount > 0 && "animate-wiggle")} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-background shadow-sm">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </Button>

                {isNotificationsOpen && (
                  <NotificationPopover 
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onNotificationClick={handleNotificationClick}
                    onClearAll={handleClearAllNotifications}
                    onRemove={handleRemoveNotification}
                    onClose={() => setIsNotificationsOpen(false)}
                  />
                )}
              </div>

              {/* Botão de Criar Tarefa (Abre o Dialog) */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="h-9 md:h-11 px-3 md:px-6 gap-1.5 md:gap-2 rounded-xl md:rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-widest text-[8px] xs:text-[9px] md:text-[10px] shadow-[0_3px_0_0_var(--primary-dark)] md:shadow-[0_4px_0_0_var(--primary-dark)] active:shadow-none active:translate-y-[2px] transition-all">
                    <Plus className="w-3.5 h-3.5 md:w-4 h-4" />
                    <span className="hidden xs:inline">{t('addTask')}</span>
                    <span className="xs:hidden">{t('new')}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2rem] sm:rounded-[2.5rem] p-0 border-4 border-border w-full max-w-[95vw] sm:max-w-lg overflow-hidden max-h-[90vh] bg-card">
                  <div className="overflow-y-auto overflow-x-hidden max-h-[90vh] p-3 sm:p-8 custom-scrollbar pr-4 sm:pr-6">
                    <DialogHeader className="mb-2 sm:mb-4">
                      <DialogTitle className="text-xl sm:text-2xl font-black text-center text-foreground">{t('addTask')} 🎯</DialogTitle>
                    </DialogHeader>
                    <TaskForm onSubmit={handleAddTask} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          {/* ÁREA DE SCROLL: Onde o conteúdo aparece */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 bg-background overflow-x-hidden">
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 w-full">
              
              {activeSection === 'dashboard' ? (
                /* VISÃO DE DASHBOARD: Gráficos e Analytics */
                <DashboardAnalytics tasks={tasks} userName={userName} greeting={greeting} stats={stats} />
              ) : activeSection === 'reports' ? (
                /* VISÃO DE RELATÓRIOS: Tempo por Categoria e Busca */
                <ReportsView tasks={tasks} onOpenTask={openTaskDetails} />
              ) : (
                /* VISÃO DE MINHAS TAREFAS: Lista de Jornada */
                <MyTasksView 
                  tasks={tasks}
                  filteredTasks={filteredTasks}
                  filter={filter}
                  setFilter={setFilter}
                  search={search}
                  setSearch={setSearch}
                  viewMode={viewMode}
                  toggleTask={toggleTask}
                  deleteTask={deleteTask}
                  joinTask={joinTask}
                  openTaskDetails={openTaskDetails}
                  setIsModalOpen={setIsModalOpen}
                />
              )}
            </div>
          </div>
        </main>

        {/* MODAL: Detalhes da Tarefa (Timer, Checklist, Descrição) */}
        <TaskDetailsModal 
          task={selectedTask}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onUpdateTask={handleUpdateTask}
        />

        {/* MODAL: Configuração de Integrações (Trello, Sheets) */}
        <IntegrationsModal 
          isOpen={isIntegrationsModalOpen}
          onClose={() => setIsIntegrationsModalOpen(false)}
          onSync={handleSync}
          onAddNotification={addNotification}
        />
      </div>
    </div>
  );
}

/**
 * COMPONENTE: DashboardAnalytics
 * Renderiza a visão de gráficos e estatísticas de produtividade.
 */
function DashboardAnalytics({ tasks, userName, greeting, stats }: { 
  tasks: Task[], 
  userName: string, 
  greeting: string,
  stats: any
}) {
  const { palette } = useTheme();
  const { t, language } = useLanguage();

  const dateLocale = useMemo(() => {
    switch (language) {
      case 'en': return enUS;
      case 'es': return esLocale;
      default: return ptBR;
    }
  }, [language]);

  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');

  /* CÁLCULO: Intervalos de tempo (Atual e Anterior) */
  const intervals = useMemo(() => {
    const now = new Date();
    let current: { start: Date; end: Date };
    let previous: { start: Date; end: Date };

    switch (period) {
      case 'day':
        current = { start: startOfDay(now), end: endOfDay(now) };
        previous = { start: startOfDay(subDays(now, 1)), end: endOfDay(subDays(now, 1)) };
        break;
      case 'week':
        current = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
        previous = { start: startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), end: endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }) };
        break;
      case 'month':
        current = { start: startOfMonth(now), end: endOfMonth(now) };
        previous = { start: startOfMonth(subMonths(now, 1)), end: endOfMonth(subMonths(now, 1)) };
        break;
      case 'year':
        current = { start: startOfYear(now), end: endOfYear(now) };
        previous = { start: startOfYear(subYears(now, 1)), end: endOfYear(subYears(now, 1)) };
        break;
    }
    return { current, previous };
  }, [period]);

  /* CÁLCULO: Dados por Categoria no período selecionado */
  const timeData = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    
    tasks.forEach(t => {
      const filteredSessions = t.timeLog?.filter(s => 
        isWithinInterval(new Date(s.startTime), intervals.current)
      ) || [];
      
      const time = filteredSessions.reduce((acc, s) => acc + s.duration, 0);
      if (time > 0) {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + time;
      }
    });

    return Object.entries(categoryMap)
      .map(([name, time]) => ({
        name: name,
        minutes: Math.round(time / 60),
        fullName: name
      }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 5);
  }, [tasks, intervals]);

  /* CÁLCULO: Ranking de Tarefas (Qual tarefa se dedicou mais) */
  const topTasksData = useMemo(() => {
    return tasks
      .map(t => {
        const filteredSessions = t.timeLog?.filter(s => 
          isWithinInterval(new Date(s.startTime), intervals.current)
        ) || [];
        const time = filteredSessions.reduce((acc, s) => acc + s.duration, 0);
        return { 
          id: t.id, 
          title: t.title, 
          minutes: Math.round(time / 60),
          category: t.category
        };
      })
      .filter(t => t.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 3);
  }, [tasks, intervals]);

  /* CÁLCULO: Comparação de Desempenho (Atual vs Anterior) */
  const performanceData = useMemo(() => {
    let currentTotal = 0;
    let previousTotal = 0;

    tasks.forEach(t => {
      const currentSessions = t.timeLog?.filter(s => 
        isWithinInterval(new Date(s.startTime), intervals.current)
      ) || [];
      const previousSessions = t.timeLog?.filter(s => 
        isWithinInterval(new Date(s.startTime), intervals.previous)
      ) || [];

      currentTotal += currentSessions.reduce((acc, s) => acc + s.duration, 0);
      previousTotal += previousSessions.reduce((acc, s) => acc + s.duration, 0);
    });

    const currentMinutes = Math.round(currentTotal / 60);
    const previousMinutes = Math.round(previousTotal / 60);
    const diff = currentMinutes - previousMinutes;
    const percent = previousMinutes > 0 ? Math.round((diff / previousMinutes) * 100) : 100;

    return {
      current: currentMinutes,
      previous: previousMinutes,
      diff,
      percent,
      isUp: diff >= 0
    };
  }, [tasks, intervals]);

  /* CÁLCULO: Dados para o gráfico de linha (Tendência) */
  const trendData = useMemo(() => {
    if (period === 'day') {
      // Por hora (simulado ou real se houver dados)
      return [
        { name: '00h', value: 0 }, { name: '04h', value: 10 }, { name: '08h', value: 45 },
        { name: '12h', value: 30 }, { name: '16h', value: 60 }, { name: '20h', value: 20 }
      ];
    }

    if (period === 'week') {
      const days = eachDayOfInterval(intervals.current);
      return days.map(day => {
        let dailyTotal = 0;
        tasks.forEach(t => {
          const sessions = t.timeLog?.filter(s => isSameDay(new Date(s.startTime), day)) || [];
          dailyTotal += sessions.reduce((acc, s) => acc + s.duration, 0);
        });
        return {
          name: format(day, 'EEE', { locale: dateLocale }),
          value: Math.round(dailyTotal / 60)
        };
      });
    }

    if (period === 'month') {
      const days = eachDayOfInterval(intervals.current);
      // Agrupar por semanas para não ficar muito poluído
      const weeks: any[] = [];
      for (let i = 0; i < days.length; i += 7) {
        const weekDays = days.slice(i, i + 7);
        let weekTotal = 0;
        tasks.forEach(t => {
          const sessions = t.timeLog?.filter(s => 
            weekDays.some(wd => isSameDay(new Date(s.startTime), wd))
          ) || [];
          weekTotal += sessions.reduce((acc, s) => acc + s.duration, 0);
        });
        weeks.push({
          name: `${t('weekAbbreviation')} ${Math.floor(i/7) + 1}`,
          value: Math.round(weekTotal / 60)
        });
      }
      return weeks;
    }

    if (period === 'year') {
      const months = eachMonthOfInterval(intervals.current);
      return months.map(month => {
        let monthTotal = 0;
        tasks.forEach(t => {
          const sessions = t.timeLog?.filter(s => isSameMonth(new Date(s.startTime), month)) || [];
          monthTotal += sessions.reduce((acc, s) => acc + s.duration, 0);
        });
        return {
          name: format(month, 'MMM', { locale: dateLocale }),
          value: Math.round(monthTotal / 60)
        };
      });
    }

    return [];
  }, [tasks, intervals, period]);

  /* Prepara dados para o gráfico de distribuição de status */
  const statusData = [
    { name: t('todo'), value: stats.pending, color: '#fef08a' },
    { name: t('focus'), value: stats.inProgress, color: '#e9d5ff' },
    { name: t('done'), value: stats.completed, color: '#86efac' },
  ].filter(d => d.value > 0);

  /* Calcula tempo total focado (Geral) */
  const totalMinutes = Math.round(tasks.reduce((acc, t) => acc + (t.totalTimeSpent ?? 0), 0) / 60);

  return (
    <div className="space-y-6 md:space-y-10">
      {/* HEADER DE BOAS-VINDAS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-5 md:p-8 lg:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-border shadow-[0_8px_0_0_var(--shadow)] md:shadow-[0_12px_0_0_var(--shadow)]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
          <div className="space-y-2 md:space-y-3">
            <h2 className="text-xl md:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-tight">
              {greeting}, <span className="text-me-purple">{userName.split(' ')[0]}</span>!
            </h2>
            <p className="text-slate-500 font-bold text-sm md:text-lg lg:text-xl">
              {t('productivityMap')}
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3 md:gap-4">
            <StatMiniCard icon={TrendingUp} label={t('totalTime')} value={`${totalMinutes}m`} color="bg-me-blue" />
            <StatMiniCard icon={CheckSquare} label={t('completed')} value={stats.completed} color="bg-duo-green" />
          </div>
        </div>
      </motion.div>

      {/* SELETOR DE PERÍODO: Agora abaixo do header e acima dos indicadores */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-4 md:p-6 rounded-[2rem] border-2 border-border shadow-[0_6px_0_0_var(--shadow)] flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center">
            <Filter className="w-4 h-4 text-slate-400" />
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-slate-400">{t('filterTimeAnalysis')}</span>
        </div>
        <div className="flex gap-1 md:gap-2 w-full md:w-auto overflow-x-auto no-scrollbar flex-nowrap justify-center pb-2">
          {(['day', 'week', 'month', 'year'] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? "me" : "ghost"}
              size="sm"
              onClick={() => setPeriod(p)}
              className={cn(
                "flex-1 md:flex-none rounded-xl font-black uppercase tracking-widest text-[9px] md:text-[10px] px-3 md:px-6 h-9 md:h-10 transition-all whitespace-nowrap shrink-0",
                period === p ? "shadow-[0_4px_0_0_#1e40af]" : "text-slate-400"
              )}
            >
              {p === 'day' ? t('today') : p === 'week' ? t('week') : p === 'month' ? t('month') : t('year')}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* CARDS DE COMPARAÇÃO E RANKING */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-10">
        {/* CARD: COMPARAÇÃO DE DESEMPENHO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card p-8 rounded-[2.5rem] border-4 border-border border-b-[10px] border-b-slate-300 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 bg-me-blue rounded-xl flex items-center justify-center text-white shadow-lg border-b-4 border-blue-800">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className={cn(
              "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1",
              performanceData.isUp ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
            )}>
              {performanceData.isUp ? '+' : ''}{performanceData.percent}%
            </div>
          </div>
          <p className="text-4xl font-black text-foreground tracking-tighter">{performanceData.current}m</p>
          <p className="text-slate-400 font-bold italic mt-2">{t('focusedInThis')} {period === 'day' ? t('today') : period === 'week' ? t('week') : period === 'month' ? t('month') : t('year')}</p>
          <div className="mt-4 pt-4 border-t-2 border-border flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('previous')}: {performanceData.previous}m</span>
            <span className={cn("text-xs font-black", performanceData.isUp ? "text-green-500" : "text-red-500")}>
              {performanceData.isUp ? t('growing') : t('belowTarget')}
            </span>
          </div>
        </motion.div>

        {/* CARD: TOP MISSÃO DO PERÍODO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card p-8 rounded-[2.5rem] border-4 border-border border-b-[10px] border-b-slate-300 shadow-xl"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-me-purple rounded-xl flex items-center justify-center text-white shadow-lg border-b-4 border-purple-800">
              <Target className="w-6 h-6" />
            </div>
            <span className="font-black text-slate-400 uppercase tracking-widest text-xs">{t('highestDedication')}</span>
          </div>
          <p className="text-3xl font-black text-foreground tracking-tighter truncate">
            {topTasksData[0]?.title || '---'}
          </p>
          <p className="text-slate-400 font-bold italic mt-2">{topTasksData[0]?.minutes || 0}m {t('invested')}</p>
          <div className="mt-4 space-y-2">
            {topTasksData.slice(1).map((t, i) => (
              <div key={t.id} className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="truncate max-w-[150px]">{i+2}. {t.title}</span>
                <span>{t.minutes}m</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card p-6 rounded-[2.5rem] border-4 border-border border-b-[10px] border-b-shadow shadow-xl flex flex-col"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg border-b-4 border-primary-dark">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="font-black text-foreground-muted uppercase tracking-widest text-xs">{t('trend')}</span>
          </div>
          <div className="flex-1 min-h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={palette.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={palette.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="value" stroke={palette.primary} strokeWidth={4} fillOpacity={1} fill="url(#colorValue)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: palette.card,
                    borderRadius: '1rem', 
                    border: `2px solid ${palette.border}`, 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', 
                    fontWeight: 800,
                    color: palette.text
                  }}
                  labelStyle={{ display: 'none' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-card p-6 md:p-8 rounded-[2rem] border-2 border-border shadow-[0_8px_0_0_var(--shadow)] flex flex-col h-[350px] md:h-[450px]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Clock className="text-primary w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg lg:text-xl font-black uppercase tracking-widest text-foreground">{t('timeByCategory')}</h3>
          </div>
          
          <div className="flex-1 min-h-0">
            {timeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={palette.border} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: palette.textMuted, fontSize: 10, fontWeight: 800 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: palette.textMuted, fontSize: 10, fontWeight: 800 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: palette.background }}
                    contentStyle={{ 
                      backgroundColor: palette.card,
                      borderRadius: '1rem', 
                      border: `2px solid ${palette.border}`,
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      fontWeight: 800,
                      fontSize: '12px',
                      color: palette.text
                    }}
                  />
                  <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
                    {timeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[palette.primary, palette.secondary, palette.accent, palette.primaryDark, palette.secondaryDark][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message={t('startTimerMessage')} />
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-card p-6 md:p-8 rounded-[2rem] border-2 border-border shadow-[0_8px_0_0_var(--shadow)] flex flex-col h-[350px] md:h-[450px]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-accent/10 rounded-xl flex items-center justify-center">
              <PieChartIcon className="text-accent w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg lg:text-xl font-black uppercase tracking-widest text-foreground">{t('journeyStatus')}</h3>
          </div>

          <div className="flex-1 min-h-0">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={[palette.primary, palette.secondary, palette.accent, palette.primaryDark][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: palette.card,
                      borderRadius: '1rem', 
                      border: `2px solid ${palette.border}`,
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      fontWeight: 800,
                      color: palette.text
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message={t('addMissionsMessage')} />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * COMPONENTE: MyTasksView
 * Renderiza a lista de tarefas e controles de filtragem.
 */
function MyTasksView({ 
  tasks, 
  filteredTasks, 
  filter, 
  setFilter, 
  search, 
  setSearch, 
  viewMode,
  toggleTask,
  deleteTask,
  joinTask,
  openTaskDetails,
  setIsModalOpen
}: {
  tasks: Task[],
  filteredTasks: Task[],
  filter: FilterStatus,
  setFilter: (f: FilterStatus) => void,
  search: string,
  setSearch: (s: string) => void,
  viewMode: 'list' | 'grid',
  toggleTask: (id: string) => void,
  deleteTask: (id: string) => void,
  joinTask: (id: string) => void,
  openTaskDetails: (task: Task) => void,
  setIsModalOpen: (o: boolean) => void
}) {
  const { palette } = useTheme();
  const { t } = useLanguage();
  /* Calcula estatísticas locais */
  const localStats = useMemo(() => {
    return {
      total: filteredTasks.length,
      completed: filteredTasks.filter(t => t.completed).length
    };
  }, [filteredTasks]);

  return (
    <div className="space-y-8 md:space-y-12">
      {/* BARRA DE PROGRESSO LOCAL */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-border shadow-[0_10px_0_0_var(--shadow)] space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-3xl font-black tracking-tight text-foreground">{t('myMissions')}</h2>
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Rocket className="w-6 h-6 text-primary" />
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground-muted">
            {localStats.completed} {t('doneOf')} {localStats.total} {t('doneTasks')}
          </span>
        </div>
        <div className="h-4 w-full bg-background rounded-full overflow-hidden border-2 border-border p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(localStats.completed / (localStats.total || 1)) * 100}%` }}
            className="h-full bg-primary rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]"
          />
        </div>
      </motion.div>

      {/* CONTROLES: Filtros por abas e Barra de Busca */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)} className="w-full lg:w-auto min-w-0">
          <TabsList className="bg-card p-1 md:p-2 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-border shadow-[0_6px_0_0_var(--shadow)] md:shadow-[0_8px_0_0_var(--shadow)] h-auto min-h-[3rem] md:min-h-[5rem] flex gap-1 md:gap-2 w-full overflow-x-auto no-scrollbar pb-3 md:pb-4">
            <TabsTrigger value="all" className="flex-1 lg:flex-none rounded-xl md:rounded-3xl data-[state=active]:bg-primary data-[state=active]:text-background data-[state=active]:shadow-[0_3px_0_0_var(--primary-dark)] font-black uppercase tracking-widest text-[7px] xs:text-[8px] md:text-[10px] px-2 md:px-8 transition-all min-w-0 shrink-0">{t('all')}</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 lg:flex-none rounded-xl md:rounded-3xl data-[state=active]:bg-warning data-[state=active]:text-background data-[state=active]:shadow-[0_3px_0_0_var(--warning-dark)] font-black uppercase tracking-widest text-[7px] xs:text-[8px] md:text-[10px] px-2 md:px-8 transition-all min-w-0 shrink-0">{t('todo')}</TabsTrigger>
            <TabsTrigger value="in-progress" className="flex-1 lg:flex-none rounded-xl md:rounded-3xl data-[state=active]:bg-accent data-[state=active]:text-background data-[state=active]:shadow-[0_3px_0_0_var(--accent-dark)] font-black uppercase tracking-widest text-[7px] xs:text-[8px] md:text-[10px] px-2 md:px-8 transition-all min-w-0 shrink-0">{t('focus')}</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 lg:flex-none rounded-xl md:rounded-3xl data-[state=active]:bg-success data-[state=active]:text-background data-[state=active]:shadow-[0_3px_0_0_var(--success-dark)] font-black uppercase tracking-widest text-[7px] xs:text-[8px] md:text-[10px] px-2 md:px-8 transition-all min-w-0 shrink-0">{t('done')}</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full lg:w-80 xl:w-96">
          <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-foreground-muted" />
          <Input 
            placeholder={t('searchMission')} 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 md:pl-16 h-14 md:h-20 bg-card rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-border shadow-[0_6px_0_0_var(--shadow)] md:shadow-[0_8px_0_0_var(--shadow)] focus-visible:ring-primary font-black text-sm md:text-xl placeholder:text-foreground-muted/50 transition-all focus:translate-y-[2px] focus:shadow-[0_4px_0_0_var(--shadow)] md:focus:shadow-[0_6px_0_0_var(--shadow)]"
          />
        </div>
      </div>

      {/* LISTA DE TAREFAS: Renderizada como uma Jornada Visual */}
      <div className="relative pb-12 md:pb-24 w-full">
        <div className="absolute left-4 sm:left-6 md:-left-10 top-0 bottom-0 w-1.5 md:w-2 bg-border rounded-full hidden xs:block" />
        
        <div className={cn(
          "min-h-[300px] md:min-h-[400px] relative z-10 w-full",
          viewMode === 'list' ? "space-y-6 md:space-y-10" : "grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10"
        )}>
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 100 }}
                  className="relative w-full"
                >
                  <div className={cn(
                    "absolute -left-6 sm:-left-10 md:-left-16 top-8 md:top-12 w-8 h-8 md:w-12 md:h-12 rounded-full border-2 md:border-4 border-background shadow-xl hidden xs:flex items-center justify-center z-20 transition-colors duration-500",
                    task.completed ? "bg-success" : task.inProgress ? "bg-accent" : "bg-border"
                  )}>
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 md:w-6 md:h-6 text-background" />
                    ) : (
                      <div className="w-3 h-3 md:w-4 md:h-4 bg-background rounded-full animate-pulse" />
                    )}
                  </div>

                  <TaskCard 
                    task={task} 
                    onToggle={toggleTask} 
                    onDelete={deleteTask}
                    onJoin={joinTask}
                    onClick={openTaskDetails}
                  />
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full py-40 flex flex-col items-center justify-center text-foreground-muted text-center bg-card rounded-[4rem] border-4 border-dashed border-border"
              >
                <div className="w-32 h-32 bg-background rounded-[2.5rem] flex items-center justify-center mb-8 border-2 border-border">
                  <CheckSquare className="w-16 h-16 text-border" />
                </div>
                <p className="font-black text-foreground text-3xl">{t('noMissionsFound')}</p>
                <p className="text-xl mt-4 font-bold text-foreground-muted" dangerouslySetInnerHTML={{ __html: t('journeyWaiting') }} />
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-10 h-14 px-8 rounded-2xl bg-foreground text-background font-black uppercase tracking-normal sm:tracking-widest text-[10px] sm:text-xs shadow-[0_6px_0_0_var(--shadow)] active:shadow-none active:translate-y-[2px] transition-all"
                >
                  {t('addTask')}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

/**
 * COMPONENTE AUXILIAR: StatMiniCard
 */
function StatMiniCard({ icon: Icon, label, value, color }: { icon: any, label: string, value: string | number, color: string }) {
  return (
    <div className="bg-background/50 p-3 md:p-6 rounded-2xl md:rounded-3xl border-2 border-border flex items-center gap-3 md:gap-4 min-w-[110px] md:min-w-[160px] flex-1 sm:flex-none">
      <div className={cn("w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-background shadow-md shrink-0", color)}>
        <Icon className="w-4 h-4 md:w-6 md:h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-foreground-muted truncate">{label}</p>
        <p className="text-sm md:text-xl font-black text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

/**
 * COMPONENTE AUXILIAR: EmptyChartState
 */
function EmptyChartState({ message }: { message: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8">
      <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center mb-4 border-2 border-border">
        <BarChart3 className="w-8 h-8 text-border" />
      </div>
      <p className="text-foreground-muted font-bold text-sm">{message}</p>
    </div>
  );
}

/**
 * COMPONENTE AUXILIAR: NavItem
 * Renderiza um link na barra lateral com estilo ativo/inativo.
 */
function NavItem({ icon: Icon, label, active = false, onClick, collapsed = false }: { icon: any, label: string, active?: boolean, onClick?: () => void, collapsed?: boolean }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all cursor-pointer border-2 border-transparent",
        active 
          ? "bg-foreground text-background shadow-lg shadow-shadow" 
          : "text-foreground-muted hover:bg-background hover:text-foreground hover:border-border",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon className={cn("w-4.5 h-4.5 shrink-0", active ? "text-background" : "text-foreground-muted")} />
      {!collapsed && <span>{label}</span>}
      {active && !collapsed && <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 bg-background rounded-full" />}
    </div>
  );
}
