import React, { useState } from "react";
import { TaskFormData, Category, Priority } from "@/src/types";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea"; // I need to create this or use a standard textarea
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/src/components/ui/select";

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
}

const categories: { value: Category; label: string }[] = [
  { value: 'trabalho', label: 'Trabalho' },
  { value: 'estudos', label: 'Estudos' },
  { value: 'pessoal', label: 'Pessoal' },
  { value: 'saude', label: 'Saúde' },
  { value: 'outros', label: 'Outros' },
];

const priorities: { value: Priority; label: string }[] = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
];

export const TaskForm = ({ onSubmit }: TaskFormProps) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: 'trabalho',
    priority: 'medium',
    inProgress: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('O título é obrigatório');
      return;
    }

    if (formData.title.trim().length < 3) {
      toast.error('O título deve ter pelo menos 3 caracteres');
      return;
    }

    onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      category: 'trabalho',
      priority: 'medium',
      inProgress: false,
    });
    toast.success('Tarefa adicionada com sucesso');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Ex: Estudar JavaScript"
          className="bg-zinc-50/50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Detalhes da tarefa..."
          className="flex min-h-[80px] w-full rounded-md border border-input bg-zinc-50/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={formData.category}
            onValueChange={(value: Category) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="bg-zinc-50/50">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Prioridade</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger className="bg-zinc-50/50">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {priorities.map((pri) => (
                <SelectItem key={pri.value} value={pri.value}>
                  {pri.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="inProgress"
          checked={formData.inProgress}
          onChange={(e) => setFormData(prev => ({ ...prev, inProgress: e.target.checked }))}
          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
        />
        <Label htmlFor="inProgress" className="text-sm font-medium leading-none cursor-pointer">
          Iniciar imediatamente (Em andamento)
        </Label>
      </div>

      <Button type="submit" className="w-full gap-2 shadow-sm">
        <Plus className="w-4 h-4" />
        Adicionar Tarefa
      </Button>
    </form>
  );
};
