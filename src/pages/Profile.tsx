/**
 * PÁGINA: PERFIL DO USUÁRIO
 * 
 * Esta página exibe as informações pessoais e de conta do herói logado.
 * Ela permite visualizar dados como nome, e-mail, data de nascimento e status de segurança.
 * 
 * Destaques visuais (Playful Soft UI):
 * - Avatar centralizado com efeito 3D e badge de troféu gamificado.
 * - Seções de informação organizadas em cards brancos com bordas grossas.
 * - Itens de configuração interativos com animação de hover e ícones coloridos.
 * - Botão de logout "destrutivo" com forte apelo visual 3D.
 */

import React, { useEffect, useState } from 'react';
/* Importação do hook de navegação para retornar ao dashboard ou login */
import { useNavigate } from 'react-router-dom';
/* Importação de ícones da biblioteca Lucide-React para representar cada seção */
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  ArrowLeft, 
  LogOut, 
  ChevronRight,
  Settings,
  Bell,
  CreditCard,
  Loader2,
  Trophy
} from 'lucide-react';
/* Importação de componentes de UI baseados no design system Soft UI */
import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
/* Importação do sistema de notificações Toast */
import { toast } from 'sonner';
/* Importação do Axios para chamadas de API seguras */
import axios from 'axios';
/* Importação de utilitário para manipulação condicional de classes CSS */
import { cn } from '@/src/lib/utils';

/**
 * INTERFACE: UserData
 * Define o formato dos dados do usuário que esperamos receber do servidor.
 */
interface UserData {
  id: number;
  username: string;
  fullName: string | null;
  email: string | null;
  birthDate: string | null;
  twoFactorEnabled: boolean;
}

/**
 * COMPONENTE PROFILE
 * Gerencia a visualização e as ações do perfil do usuário.
 */
export default function Profile() {
  /* Hook para redirecionamento programático */
  const navigate = useNavigate();
  
  /* ESTADO: Armazena o objeto de dados do usuário carregado da API */
  const [user, setUser] = useState<UserData | null>(null);
  
  /* ESTADO: Controla se a página está em estado de carregamento inicial */
  const [isLoading, setIsLoading] = useState(true);

  /**
   * EFEITO: CARREGAMENTO DE DADOS
   * Busca as informações do perfil assim que a página é aberta.
   */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        /* Recupera o token de autenticação do LocalStorage */
        const token = localStorage.getItem('token');
        /* Se não houver token, o usuário não está logado, então manda para o login */
        if (!token) {
          navigate('/login');
          return;
        }

        /* Faz a requisição para o endpoint 'me' enviando o token no cabeçalho de autorização */
        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        /* Salva os dados do usuário no estado */
        setUser(response.data.user);
      } catch (error) {
        /* Se houver erro (ex: token expirado), notifica e redireciona */
        toast.error('Sessão expirada ou erro ao carregar perfil. Faça login novamente.');
        navigate('/login');
      } finally {
        /* Finaliza o estado de carregamento global da página */
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  /**
   * FUNÇÃO: handleLogout
   * Limpa os dados da sessão e encerra a conexão do usuário.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    toast.success('Você saiu da sua jornada com segurança! 👋');
    navigate('/login');
  };

  /**
   * RENDERIZAÇÃO CONDICIONAL: TELA DE CARREGAMENTO
   * Exibe um spinner animado enquanto os dados não chegam.
   */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-16 h-16 animate-spin text-me-purple" />
      </div>
    );
  }

  /* Se por algum motivo não houver usuário após o loading, não renderiza nada */
  if (!user) return null;

  return (
    /* CONTAINER PRINCIPAL: Fundo suave e padding inferior para scroll confortável */
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      <div className="max-w-3xl mx-auto p-4 sm:p-8 md:py-16">
        
        {/* BOTÃO VOLTAR: Estilo minimalista mas com tipografia forte */}
        <Button 
          variant="ghost" 
          className="mb-8 sm:mb-12 -ml-4 text-slate-400 hover:text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" />
          Voltar ao Dashboard
        </Button>

        <div className="space-y-8 sm:space-y-12">
          
          {/* SEÇÃO 1: CABEÇALHO DE IDENTIDADE (Avatar e Nomes) */}
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 text-center sm:text-left">
            {/* Avatar Gamificado com efeito 3D e Badge de Conquista */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-slate-900 rounded-[2rem] sm:rounded-[3rem] flex items-center justify-center shadow-2xl border-b-[8px] sm:border-b-[12px] border-slate-950 relative group transition-transform hover:scale-105">
              <User className="text-white w-16 h-16 sm:w-20 sm:h-20" />
              {/* Badge de Troféu indicando nível do usuário */}
              <div className="absolute -right-2 -bottom-2 sm:-right-3 sm:-bottom-3 w-10 h-10 sm:w-14 sm:h-14 bg-duo-yellow rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center border-2 sm:border-4 border-white shadow-xl">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-duo-yellow-dark" />
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-slate-900 uppercase italic">
                {user.fullName || user.username}
              </h1>
              <p className="text-slate-400 font-black text-xl sm:text-2xl">@{user.username}</p>
              {/* Badges de Status do Usuário */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-4 mt-4 sm:mt-6">
                <span className="px-4 sm:px-6 py-1.5 sm:py-2 bg-me-purple text-white text-[8px] sm:text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">Plano Herói</span>
                <span className="px-4 sm:px-6 py-1.5 sm:py-2 bg-duo-green/10 text-duo-green text-[8px] sm:text-[10px] font-black rounded-full uppercase tracking-widest border-2 border-duo-green/20">Membro Ativo</span>
              </div>
            </div>
          </div>

          {/* SEÇÃO 2: INFORMAÇÕES DETALHADAS (Card de Dados) */}
          <div className="bg-white rounded-[2rem] sm:rounded-[3.5rem] border-2 sm:border-4 border-slate-200 border-b-8 sm:border-b-[12px] shadow-2xl overflow-hidden">
            <div className="p-6 sm:p-12">
              <h2 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6 sm:mb-10 ml-2 sm:ml-4">Identidade Secreta</h2>
              <div className="space-y-6 sm:space-y-10">
                {/* Linhas de informação usando o componente auxiliar InfoRow */}
                <InfoRow icon={User} label="Nome Completo" value={user.fullName || 'Herói Anônimo'} />
                <Separator className="h-0.5 sm:h-1 bg-slate-50 rounded-full" />
                <InfoRow icon={Mail} label="Email de Contato" value={user.email || 'Não vinculado'} />
                <Separator className="h-0.5 sm:h-1 bg-slate-50 rounded-full" />
                <InfoRow 
                  icon={Shield} 
                  label="Nível de Segurança" 
                  value={user.twoFactorEnabled ? "Escudo 2FA Ativado 🛡️" : "Escudo 2FA Desativado ⚠️"} 
                />
                <Separator className="h-0.5 sm:h-1 bg-slate-50 rounded-full" />
                <InfoRow 
                  icon={Calendar} 
                  label="Data de Nascimento" 
                  value={user.birthDate ? new Date(user.birthDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Data não revelada'} 
                />
              </div>
            </div>
          </div>

          {/* SEÇÃO 3: PAINEL DE CONTROLE (Configurações Rápidas) */}
          <div className="space-y-4 sm:space-y-8">
            <h2 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 px-4 sm:px-8">Painel de Controle</h2>
            <div className="bg-white rounded-[2rem] sm:rounded-[3.5rem] border-2 sm:border-4 border-slate-200 border-b-8 sm:border-b-[12px] shadow-2xl overflow-hidden">
              <SettingsItem icon={Bell} label="Notificações" description="Gerencie seus alertas" color="bg-me-blue" />
              <Separator className="h-0.5 sm:h-1 bg-slate-50" />
              <SettingsItem icon={CreditCard} label="Faturamento" description="Planos e pagamentos" color="bg-duo-green" />
              <Separator className="h-0.5 sm:h-1 bg-slate-50" />
              <SettingsItem icon={Settings} label="Configurações" description="Idioma e tema" color="bg-me-purple" />
            </div>
          </div>

          {/* SEÇÃO 4: AÇÕES DE SAÍDA (Botão Logout) */}
          <div className="pt-8 sm:pt-12 space-y-6 sm:space-y-8">
            <Button 
              variant="destructive" 
              className="w-full h-16 sm:h-20 rounded-xl sm:rounded-[1.5rem] shadow-xl font-black uppercase tracking-widest text-lg sm:text-xl border-b-4 sm:border-b-[10px] border-red-800 active:border-b-0 active:translate-y-[4px] sm:active:translate-y-[10px] transition-all"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 sm:mr-4 w-6 h-6 sm:w-8 sm:h-8" />
              Sair
            </Button>
            
            {/* Informações de Versão e Créditos */}
            <div className="text-center space-y-2">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                TaskFlow v2.5.0-PRO
              </p>
              <p className="text-xs font-bold text-slate-200">
                Desenvolvido com foco total em sua produtividade
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * COMPONENTE AUXILIAR: InfoRow
 * Renderiza uma linha de informação com ícone, rótulo e valor.
 */
function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4 sm:gap-8 group">
      {/* Box do Ícone com borda suave */}
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-50 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center shrink-0 border-2 border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-slate-300 group-hover:text-slate-600 transition-colors" />
      </div>
      <div className="pt-1">
        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-300">{label}</p>
        <p className="text-lg sm:text-2xl font-black text-slate-900 mt-1 sm:mt-2 tracking-tight">{value}</p>
      </div>
    </div>
  );
}

/**
 * COMPONENTE AUXILIAR: SettingsItem
 * Renderiza um item de configuração clicável com descrição e seta de navegação.
 */
function SettingsItem({ icon: Icon, label, description, color }: { icon: any, label: string, description: string, color: string }) {
  return (
    <div className="flex items-center justify-between p-6 sm:p-8 hover:bg-slate-50 cursor-pointer transition-all group">
      <div className="flex items-center gap-4 sm:gap-8">
        {/* Box do Ícone colorido com sombra */}
        <div className={cn(
          "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg",
          color
        )}>
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div>
          <p className="text-lg sm:text-2xl font-black text-slate-900 uppercase tracking-tighter">{label}</p>
          <p className="text-xs sm:text-base font-bold text-slate-400 mt-0.5 sm:mt-1">{description}</p>
        </div>
      </div>
      {/* Ícone de seta indicando que é clicável */}
      <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-slate-200 group-hover:text-slate-900 group-hover:translate-x-2 sm:group-hover:translate-x-3 transition-all" />
    </div>
  );
}
