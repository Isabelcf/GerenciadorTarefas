import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
} from "@/src/components/ui/dialog";
import { 
  Share2, 
  Check, 
  ExternalLink, 
  RefreshCw,
  AlertCircle,
  Database,
  Layout,
  MessageSquare,
  BarChart3,
  Settings2,
  Key,
  ChevronDown,
  ChevronUp,
  StickyNote
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/src/lib/utils";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  category: 'tarefas' | 'crm' | 'financeiro' | 'comunicacao';
  connected: boolean;
  authUrl?: string;
}

interface IntegrationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSync: () => void;
}

export function IntegrationsModal({ isOpen, onClose, onSync }: IntegrationsModalProps) {
  const [integrations, setIntegrations] = useState<Integration[]>([
    { id: 'google-sheets', name: 'Google Planilhas', description: 'Sincronize tarefas de suas planilhas.', icon: Database, category: 'tarefas', connected: false },
    { id: 'trello', name: 'Trello', description: 'Importe cartões de seus quadros.', icon: Layout, category: 'tarefas', connected: false },
    { id: 'notion', name: 'Notion', description: 'Conecte suas bases de dados.', icon: Database, category: 'comunicacao', connected: false },
    { id: 'asana', name: 'Asana', description: 'Gerencie projetos complexos.', icon: Layout, category: 'tarefas', connected: false },
    { id: 'hubspot', name: 'HubSpot', description: 'Sincronize negócios e tickets.', icon: BarChart3, category: 'crm', connected: false },
    { id: 'slack', name: 'Slack', description: 'Receba notificações de tarefas.', icon: MessageSquare, category: 'comunicacao', connected: false },
    { id: 'google-keep', name: 'Google Keep', description: 'Sincronize suas notas e lembretes.', icon: StickyNote, category: 'tarefas', connected: false },
  ]);

  const [isSyncing, setIsSyncing] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<string, Record<string, string>>>(() => {
    const defaults = {
      trello: { key: '', token: '' },
      notion: { key: '', databaseId: '' },
      asana: { token: '' },
      hubspot: { key: '' },
      slack: { webhook: '' },
      'google-keep': { clientId: '', clientSecret: '' }
    };
    const saved = localStorage.getItem('taskflow_api_keys');
    if (!saved) return defaults;
    
    try {
      const parsed = JSON.parse(saved);
      // Merge saved with defaults to ensure new integrations (like google-keep) are present
      return {
        ...defaults,
        ...parsed
      };
    } catch (e) {
      return defaults;
    }
  });

  useEffect(() => {
    localStorage.setItem('taskflow_api_keys', JSON.stringify(apiKeys));
  }, [apiKeys]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        const provider = event.data.provider;
        setIntegrations(prev => prev.map(i => i.id === provider ? { ...i, connected: true } : i));
        toast.success(`${provider === 'google' ? 'Google' : provider} conectado com sucesso!`);
        handleSync();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleConnect = async (id: string) => {
    if (id === 'google-sheets') {
      try {
        const response = await fetch('/api/auth/google/url');
        const { url } = await response.json();
        window.open(url, 'google_oauth', 'width=600,height=700');
      } catch (error) {
        toast.error("Erro ao iniciar autenticação com Google");
      }
    } else {
      setExpandedId(expandedId === id ? null : id);
    }
  };

  const handleKeyChange = (integrationId: string, field: string, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [integrationId]: {
        ...prev[integrationId],
        [field]: value
      }
    }));
  };

  const isConfigured = (id: string) => {
    if (id === 'google-sheets') return integrations.find(i => i.id === id)?.connected;
    const keys = apiKeys[id];
    if (!keys) return false;
    return Object.values(keys).every(v => typeof v === 'string' && v.length > 0);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await onSync();
      toast.success("Dados sincronizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao sincronizar dados.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="px-1">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Share2 className="w-6 h-6 text-slate-900" />
            Integrações
          </DialogTitle>
          <DialogDescription>
            Conecte suas ferramentas favoritas para centralizar todas as suas tarefas no TaskFlow.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 mt-4 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            {integrations.map((integration) => {
              const configured = isConfigured(integration.id);
              const isExpanded = expandedId === integration.id;

              return (
                <div 
                  key={integration.id}
                  className={cn(
                    "rounded-xl border transition-all overflow-hidden",
                    configured ? "bg-emerald-50/50 border-emerald-100" : "bg-white border-slate-200 hover:border-slate-300"
                  )}
                >
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        configured ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                      )}>
                        <integration.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 flex items-center gap-2">
                          {integration.name}
                          {configured && <Check className="w-4 h-4 text-emerald-500" />}
                        </h4>
                        <p className="text-xs text-slate-500">{integration.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant={configured ? "ghost" : "outline"} 
                        size="sm" 
                        onClick={() => handleConnect(integration.id)}
                        className={cn(
                          "font-bold text-[10px] uppercase tracking-wider h-8",
                          configured && "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100/50"
                        )}
                      >
                        {integration.id === 'google-sheets' 
                          ? (configured ? 'Conectado' : 'Conectar')
                          : (isExpanded ? <ChevronUp className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />)
                        }
                      </Button>
                    </div>
                  </div>

                  {isExpanded && integration.id !== 'google-sheets' && (
                    <div className="px-4 pb-4 pt-0 border-t border-slate-100 bg-slate-50/50">
                      <div className="mt-4 space-y-4">
                        {integration.id === 'trello' && (
                          <>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase font-bold text-slate-500">API Key</Label>
                              <Input 
                                value={apiKeys.trello.key} 
                                onChange={(e) => handleKeyChange('trello', 'key', e.target.value)}
                                placeholder="Insira sua Trello API Key"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase font-bold text-slate-500">Token</Label>
                              <Input 
                                value={apiKeys.trello.token} 
                                onChange={(e) => handleKeyChange('trello', 'token', e.target.value)}
                                placeholder="Insira seu Trello Token"
                                type="password"
                                className="h-8 text-xs"
                              />
                            </div>
                          </>
                        )}
                        {integration.id === 'notion' && (
                          <>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase font-bold text-slate-500">Internal Integration Token</Label>
                              <Input 
                                value={apiKeys.notion.key} 
                                onChange={(e) => handleKeyChange('notion', 'key', e.target.value)}
                                placeholder="secret_..."
                                type="password"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase font-bold text-slate-500">Database ID</Label>
                              <Input 
                                value={apiKeys.notion.databaseId} 
                                onChange={(e) => handleKeyChange('notion', 'databaseId', e.target.value)}
                                placeholder="ID da base de dados"
                                className="h-8 text-xs"
                              />
                            </div>
                          </>
                        )}
                        {integration.id === 'asana' && (
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Personal Access Token</Label>
                            <Input 
                              value={apiKeys.asana.token} 
                              onChange={(e) => handleKeyChange('asana', 'token', e.target.value)}
                              placeholder="Insira seu Asana Token"
                              type="password"
                              className="h-8 text-xs"
                            />
                          </div>
                        )}
                        {integration.id === 'hubspot' && (
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Private App Access Token</Label>
                            <Input 
                              value={apiKeys.hubspot.key} 
                              onChange={(e) => handleKeyChange('hubspot', 'key', e.target.value)}
                              placeholder="pat-na1-..."
                              type="password"
                              className="h-8 text-xs"
                            />
                          </div>
                        )}
                        {integration.id === 'slack' && (
                          <div className="space-y-1.5">
                            <Label className="text-[10px] uppercase font-bold text-slate-500">Webhook URL</Label>
                            <Input 
                              value={apiKeys.slack.webhook} 
                              onChange={(e) => handleKeyChange('slack', 'webhook', e.target.value)}
                              placeholder="https://hooks.slack.com/services/..."
                              className="h-8 text-xs"
                            />
                          </div>
                        )}
                        {integration.id === 'google-keep' && (
                          <>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase font-bold text-slate-500">Client ID</Label>
                              <Input 
                                value={apiKeys['google-keep'].clientId} 
                                onChange={(e) => handleKeyChange('google-keep', 'clientId', e.target.value)}
                                placeholder="Insira seu Google Keep Client ID"
                                className="h-8 text-xs"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-[10px] uppercase font-bold text-slate-500">Client Secret</Label>
                              <Input 
                                value={apiKeys['google-keep'].clientSecret} 
                                onChange={(e) => handleKeyChange('google-keep', 'clientSecret', e.target.value)}
                                placeholder="Insira seu Google Keep Client Secret"
                                type="password"
                                className="h-8 text-xs"
                              />
                            </div>
                          </>
                        )}
                        <Button 
                          size="sm" 
                          className="w-full h-8 text-[10px] font-bold uppercase tracking-wider"
                          onClick={() => {
                            setExpandedId(null);
                            toast.success(`Configurações de ${integration.name} salvas!`);
                          }}
                        >
                          Salvar Configurações
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="bg-slate-900 rounded-xl p-6 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold mb-2 flex items-center gap-2">
                <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                Sincronização Automática
              </h4>
              <p className="text-xs text-slate-300 mb-4">
                Mantenha seus dados sempre atualizados. A sincronização ocorre a cada 15 minutos ou manualmente.
              </p>
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={isSyncing}
                onClick={handleSync}
                className="w-full font-bold uppercase tracking-wider h-9"
              >
                {isSyncing ? "Sincronizando..." : "Sincronizar Agora"}
              </Button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <RefreshCw className="w-32 h-32" />
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <p className="font-bold mb-1">Configuração Necessária</p>
              <p>Para algumas integrações, você precisará configurar as chaves de API nas configurações do sistema.</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-4 border-t">
          <Button variant="ghost" onClick={onClose} className="text-xs font-bold uppercase tracking-wider">
            Cancelar
          </Button>
          <Button onClick={onClose} className="text-xs font-bold uppercase tracking-wider">
            Concluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
