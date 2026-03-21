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
  Legend
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
/* Importação de utilitários e componentes de UI base (Shadcn/UI style) */
import { cn } from '@/src/lib/utils';
import { format } from "date-fns";
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
  /* Hook para navegação programática */
  const navigate = useNavigate();
  
  /**
   * ESTADO: LISTA DE TAREFAS
   * Inicializa tentando ler do LocalStorage para manter os dados após o refresh.
   */
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
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
    return saved ? JSON.parse(saved) : [];
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
  const [activeSection, setActiveSection] = useState<'dashboard' | 'my-tasks'>('dashboard');
  
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
      { date: '2026-01-01', name: 'Ano Novo' },
      { date: '2026-02-17', name: 'Carnaval' },
      { date: '2026-04-03', name: 'Sexta-feira Santa' },
      { date: '2026-04-05', name: 'Páscoa' },
      { date: '2026-04-21', name: 'Tiradentes' },
      { date: '2026-05-01', name: 'Dia do Trabalho' },
      { date: '2026-06-04', name: 'Corpus Christi' },
      { date: '2026-09-07', name: 'Independência do Brasil' },
      { date: '2026-10-12', name: 'Nossa Senhora Aparecida' },
      { date: '2026-11-02', name: 'Finados' },
      { date: '2026-11-15', name: 'Proclamação da República' },
      { date: '2026-12-25', name: 'Natal' },
    ];

    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const holiday = holidays2026.find(h => h.date === todayStr);

    if (holiday) {
      const holidayId = `holiday-${todayStr}`;
      if (!notifications.some(n => n.id === holidayId)) {
        addNotification({
          title: 'Feriado Hoje! 🎈',
          message: `Hoje é ${holiday.name}. Aproveite para descansar ou focar em missões leves!`,
          type: 'holiday'
        });
        toast.info(`Hoje é feriado: ${holiday.name}! 🎈`);
      }
    }
  }, []);

  /**
   * FUNÇÃO: ADICIONAR NOTIFICAÇÃO
   * Centraliza a criação de notificações reais.
   */
  const addNotification = (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
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
   * EFEITO: BUSCA DADOS DO USUÁRIO
   * Executado uma vez ao carregar a página para validar o token e pegar o nome real.
   */
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.ok) {
            const data = await response.json();
            /* Prioriza o nome completo, senão usa o username */
            const name = data.user.fullName || data.user.username;
            setUserName(name);
            localStorage.setItem('userName', name);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      }
    };
    fetchUser();
  }, []);

  /**
   * FUNÇÃO: LOGOUT
   * Limpa as credenciais e redireciona para a tela de login.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    toast.success('Sessão encerrada com segurança.');
    navigate('/login');
  };

  /**
   * EFEITO: PERSISTÊNCIA DE TAREFAS
   * Salva a lista de tarefas no LocalStorage sempre que houver mudanças.
   * Usa um pequeno delay (debounce) para evitar gravações excessivas.
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [tasks]);

  /**
   * EFEITO: MOTOR DO TIMER POMODORO
   * Roda a cada 1 segundo para atualizar o tempo das tarefas que estão com o timer ativo.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => {
        let changed = false;
        const newTasks = prevTasks.map(task => {
          /* Só decrementa se o timer estiver rodando e a tarefa não estiver concluída */
          if (task.timerIsRunning && !task.completed) {
            changed = true;
            const currentSeconds = task.timerSeconds ?? 1500;
            const nextSeconds = currentSeconds - 1;
            const nextTotalSpent = (task.totalTimeSpent ?? 0) + 1;
            
            /* Se o tempo acabar, para o timer e avisa o usuário */
            if (nextSeconds <= 0) {
              toast.info(`Pomodoro concluído: ${task.title}`);
              return { 
                ...task, 
                timerSeconds: 0, 
                timerIsRunning: false,
                totalTimeSpent: nextTotalSpent 
              };
            }
            
            /* Atualiza os segundos restantes e o tempo total acumulado */
            return { 
              ...task, 
              timerSeconds: nextSeconds,
              totalTimeSpent: nextTotalSpent
            };
          }
          return task;
        });
        
        /* Só atualiza o estado se realmente houve mudança (performance) */
        if (changed) {
          return newTasks;
        }
        return prevTasks;
      });
    }, 1000);
    
    /* Limpa o intervalo ao desmontar o componente */
    return () => clearInterval(interval);
  }, []);

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
    if (hour >= 4 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    if (hour >= 18 && hour <= 23) return 'Boa noite';
    return 'Boa madrugada';
  }, []);

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
   * Cria um novo objeto de tarefa com ID único e salva na lista.
   */
  const handleAddTask = (data: TaskFormData) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...data,
      completed: false,
      inProgress: data.inProgress || false,
      createdAt: Date.now(),
      source: 'local', /* Identifica que foi criada manualmente aqui */
      history: [{
        id: crypto.randomUUID(),
        action: 'Missão criada',
        timestamp: Date.now()
      }]
    };

    setTasks([newTask, ...tasks]);
    setIsModalOpen(false); /* Fecha o modal após criar */
    toast.success('Missão adicionada à sua jornada!');

    /* Notificação Real: Nova Missão */
    addNotification({
      title: 'Nova Missão Criada! 🎯',
      message: `A missão "${newTask.title}" foi adicionada com sucesso.`,
      type: 'system'
    });
  };

  /**
   * FUNÇÃO: ALTERNAR CONCLUSÃO
   * Marca como concluída ou volta para pendente.
   */
  const toggleTask = (id: string) => {
    let completedTaskTitle = '';
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const isCompleting = !t.completed;
        completedTaskTitle = t.title;
        const newEntry = {
          id: crypto.randomUUID(),
          action: isCompleting ? 'Missão concluída' : 'Missão reaberta',
          timestamp: Date.now()
        };

        /* Notificação Real: Missão Concluída */
        if (isCompleting) {
          addNotification({
            title: 'Missão Cumprida! 🏆',
            message: `Você concluiu a missão "${t.title}". Bom trabalho!`,
            type: 'system'
          });
        }

        return { 
          ...t, 
          completed: isCompleting, 
          inProgress: false, 
          timerIsRunning: false,
          history: [...(t.history || []), newEntry]
        };
      }
      return t;
    }));
  };

  /**
   * FUNÇÃO: INGRESSAR NA TAREFA
   * Define o status como "Em Progresso" (Em Foco).
   */
  const joinTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        const newEntry = {
          id: crypto.randomUUID(),
          action: 'Missão colocada em foco',
          timestamp: Date.now()
        };
        return { 
          ...t, 
          inProgress: true,
          history: [...(t.history || []), newEntry]
        };
      }
      return t;
    }));
    toast.success('Você iniciou o foco nesta missão!');
  };

  /**
   * FUNÇÃO: ATUALIZAR TAREFA
   * Recebe os dados editados de uma tarefa e atualiza a lista.
   */
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
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
    try {
      /* Recupera as chaves de API salvas no navegador */
      const savedKeys = localStorage.getItem('taskflow_api_keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};

      const response = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKeys }),
      });
      
      if (!response.ok) throw new Error('Falha na sincronização');
      
      const data = await response.json();
      const integratedTasks = data.tasks as Task[];
      
      /* Detectar novos comentários para notificar o usuário */
      integratedTasks.forEach(externalTask => {
        const existingTask = tasks.find(t => t.id === externalTask.id);
        
        /* Se a tarefa já existia, verifica se há novos comentários */
        if (existingTask && externalTask.comments) {
          const newComments = externalTask.comments.filter(
            extComm => !existingTask.comments?.some(existComm => existComm.id === extComm.id)
          );

          if (newComments.length > 0) {
            addNotification({
              title: `Novo Comentário em ${externalTask.source?.toUpperCase()}! 💬`,
              message: `"${newComments[0].author}" comentou na missão "${externalTask.title}".`,
              type: 'interaction',
              link: externalTask.id
            });
          }
        }
      });

      /* Mescla as tarefas locais com as vindas das integrações */
      setTasks(prev => {
        const localOnly = prev.filter(t => t.source === 'local' || !t.source);
        return [...localOnly, ...integratedTasks];
      });
      
      toast.success(`${integratedTasks.length} tarefas sincronizadas com sucesso!`);

      /* Notificação Real: Sincronização */
      addNotification({
        title: 'Sincronização Concluída! 🔄',
        message: `${integratedTasks.length} tarefas foram atualizadas das suas integrações externas.`,
        type: 'integration'
      });
    } catch (error) {
      console.error("Erro de sincronização:", error);
      toast.error("Não foi possível conectar com as integrações externas.");
    } finally {
      setIsSyncing(false);
    }
  };

  /**
   * FUNÇÃO: EXCLUIR TAREFA
   * Remove permanentemente uma tarefa da lista.
   */
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast.success('Missão removida da jornada.');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col text-slate-900 font-sans overflow-x-hidden">
      {/* Componente de notificações global */}
      <Toaster position="top-right" richColors />
      
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* SIDEBAR: Navegação lateral fixa no desktop */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-[60] bg-white border-r border-slate-200 p-8 transform transition-all duration-300 ease-in-out shrink-0",
          isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full md:translate-x-0",
          isSidebarCollapsed ? "md:w-24 md:px-4" : "w-72"
        )}>
          {/* Botão Minimizar Sidebar (Desktop/Tablet) */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute -right-4 top-20 z-[60] bg-white border border-slate-200 rounded-full shadow-sm hidden md:flex hover:bg-slate-50"
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
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <CheckSquare className="text-white w-6 h-6" />
            </div>
            {(!isSidebarCollapsed || isMobileMenuOpen) && <h1 className="text-xl font-black tracking-tighter">TASKFLOW</h1>}
          </div>

          {/* Links de Navegação */}
          <nav className="space-y-1 flex-1">
            <NavItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={activeSection === 'dashboard'} 
              collapsed={isSidebarCollapsed && !isMobileMenuOpen}
              onClick={() => { setActiveSection('dashboard'); setIsMobileMenuOpen(false); }} 
            />
            <NavItem 
              icon={CheckSquare} 
              label="Minhas Tarefas" 
              active={activeSection === 'my-tasks'} 
              collapsed={isSidebarCollapsed && !isMobileMenuOpen}
              onClick={() => { setActiveSection('my-tasks'); setIsMobileMenuOpen(false); }} 
            />
            <NavItem icon={CalendarIcon} label="Calendário" collapsed={isSidebarCollapsed && !isMobileMenuOpen} onClick={() => navigate('/calendar')} />
            <NavItem icon={Share2} label="Integrações" collapsed={isSidebarCollapsed && !isMobileMenuOpen} onClick={() => { setIsIntegrationsModalOpen(true); setIsMobileMenuOpen(false); }} />
            <NavItem icon={Settings} label="Configurações" collapsed={isSidebarCollapsed && !isMobileMenuOpen} />
          </nav>

          {/* Rodapé da Sidebar com Perfil do Usuário */}
          <div className={cn("pt-4 transition-all", isSidebarCollapsed && !isMobileMenuOpen && "flex flex-col items-center")}>
            <Separator className="mb-6" />
            <div 
              onClick={() => navigate('/profile')}
              className={cn(
                "group flex items-center gap-3 p-2 rounded-2xl hover:bg-slate-50 cursor-pointer transition-all border-2 border-transparent hover:border-slate-100",
                isSidebarCollapsed && !isMobileMenuOpen && "justify-center"
              )}
            >
              <div className="w-9 h-9 bg-me-purple rounded-full flex items-center justify-center shadow-md text-white shrink-0">
                <User className="w-4 h-4" />
              </div>
              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black truncate group-hover:text-me-purple transition-colors">{userName}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Ver Perfil</p>
                </div>
              )}
            </div>
            
            {/* Botão de Sair */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className={cn(
                "w-full mt-2 justify-start text-slate-500 hover:text-destructive hover:bg-destructive/5 rounded-xl font-bold h-9",
                isSidebarCollapsed && !isMobileMenuOpen && "justify-center px-0"
              )}
            >
              <LogOut className={cn("w-3.5 h-3.5", (!isSidebarCollapsed || isMobileMenuOpen) && "mr-2")} />
              {(!isSidebarCollapsed || isMobileMenuOpen) && "Sair"}
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
          <header className="h-16 md:h-20 bg-white border-b border-slate-200 px-3 md:px-8 flex items-center justify-between shrink-0 relative z-[50]">
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
              <h1 className="text-base font-black tracking-tighter">TASKFLOW</h1>
            </div>

            {/* Breadcrumbs (Caminho de navegação) */}
            <div className="hidden md:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="hover:text-slate-600 cursor-pointer">Início</span>
              <span className="text-slate-300">/</span>
              <span className="text-slate-900">
                {activeSection === 'dashboard' ? 'Visão Geral' : 'Minhas Tarefas'}
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
                className="h-9 md:h-11 px-3 md:px-5 text-[9px] md:text-[10px] font-black uppercase tracking-widest hidden sm:flex items-center gap-2 rounded-xl md:rounded-2xl border-2 border-slate-200 shadow-[0_3px_0_0_#e2e8f0] md:shadow-[0_4px_0_0_#e2e8f0] active:shadow-none active:translate-y-[2px] transition-all"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
                {isSyncing ? "Sinc..." : "Sincronizar"}
              </Button>
              
              {/* Notificações */}
              <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className={cn(
                    "text-slate-400 rounded-xl hover:bg-slate-50 w-9 h-9 md:w-10 md:h-10 transition-all",
                    isNotificationsOpen && "bg-slate-100 text-slate-900 shadow-inner"
                  )}
                >
                  <Bell className={cn("w-5 h-5 md:w-6 md:h-6", unreadNotificationsCount > 0 && "animate-wiggle")} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
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
                  <Button className="h-9 md:h-11 px-3 md:px-6 gap-1.5 md:gap-2 rounded-xl md:rounded-2xl bg-me-blue hover:bg-me-blue/90 text-white font-black uppercase tracking-widest text-[8px] xs:text-[9px] md:text-[10px] shadow-[0_3px_0_0_#1899d6] md:shadow-[0_4px_0_0_#1899d6] active:shadow-none active:translate-y-[2px] transition-all">
                    <Plus className="w-3.5 h-3.5 md:w-4 h-4" />
                    <span className="hidden xs:inline">Nova Missão</span>
                    <span className="xs:hidden">Nova</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="rounded-[2rem] sm:rounded-[2.5rem] p-0 border-4 border-slate-100 w-full max-w-[95vw] sm:max-w-lg overflow-hidden max-h-[90vh]">
                  <div className="overflow-y-auto overflow-x-hidden max-h-[90vh] p-3 sm:p-8 custom-scrollbar pr-4 sm:pr-6">
                    <DialogHeader className="mb-2 sm:mb-4">
                      <DialogTitle className="text-xl sm:text-2xl font-black text-center">Nova Missão 🎯</DialogTitle>
                    </DialogHeader>
                    <TaskForm onSubmit={handleAddTask} />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </header>

          {/* ÁREA DE SCROLL: Onde o conteúdo aparece */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 lg:p-10 bg-slate-50/30 overflow-x-hidden">
            <div className="max-w-6xl mx-auto space-y-6 md:space-y-10 w-full">
              
              {activeSection === 'dashboard' ? (
                /* VISÃO DE DASHBOARD: Gráficos e Analytics */
                <DashboardAnalytics tasks={tasks} userName={userName} greeting={greeting} stats={stats} />
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
  /* Prepara dados para o gráfico de tempo por tarefa */
  const timeData = useMemo(() => {
    return tasks
      .filter(t => (t.totalTimeSpent ?? 0) > 0)
      .sort((a, b) => (b.totalTimeSpent ?? 0) - (a.totalTimeSpent ?? 0))
      .slice(0, 5)
      .map(t => ({
        name: t.title.length > 15 ? t.title.substring(0, 12) + '...' : t.title,
        minutes: Math.round((t.totalTimeSpent ?? 0) / 60),
        fullName: t.title
      }));
  }, [tasks]);

  /* Prepara dados para o gráfico de distribuição de status */
  const statusData = [
    { name: 'Fazer', value: stats.pending, color: '#fef08a' },
    { name: 'Foco', value: stats.inProgress, color: '#e9d5ff' },
    { name: 'Concluído', value: stats.completed, color: '#86efac' },
  ].filter(d => d.value > 0);

  /* Calcula tempo total focado */
  const totalMinutes = Math.round(tasks.reduce((acc, t) => acc + (t.totalTimeSpent ?? 0), 0) / 60);

  return (
    <div className="space-y-6 md:space-y-10">
      {/* HEADER DE BOAS-VINDAS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 md:p-8 lg:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-slate-200 shadow-[0_8px_0_0_#f1f5f9] md:shadow-[0_12px_0_0_#f1f5f9]"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
          <div className="space-y-2 md:space-y-3">
            <h2 className="text-xl md:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 leading-tight">
              {greeting}, <span className="text-me-purple">{userName.split(' ')[0]}</span>! 📊
            </h2>
            <p className="text-slate-500 font-bold text-sm md:text-lg lg:text-xl">
              Aqui está o mapa da sua produtividade. Continue focado!
            </p>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-3 md:gap-4">
            <StatMiniCard icon={TrendingUp} label="Tempo Total" value={`${totalMinutes}m`} color="bg-me-blue" />
            <StatMiniCard icon={CheckSquare} label="Concluído" value={stats.completed} color="bg-duo-green" />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        {/* GRÁFICO: TEMPO POR DEMANDA */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-slate-200 shadow-[0_8px_0_0_#f1f5f9] flex flex-col h-[350px] md:h-[450px]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-me-blue/10 rounded-xl flex items-center justify-center">
              <Clock className="text-me-blue w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg lg:text-xl font-black uppercase tracking-widest">Tempo por Missão (min)</h3>
          </div>
          
          <div className="flex-1 min-h-0">
            {timeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ 
                      borderRadius: '1rem', 
                      border: '2px solid #e2e8f0',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                      fontWeight: 800,
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="minutes" radius={[8, 8, 0, 0]}>
                    {timeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#7dd3fc', '#86efac', '#e9d5ff', '#fef08a', '#fca5a5'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChartState message="Inicie o timer em suas missões para ver o tempo gasto aqui." />
            )}
          </div>
        </motion.div>

        {/* GRÁFICO: DISTRIBUIÇÃO DE STATUS */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 md:p-8 rounded-[2rem] border-2 border-slate-200 shadow-[0_8px_0_0_#f1f5f9] flex flex-col h-[350px] md:h-[450px]"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-me-purple/10 rounded-xl flex items-center justify-center">
              <PieChartIcon className="text-me-purple w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg lg:text-xl font-black uppercase tracking-widest">Estado da Jornada</h3>
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
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '1rem', 
                      border: '2px solid #e2e8f0',
                      fontWeight: 800
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
              <EmptyChartState message="Adicione missões para ver a distribuição de status." />
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
        className="bg-white p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-slate-200 shadow-[0_10px_0_0_#f1f5f9] space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-3xl font-black tracking-tight">Minhas Missões 🎯</h2>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            {localStats.completed} de {localStats.total} Feitas
          </span>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden border-2 border-slate-200 p-0.5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(localStats.completed / (localStats.total || 1)) * 100}%` }}
            className="h-full bg-me-blue rounded-full shadow-[inset_0_2px_4px_rgba(255,255,255,0.3)]"
          />
        </div>
      </motion.div>

      {/* CONTROLES: Filtros por abas e Barra de Busca */}
      <div className="flex flex-col lg:flex-row gap-6 md:gap-8 items-center justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)} className="w-full lg:w-auto min-w-0">
          <TabsList className="bg-white p-1 md:p-2 rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-200 shadow-[0_6px_0_0_#f1f5f9] md:shadow-[0_8px_0_0_#f1f5f9] h-12 md:h-20 flex gap-1 md:gap-2 w-full overflow-x-auto no-scrollbar">
            <TabsTrigger value="all" className="flex-1 lg:flex-none rounded-xl md:rounded-3xl data-[state=active]:bg-me-blue data-[state=active]:text-white data-[state=active]:shadow-[0_3px_0_0_#38bdf8] font-black uppercase tracking-widest text-[7px] xs:text-[8px] md:text-[10px] px-2 md:px-8 transition-all min-w-0">Todas</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1 lg:flex-none rounded-xl md:rounded-3xl data-[state=active]:bg-duo-yellow data-[state=active]:text-white data-[state=active]:shadow-[0_3px_0_0_#facc15] font-black uppercase tracking-widest text-[7px] xs:text-[8px] md:text-[10px] px-2 md:px-8 transition-all min-w-0">Fazer</TabsTrigger>
            <TabsTrigger value="in-progress" className="flex-1 lg:flex-none rounded-xl md:rounded-3xl data-[state=active]:bg-me-purple data-[state=active]:text-white data-[state=active]:shadow-[0_3px_0_0_#c084fc] font-black uppercase tracking-widest text-[7px] xs:text-[8px] md:text-[10px] px-2 md:px-8 transition-all min-w-0">Foco</TabsTrigger>
            <TabsTrigger value="completed" className="flex-1 lg:flex-none rounded-xl md:rounded-3xl data-[state=active]:bg-duo-green data-[state=active]:text-white data-[state=active]:shadow-[0_3px_0_0_#4ade80] font-black uppercase tracking-widest text-[7px] xs:text-[8px] md:text-[10px] px-2 md:px-8 transition-all min-w-0">Concluído</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full lg:w-80 xl:w-96">
          <Search className="absolute left-5 md:left-6 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-slate-400" />
          <Input 
            placeholder="Buscar missão..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 md:pl-16 h-14 md:h-20 bg-white rounded-[1.5rem] md:rounded-[2.5rem] border-2 border-slate-200 shadow-[0_6px_0_0_#f1f5f9] md:shadow-[0_8px_0_0_#f1f5f9] focus-visible:ring-me-blue font-black text-sm md:text-xl placeholder:text-slate-300 transition-all focus:translate-y-[2px] focus:shadow-[0_4px_0_0_#f1f5f9] md:focus:shadow-[0_6px_0_0_#f1f5f9]"
          />
        </div>
      </div>

      {/* LISTA DE TAREFAS: Renderizada como uma Jornada Visual */}
      <div className="relative pb-12 md:pb-24 w-full">
        <div className="absolute left-4 sm:left-6 md:-left-10 top-0 bottom-0 w-1.5 md:w-2 bg-slate-200 rounded-full hidden xs:block" />
        
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
                    "absolute -left-6 sm:-left-10 md:-left-16 top-8 md:top-12 w-8 h-8 md:w-12 md:h-12 rounded-full border-2 md:border-4 border-white shadow-xl hidden xs:flex items-center justify-center z-20 transition-colors duration-500",
                    task.completed ? "bg-duo-green" : task.inProgress ? "bg-me-purple" : "bg-slate-300"
                  )}>
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 md:w-6 md:h-6 text-white" />
                    ) : (
                      <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full animate-pulse" />
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
                className="col-span-full py-40 flex flex-col items-center justify-center text-slate-400 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100"
              >
                <div className="w-32 h-32 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mb-8 border-2 border-slate-100">
                  <CheckSquare className="w-16 h-16 text-slate-200" />
                </div>
                <p className="font-black text-slate-500 text-3xl">Nenhuma missão encontrada</p>
                <p className="text-xl mt-4 font-bold text-slate-400">Sua jornada está esperando por você. <br/>Que tal começar agora?</p>
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-10 h-14 px-8 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-normal sm:tracking-widest text-[10px] sm:text-xs shadow-[0_6px_0_0_#000] active:shadow-none active:translate-y-[2px] transition-all"
                >
                  Começar Nova Missão
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
    <div className="bg-slate-50 p-3 md:p-6 rounded-2xl md:rounded-3xl border-2 border-slate-100 flex items-center gap-3 md:gap-4 min-w-[110px] md:min-w-[160px] flex-1 sm:flex-none">
      <div className={cn("w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white shadow-md shrink-0", color)}>
        <Icon className="w-4 h-4 md:w-6 md:h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 truncate">{label}</p>
        <p className="text-sm md:text-xl font-black text-slate-900 truncate">{value}</p>
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
      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border-2 border-slate-100">
        <BarChart3 className="w-8 h-8 text-slate-200" />
      </div>
      <p className="text-slate-400 font-bold text-sm">{message}</p>
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
          ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
          : "text-slate-400 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-100",
        collapsed && "justify-center px-0"
      )}
    >
      <Icon className={cn("w-4.5 h-4.5 shrink-0", active ? "text-white" : "text-slate-400")} />
      {!collapsed && <span>{label}</span>}
      {active && !collapsed && <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
    </div>
  );
}
