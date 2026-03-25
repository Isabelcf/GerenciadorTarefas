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
import { 
  Plus, 
  Paperclip, 
  Link as LinkIcon, 
  X, 
  Image as ImageIcon, 
  FileText 
} from "lucide-react";
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
import { Separator } from "@/src/components/ui/separator";
/* Utilitário para manipulação inteligente de classes CSS */
import { cn } from "@/src/lib/utils";
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * INTERFACE: TaskFormProps
 * Define que este componente espera receber uma função 'onSubmit' do pai.
 */
interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
}

/**
 * COMPONENTE: TaskForm
 */
export const TaskForm = ({ onSubmit }: TaskFormProps) => {
  const { theme, palette } = useTheme();
  const { t } = useLanguage();

  const priorities: { value: Priority; label: string }[] = [
    { value: 'low', label: t('low') },
    { value: 'medium', label: t('medium') },
    { value: 'high', label: t('high') },
  ];

  /* ESTADO: Lista de categorias (carregada do localStorage ou padrão) */
  const [availableCategories, setAvailableCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('taskflow_custom_categories');
    if (saved) return JSON.parse(saved);
    return ['trabalho', 'estudos', 'pessoal', 'saude', 'outros'];
  });

  /* ESTADO: Controla se o usuário está criando uma nova categoria */
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  /* ESTADO: Anexos da tarefa */
  const [attachments, setAttachments] = useState<{ name: string; url: string; type: string }[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  /* ESTADO: Objeto que armazena todos os valores digitados pelo usuário */
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    category: 'trabalho',
    priority: 'medium',
    inProgress: false,
    attachments: [],
  });

  /**
   * FUNÇÃO: handleAddCategory
   * Adiciona uma nova categoria à lista e a seleciona.
   */
  const handleAddCategory = () => {
    const name = newCategoryName.trim().toLowerCase();
    if (!name) return;
    
    if (availableCategories.includes(name)) {
      toast.error(t('categoryExists'));
      return;
    }

    const updatedCategories = [...availableCategories, name];
    setAvailableCategories(updatedCategories);
    localStorage.setItem('taskflow_custom_categories', JSON.stringify(updatedCategories));
    
    setFormData(prev => ({ ...prev, category: name }));
    setNewCategoryName('');
    setIsAddingCategory(false);
    toast.success(t('categoryCreated'));
  };

  /**
   * FUNÇÃO: handleFileChange
   * Processa o arquivo selecionado e adiciona aos anexos.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setAttachments(prev => [...prev, newAttachment]);
        toast.success(t('fileAttached'));
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  /**
   * FUNÇÃO: handleAddLink
   * Solicita uma URL ao usuário e a adiciona como anexo.
   */
  const handleAddLink = () => {
    const url = window.prompt(t('enterUrl'));
    if (url) {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      const newAttachment = {
        name: url.replace(/^https?:\/\//, '').split('/')[0],
        url: formattedUrl,
        type: 'url'
      };
      setAttachments(prev => [...prev, newAttachment]);
      toast.success(t('linkAdded'));
    }
  };

  /**
   * FUNÇÃO: removeAttachment
   * Remove um anexo da lista.
   */
  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  /**
   * FUNÇÃO: handleSubmit
   * Processa o envio do formulário, valida os campos e limpa o estado após o sucesso.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); /* Impede o recarregamento da página padrão do HTML */
    
    /* VALIDAÇÃO: Verifica se o título não está vazio */
    if (!formData.title.trim()) {
      toast.error(t('titleRequired'));
      return;
    }

    /* VALIDAÇÃO: Garante um título minimamente descritivo */
    if (formData.title.trim().length < 3) {
      toast.error(t('titleTooShort'));
      return;
    }

    /* ENVIO: Passa os dados para o componente pai (Dashboard) */
    onSubmit({
      ...formData,
      attachments: attachments
    });

    /* RESET: Limpa os campos para a próxima tarefa */
    setFormData({
      title: '',
      description: '',
      category: 'trabalho',
      priority: 'medium',
      inProgress: false,
    });
    setAttachments([]);

    /* FEEDBACK: Notifica o usuário do sucesso */
    toast.success(t('missionAddedSuccess'));
  };

  return (
    /* Formulário com espaçamento vertical entre os campos */
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8 p-1 sm:p-2 pb-6 sm:pb-10 overflow-x-hidden custom-scrollbar">
      
      {/* CAMPO: TÍTULO DA MISSÃO */}
      <div className="space-y-1.5 sm:space-y-3">
        <Label htmlFor="title" className="text-[10px] sm:text-sm font-black uppercase tracking-widest sm:tracking-[0.2em] text-foreground-muted ml-2">
          {t('missionTitle')} <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder={t('missionTitlePlaceholder')}
          className="bg-card h-12 sm:h-16 text-base sm:text-lg rounded-xl sm:rounded-2xl px-3 sm:px-6 border-2 border-border border-b-4 sm:border-b-8 focus-visible:ring-primary transition-all focus:translate-y-[2px] focus:shadow-none"
        />
      </div>

      {/* CAMPO: DESCRIÇÃO (TEXTAREA) */}
      <div className="space-y-1.5 sm:space-y-3">
        <Label htmlFor="description" className="text-[10px] sm:text-sm font-black uppercase tracking-widest sm:tracking-[0.2em] text-foreground-muted ml-2">
          {t('missionDetails')}
        </Label>
        <div className="relative group">
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder={t('missionDetailsPlaceholder')}
            className={cn(
              /* Estilização manual para o textarea seguir o padrão Soft UI */
              "flex min-h-[120px] sm:min-h-[180px] w-full rounded-xl sm:rounded-[2rem] bg-card px-4 sm:px-6 py-4 sm:py-5 text-base sm:text-lg font-bold",
              "border-2 border-border border-b-4 sm:border-b-8 focus-visible:border-primary pb-16",
              "placeholder:text-foreground-muted placeholder:font-medium focus:outline-none transition-all resize-none shadow-inner text-foreground focus:translate-y-[2px] focus:shadow-none"
            )}
          />
          
          {/* BOTÕES DE ANEXO RÁPIDO */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*,application/pdf,text/plain"
            />
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full text-foreground-muted hover:text-primary hover:bg-primary/5"
              title={t('attachFile')}
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              size="icon" 
              className="h-10 w-10 rounded-full text-foreground-muted hover:text-primary hover:bg-primary/5"
              title={t('addLink')}
              onClick={handleAddLink}
            >
              <LinkIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* LISTA DE ANEXOS TEMPORÁRIOS */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2 px-2">
            {attachments.map((att, index) => (
              <div key={index} className="flex items-center gap-2 bg-card border-2 border-border rounded-xl p-2 pr-1 shadow-sm animate-in zoom-in-95 duration-200">
                {att.type.startsWith('image/') ? (
                  <ImageIcon className="w-4 h-4 text-primary" />
                ) : att.type === 'url' ? (
                  <LinkIcon className="w-4 h-4 text-accent" />
                ) : (
                  <FileText className="w-4 h-4 text-foreground-muted" />
                )}
                <span className="text-[10px] font-bold text-foreground-muted max-w-[100px] truncate">{att.name}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-lg text-foreground-muted hover:text-red-500"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* GRID: CATEGORIA E PRIORIDADE (Lado a lado em telas maiores) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        
        {/* SELETOR: CATEGORIA */}
        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="category" className="text-[10px] sm:text-sm font-black uppercase tracking-widest sm:tracking-[0.2em] text-foreground-muted ml-2">{t('category')}</Label>
          
          {isAddingCategory ? (
            <div className="flex gap-2 animate-in slide-in-from-left-2 duration-200">
              <Input 
                autoFocus
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder={t('categoryNamePlaceholder')}
                className="h-12 sm:h-14 rounded-2xl border-2 border-border border-b-4 bg-card font-bold px-3 sm:px-5 text-foreground"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCategory();
                  }
                  if (e.key === 'Escape') setIsAddingCategory(false);
                }}
              />
              <Button 
                type="button"
                variant="me"
                onClick={handleAddCategory}
                className="h-12 sm:h-14 px-4 rounded-2xl"
              >
                <Plus className="w-5 h-5" />
              </Button>
              <Button 
                type="button"
                variant="ghost"
                onClick={() => setIsAddingCategory(false)}
                className="h-12 sm:h-14 px-4 rounded-2xl text-foreground-muted"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Select
              value={formData.category}
              onValueChange={(value: string) => {
                if (value === 'NEW_CATEGORY') {
                  setIsAddingCategory(true);
                } else {
                  setFormData(prev => ({ ...prev, category: value }));
                }
              }}
            >
              <SelectTrigger className="h-12 sm:h-16 rounded-xl sm:rounded-2xl border-2 border-border border-b-4 sm:border-b-8 bg-card font-black px-4 sm:px-6 shadow-sm text-sm sm:text-lg text-foreground transition-all active:translate-y-[2px] active:shadow-none">
                <SelectValue placeholder={t('categoryPlaceholder')} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-2 border-border shadow-2xl bg-card">
                {availableCategories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="rounded-xl font-bold py-2 sm:py-3 text-sm sm:text-base capitalize text-foreground hover:bg-background">
                    {t(cat) !== cat ? t(cat) : cat}
                  </SelectItem>
                ))}
                <Separator className="my-2 bg-border" />
                <SelectItem value="NEW_CATEGORY" className="rounded-xl font-black py-2 sm:py-3 text-sm sm:text-base text-accent bg-accent/5">
                  {t('createNewCategory')}
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* SELETOR: PRIORIDADE */}
        <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="priority" className="text-[10px] sm:text-sm font-black uppercase tracking-widest sm:tracking-[0.2em] text-foreground-muted ml-2">{t('priority')}</Label>
          <Select
            value={formData.priority}
            onValueChange={(value: Priority) => setFormData(prev => ({ ...prev, priority: value }))}
          >
            <SelectTrigger className="h-12 sm:h-16 rounded-xl sm:rounded-2xl border-2 border-border border-b-4 sm:border-b-8 bg-card font-black px-4 sm:px-6 shadow-sm text-sm sm:text-lg text-foreground transition-all active:translate-y-[2px] active:shadow-none">
              <SelectValue placeholder={t('priorityPlaceholder')} />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-2 border-border shadow-2xl bg-card">
              {priorities.map((pri) => (
                <SelectItem key={pri.value} value={pri.value} className="rounded-xl font-bold py-2 sm:py-3 text-sm sm:text-base text-foreground hover:bg-background">
                  {pri.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* CAMPO: INICIAR IMEDIATAMENTE (CHECKBOX ESTILIZADO) */}
      <div className="flex items-center gap-2.5 sm:gap-5 p-2.5 sm:p-6 bg-background rounded-xl sm:rounded-[2rem] border-2 border-border border-b-4 transition-all hover:bg-background/80">
        <div className="relative flex items-center shrink-0">
          <input
            type="checkbox"
            id="inProgress"
            checked={formData.inProgress}
            onChange={(e) => setFormData(prev => ({ ...prev, inProgress: e.target.checked }))}
            className={cn(
              /* Checkbox customizado estilo Duolingo/Soft UI */
              "h-7 w-7 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl border-4 border-border bg-card appearance-none cursor-pointer transition-all",
              "checked:bg-accent checked:border-accent-dark",
              "after:content-['✓'] after:absolute after:left-1/2 after:top-1/2 after:-translate-x-1/2 after:-translate-y-1/2 after:text-white after:font-black after:text-lg sm:after:text-2xl after:hidden checked:after:block"
            )}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <Label htmlFor="inProgress" className="text-sm sm:text-lg font-black text-foreground cursor-pointer select-none leading-none truncate">
            {t('startImmediately')}
          </Label>
          <span className="text-[8px] sm:text-xs font-bold text-foreground-muted mt-0.5 sm:mt-1 leading-tight">{t('startImmediatelyDesc')}</span>
        </div>
      </div>

      {/* BOTÃO DE SUBMISSÃO: Grande, vibrante e com efeito 3D */}
      <Button 
        type="submit" 
        variant="duo" 
        size="lg" 
        className="w-full h-14 sm:h-20 text-lg sm:text-2xl rounded-xl sm:rounded-[2rem] shadow-[0_6px_0_0_var(--primary-dark)] sm:shadow-[0_10px_0_0_var(--primary-dark)] active:shadow-none active:translate-y-[6px] sm:active:translate-y-[10px] transition-all"
      >
        <Plus className="w-5 h-5 sm:w-8 sm:h-8 mr-2" />
        {t('addMission')}
      </Button>
    </form>
  );
};
