/**
 * COMPONENTE: INTEGRATIONSMODAL (MODAL DE INTEGRAÇÕES)
 * 
 * Este modal é o portal de conexão entre o TaskFlow e o mundo externo.
 * Ele permite que o usuário conecte ferramentas como Trello, Notion, Slack e Google Sheets.
 * 
 * Funcionalidades principais:
 * - Listagem de serviços suportados com ícones e descrições.
 * - Autenticação OAuth (ex: Google Sheets) via popup.
 * - Configuração manual de chaves de API para outros serviços.
 * - Persistência das chaves de API no localStorage para uso futuro.
 * - Sincronização manual de dados entre as plataformas.
 * 
 * Estilo Visual (Playful Soft UI):
 * - Cards de integração com cantos arredondados (`rounded-[2rem]`) e bordas 3D.
 * - Feedback visual de conexão (verde para conectado, cinza para desconectado).
 * - Painéis expansíveis para configuração de chaves de API.
 * - Banner de sincronização escuro com efeito de brilho e ícone animado.
 */

import React, { useState, useEffect, useMemo } from 'react';
/* Importação de componentes de diálogo do Radix UI estilizados para o projeto */
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
/* Importação de ícones da biblioteca Lucide-React para ilustrar os serviços */
import { 
  Share2, 
  Check, 
  RefreshCw,
  AlertCircle,
  Database,
  Layout,
  MessageSquare,
  BarChart3,
  Settings2,
  ChevronUp,
  StickyNote
} from "lucide-react";
/* Importação de componentes de UI base do design system */
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
/* Biblioteca de notificações toast para feedback de ações */
import { toast } from "sonner";
/* Utilitário para manipulação inteligente de classes CSS */
import { cn } from "@/src/lib/utils";

/* Importação de tipos globais */
import { Notification } from "@/src/types";
import { useLanguage } from '../contexts/LanguageContext';

/**
 * INTERFACE: Integration
 * Define a estrutura de dados de uma integração individual.
 */
interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'tarefas' | 'crm' | 'financeiro' | 'comunicacao';
  connected: boolean;
  authUrl?: string;
}

/**
 * INTERFACE: IntegrationsModalProps
 * Define as funções e estados que o modal precisa para operar.
 */
interface IntegrationsModalProps {
  isOpen: boolean; /* Controla se o modal está visível */
  onClose: () => void; /* Função para fechar o modal */
  onSync: () => void; /* Função para disparar a sincronização de dados */
  onAddNotification: (data: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void; /* Função para adicionar notificação */
}

/**
 * COMPONENTE: IntegrationsModal
 */
export function IntegrationsModal({ isOpen, onClose, onSync, onAddNotification }: IntegrationsModalProps) {
  const { t } = useLanguage();

  /* ESTADO: Lista de integrações disponíveis e seus estados de conexão */
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'google-sheets', name: 'googleSheets', description: 'googleSheetsDesc', icon: Database, category: 'tarefas', connected: false },
    { id: 'trello', name: 'Trello', description: 'trelloDesc', icon: Layout, category: 'tarefas', connected: false },
    { id: 'notion', name: 'Notion', description: 'notionDesc', icon: Database, category: 'comunicacao', connected: false },
    { id: 'asana', name: 'Asana', description: 'asanaDesc', icon: Layout, category: 'tarefas', connected: false },
    { id: 'hubspot', name: 'HubSpot', description: 'hubspotDesc', icon: BarChart3, category: 'crm', connected: false },
    { id: 'slack', name: 'Slack', description: 'slackDesc', icon: MessageSquare, category: 'comunicacao', connected: false },
    { id: 'jira', name: 'Jira', description: 'jiraDesc', icon: Layout, category: 'tarefas', connected: false },
    { id: 'clickup', name: 'clickup', description: 'clickupDesc', icon: Layout, category: 'tarefas', connected: false },
    { id: 'zendesk', name: 'Zendesk', description: 'zendeskDesc', icon: MessageSquare, category: 'crm', connected: false },
    { id: 'google-keep', name: 'Google Keep', description: 'googleKeepDesc', icon: StickyNote, category: 'tarefas', connected: false },
  ]);

  /* ESTADOS DE UI: Controle de carregamento e expansão de painéis */
  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  /* ESTADO: Armazenamento de chaves de API (Inicializado a partir do localStorage) */
  const [apiKeys, setApiKeys] = useState<Record<string, Record<string, string>>>(() => {
    const defaults = {
      trello: { key: '', token: '' },
      notion: { key: '', databaseId: '' },
      asana: { token: '' },
      hubspot: { key: '' },
      slack: { webhook: '' },
      jira: { host: '', email: '', apiToken: '' },
      clickup: { apiToken: '', teamId: '' },
      zendesk: { subdomain: '', email: '', apiToken: '' },
      'google-keep': { clientId: '', clientSecret: '' }
    };
    const saved = localStorage.getItem('taskflow_api_keys');
    if (!saved) return defaults;
    
    try {
      const parsed = JSON.parse(saved);
      /* Mescla os valores salvos com os padrões para evitar erros de campos ausentes */
      return { ...defaults, ...parsed };
    } catch (e) {
      return defaults;
    }
  });

  /**
   * EFEITO: PERSISTÊNCIA
   * Salva as chaves de API no localStorage sempre que houver uma alteração.
   */
  useEffect(() => {
    localStorage.setItem('taskflow_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  /**
   * EFEITO: OAUTH LISTENER
   * Escuta mensagens de sucesso vindas de popups de autenticação externa.
   */
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      /* Verifica se a mensagem é um sinal de sucesso de autenticação */
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const provider = event.data.provider;
        /* Marca a integração como conectada no estado local */
        setIntegrations(prev => prev.map(i => i.id === provider ? { ...i, connected: true } : i));
        toast.success(t('connectedSuccess', { provider: provider === 'google' ? 'Google' : provider }));
        handleSync(); /* Sincroniza os dados imediatamente após conectar */
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  /**
   * FUNÇÃO: handleConnect
   * Inicia o fluxo de conexão. Para Google, abre um popup. Para outros, expande o formulário de chaves.
   */
  const handleConnect = async (id: string) => {
    if (id === 'google-sheets') {
      try {
        /* Busca a URL de autorização do backend */
        const response = await fetch('/api/auth/google/url');
        const { url } = await response.json();
        /* Abre o popup do Google */
        window.open(url, 'google_oauth', 'width=600,height=700');
      } catch (error) {
        toast.error(t('authError'));
      }
    } else {
      /* Alterna a expansão do painel de configuração manual */
      setExpandedId(expandedId === id ? null : id);
    }
  };

  /**
   * FUNÇÃO: handleKeyChange
   * Atualiza o valor de uma chave de API específica no estado.
   */
  const handleKeyChange = (integrationId: string, field: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        [field]: value
      }
    }));
  };

  /**
   * UTILITÁRIO: isConfigured
   * Verifica se todos os campos necessários para uma integração estão preenchidos.
   */
  const isConfigured = (id: string) => {
    if (id === 'google-sheets') return integrations.find(i => i.id === id)?.connected;
    const keys = apiKeys[id];
    if (!keys) return false;
    /* Verifica se todas as chaves do objeto têm valor */
    return Object.values(keys).every(v => typeof v === 'string' && v.length > 0);
  };

  /**
   * FUNÇÃO: handleSync
   * Dispara o processo de sincronização e gerencia o estado de carregamento.
   */
  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync(); /* Chama a função de sincronização passada pelo Dashboard */
    } catch (error) {
      toast.error(t('syncError'));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* CONTEÚDO DO MODAL: Estilo Soft UI com scroll interno e bordas 3D */}
      <DialogContent className="sm:max-w-[700px] w-[95vw] max-h-[90vh] overflow-hidden flex flex-col rounded-[2.5rem] sm:rounded-[3.5rem] border-4 border-border p-6 sm:p-10 shadow-2xl bg-card">
        
        {/* CABEÇALHO: Título gamificado e descrição */}
        <DialogHeader className="px-2 sm:px-4 space-y-4 sm:space-y-6">
          <DialogTitle className="text-2xl sm:text-4xl font-black flex items-center gap-4 sm:gap-6 text-foreground tracking-tighter italic uppercase">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary rounded-xl sm:rounded-[1.5rem] flex items-center justify-center shadow-xl sm:shadow-2xl border-b-4 sm:border-b-8 border-primary-dark shrink-0">
              <Share2 className="w-6 h-6 sm:w-9 sm:h-9 text-white" />
            </div>
            {t('connectWorlds')}
          </DialogTitle>
          <DialogDescription className="text-foreground-muted font-bold text-base sm:text-xl leading-relaxed italic">
            {t('centralizeMissions')}
          </DialogDescription>
        </DialogHeader>

        {/* ÁREA DE LISTAGEM: Com scroll customizado */}
        <div className="flex-1 overflow-y-auto pr-2 sm:pr-6 mt-6 sm:mt-10 space-y-6 sm:space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            {integrations.map((integration) => {
              const configured = isConfigured(integration.id);
              const isExpanded = expandedId === integration.id;

              return (
                <div 
                  key={integration.id}
                  className={cn(
                    "rounded-[1.5rem] sm:rounded-[2.5rem] border-4 border-b-[6px] sm:border-b-[10px] transition-all overflow-hidden",
                    configured 
                      ? "bg-duo-green/5 border-duo-green/20 border-b-duo-green/30" 
                      : "bg-card border-border border-b-border hover:border-border"
                  )}
                >
                  {/* Item da Lista */}
                  <div className="p-4 sm:p-8 flex items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-center gap-4 sm:gap-8">
                      {/* Ícone do Serviço */}
                      <div className={cn(
                        "w-12 h-12 sm:w-20 sm:h-20 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-lg sm:shadow-xl border-b-2 sm:border-b-4",
                        configured ? "bg-duo-green border-green-700 text-white" : "bg-background border-border text-foreground-muted/30"
                      )}>
                        <integration.icon className="w-6 h-6 sm:w-10 sm:h-10" />
                      </div>
                      <div>
                        <h4 className="text-lg sm:text-2xl font-black text-foreground flex items-center gap-2 sm:gap-3 tracking-tight">
                          {t(integration.name) !== integration.name ? t(integration.name) : integration.name}
                          {configured && <Check className="w-4 h-4 sm:w-6 sm:h-6 text-duo-green animate-bounce" />}
                        </h4>
                        <p className="text-xs sm:text-base font-bold text-foreground-muted italic line-clamp-1 sm:line-clamp-none">{t(integration.description)}</p>
                      </div>
                    </div>

                    {/* Botão de Ação: Conectar ou Configurar */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Button 
                        variant={configured ? "ghost" : "duo"} 
                        size="sm" 
                        onClick={() => handleConnect(integration.id)}
                        className={cn(
                          "h-10 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-[0.1em] sm:tracking-[0.2em] shadow-md sm:shadow-lg",
                          configured && "text-duo-green hover:text-green-700 hover:bg-duo-green/10 border-2 border-duo-green/20"
                        )}
                      >
                        {integration.id === 'google-sheets' 
                          ? (configured ? 'OK' : t('connect'))
                          : (isExpanded ? <ChevronUp className="w-5 h-5 sm:w-6 h-6" /> : <Settings2 className="w-5 h-5 sm:w-6 h-6" />)
                        }
                      </Button>
                    </div>
                  </div>

                  {/* PAINEL DE CONFIGURAÇÃO: Abre ao clicar no ícone de engrenagem */}
                  {isExpanded && integration.id !== 'google-sheets' && (
                    <div className="px-4 sm:px-8 pb-4 sm:pb-8 pt-0 border-t-2 sm:border-t-4 border-border bg-background/50">
                      <div className="mt-4 sm:mt-8 space-y-4 sm:space-y-8">
                        {/* Campos Dinâmicos baseados no serviço */}
                        {integration.id === 'trello' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2 sm:space-y-3">
                              <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-2 sm:ml-3">API Key</Label>
                              <Input 
                                value={apiKeys.trello.key} 
                                onChange={(e) => handleKeyChange('trello', 'key', e.target.value)}
                                placeholder="Key"
                                className="h-12 sm:h-14 bg-card text-sm border-2 border-border"
                              />
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-2 sm:ml-3">Token</Label>
                              <Input 
                                value={apiKeys.trello.token} 
                                onChange={(e) => handleKeyChange('trello', 'token', e.target.value)}
                                placeholder="Token"
                                type="password"
                                className="h-12 sm:h-14 bg-card text-sm border-2 border-border"
                              />
                            </div>
                          </div>
                        )}

                        {integration.id === 'jira' && (
                          <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            <div className="space-y-2 sm:space-y-3">
                              <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 sm:ml-3">Host (ex: seu-dominio.atlassian.net)</Label>
                              <Input 
                                value={apiKeys.jira.host} 
                                onChange={(e) => handleKeyChange('jira', 'host', e.target.value)}
                                placeholder="seu-dominio.atlassian.net"
                                className="h-12 sm:h-14 bg-white text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                              <div className="space-y-2 sm:space-y-3">
                                <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 sm:ml-3">E-mail</Label>
                                <Input 
                                  value={apiKeys.jira.email} 
                                  onChange={(e) => handleKeyChange('jira', 'email', e.target.value)}
                                  placeholder="seu-email@atlassian.com"
                                  className="h-12 sm:h-14 bg-white text-sm"
                                />
                              </div>
                              <div className="space-y-2 sm:space-y-3">
                                <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 sm:ml-3">API Token</Label>
                                <Input 
                                  value={apiKeys.jira.apiToken} 
                                  onChange={(e) => handleKeyChange('jira', 'apiToken', e.target.value)}
                                  placeholder="API Token"
                                  type="password"
                                  className="h-12 sm:h-14 bg-white text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {integration.id === 'clickup' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            <div className="space-y-2 sm:space-y-3">
                              <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-2 sm:ml-3">API Token</Label>
                              <Input 
                                value={apiKeys.clickup.apiToken} 
                                onChange={(e) => handleKeyChange('clickup', 'apiToken', e.target.value)}
                                placeholder="pk_..."
                                type="password"
                                className="h-12 sm:h-14 bg-card text-sm border-2 border-border"
                              />
                            </div>
                            <div className="space-y-2 sm:space-y-3">
                              <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-foreground-muted ml-2 sm:ml-3">Team ID</Label>
                              <Input 
                                value={apiKeys.clickup.teamId} 
                                onChange={(e) => handleKeyChange('clickup', 'teamId', e.target.value)}
                                placeholder="1234567"
                                className="h-12 sm:h-14 bg-card text-sm border-2 border-border"
                              />
                            </div>
                          </div>
                        )}

                        {integration.id === 'zendesk' && (
                          <div className="grid grid-cols-1 gap-4 sm:gap-6">
                            <div className="space-y-2 sm:space-y-3">
                              <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 sm:ml-3">Subdomínio (ex: seu-subdominio)</Label>
                              <Input 
                                value={apiKeys.zendesk.subdomain} 
                                onChange={(e) => handleKeyChange('zendesk', 'subdomain', e.target.value)}
                                placeholder="seu-subdominio"
                                className="h-12 sm:h-14 bg-white text-sm"
                              />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                              <div className="space-y-2 sm:space-y-3">
                                <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 sm:ml-3">E-mail</Label>
                                <Input 
                                  value={apiKeys.zendesk.email} 
                                  onChange={(e) => handleKeyChange('zendesk', 'email', e.target.value)}
                                  placeholder="seu-email@dominio.com"
                                  className="h-12 sm:h-14 bg-white text-sm"
                                />
                              </div>
                              <div className="space-y-2 sm:space-y-3">
                                <Label className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2 sm:ml-3">API Token</Label>
                                <Input 
                                  value={apiKeys.zendesk.apiToken} 
                                  onChange={(e) => handleKeyChange('zendesk', 'apiToken', e.target.value)}
                                  placeholder="API Token"
                                  type="password"
                                  className="h-12 sm:h-14 bg-white text-sm"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Botão para salvar as chaves digitadas */}
                        <Button 
                          variant="me"
                          className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest text-xs sm:text-sm shadow-[0_4px_0_0_var(--primary-dark)] sm:shadow-[0_6px_0_0_var(--primary-dark)] active:shadow-none active:translate-y-[4px] sm:active:translate-y-[6px]"
                          onClick={() => {
                            if (!isConfigured(integration.id)) {
                              toast.error(t('error'), {
                                description: t('connectIntegrationsFirst')
                              });
                              return;
                            }
                            
                            setIntegrations(prev => prev.map(i => i.id === integration.id ? { ...i, connected: true } : i));
                            setExpandedId(null);
                            toast.success(t('settingsSaved', { name: t(integration.name) !== integration.name ? t(integration.name) : integration.name }));
                            
                            /* Notificação Real: Integração Concluída */
                            onAddNotification({
                              title: t('integrationConfigured'),
                              message: t('integrationConfiguredMsg', { name: t(integration.name) !== integration.name ? t(integration.name) : integration.name }),
                              type: 'integration'
                            });
                          }}
                        >
                          {t('save')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* BANNER: SINCRONIZAÇÃO (Estilo Dark Mode Gamificado) */}
          <div className="bg-foreground rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 text-background relative overflow-hidden border-b-[8px] sm:border-b-[12px] border-foreground-muted shadow-2xl">
            <div className="relative z-10">
              <h4 className="text-xl sm:text-2xl font-black mb-3 sm:mb-4 flex items-center gap-3 sm:gap-4 italic uppercase tracking-tighter">
                <RefreshCw className={cn("w-6 h-6 sm:w-8 sm:h-8 text-primary", isSyncing && "animate-spin")} />
                {t('sync')}
              </h4>
              <p className="text-sm sm:text-lg font-bold text-background/60 mb-6 sm:mb-8 leading-relaxed italic">
                {t('syncDesc')}
              </p>
              <Button 
                variant="secondary" 
                size="lg" 
                disabled={isSyncing}
                onClick={handleSync}
                className="w-full font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] h-12 sm:h-16 rounded-xl sm:rounded-[1.5rem] bg-background text-foreground hover:bg-background/90 shadow-xl text-xs sm:text-base"
              >
                {isSyncing ? t('syncing') : t('syncNow')}
              </Button>
            </div>
            {/* Efeito Visual de Fundo */}
            <div className="absolute -right-8 -bottom-8 sm:-right-12 sm:-bottom-12 opacity-5">
              <RefreshCw className="w-48 h-48 sm:w-64 sm:h-64" />
            </div>
          </div>

          {/* AVISO: Dica de Segurança/Configuração */}
          <div className="flex items-start gap-4 sm:gap-6 p-6 sm:p-8 bg-duo-yellow/10 border-2 sm:border-4 border-duo-yellow/20 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-inner">
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-duo-yellow-dark shrink-0 mt-1" />
            <div className="text-duo-yellow-dark">
              <p className="font-black mb-1 sm:mb-2 text-lg sm:text-xl italic uppercase tracking-tight">{t('attention')}</p>
              <p className="font-bold text-xs sm:text-base italic leading-relaxed">
                {t('securityNotice')}
              </p>
            </div>
          </div>
        </div>

        {/* RODAPÉ DO MODAL: Botões de Navegação */}
        <div className="mt-6 sm:mt-10 flex justify-center gap-4 sm:gap-6 pt-6 sm:pt-8 border-t-2 sm:border-t-4 border-border">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={onClose} 
            className="rounded-xl sm:rounded-2xl px-8 sm:px-12 h-12 sm:h-16 font-black uppercase tracking-widest text-[10px] sm:text-xs border-2 sm:border-4 border-b-4 sm:border-b-8 border-border hover:bg-background transition-all"
          >
            {t('back')}
          </Button>
          <Button 
            variant="duo" 
            size="lg" 
            onClick={onClose} 
            className="rounded-xl sm:rounded-2xl px-10 sm:px-16 h-12 sm:h-16 font-black uppercase tracking-widest text-[10px] sm:text-xs shadow-[0_4px_0_0_var(--secondary-dark)] sm:shadow-[0_8px_0_0_var(--secondary-dark)] active:shadow-none active:translate-y-[4px] sm:active:translate-y-[8px] transition-all"
          >
            {t('finish')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
