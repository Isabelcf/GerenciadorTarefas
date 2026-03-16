import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Loader2
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
import { toast } from 'sonner';
import axios from 'axios';

interface UserData {
  id: number;
  username: string;
  fullName: string | null;
  email: string | null;
  birthDate: string | null;
  twoFactorEnabled: boolean;
}

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await axios.get('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data.user);
      } catch (error) {
        toast.error('Erro ao carregar perfil');
        navigate('/login');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    toast.success('Logout realizado com sucesso');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <div className="max-w-2xl mx-auto p-6 md:py-12">
        <Button 
          variant="ghost" 
          className="mb-8 -ml-4 text-slate-500 hover:text-slate-900"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Voltar ao Dashboard
        </Button>

        <div className="space-y-8">
          {/* Profile Header */}
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center shadow-xl">
              <User className="text-white w-10 h-10" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.fullName || user.username}</h1>
              <p className="text-slate-500">@{user.username}</p>
              <div className="flex gap-2 mt-3">
                <span className="px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">Pro Plan</span>
                <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Ativo</span>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Informações da Conta</h2>
              <div className="space-y-6">
                <InfoRow icon={User} label="Nome Completo" value={user.fullName || 'Não informado'} />
                <Separator />
                <InfoRow icon={Mail} label="Email" value={user.email || 'Não informado'} />
                <Separator />
                <InfoRow 
                  icon={Shield} 
                  label="Segurança" 
                  value={user.twoFactorEnabled ? "Autenticação em 2 fatores ativa" : "Autenticação em 2 fatores inativa"} 
                />
                <Separator />
                <InfoRow 
                  icon={Calendar} 
                  label="Data de Nascimento" 
                  value={user.birthDate ? new Date(user.birthDate).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Não informada'} 
                />
              </div>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 px-2">Preferências</h2>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <SettingsItem icon={Bell} label="Notificações" description="Gerencie como você recebe alertas" />
              <Separator />
              <SettingsItem icon={CreditCard} label="Faturamento" description="Planos, métodos de pagamento e faturas" />
              <Separator />
              <SettingsItem icon={Settings} label="Configurações Gerais" description="Idioma, tema e acessibilidade" />
            </div>
          </div>

          {/* Logout Section */}
          <div className="pt-4">
            <Button 
              variant="destructive" 
              className="w-full h-12 rounded-xl shadow-sm"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 w-4 h-4" />
              Sair da Conta
            </Button>
            <p className="text-center text-xs text-slate-400 mt-4">
              Versão do App: 2.4.0-stable
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-slate-400" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-400">{label}</p>
        <p className="text-sm font-semibold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function SettingsItem({ icon: Icon, label, description }: { icon: any, label: string, description: string }) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors group">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
          <Icon className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900">{label}</p>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-colors" />
    </div>
  );
}
