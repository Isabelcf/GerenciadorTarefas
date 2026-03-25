/**
 * PÁGINA: ESQUECI MINHA SENHA
 * 
 * Permite que o usuário solicite a recuperação de senha via e-mail ou username.
 * Segue a estética 'Playful Soft UI' do projeto.
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckSquare, Mail, User, ArrowLeft, Send, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { useLanguage } from '@/src/contexts/LanguageContext';
import { toast } from 'sonner';
import axios from 'axios';
import { motion } from 'motion/react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorType, setErrorType] = useState<'none' | 'not_found'>('none');

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorType('none');
    
    try {
      await axios.post('/api/auth/forgot-password', { identifier });
      toast.success(t('recoveryInstructionsSent').replace('{identifier}', identifier));
      
      // Em produção, redirecionamos após um tempo para evitar "fishing" de usuários
      setTimeout(() => navigate('/login'), 5000);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setErrorType('not_found');
      } else {
        toast.error(t('genericError'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start sm:justify-center p-6 py-12 sm:py-6 font-sans">
      <div className="w-full max-w-md space-y-12">
        
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-secondary rounded-[2rem] flex items-center justify-center mb-6 shadow-xl border-b-8 border-secondary-dark transition-transform hover:scale-105">
            <CheckSquare className="text-white w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic">
            {t('recoverPassword')}
          </h1>
          <p className="text-muted-foreground mt-4 font-bold text-lg">{t('dontWorry')}</p>
        </div>

        <div className="bg-card p-8 sm:p-10 rounded-[3rem] border-4 border-border border-b-[12px] shadow-2xl space-y-8">
          {errorType === 'not_found' ? (
            <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border-4 border-red-100">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <div className="space-y-2">
                <p className="text-lg font-black text-foreground">
                  {t('accountNotFound')}
                </p>
                <p className="text-muted-foreground font-bold">
                  {t('please')}{' '}
                  <Link 
                    to="/signup" 
                    className="text-secondary hover:underline decoration-2"
                  >
                    {t('createYourAccount')}
                  </Link>
                  {t('toStartJourney')}
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setErrorType('none')}
                className="w-full h-12 rounded-xl border-2 font-bold"
              >
                {t('tryAnotherUser')}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleRecover} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="identifier" className="text-xs sm:text-sm font-black uppercase tracking-[0.15em] text-muted-foreground/60 ml-4">
                  {t('emailOrUser')}
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 group-focus-within:text-secondary transition-colors" />
                  <Input 
                    id="identifier"
                    type="text" 
                    placeholder="seu@email.com ou username" 
                    className="pl-14 h-12 sm:h-14 text-base sm:text-lg rounded-2xl border-2 border-border focus:border-secondary focus:ring-secondary/20 transition-all"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
                <p className="text-[10px] font-bold text-muted-foreground/40 ml-4 italic">
                  {t('recoveryInstructionsDesc')}
                </p>
              </div>

              <Button 
                variant="me" 
                type="submit" 
                className="w-full h-16 rounded-[1.25rem] text-lg font-black uppercase tracking-widest shadow-[0_5px_0_0_var(--secondary-dark)] active:shadow-none active:translate-y-[3px] transition-all" 
                disabled={isLoading}
              >
                {isLoading ? t('verifying') : t('sendRecovery')}
                {!isLoading && <Send className="ml-3 w-5 h-5" />}
              </Button>
            </form>
          )}
        </div>

        <div className="text-center">
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-muted-foreground/40 hover:text-foreground font-black text-sm uppercase tracking-widest transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}
