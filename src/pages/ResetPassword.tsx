/**
 * PÁGINA: REDEFINIR SENHA
 * 
 * Esta página permite que o usuário defina uma nova senha após clicar no link de recuperação.
 * Ela valida o token enviado via URL e aplica a nova política de segurança.
 */

import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckSquare, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { toast } from 'sonner';
import axios from 'axios';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      return toast.error(t('invalidToken') || 'Token de recuperação ausente ou inválido.');
    }

    if (password !== confirmPassword) {
      return toast.error(t('passwordsDoNotMatch'));
    }

    /* VALIDAÇÃO: Política de Senha */
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return toast.error(t('passwordPolicyError') || 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números.');
    }

    setIsLoading(true);
    
    try {
      await axios.post('/api/auth/reset-password', { token, newPassword: password });
      toast.success(t('passwordResetSuccess') || 'Senha redefinida com sucesso! Agora você pode entrar.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || t('resetError') || 'Erro ao redefinir senha.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-card p-12 rounded-[3rem] border-4 border-border border-b-[12px] shadow-2xl max-w-md w-full space-y-6">
          <div className="w-20 h-20 bg-destructive/10 rounded-3xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-10 h-10 text-destructive" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tight">{t('invalidLink') || 'Link Inválido'}</h2>
          <p className="text-muted-foreground font-bold">{t('invalidLinkDesc') || 'Este link de recuperação expirou ou é inválido.'}</p>
          <Button variant="me" onClick={() => navigate('/forgot-password')} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-[0_4px_0_0_#1e40af]">
            {t('requestNewLink') || 'Pedir novo link'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md space-y-12">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-secondary rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl border-b-8 border-secondary-dark">
            <CheckSquare className="text-white w-12 h-12" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
            {t('resetPasswordTitle') || 'Nova Senha'}
          </h1>
          <p className="text-muted-foreground mt-4 font-bold text-xl">{t('chooseStrongPassword') || 'Escolha uma senha poderosa!'}</p>
        </div>

        <div className="bg-card p-10 sm:p-12 rounded-[3rem] border-4 border-border border-b-[12px] shadow-2xl space-y-10">
          <form onSubmit={handleReset} className="space-y-8">
            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-4">
                {t('newPassword') || 'Nova Senha'}
              </Label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-secondary transition-colors" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-14 h-14 text-lg rounded-2xl border-2 border-border focus:border-secondary transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-4">
                {t('confirmNewPassword') || 'Confirmar Nova Senha'}
              </Label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-secondary transition-colors" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-14 h-14 text-lg rounded-2xl border-2 border-border focus:border-secondary transition-all"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button 
              variant="me" 
              type="submit" 
              className="w-full h-16 rounded-[1.5rem] text-xl font-black uppercase tracking-widest shadow-[0_8px_0_0_var(--secondary-dark)] active:shadow-none active:translate-y-[4px] transition-all" 
              disabled={isLoading}
            >
              {isLoading ? t('saving') || 'Salvando...' : t('updatePassword') || 'Atualizar Senha'}
              {!isLoading && <ArrowRight className="ml-4 w-8 h-8" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
