/**
 * PÁGINA: CALENDÁRIO DE FERIADOS
 * 
 * Esta página atua como um "Radar de Feriados", ajudando o usuário a planejar seus descansos.
 * Ela utiliza APIs externas para detectar a localização do usuário e listar os próximos feriados nacionais.
 * 
 * Funcionalidades principais:
 * - Geocalização via IP (ipapi.co) para identificar o país do usuário.
 * - Busca de feriados públicos (Nager.Date API) baseada no código do país.
 * - Filtragem automática para exibir apenas feriados futuros.
 * 
 * Destaques visuais (Playful Soft UI):
 * - Cabeçalho com ícone 3D roxo (`me-purple`).
 * - Badge de localização arredondada com sombra.
 * - Cards de feriado com widget de data estilizado (estilo calendário físico).
 * - Seção de "Dica de Mestre" com fundo escuro e elementos brilhantes.
 */

import React, { useState, useEffect } from 'react';
/* Importação do hook de navegação para retornar ao dashboard */
import { useNavigate } from 'react-router-dom';
/* Importação de ícones da biblioteca Lucide-React */
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  MapPin, 
  Info,
  Loader2,
  Globe,
  Sparkles
} from 'lucide-react';
/* Importação de componentes de UI baseados no design system Soft UI */
import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
/* Importação de utilitário para classes CSS dinâmicas */
import { cn } from '@/src/lib/utils';

/**
 * INTERFACE: Holiday
 * Define a estrutura de um feriado vindo da API Nager.Date.
 */
interface Holiday {
  date: string;
  localName: string;
  name: string;
  countryCode: string;
  fixed: boolean;
  global: boolean;
  counties: string[] | null;
  launchYear: number | null;
  types: string[];
}

/**
 * INTERFACE: LocationData
 * Define a estrutura dos dados de localização retornados pela API de IP.
 */
interface LocationData {
  country_code: string;
  country_name: string;
  city: string;
  region: string;
}

/**
 * COMPONENTE CALENDAR
 * Gerencia a lógica de busca e exibição dos feriados.
 */
export default function Calendar() {
  /* Hook para navegação programática */
  const navigate = useNavigate();
  
  /* ESTADO: Lista de feriados carregados */
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  
  /* ESTADO: Informações de localização do usuário */
  const [location, setLocation] = useState<LocationData | null>(null);
  
  /* ESTADO: Controla se a página está carregando dados */
  const [isLoading, setIsLoading] = useState(true);
  
  /* ESTADO: Armazena mensagens de erro, se houver */
  const [error, setError] = useState<string | null>(null);

  /**
   * EFEITO: BUSCA DE DADOS
   * Executado ao montar o componente para carregar localização e feriados.
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        /* VALORES PADRÃO: Caso a geolocalização falhe, assume Brasil */
        let countryCode = 'BR';
        let locationInfo: LocationData = {
          country_code: 'BR',
          country_name: 'Brasil',
          city: 'São Paulo',
          region: 'SP'
        };

        try {
          /**
           * PASSO 1: Tenta obter a localização via IP.
           * Usamos um AbortController para cancelar a requisição se demorar mais de 4 segundos.
           */
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          
          try {
            const locRes = await fetch('https://ipapi.co/json/', { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (locRes.ok) {
              const locData = await locRes.json();
              if (locData && locData.country_code) {
                locationInfo = {
                  country_code: locData.country_code,
                  country_name: locData.country_name || 'Brasil',
                  city: locData.city || 'São Paulo',
                  region: locData.region || 'SP'
                };
                countryCode = locData.country_code;
              }
            }
          } catch (e) {
            console.warn('A API de localização falhou, usando valores padrão.');
          }
        } catch (locErr) {
          console.warn('Erro ao processar localização:', locErr);
        }
        
        /* Atualiza o estado da localização na tela */
        setLocation(locationInfo);

        /**
         * PASSO 2: Busca os feriados públicos.
         * Usamos o ano atual e o código do país detectado.
         */
        const year = new Date().getFullYear();
        const holRes = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
        
        if (!holRes.ok) {
          throw new Error(`Não conseguimos encontrar feriados para ${locationInfo.country_name} no momento.`);
        }
        
        const holData: Holiday[] = await holRes.json();
        
        /* Ordena os feriados por data (do mais próximo ao mais distante) */
        const sortedHolidays = holData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        /* Filtra apenas feriados que ainda vão acontecer (hoje ou no futuro) */
        const today = new Date().toISOString().split('T')[0];
        const upcomingHolidays = sortedHolidays.filter(h => h.date >= today);
        
        /* Salva a lista final no estado */
        setHolidays(upcomingHolidays);
      } catch (err: any) {
        /* Captura erros de rede ou da API */
        console.error('Erro no Calendar:', err);
        setError(err.message === 'Failed to fetch' 
          ? 'Erro de conexão. Verifique sua internet para ver os feriados!' 
          : err.message || 'Ocorreu um erro inesperado ao carregar o radar.');
      } finally {
        /* Finaliza o estado de carregamento */
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    /* CONTAINER PRINCIPAL: Fundo suave e centralização do conteúdo */
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 font-sans">
      <div className="max-w-4xl mx-auto p-4 sm:p-8 md:py-16 text-center sm:text-left">
        
        {/* BOTÃO VOLTAR: Estilo minimalista Soft UI */}
        <Button 
          variant="ghost" 
          className="mb-8 sm:mb-12 -ml-4 text-slate-400 hover:text-slate-900 font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 sm:mr-3 w-5 h-5 sm:w-6 sm:h-6" />
          Voltar ao Dashboard
        </Button>

        <div className="space-y-8 sm:space-y-12">
          
          {/* CABEÇALHO: Título e Localização Detectada */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
              {/* Ícone 3D do Calendário */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-me-purple rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center shadow-2xl border-b-4 sm:border-b-8 border-purple-900 transition-transform hover:rotate-6">
                <CalendarIcon className="text-white w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <h1 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase italic">Radar de Feriados</h1>
                <p className="text-slate-400 font-bold text-base sm:text-xl italic">Descubra suas próximas pausas estratégicas! 🏝️</p>
              </div>
            </div>

            {/* Badge de Localização: Mostra onde o usuário está baseado no IP */}
            {location && (
              <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-2 sm:py-4 bg-white border-2 sm:border-4 border-slate-200 rounded-[1.5rem] sm:rounded-[2rem] shadow-xl transition-all hover:border-me-blue self-center sm:self-auto">
                <MapPin className="w-4 h-4 sm:w-6 sm:h-6 text-me-blue animate-bounce" />
                <span className="text-[10px] sm:text-xs font-black text-slate-700 uppercase tracking-widest">
                  {location.city}, {location.country_code}
                </span>
              </div>
            )}
          </div>

          {/* ÁREA DE CONTEÚDO: Carregamento, Erro ou Lista */}
          {isLoading ? (
            /* TELA DE CARREGAMENTO: Spinner animado e texto pulsante */
            <div className="py-20 sm:py-32 flex flex-col items-center justify-center text-slate-300">
              <Loader2 className="w-12 h-12 sm:w-20 sm:h-20 animate-spin mb-6 sm:mb-8 text-me-purple" />
              <p className="text-lg sm:text-2xl font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] animate-pulse">Sincronizando...</p>
            </div>
          ) : error ? (
            /* TELA DE ERRO: Card vermelho com botão de tentar novamente */
            <div className="bg-red-50 border-2 sm:border-4 border-red-200 p-6 sm:p-12 rounded-[2rem] sm:rounded-[3rem] text-center shadow-2xl">
              <Info className="w-12 h-12 sm:w-20 sm:h-20 text-red-400 mx-auto mb-6 sm:mb-8" />
              <h3 className="text-red-900 text-xl sm:text-3xl font-black uppercase italic">Falha na Missão</h3>
              <p className="text-red-600 font-bold mt-2 sm:mt-4 text-base sm:text-xl">{error}</p>
              <Button 
                variant="duo" 
                className="mt-6 sm:mt-10 h-12 sm:h-16 px-8 sm:px-12 rounded-xl sm:rounded-2xl font-black uppercase tracking-widest shadow-[0_4px_0_0_#46a302] sm:shadow-[0_6px_0_0_#46a302] active:shadow-none active:translate-y-[4px] sm:active:translate-y-[6px]"
                onClick={() => window.location.reload()}
              >
                Tentar Novamente 🔄
              </Button>
            </div>
          ) : (
            /* LISTA DE FERIADOS: Renderiza cada item se houver dados */
            <div className="space-y-4 sm:space-y-8">
              {holidays.length > 0 ? (
                holidays.map((holiday, idx) => (
                  <div 
                    key={idx}
                    className="bg-white p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2.5rem] border-2 sm:border-4 border-slate-200 border-b-4 sm:border-b-[10px] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-8 group hover:scale-[1.02] transition-all"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                      {/* WIDGET DE DATA: Estilo calendário físico com cores que mudam no hover */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-50 rounded-[1rem] sm:rounded-[1.5rem] flex flex-col items-center justify-center border-2 border-slate-100 group-hover:bg-slate-900 group-hover:border-slate-900 transition-all shadow-inner">
                        <span className="text-[8px] sm:text-[10px] font-black text-slate-300 group-hover:text-slate-400 uppercase leading-none tracking-widest">
                          {new Date(holiday.date).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}
                        </span>
                        <span className="text-xl sm:text-3xl font-black text-slate-900 group-hover:text-white leading-none mt-1 sm:mt-2">
                          {new Date(holiday.date).getDate()}
                        </span>
                      </div>
                      <div className="text-center sm:text-left space-y-1">
                        <h3 className="text-lg sm:text-2xl font-black text-slate-900 uppercase tracking-tighter">{holiday.localName}</h3>
                        <p className="text-sm sm:text-lg font-bold text-slate-400 italic">{holiday.name}</p>
                      </div>
                    </div>
                    
                    {/* BADGE DE TIPO: Diferencia feriados nacionais de regionais */}
                    <div className="flex items-center gap-4">
                      {holiday.global ? (
                        <span className="px-4 sm:px-6 py-1.5 sm:py-2 bg-duo-green text-white text-[8px] sm:text-[10px] font-black rounded-full shadow-lg uppercase tracking-widest border-b-2 sm:border-b-4 border-green-700">
                          Nacional 🇧🇷
                        </span>
                      ) : (
                        <span className="px-4 sm:px-6 py-1.5 sm:py-2 bg-me-blue text-white text-[8px] sm:text-[10px] font-black rounded-full shadow-lg uppercase tracking-widest border-b-2 sm:border-b-4 border-blue-700">
                          Regional 📍
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                /* ESTADO VAZIO: Quando não há feriados futuros detectados */
                <div className="py-20 sm:py-32 flex flex-col items-center justify-center text-slate-400 text-center bg-white rounded-[2rem] sm:rounded-[3rem] border-2 sm:border-4 border-dashed border-slate-100 p-6">
                  <Globe className="w-16 h-16 sm:w-24 sm:h-24 mb-6 sm:mb-8 opacity-10" />
                  <h3 className="text-xl sm:text-3xl font-black text-slate-900 uppercase italic">Horizonte Limpo</h3>
                  <p className="text-sm sm:text-xl font-bold mt-2 sm:mt-4 text-slate-400">Nenhum feriado detectado no radar por enquanto. <br className="hidden sm:block"/>Hora de focar 100% nas missões!</p>
                </div>
              )}
            </div>
          )}

          {/* CARD DE DICA: Mensagem motivacional gamificada */}
          <div className="bg-slate-900 rounded-[2rem] sm:rounded-[3.5rem] p-6 sm:p-12 text-white shadow-2xl relative overflow-hidden border-b-8 sm:border-b-[12px] border-slate-950">
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
              {/* Ícone de brilho com efeito 3D amarelo */}
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-duo-yellow rounded-[1rem] sm:rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl border-b-4 sm:border-b-8 border-duo-yellow-dark rotate-6 transition-transform hover:-rotate-6">
                <Sparkles className="text-duo-yellow-dark w-8 h-8 sm:w-12 sm:h-12" />
              </div>
              <div className="space-y-2 sm:space-y-4">
                <h3 className="text-xl sm:text-3xl font-black uppercase tracking-tighter italic">Dica de Mestre 💡</h3>
                <p className="text-slate-300 text-base sm:text-xl font-medium leading-relaxed italic">
                  "Aproveite os feriados para descansar e recarregar suas energias. 
                  Uma mente descansada é o seu maior superpoder para vencer qualquer desafio!"
                </p>
              </div>
            </div>
            {/* Efeitos visuais de fundo (Glows) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-me-purple/20 rounded-full -mr-32 -mt-32 blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-me-blue/20 rounded-full -ml-24 -mb-24 blur-[80px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
