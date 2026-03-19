/**
 * COMPONENTE: TASKFORM (FORMULÁRIO DE TAREFA)
 * 
 * Este componente é responsável por capturar os dados necessários para criar uma nova tarefa.
 * Ele utiliza um estado local para gerenciar os campos do formulário e valida as entradas antes de enviar.
 * 
 * Estilo Visual (Playful Soft UI):
 * - Inputs e Selects arredondados (`rounded-2xl`).
 * - Bordas inferiores grossas (`border-b-4`) para criar o efeito de botão/campo 3D.
 * - Labels em caixa alta com espaçamento largo para um visual de "manual de instruções".
 * - Uso de cores vibrantes para feedback (ex: roxo para o checkbox ativo).
 */

import React, { useState } from "react";
/* Importação de tipos para garantir a integridade dos dados do formulário */
import { TaskFormData, Category, Priority } from "@/src/types";
/* Ícone de "Mais" para o botão principal de ação */
import { Plus } from "lucide-react";
/* Biblioteca de notificações toast para feedback de sucesso ou erro */
import { toast } from "sonner";
/* Componentes de UI baseados no design system do projeto */
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
/* Componentes de seleção customizados (Select do Radix UI) */
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/src/components/ui/select";
/* Utilitário para manipulação inteligente de classes CSS */
import { cn } from "@/src/lib/utils";

/**
 * INTERFACE: TaskFormProps
 * Define que este componente espera receber uma função 'onSubmit' do pai.
 */
interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
}

/**
 * CONFIGURAÇÃO: Categorias e Prioridades
 * Listas estáticas que alimentam os campos de seleção do formulário.
 */
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

/**
 * COMPONENTE: TaskForm
 */
export const TaskForm = ({ onSubmit }: TaskFormProps) => {
  /* ESTADO: Objeto que armazena todos os valores digitados pelo usuário */
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: 'trabalho',
    priority: 'medium',
    inProgress: false,
  });

  /**
   * FUNÇÃO: handleSubmit
   * Processa o envio do formulário, valida os campos e limpa o estado após o sucesso.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); /* Impede o recarregamento da página padrão do HTML */
    
    /* VALIDAÇÃO: Verifica se o título não está vazio */
    if (!formData.title.trim()) {
      toast.error('O título é obrigatório para iniciar a missão!');
      return;
    }

    /* VALIDAÇÃO: Garante um título minimamente descritivo */
    if (formData.title.trim().length < 3) {
      toast.error('O título da missão deve ter pelo menos 3 caracteres.');
      return;
    }

    /* ENVIO: Passa os dados para o componente pai (Dashboard) */
    onSubmit(formData);

    /* RESET: Limpa os campos para a próxima tarefa */
    setFormData({
      title: '',
      description: '',
      category: 'trabalho',
      priority: 'medium',
      inProgress: false,
    });

    /* FEEDBACK: Notifica o usuário do sucesso */
    toast.success('Missão adicionada com sucesso ao seu radar!');
  };

  return (
    /* Formulário com espaçamento vertical entre os campos */
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8 p-0.5">
      
      {/* CAMPO: TÍTULO DA MISSÃO */}
      <div className="space-y-1.5 sm:space-y-3">
        <Label htmlFor="title" className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-slate-500 ml-2">
          Título da Missão <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Ex: Dominar o mundo"
          className="bg-white h-12 sm:h-14 text-base sm:text-lg rounded-xl sm:rounded-2xl"
        />
      </div>

      {/* CAMPO: DESCRIÇÃO (TEXTAREA) */}
      <div className="space-y-1.5 sm:space-y-3">
        <Label htmlFor="description" className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-slate-500 ml-2">
          Detalhes da Missão
        </Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="O que exatamente você precisa fazer?"
          className={cn(
            /* Estilização manual para o textarea seguir o padrão Soft UI */
            "flex min-h-[80px] sm:min-h-[120px] w-full rounded-xl sm:rounded-2xl bg-white px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-base font-bold",
            "border-2 border-slate-200 border-b-4 focus-visible:border-me-blue",
            "placeholder:text-slate-400 placeholder:font-medium focus:outline-none transition-all resize-none shadow-inner"
          )}
        />
      </div>

      {/* GRID: CATEGORIA E PRIORIDADE (Lado a lado em telas maiores) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        
        {/* SELETOR: CATEGORIA */}
        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="category" className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Categoria</Label>
          <Select
            value={formData.category}
            onValueChange={(value: Category) => setFormData(prev => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="h-12 sm:h-14 rounded-2xl border-2 border-slate-200 border-b-4 bg-white font-bold px-4 sm:px-5 shadow-sm text-sm sm:text-base">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-2 border-slate-200 shadow-2xl">
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value} className="rounded-xl font-bold py-2 sm:py-3 text-sm sm:text-base">
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* SELETOR: PRIORIDADE */}
        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="priority" className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-slate-500 ml-2">Prioridade</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger className="h-12 sm:h-14 rounded-2xl border-2 border-slate-200 border-b-4 bg-white font-bold px-4 sm:px-5 shadow-sm text-sm sm:text-base">
              <SelectValue placeholder="Qual a urgência?" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-2 border-slate-200 shadow-2xl">
              {priorities.map((pri) => (
                <SelectItem key={pri.value} value={pri.value} className="rounded-xl font-bold py-2 sm:py-3 text-sm sm:text-base">
                  {pri.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* CAMPO: INICIAR IMEDIATAMENTE (CHECKBOX ESTILIZADO) */}
      <div className="flex items-center gap-3 sm:gap-5 p-3 sm:p-6 bg-slate-50 rounded-xl sm:rounded-[2rem] border-2 border-slate-200 border-b-4 transition-all hover:bg-slate-100">
        <div className="relative flex items-center shrink-0">
          <input
            type="checkbox"
            id="inProgress"
            checked={formData.inProgress}
            onChange={(e) => setFormData(prev => ({ ...prev, inProgress: e.target.checked }))}
            className={cn(
              /* Checkbox customizado estilo Duolingo/Soft UI */
              "h-7 w-7 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl border-4 border-slate-300 bg-white appearance-none cursor-pointer transition-all",
              "checked:bg-me-purple checked:border-purple-800",
              "after:content-['✓'] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:text-white after:font-black after:text-lg sm:after:text-2xl after:hidden checked:after:block"
            )}
          />
        </div>
        <div className="flex flex-col">
          <Label htmlFor="inProgress" className="text-sm sm:text-lg font-black text-slate-800 cursor-pointer select-none leading-none">
            Iniciar Imediatamente
          </Label>
          <span className="text-[8px] sm:text-xs font-bold text-slate-400 mt-0.5 sm:mt-1">A missão já começará em seu radar de foco.</span>
        </div>
      </div>

      {/* BOTÃO DE SUBMISSÃO: Grande, vibrante e com efeito 3D */}
      <Button 
        type="submit" 
        variant="duo" 
        size="lg" 
        className="w-full h-14 sm:h-20 text-lg sm:text-2xl rounded-xl sm:rounded-[2rem] shadow-[0_6px_0_0_#46a302] sm:shadow-[0_10px_0_0_#46a302] active:shadow-none active:translate-y-[6px] sm:active:translate-y-[10px] transition-all"
      >
        <Plus className="w-5 h-5 sm:w-8 sm:h-8 mr-2" />
        Adicionar Missão
      </Button>
    </form>
  );
};
