export type Priority = 'low' | 'medium' | 'high';
export type Category = 'trabalho' | 'estudos' | 'pessoal' | 'saude' | 'outros';
export type FilterStatus = 'all' | 'pending' | 'in-progress' | 'completed';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

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
  source?: 'local' | 'google-sheets' | 'trello' | 'notion' | 'asana' | 'monday' | 'clickup' | 'hubspot' | 'salesforce' | 'pipedrive' | 'slack' | 'google-keep';
  timerSeconds?: number;
  timerIsRunning?: boolean;
  totalTimeSpent?: number;
}

export interface TaskFormData {
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  inProgress?: boolean;
}
