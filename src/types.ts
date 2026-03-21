/**
 * ARQUIVO: TYPES.TS
 * 
 * Este arquivo centraliza as definições de tipos e interfaces do TypeScript.
 * Ele garante que os dados trafeguem com segurança e consistência por toda a aplicação.
 */

/* Níveis de prioridade permitidos para uma tarefa */
export type Priority = 'low' | 'medium' | 'high';

/* Categorias temáticas para organização das tarefas */
export type Category = 'trabalho' | 'estudos' | 'pessoal' | 'saude' | 'outros';

/* Status possíveis para filtragem na listagem principal */
export type FilterStatus = 'all' | 'pending' | 'in-progress' | 'completed';

/**
 * INTERFACE: ChecklistItem
 * Representa um item individual dentro de uma lista de verificação de uma tarefa.
 */
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

/**
 * INTERFACE: Comment
 * Representa um comentário ou nota dentro de uma tarefa.
 */
export interface Comment {
  id: string;
  text: string;
  createdAt: number;
  author: string;
  attachments?: { name: string; url: string; type: string }[];
}

/**
 * INTERFACE: HistoryEntry
 * Representa um registro de atividade ou movimentação de uma tarefa.
 */
export interface HistoryEntry {
  id: string;
  action: string;
  timestamp: number;
  details?: string;
}

/**
 * INTERFACE: Task
 * A estrutura completa de uma tarefa no sistema.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  completed: boolean;
  inProgress?: boolean;
  createdAt: number;
  checklist?: ChecklistItem[];
  /* Origem da tarefa (integrações externas) */
  source?: 'local' | 'google-sheets' | 'trello' | 'notion' | 'asana' | 'monday' | 'clickup' | 'hubspot' | 'salesforce' | 'pipedrive' | 'slack' | 'google-keep' | 'jira' | 'zendesk';
  /* Dados do Timer Pomodoro */
  timerSeconds?: number;
  timerIsRunning?: boolean;
  totalTimeSpent?: number;
  /* Comentários e Histórico */
  comments?: Comment[];
  history?: HistoryEntry[];
}

/**
 * INTERFACE: TaskFormData
 * Define os campos necessários para criar ou editar uma tarefa via formulário.
 */
export interface TaskFormData {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  inProgress?: boolean;
}

/**
 * INTERFACE: Notification
 * Representa uma notificação no sistema.
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'holiday' | 'integration' | 'interaction' | 'system';
  createdAt: number;
  read: boolean;
  link?: string;
}
