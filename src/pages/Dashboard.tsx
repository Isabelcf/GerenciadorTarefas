import React, { useState, useEffect, useMemo } from 'react';
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
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster, toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Task, TaskFormData, FilterStatus } from '@/src/types';
import { TaskForm } from '@/src/components/TaskForm';
import { TaskCard } from '@/src/components/TaskCard';
import { TaskDetailsModal } from '@/src/components/TaskDetailsModal';
import { IntegrationsModal } from '@/src/components/IntegrationsModal';
import { cn } from '@/src/lib/utils';
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
import { Share2, RefreshCw, Timer } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isIntegrationsModalOpen, setIsIntegrationsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [activeSection, setActiveSection] = useState<'dashboard' | 'my-tasks'>('dashboard');
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('userName') || 'Usuário';
  });

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
            const name = data.user.fullName || data.user.username;
            setUserName(name);
            localStorage.setItem('userName', name);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    toast.success('Sessão encerrada com segurança.');
    navigate('/login');
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [tasks]);

  // Pomodoro Timer Logic
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prevTasks => {
        let changed = false;
        const newTasks = prevTasks.map(task => {
          if (task.timerIsRunning && !task.completed) {
            changed = true;
            const currentSeconds = task.timerSeconds ?? 1500;
            const nextSeconds = currentSeconds - 1;
            const nextTotalSpent = (task.totalTimeSpent ?? 0) + 1;
            
            if (nextSeconds <= 0) {
              toast.info(`Pomodoro concluído: ${task.title}`);
              return { 
                ...task, 
                timerSeconds: 0, 
                timerIsRunning: false,
                totalTimeSpent: nextTotalSpent 
              };
            }
            
            return { 
              ...task, 
              timerSeconds: nextSeconds,
              totalTimeSpent: nextTotalSpent
            };
          }
          return task;
        });
        
        if (changed) {
          return newTasks;
        }
        return prevTasks;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Sync selectedTask with tasks list for timer updates
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

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    if (hour >= 18 && hour <= 23) return 'Boa noite';
    return 'Boa madrugada';
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) || 
                             task.description.toLowerCase().includes(search.toLowerCase());
        const matchesFilter = filter === 'all' || 
                             (filter === 'pending' && !task.completed && !task.inProgress) || 
                             (filter === 'in-progress' && task.inProgress && !task.completed) ||
                             (filter === 'completed' && task.completed);
        
        // Filter for manual tasks only in "Minhas Tarefas" section
        const matchesSection = activeSection === 'dashboard' || 
                              (activeSection === 'my-tasks' && (task.source === 'local' || !task.source));
                              
        return matchesSearch && matchesFilter && matchesSection;
      })
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [tasks, search, filter, activeSection]);

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

  const handleAddTask = (data: TaskFormData) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      ...data,
      completed: false,
      inProgress: data.inProgress || false,
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setIsModalOpen(false);
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed, inProgress: false, timerIsRunning: false } : t));
  };

  const joinTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, inProgress: true } : t));
    toast.success('Você ingressou na tarefa!');
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    if (selectedTask?.id === updatedTask.id) {
      setSelectedTask(updatedTask);
    }
  };

  const openTaskDetails = (task: Task) => {
    setSelectedTask(task);
    setIsDetailsModalOpen(true);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const savedKeys = localStorage.getItem('taskflow_api_keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};

      const response = await fetch('/api/integrations/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKeys }),
      });
      
      const data = await response.json();
      
      // Merge integrated tasks with local tasks
      const integratedTasks = data.tasks as Task[];
      
      setTasks(prev => {
        const localOnly = prev.filter(t => t.source === 'local' || !t.source);
        return [...localOnly, ...integratedTasks];
      });
      
      toast.success(`${integratedTasks.length} tarefas sincronizadas!`);
    } catch (error) {
      console.error("Sync error:", error);
      toast.error("Erro ao sincronizar tarefas externas.");
    } finally {
      setIsSyncing(false);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast.success('Tarefa excluída com sucesso');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col text-slate-900">
      <Toaster position="top-right" richColors />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation (Desktop) */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <CheckSquare className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">TaskFlow</h1>
          </div>

          <nav className="space-y-1 flex-1">
            <NavItem 
              icon={LayoutDashboard} 
              label="Dashboard" 
              active={activeSection === 'dashboard'} 
              onClick={() => setActiveSection('dashboard')} 
            />
            <NavItem 
              icon={CheckSquare} 
              label="Minhas Tarefas" 
              active={activeSection === 'my-tasks'} 
              onClick={() => setActiveSection('my-tasks')} 
            />
            <NavItem icon={CalendarIcon} label="Calendário" onClick={() => navigate('/calendar')} />
            <NavItem icon={Share2} label="Integrações" onClick={() => setIsIntegrationsModalOpen(true)} />
            <NavItem icon={Settings} label="Configurações" />
          </nav>

          <div className="pt-6">
            <Separator className="mb-6" />
            <div 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate">Sessão Privada</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="w-full mt-2 justify-start text-slate-500 hover:text-destructive hover:bg-destructive/5"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4 md:hidden">
              <Menu className="w-5 h-5 text-slate-600" />
              <h1 className="text-base font-bold">TaskFlow</h1>
            </div>

            <div className="hidden md:flex items-center gap-2 text-sm text-slate-400 font-medium">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-slate-900">
                {activeSection === 'dashboard' ? 'Visão Geral' : 'Minhas Tarefas'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSync}
                disabled={isSyncing}
                className="h-9 px-3 text-xs font-bold uppercase tracking-wider hidden sm:flex items-center gap-2"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin")} />
                {isSyncing ? "Sincronizando..." : "Sincronizar"}
              </Button>
              <Button variant="ghost" size="icon" className="text-slate-400">
                <Bell className="w-5 h-5" />
              </Button>
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 shadow-sm">
                    <Plus className="w-4 h-4" />
                    Nova Tarefa
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Nova Tarefa</DialogTitle>
                  </DialogHeader>
                  <TaskForm onSubmit={handleAddTask} />
                </DialogContent>
              </Dialog>
            </div>
          </header>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-5xl mx-auto space-y-8">
              
              {/* Welcome & Stats */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{greeting}, {userName}</h2>
                  <p className="text-slate-500 text-sm">Você tem {stats.pending} tarefas pendentes e {stats.inProgress} em andamento.</p>
                </div>
                <div className="flex gap-2 sm:gap-3 flex-wrap">
                  <StatItem label="Total" value={stats.total} />
                  <StatItem label="Pendentes" value={stats.pending} />
                  <StatItem label="Em andamento" value={stats.inProgress} />
                  <StatItem label="Concluídas" value={stats.completed} />
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)} className="w-full sm:w-auto">
                  <TabsList className="bg-slate-100/50 border border-slate-200">
                    <TabsTrigger value="all">Todas</TabsTrigger>
                    <TabsTrigger value="pending">Pendentes</TabsTrigger>
                    <TabsTrigger value="in-progress">Em andamento</TabsTrigger>
                    <TabsTrigger value="completed">Concluídas</TabsTrigger>
                  </TabsList>
                </Tabs>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="Pesquisar..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 bg-white"
                    />
                  </div>
                  <div className="flex bg-white border border-slate-200 rounded-lg p-1 shrink-0">
                    <Button 
                      variant={viewMode === 'list' ? 'secondary' : 'ghost'} 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setViewMode('list')}
                    >
                      <ListIcon className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Task List */}
              <div className={cn(
                "min-h-[400px]",
                viewMode === 'list' ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              )}>
                <AnimatePresence mode="popLayout">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        onToggle={toggleTask} 
                        onDelete={deleteTask}
                        onJoin={joinTask}
                        onClick={openTaskDetails}
                      />
                    ))
                  ) : (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-400 text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <Filter className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">Nenhuma tarefa encontrada</h3>
                      <p className="text-xs mt-1">Tente ajustar seus filtros ou adicione uma nova tarefa.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>

        <TaskDetailsModal 
          task={selectedTask}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onUpdateTask={handleUpdateTask}
        />

        <IntegrationsModal 
          isOpen={isIntegrationsModalOpen}
          onClose={() => setIsIntegrationsModalOpen(false)}
          onSync={handleSync}
        />
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer",
        active 
          ? "bg-slate-900 text-white shadow-sm" 
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </div>
  );
}

function StatItem({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold leading-none mt-1">{value}</p>
    </div>
  );
}
