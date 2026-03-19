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
      return toast.error('Ops! As senhas não coincidem. Tente novamente! 🧐');
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
      toast.success('Conta criada com sucesso! Agora você é um herói da produtividade! 🏆');
      /* Redireciona para a tela de login para que o usuário possa entrar */
      navigate('/login');
    } catch (error: any) {
      /* Captura e exibe erros retornados pelo servidor */
      const message = error.response?.data?.error || 'Erro ao criar conta. Verifique os dados e tente novamente.';
      toast.error(message);
    } finally {
      /* Finaliza o estado de carregamento */
      setIsLoading(false);
    }
  };

  return (
    /* CONTAINER PRINCIPAL: Centraliza o formulário e define o fundo suave */
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 py-16 font-sans">
      <div className="w-full max-w-md space-y-12">
        
        {/* CABEÇALHO: Ícone de escudo e Título de Boas-vindas */}
        <div className="flex flex-col items-center text-center">
          {/* Box do Ícone com efeito 3D verde (estilo Duolingo) */}
          <div className="w-24 h-24 bg-duo-green rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl border-b-8 border-green-700 transition-transform hover:rotate-3">
            <ShieldCheck className="text-white w-12 h-12" />
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 uppercase italic">
            Novo Herói
          </h1>
          <p className="text-slate-500 mt-4 font-bold text-xl">Pronto para dominar suas tarefas? 🚀</p>
        </div>

        {/* CARD DO FORMULÁRIO: Estética Soft UI com bordas grossas e sombras profundas */}
        <div className="bg-white p-10 sm:p-12 rounded-[3rem] border-4 border-slate-200 border-b-[12px] shadow-2xl space-y-10">
          <form onSubmit={handleSignup} className="space-y-8">
            
            {/* CAMPO: NOME REAL */}
            <div className="space-y-3">
              <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">
                Seu Nome Completo
              </Label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-duo-green transition-colors" />
                <Input 
                  id="fullName"
                  type="text" 
                  placeholder="ex: João Silva" 
                  className="pl-16 h-16 text-xl rounded-2xl border-2 border-slate-200 focus:border-duo-green focus:ring-duo-green/20 transition-all"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CAMPO: CODINOME (USERNAME) */}
            <div className="space-y-3">
              <Label htmlFor="username" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">
                Codinome (Username)
              </Label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-duo-green transition-colors" />
                <Input 
                  id="username"
                  type="text" 
                  placeholder="ex: mestre_das_tarefas" 
                  className="pl-16 h-16 text-xl rounded-2xl border-2 border-slate-200 focus:border-duo-green focus:ring-duo-green/20 transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CAMPO: E-MAIL */}
            <div className="space-y-3">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">
                E-mail de Contato
              </Label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-duo-green transition-colors" />
                <Input 
                  id="email"
                  type="email" 
                  placeholder="seu@email.com" 
                  className="pl-16 h-16 text-xl rounded-2xl border-2 border-slate-200 focus:border-duo-green focus:ring-duo-green/20 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CAMPO: DATA DE NASCIMENTO */}
            <div className="space-y-3">
              <Label htmlFor="birthDate" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">
                Data de Nascimento
              </Label>
              <div className="relative group">
                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-duo-green transition-colors" />
                <Input 
                  id="birthDate"
                  type="date" 
                  className="pl-16 h-16 text-xl rounded-2xl border-2 border-slate-200 focus:border-duo-green focus:ring-duo-green/20 transition-all"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CAMPO: SENHA */}
            <div className="space-y-3">
              <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">
                Senha de Acesso
              </Label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-duo-green transition-colors" />
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-16 h-16 text-xl rounded-2xl border-2 border-slate-200 focus:border-duo-green focus:ring-duo-green/20 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* CAMPO: CONFIRMAR SENHA */}
            <div className="space-y-3">
              <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">
                Confirmar Senha
              </Label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-300 group-focus-within:text-duo-green transition-colors" />
                <Input 
                  id="confirmPassword"
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-16 h-16 text-xl rounded-2xl border-2 border-slate-200 focus:border-duo-green focus:ring-duo-green/20 transition-all"
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
              className="w-full h-20 rounded-[1.5rem] text-2xl font-black uppercase tracking-widest shadow-[0_8px_0_0_#46a302] active:shadow-none active:translate-y-[4px] transition-all" 
              disabled={isLoading}
            >
              {isLoading ? 'Criando Conta...' : 'Começar Agora!'}
              {!isLoading && <ArrowRight className="ml-4 w-8 h-8" />}
            </Button>
          </form>
        </div>

        {/* RODAPÉ: Link para voltar ao login se já tiver conta */}
        <div className="text-center space-y-4">
          <p className="text-xl font-bold text-slate-500">
            Já faz parte da equipe?
          </p>
          <Link 
            to="/login" 
            className="inline-block text-duo-green hover:text-green-700 font-black text-2xl underline underline-offset-8 decoration-4 transition-all hover:scale-105"
          >
            Fazer login agora!
          </Link>
        </div>
      </div>
    </div>
  );
}
