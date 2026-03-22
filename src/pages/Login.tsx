/**
 * PÁGINA: LOGIN
 * 
 * Esta página permite que usuários existentes acessem suas contas.
 * Ela apresenta um formulário centralizado com campos para nome de usuário e senha.
 * 
 * Destaques visuais (Playful Soft UI):
 * - Logo centralizado com efeito 3D (borda inferior grossa).
 * - Card de formulário com cantos arredondados (`rounded-[2.5rem]`) e sombra profunda.
 * - Botão de ação principal com variante "me" (roxo vibrante) e efeito de clique.
 * - Inputs com ícones internos para melhor usabilidade.
 */

import React, { useState } from 'react';
/* Importação de hooks do React Router para navegação entre rotas */
import { useNavigate, Link } from 'react-router-dom';
/* Importação de ícones da biblioteca Lucide-React */
import { CheckSquare, User, Lock, ArrowRight } from 'lucide-react';
/* Importação de componentes de UI baseados no design system do projeto */
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useLanguage } from '@/src/contexts/LanguageContext';
/* Importação do sistema de notificações Toast */
import { toast } from 'sonner';
/* Importação do Axios para chamadas de API */
import axios from 'axios';

/**
 * COMPONENTE LOGIN
 * Gerencia a autenticação do usuário.
 */
export default function Login() {
  /* Hook para redirecionar o usuário após o login */
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  /* ESTADO: Armazena o nome de usuário digitado */
  const [username, setUsername] = useState('');
  
  /* ESTADO: Armazena a senha digitada */
  const [password, setPassword] = useState('');
  
  /* ESTADO: Controla o estado visual de carregamento do botão */
  const [isLoading, setIsLoading] = useState(false);

  /**
   * FUNÇÃO: handleLogin
   * Disparada ao enviar o formulário. Realiza a autenticação no servidor.
   */
  const handleLogin = async (e: React.FormEvent) => {
    /* Previne o comportamento padrão de recarregar a página */
    e.preventDefault();
    /* Inicia o estado de carregamento */
    setIsLoading(true);
    
    try {
      /* Envia as credenciais para o endpoint de login */
      const response = await axios.post('/api/auth/login', { username, password });
      const { token, user } = response.data;
      
      /* Salva o token JWT no LocalStorage para manter o usuário logado */
      localStorage.setItem('token', token);
      /* Salva o nome do usuário para exibir saudações personalizadas */
      localStorage.setItem('userName', user.username);
      
      /* Notifica o usuário sobre o sucesso */
      toast.success(t('welcomeBack').replace('{user}', user.username));
      /* Redireciona para a página principal (Dashboard) */
      navigate('/');
    } catch (error: any) {
      /* Captura erros da API ou de rede */
      const message = error.response?.data?.error || t('invalidCredentials');
      /* Exibe o erro em um toast vermelho */
      toast.error(message);
    } finally {
      /* Finaliza o estado de carregamento, independente do resultado */
      setIsLoading(false);
    }
  };

  return (
    /* CONTAINER PRINCIPAL: Ocupa toda a tela, centraliza o conteúdo e define o fundo */
    <div className="min-h-screen bg-background flex flex-col items-center justify-start sm:justify-center p-6 py-12 sm:py-6 font-sans">
      <div className="w-full max-w-md space-y-12">
        
        {/* CABEÇALHO: Logo animado e Título do App */}
        <div className="flex flex-col items-center text-center">
          {/* Box do Logo com efeito 3D (estilo Duolingo) */}
          <div className="w-24 h-24 bg-secondary rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl border-b-8 border-secondary-dark transition-transform hover:scale-105">
            <CheckSquare className="text-white w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-foreground uppercase italic">
            TaskFlow
          </h1>
          <p className="text-muted-foreground mt-4 font-bold text-xl">{t('readyForMission')}</p>
        </div>

        {/* CARD DO FORMULÁRIO: Estética Soft UI com bordas grossas e sombras */}
        <div className="bg-card p-10 sm:p-12 rounded-[3rem] border-4 border-border border-b-[12px] shadow-2xl space-y-10">
          <form onSubmit={handleLogin} className="space-y-8">
            
            {/* CAMPO: NOME DE USUÁRIO */}
            <div className="space-y-3">
              <Label htmlFor="username" className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-4">
                {t('user')}
              </Label>
              <div className="relative group">
                {/* Ícone posicionado dentro do input */}
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-secondary transition-colors" />
                <Input 
                   id="username"
                  type="text" 
                  placeholder="ex: super_dev" 
                  className="pl-14 h-12 sm:h-14 text-base sm:text-lg rounded-2xl border-2 border-border focus:border-secondary focus:ring-secondary/20 transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-secondary transition-colors" />
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-14 h-12 sm:h-14 text-base sm:text-lg rounded-2xl border-2 border-border focus:border-secondary focus:ring-secondary/20 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end px-2">
                <Link 
                  to="/forgot-password" 
                  className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-muted-foreground/60 hover:text-secondary transition-colors"
                >
                  {t('forgotPassword')}
                </Link>
              </div>
            </div>

            {/* BOTÃO DE SUBMISSÃO: Grande, roxo e com efeito de profundidade */}
            <Button 
              variant="me" 
              type="submit" 
              className="w-full h-16 sm:h-20 rounded-[1.25rem] sm:rounded-[1.5rem] text-base sm:text-2xl font-black uppercase tracking-normal sm:tracking-widest shadow-[0_5px_0_0_var(--secondary-dark)] sm:shadow-[0_8px_0_0_var(--secondary-dark)] active:shadow-none active:translate-y-[3px] sm:active:translate-y-[4px] transition-all" 
              disabled={isLoading}
            >
              {isLoading ? t('authenticating') : t('enter')}
              {!isLoading && <ArrowRight className="ml-2 sm:ml-4 w-6 h-6 sm:w-8 sm:h-8" />}
            </Button>
          </form>
        </div>

        {/* RODAPÉ: Link para cadastro se o usuário não tiver conta */}
        <div className="text-center space-y-4">
          <p className="text-lg sm:text-xl font-bold text-muted-foreground">
            {t('newHere')}
          </p>
          <Link 
            to="/signup" 
            className="inline-block text-secondary hover:text-secondary-dark font-black text-lg sm:text-xl underline underline-offset-8 decoration-4 transition-all hover:scale-105"
          >
            {t('createAccountNow')}
          </Link>
        </div>
      </div>
    </div>
  );
}
