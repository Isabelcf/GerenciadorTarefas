/**
 * PÁGINA: CADASTRO (SIGNUP)
 * 
 * Esta página permite que novos usuários criem seus perfis no TaskFlow.
 * Ela coleta informações essenciais como nome completo, codinome, e-mail, data de nascimento e senha.
 * 
 * Destaques visuais (Playful Soft UI):
 * - Cabeçalho com ícone de escudo verde (`duo-green`) e efeito 3D.
 * - Formulário em card branco com bordas grossas e cantos arredondados (`rounded-[2.5rem]`).
 * - Botão de ação principal em verde vibrante com efeito de profundidade.
 * - Feedback visual imediato via Toasts para validações de senha e erros de API.
 */

import React, { useState } from 'react';
/* Importação de hooks do React Router para navegação e links */
import { useNavigate, Link } from 'react-router-dom';
/* Importação de ícones da biblioteca Lucide-React para ilustrar os campos */
import { CheckSquare, User, Lock, ArrowRight, ShieldCheck, Mail, Calendar } from 'lucide-react';
/* Importação de componentes de UI baseados no design system Soft UI */
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useLanguage } from '@/src/contexts/LanguageContext';
/* Importação do sistema de notificações Toast */
import { toast } from 'sonner';
/* Importação do Axios para comunicação com o servidor */
import axios from 'axios';

/**
 * COMPONENTE SIGNUP
 * Gerencia a criação de novas contas de usuário.
 */
export default function Signup() {
  /* Hook para redirecionar o usuário após o cadastro bem-sucedido */
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  /* ESTADOS: Controlam os valores de cada campo do formulário */
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  /* ESTADO: Controla o estado visual de carregamento (loading) do botão */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * FUNÇÃO: handleSignup
   * Processa o envio do formulário de cadastro.
   */
  const handleSignup = async (e: React.FormEvent) => {
    /* Previne o recarregamento da página ao enviar o formulário */
    e.preventDefault();
    
    /* VALIDAÇÃO: Verifica se as senhas digitadas são idênticas */
    if (password !== confirmPassword) {
      return toast.error(t('passwordsDoNotMatch'));
    }

    /* Inicia o estado de carregamento */
    setIsLoading(true);
    
    try {
      /* Envia os dados do novo usuário para o endpoint de registro */
      await axios.post('/api/auth/register', { 
        username, 
        password, 
        fullName, 
        email, 
        birthDate 
      });
      
      /* Notifica o usuário sobre o sucesso da criação da conta */
      toast.success(t('accountCreatedSuccess'));
      /* Redireciona para a tela de login para que o usuário possa entrar */
      navigate('/login');
    } catch (error: any) {
      /* Captura e exibe erros retornados pelo servidor */
      const message = error.response?.data?.error || t('signupError');
      toast.error(message);
    } finally {
      /* Finaliza o estado de carregamento */
      setIsLoading(false);
    }
  };

  return (
    /* CONTAINER PRINCIPAL: Centraliza o formulário e define o fundo suave */
    <div className="min-h-screen bg-background flex flex-col items-center justify-start sm:justify-center p-6 py-12 sm:py-16 font-sans">
      <div className="w-full max-w-md space-y-12">
        
        {/* CABEÇALHO: Ícone de escudo e Título de Boas-vindas */}
        <div className="flex flex-col items-center text-center">
          {/* Box do Ícone com efeito 3D verde (estilo Duolingo) */}
          <div className="w-24 h-24 bg-primary rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl border-b-8 border-primary-dark transition-transform hover:rotate-3">
            <ShieldCheck className="text-white w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase italic">
            {t('newHero')}
          </h1>
          <p className="text-muted-foreground mt-4 font-bold text-xl">{t('readyToMaster')}</p>
        </div>

        {/* CARD DO FORMULÁRIO: Estética Soft UI com bordas grossas e sombras profundas */}
        <div className="bg-card p-10 sm:p-12 rounded-[3rem] border-4 border-border border-b-[12px] shadow-2xl space-y-10">
          <form onSubmit={handleSignup} className="space-y-8">
            
            {/* CAMPO: NOME REAL */}
            <div className="space-y-3">
              <Label htmlFor="fullName" className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-4">
                {t('yourFullName')}
              </Label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="fullName"
                  type="text" 
                  placeholder="ex: João Silva" 
                  className="pl-14 h-12 sm:h-14 text-base sm:text-lg rounded-2xl border-2 border-border focus:border-primary focus:ring-primary/20 transition-all"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CAMPO: CODINOME (USERNAME) */}
            <div className="space-y-3">
              <Label htmlFor="username" className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-4">
                {t('user')}
              </Label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="username"
                  type="text" 
                  placeholder="ex: mestre_das_tarefas" 
                  className="pl-14 h-12 sm:h-14 text-base sm:text-lg rounded-2xl border-2 border-border focus:border-primary focus:ring-primary/20 transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CAMPO: E-MAIL */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-4">
                {t('contactEmail')}
              </Label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="email"
                  type="email" 
                  placeholder="seu@email.com" 
                  className="pl-14 h-12 sm:h-14 text-base sm:text-lg rounded-2xl border-2 border-border focus:border-primary focus:ring-primary/20 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CAMPO: DATA DE NASCIMENTO */}
            <div className="space-y-3">
              <Label htmlFor="birthDate" className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-4">
                {t('birthDate')}
              </Label>
              <div className="relative group">
                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="birthDate"
                  type="date" 
                  className="pl-14 h-12 sm:h-14 text-base sm:text-lg rounded-2xl border-2 border-border focus:border-primary focus:ring-primary/20 transition-all"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CAMPO: SENHA */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-4">
                {t('password')}
              </Label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-14 h-12 sm:h-14 text-base sm:text-lg rounded-2xl border-2 border-border focus:border-primary focus:ring-primary/20 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CAMPO: CONFIRMAR SENHA */}
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-4">
                {t('confirmPassword')}
              </Label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-primary transition-colors" />
                <Input 
                  id="confirmPassword"
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-14 h-12 sm:h-14 text-base sm:text-lg rounded-2xl border-2 border-border focus:border-primary focus:ring-primary/20 transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* BOTÃO DE CADASTRO: Grande, verde e com efeito de profundidade */}
            <Button 
              variant="duo" 
              type="submit" 
              className="w-full h-16 sm:h-20 rounded-[1.25rem] sm:rounded-[1.5rem] text-base sm:text-2xl font-black uppercase tracking-normal sm:tracking-widest shadow-[0_5px_0_0_var(--primary-dark)] sm:shadow-[0_8px_0_0_var(--primary-dark)] active:shadow-none active:translate-y-[3px] sm:active:translate-y-[4px] transition-all" 
              disabled={isLoading}
            >
              {isLoading ? t('creatingAccount') : t('enter')}
              {!isLoading && <ArrowRight className="ml-2 sm:ml-4 w-6 h-6 sm:w-8 sm:h-8" />}
            </Button>
          </form>
        </div>

        {/* RODAPÉ: Link para voltar ao login se já tiver conta */}
        <div className="text-center space-y-4">
          <p className="text-lg sm:text-xl font-bold text-muted-foreground">
            {t('alreadyPart')}
          </p>
          <Link 
            to="/login" 
            className="inline-block text-primary hover:text-primary-dark font-black text-lg sm:text-xl underline underline-offset-8 decoration-4 transition-all hover:scale-105"
          >
            {t('loginNow')}
          </Link>
        </div>
      </div>
    </div>
  );
}
