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
  Settings as SettingsIcon,
  Bell,
  CreditCard,
  Loader2,
  Trophy,
  Moon,
  Sun,
  Palette,
  Check,
  Smartphone,
  QrCode,
  XCircle,
  Lock,
  Edit3,
  Save
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
/* Importação de componentes de UI baseados no design system Soft UI */
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Separator } from '@/src/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Label } from '@/src/components/ui/label';
/* Importação do sistema de notificações Toast */
import { toast } from 'sonner';
/* Importação do Axios para chamadas de API seguras */
import axios from 'axios';
/* Importação de utilitário para manipulação condicional de classes CSS */
import { cn } from '@/src/lib/utils';
import { useTheme } from '@/src/contexts/ThemeContext';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { motion } from 'motion/react';

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
  const { theme, setTheme, colorName, setColorName, availableColors } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  
  /* ESTADO: Armazena o objeto de dados do usuário carregado da API */
  const [user, setUser] = useState<UserData | null>(null);
  
  /* ESTADO: Edição de Perfil */
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    email: '',
    birthDate: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  
  /* ESTADO: Controla se a página está em estado de carregamento inicial */
  const [isLoading, setIsLoading] = useState(true);

  /* ESTADO: 2FA */
  const [is2FASettingUp, setIs2FASettingUp] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{ secret: string, otpauth_url: string } | null>(null);
  const [twoFactorVerifyCode, setTwoFactorVerifyCode] = useState('');
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  /**
   * FUNÇÃO: fetchProfile
   * Busca as informações do perfil do servidor.
   */
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
      /* Inicializa os dados de edição */
      setEditData({
        fullName: response.data.user.fullName || '',
        email: response.data.user.email || '',
        birthDate: response.data.user.birthDate || ''
      });
    } catch (error) {
      /* Se houver erro (ex: token expirado), notifica e redireciona */
      toast.error(t('sessionExpired'));
      navigate('/login');
    } finally {
      /* Finaliza o estado de carregamento global da página */
      setIsLoading(false);
    }
  };

  /**
   * EFEITO: CARREGAMENTO DE DADOS
   * Busca as informações do perfil assim que a página é aberta.
   */
  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  /**
   * FUNÇÃO: setup2FA
   * Inicia o processo de configuração do 2FA.
   */
  const setup2FA = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/auth/2fa/setup', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTwoFactorData(response.data);
      setIs2FASettingUp(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao iniciar 2FA');
    }
  };

  /**
   * FUNÇÃO: verify2FA
   * Verifica o código digitado pelo usuário para ativar o 2FA.
   */
  const verify2FA = async () => {
    if (!twoFactorVerifyCode || twoFactorVerifyCode.length !== 6) {
      return toast.error('Digite o código de 6 dígitos');
    }
    setIsVerifying2FA(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/2fa/verify', { code: twoFactorVerifyCode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Autenticação de dois fatores ativada com sucesso!');
      setIs2FASettingUp(false);
      setTwoFactorData(null);
      setTwoFactorVerifyCode('');
      fetchProfile(); // Atualiza o perfil para mostrar que o 2FA está ativo
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Código inválido');
    } finally {
      setIsVerifying2FA(false);
    }
  };

  /**
   * FUNÇÃO: disable2FA
   * Desativa o 2FA.
   */
  const disable2FA = async () => {
    if (!confirm('Tem certeza que deseja desativar a autenticação de dois fatores?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/auth/2fa/disable', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Autenticação de dois fatores desativada');
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao desativar 2FA');
    }
  };

  /**
   * FUNÇÃO: handleSaveProfile
   * Salva as alterações do perfil no servidor.
   */
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/auth/profile', editData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(t('profileUpdated') || 'Perfil atualizado com sucesso!');
      setIsEditing(false);
      fetchProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * FUNÇÃO: handleLogout
   * Limpa os dados da sessão e encerra a conexão do usuário.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    toast.success(t('logoutSuccess'));
    navigate('/login');
  };

  /**
   * RENDERIZAÇÃO CONDICIONAL: TELA DE CARREGAMENTO
   * Exibe um spinner animado enquanto os dados não chegam.
   */
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-16 h-16 animate-spin text-secondary" />
      </div>
    );
  }

  /* Se por algum motivo não houver usuário após o loading, não renderiza nada */
  if (!user) return null;

  return (
    /* CONTAINER PRINCIPAL: Fundo suave e padding inferior para scroll confortável */
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans">
      <div className="max-w-3xl mx-auto p-4 sm:p-8 md:py-16">
        
        {/* BOTÃO VOLTAR: Estilo minimalista mas com tipografia forte */}
        <Button 
          variant="ghost" 
          className="mb-8 sm:mb-12 -ml-4 text-muted-foreground hover:text-foreground font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" />
          {t('backToDashboard')}
        </Button>

        <div className="space-y-8 sm:space-y-12">
          
          {/* SEÇÃO 1: CABEÇALHO DE IDENTIDADE (Avatar e Nomes) */}
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10 text-center sm:text-left">
            {/* Avatar Gamificado com efeito 3D e Badge de Conquista */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 bg-foreground rounded-[2rem] sm:rounded-[3rem] flex items-center justify-center shadow-2xl border-b-[8px] sm:border-b-[12px] border-foreground/90 relative group transition-transform hover:scale-105">
              <User className="text-background w-16 h-16 sm:w-20 sm:h-20" />
              {/* Badge de Troféu indicando nível do usuário */}
              <div className="absolute -right-2 -bottom-2 sm:-right-3 sm:-bottom-3 w-10 h-10 sm:w-14 sm:h-14 bg-warning rounded-[1rem] sm:rounded-[1.5rem] flex items-center justify-center border-2 sm:border-4 border-background shadow-xl">
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-warning-dark" />
              </div>
            </div>
            
            <div className="space-y-2 sm:space-y-4">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-foreground uppercase italic">
                {user.fullName || user.username}
              </h1>
              <p className="text-muted-foreground font-black text-xl sm:text-2xl">@{user.username}</p>
              {/* Badges de Status do Usuário e Botão de Edição */}
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4 mt-4 sm:mt-6">
                <span className="px-4 sm:px-6 py-1.5 sm:py-2 bg-secondary text-white text-[8px] sm:text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">{t('heroPlan')}</span>
                <span className="px-4 sm:px-6 py-1.5 sm:py-2 bg-primary/10 text-primary text-[8px] sm:text-[10px] font-black rounded-full uppercase tracking-widest border-2 border-primary/20">{t('activeMember')}</span>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(!isEditing)}
                  className={cn(
                    "rounded-full h-8 px-4 text-[8px] font-black uppercase tracking-widest transition-all",
                    isEditing ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent"
                  )}
                >
                  {isEditing ? (
                    <><XCircle className="w-3 h-3 mr-2" /> {t('cancel') || 'Cancelar'}</>
                  ) : (
                    <><Edit3 className="w-3 h-3 mr-2" /> {t('editProfile') || 'Editar Perfil'}</>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* INTERFACE DE ABAS: Separação entre Perfil e Configurações */}
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="w-full grid grid-cols-2 mb-8 sm:mb-12 h-auto min-h-[3.5rem] p-1.5 sm:p-2 bg-accent/5 rounded-[1.5rem] sm:rounded-[2rem] border-2 border-border shadow-inner pb-3 sm:pb-4">
              <TabsTrigger value="profile" className="text-[10px] sm:text-xs rounded-xl sm:rounded-2xl data-[state=active]:shadow-[0_4px_0_0_var(--primary-dark)] transition-all">
                <User className="w-4 h-4 mr-2" />
                {t('profile')}
              </TabsTrigger>
              <TabsTrigger value="settings" className="text-[10px] sm:text-xs rounded-xl sm:rounded-2xl data-[state=active]:shadow-[0_4px_0_0_var(--secondary-dark)] transition-all">
                <SettingsIcon className="w-4 h-4 mr-2" />
                {t('settings')}
              </TabsTrigger>
            </TabsList>

            {/* ABA: PERFIL (Informações de Identidade) */}
            <TabsContent value="profile" className="space-y-8">
              <div className="bg-card rounded-[2rem] sm:rounded-[3.5rem] border-2 sm:border-4 border-border border-b-8 sm:border-b-[12px] shadow-2xl overflow-hidden">
                <div className="p-6 sm:p-12">
                  <div className="flex justify-between items-center mb-6 sm:mb-10">
                    <h2 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/30 ml-2 sm:ml-4">{t('secretIdentity')}</h2>
                    {isEditing && (
                      <Button 
                        variant="me" 
                        size="sm" 
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="rounded-xl h-10 px-6 font-black uppercase tracking-widest text-[10px] shadow-[0_4px_0_0_#1e40af]"
                      >
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Save className="w-3 h-3 mr-2" />}
                        {t('saveChanges') || 'Salvar Alterações'}
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-6 sm:space-y-10">
                    {isEditing ? (
                      <div className="space-y-8">
                        <div className="space-y-3">
                          <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-4">{t('fullName')}</Label>
                          <div className="relative group">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-secondary transition-colors" />
                            <Input 
                              value={editData.fullName}
                              onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                              className="pl-14 h-14 text-base sm:text-lg rounded-2xl border-2 border-border focus:border-secondary transition-all"
                              placeholder={t('fullNamePlaceholder') || 'Seu nome completo'}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-4">{t('email')}</Label>
                          <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-secondary transition-colors" />
                            <Input 
                              type="email"
                              value={editData.email}
                              onChange={(e) => setEditData({...editData, email: e.target.value})}
                              className="pl-14 h-14 text-base sm:text-lg rounded-2xl border-2 border-border focus:border-secondary transition-all"
                              placeholder="seu@email.com"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground/60 ml-4">{t('birthDate')}</Label>
                          <div className="relative group">
                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-secondary transition-colors" />
                            <Input 
                              type="date"
                              value={editData.birthDate}
                              onChange={(e) => setEditData({...editData, birthDate: e.target.value})}
                              className="pl-14 h-14 text-base sm:text-lg rounded-2xl border-2 border-border focus:border-secondary transition-all"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <InfoRow icon={User} label={t('fullName')} value={user.fullName || t('anonymousHero')} />
                        <Separator className="h-0.5 sm:h-1 bg-background rounded-full" />
                        <InfoRow icon={Mail} label={t('email')} value={user.email || t('notLinked')} />
                        <Separator className="h-0.5 sm:h-1 bg-background rounded-full" />
                        <InfoRow 
                          icon={Shield} 
                          label={t('securityLevel')} 
                          value={user.twoFactorEnabled ? t('securityEnabled') : t('securityDisabled')} 
                        />
                        <Separator className="h-0.5 sm:h-1 bg-background rounded-full" />
                        <InfoRow 
                          icon={Calendar} 
                          label={t('birthDate')} 
                          value={user.birthDate ? new Date(user.birthDate).toLocaleDateString(t('locale') || 'pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : t('dateNotRevealed')} 
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ABA: CONFIGURAÇÕES (Painel de Controle) */}
            <TabsContent value="settings" className="space-y-8">
              <div className="bg-card rounded-[2rem] sm:rounded-[3.5rem] border-2 sm:border-4 border-border border-b-8 sm:border-b-[12px] shadow-2xl overflow-hidden">
                <SettingsItem icon={Bell} label={t('notifications')} description={t('manageAlerts')} color="bg-accent" />
                <Separator className="h-0.5 sm:h-1 bg-background" />
                <SettingsItem icon={CreditCard} label={t('billing')} description={t('plansPayments')} color="bg-primary" />
                <Separator className="h-0.5 sm:h-1 bg-background" />

                {/* SEÇÃO: SEGURANÇA (2FA) */}
                <div className="p-4 sm:p-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border-b-4",
                        user.twoFactorEnabled ? "bg-green-500 border-green-700" : "bg-orange-500 border-orange-700"
                      )}>
                        <Smartphone className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-lg font-black uppercase tracking-tight leading-none mb-1">
                          {t('twoFactorAuth') || 'Autenticação 2FA'}
                        </p>
                        <p className="text-xs font-bold text-muted-foreground/60">
                          {user.twoFactorEnabled ? (t('securityActive') || 'Sua conta está super protegida!') : (t('securityInactive') || 'Adicione uma camada extra de proteção.')}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant={user.twoFactorEnabled ? "ghost" : "me"}
                      size="sm"
                      className={cn(
                        "rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-6",
                        user.twoFactorEnabled ? "text-destructive hover:bg-destructive/10" : "shadow-[0_4px_0_0_#1e40af]"
                      )}
                      onClick={user.twoFactorEnabled ? disable2FA : setup2FA}
                    >
                      {user.twoFactorEnabled ? (t('disable') || 'Desativar') : (t('enable') || 'Ativar')}
                    </Button>
                  </div>

                  {/* MODAL/ÁREA DE CONFIGURAÇÃO 2FA */}
                  {is2FASettingUp && twoFactorData && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-background/80 rounded-3xl p-6 sm:p-8 border-4 border-dashed border-secondary/30 space-y-6 text-center"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-sm font-black uppercase tracking-widest text-secondary">{t('setup2FA') || 'Configurar 2FA'}</h3>
                        <Button variant="ghost" size="icon" onClick={() => setIs2FASettingUp(false)} className="rounded-full">
                          <XCircle className="w-5 h-5 text-muted-foreground/40" />
                        </Button>
                      </div>

                      <div className="flex flex-col items-center space-y-4">
                        <div className="bg-white p-4 rounded-3xl shadow-xl border-4 border-white">
                          <QRCodeSVG value={twoFactorData.otpauth_url} size={180} />
                        </div>
                        <p className="text-[10px] font-bold text-muted-foreground max-w-[240px]">
                          {t('scanQRCode') || 'Escaneie este código com seu app autenticador (Google Authenticator, Authy, etc).'}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30 group-focus-within:text-secondary transition-colors" />
                          <input 
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            className="w-full h-14 bg-card border-2 border-border rounded-2xl pl-12 text-center text-xl font-black tracking-[0.5em] focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all outline-none"
                            value={twoFactorVerifyCode}
                            onChange={(e) => setTwoFactorVerifyCode(e.target.value)}
                          />
                        </div>
                        <Button 
                          variant="me" 
                          className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-[0_4px_0_0_#1e40af]"
                          onClick={verify2FA}
                          disabled={isVerifying2FA}
                        >
                          {isVerifying2FA ? (t('verifying') || 'Verificando...') : (t('confirmCode') || 'Confirmar Código')}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
                <Separator className="h-0.5 sm:h-1 bg-background" />
                
                {/* Configurações de Tema e Idioma (Sempre visíveis nesta aba) */}
                <div className="bg-background/50 p-4 sm:p-10 space-y-8 border-t-2 border-border">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shadow-md">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-lg font-black uppercase tracking-tight">{t('appearance') || 'Aparência'}</p>
                  </div>

                  {/* Seleção de Idioma */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('language')}</p>
                    <div className="grid grid-cols-3 gap-3">
                      <Button
                        variant={language === 'pt' ? 'me' : 'ghost'}
                        className={cn(
                          "h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]",
                          language === 'pt' ? "shadow-[0_4px_0_0_#1e40af]" : "bg-card border-2 border-border text-slate-400"
                        )}
                        onClick={() => setLanguage('pt')}
                      >
                        PT
                      </Button>
                      <Button
                        variant={language === 'en' ? 'me' : 'ghost'}
                        className={cn(
                          "h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]",
                          language === 'en' ? "shadow-[0_4px_0_0_#1e40af]" : "bg-card border-2 border-border text-slate-400"
                        )}
                        onClick={() => setLanguage('en')}
                      >
                        EN
                      </Button>
                      <Button
                        variant={language === 'es' ? 'me' : 'ghost'}
                        className={cn(
                          "h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]",
                          language === 'es' ? "shadow-[0_4px_0_0_#1e40af]" : "bg-card border-2 border-border text-slate-400"
                        )}
                        onClick={() => setLanguage('es')}
                      >
                        ES
                      </Button>
                    </div>
                  </div>

                  {/* Toggle de Tema Claro/Escuro */}
                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('displayMode')}</p>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <Button
                        variant={theme === 'light' ? 'me' : 'ghost'}
                        className={cn(
                          "h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs gap-2 sm:gap-3 px-2 sm:px-4",
                          theme === 'light' ? "shadow-[0_4px_0_0_#1e40af]" : "bg-card border-2 border-border text-slate-400"
                        )}
                        onClick={() => setTheme('light')}
                      >
                        <Sun className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        <span className="truncate">{t('light')}</span>
                      </Button>
                      <Button
                        variant={theme === 'dark' ? 'me' : 'ghost'}
                        className={cn(
                          "h-16 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs gap-2 sm:gap-3 px-2 sm:px-4",
                          theme === 'dark' ? "shadow-[0_4px_0_0_#1e40af]" : "bg-card border-2 border-border text-slate-400"
                        )}
                        onClick={() => setTheme('dark')}
                      >
                        <Moon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                        <span className="truncate">{t('dark')}</span>
                      </Button>
                    </div>
                  </div>

                  {/* Seleção de Paleta de Cores */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('colorPalette')}</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {availableColors.map((name) => (
                        <button
                          key={name}
                          onClick={() => setColorName(name)}
                          className={cn(
                            "p-4 rounded-2xl border-2 transition-all flex items-center justify-between group",
                            colorName === name 
                              ? "bg-card border-foreground shadow-md" 
                              : "bg-card border-border hover:border-slate-300"
                          )}
                        >
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-tight",
                            colorName === name ? "text-foreground" : "text-slate-400"
                          )}>
                            {name}
                          </span>
                          {colorName === name && <Check className="w-4 h-4 text-foreground" />}
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 italic">
                      {t('autoColors')}
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* SEÇÃO 4: AÇÕES DE SAÍDA (Botão Logout) */}
          <div className="pt-8 sm:pt-12 space-y-6 sm:space-y-8">
            <Button 
              variant="destructive" 
              className="w-full h-16 sm:h-20 rounded-xl sm:rounded-[1.5rem] shadow-xl font-black uppercase tracking-widest text-lg sm:text-xl border-b-4 sm:border-b-[10px] border-red-800 active:border-b-0 active:translate-y-[4px] sm:active:translate-y-[10px] transition-all"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 sm:mr-4 w-6 h-6 sm:w-8 sm:h-8" />
              {t('logout')}
            </Button>
            
            {/* Informações de Versão e Créditos */}
            <div className="text-center space-y-2">
              <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.4em]">
                TaskFlow v2.5.0-PRO
              </p>
              <p className="text-xs font-bold text-muted-foreground/20">
                {t('developedBy')}
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
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-accent/5 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center shrink-0 border-2 border-border/50 group-hover:bg-card group-hover:border-border transition-all">
        <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/30 group-hover:text-foreground transition-colors" />
      </div>
      <div className="pt-1 min-w-0 flex-1">
        <p className="text-xs sm:text-sm font-black uppercase tracking-widest text-muted-foreground/80 mb-1">{label}</p>
        <p className="text-base sm:text-xl font-black text-foreground tracking-tight break-words">{value}</p>
      </div>
    </div>
  );
}

/**
 * COMPONENTE AUXILIAR: SettingsItem
 * Renderiza um item de configuração clicável com descrição e seta de navegação.
 */
function SettingsItem({ icon: Icon, label, description, color, onClick }: { icon: any, label: string, description: string, color: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 sm:p-8 hover:bg-accent/5 cursor-pointer transition-all group"
    >
      <div className="flex items-center gap-4 sm:gap-8">
        {/* Box do Ícone colorido com sombra */}
        <div className={cn(
          "w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg",
          color
        )}>
          <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-lg sm:text-2xl font-black text-foreground uppercase tracking-tighter truncate">{label}</p>
          <p className="text-xs sm:text-base font-bold text-muted-foreground mt-0.5 sm:mt-1 truncate">{description}</p>
        </div>
      </div>
      {/* Ícone de seta indicando que é clicável */}
      <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/20 group-hover:text-foreground group-hover:translate-x-2 sm:group-hover:translate-x-3 transition-all" />
    </div>
  );
}
