import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  MapPin, 
  Info,
  Loader2,
  Globe
} from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
import { cn } from '@/src/lib/utils';

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

interface LocationData {
  country_code: string;
  country_name: string;
  city: string;
  region: string;
}

export default function Calendar() {
  const navigate = useNavigate();
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        let countryCode = 'BR'; // Fallback to Brazil
        let locationInfo: LocationData = {
          country_code: 'BR',
          country_name: 'Brasil',
          city: 'São Paulo',
          region: 'SP'
        };

        try {
          // 1. Get location from IP (with timeout and error handling)
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 4000);
          
          // Try ipapi.co first
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
            console.warn('ipapi.co failed, using fallback location');
          }
        } catch (locErr) {
          console.warn('Falha ao obter localização via IP, usando padrão:', locErr);
        }
        
        setLocation(locationInfo);

        // 2. Get holidays for the country
        const year = new Date().getFullYear();
        const holRes = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
        
        if (!holRes.ok) {
          throw new Error(`Não foi possível carregar os feriados para ${locationInfo.country_name}`);
        }
        
        const holData: Holiday[] = await holRes.json();
        
        // Sort by date
        const sortedHolidays = holData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Filter only upcoming holidays
        const today = new Date().toISOString().split('T')[0];
        const upcomingHolidays = sortedHolidays.filter(h => h.date >= today);
        
        setHolidays(upcomingHolidays);
      } catch (err: any) {
        console.error('Erro no Calendar:', err);
        setError(err.message === 'Failed to fetch' 
          ? 'Erro de conexão ao buscar feriados. Por favor, verifique sua internet ou tente mais tarde.' 
          : err.message || 'Ocorreu um erro ao carregar os dados');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900">
      <div className="max-w-3xl mx-auto p-6 md:py-12">
        <Button 
          variant="ghost" 
          className="mb-8 -ml-4 text-slate-500 hover:text-slate-900"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Voltar ao Dashboard
        </Button>

        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                <CalendarIcon className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Feriados Regionais</h1>
                <p className="text-slate-500 text-sm">Próximos feriados baseados na sua localização</p>
              </div>
            </div>

            {location && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-slate-600">
                  {location.city}, {location.country_name}
                </span>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4" />
              <p className="text-sm font-medium">Detectando localização e buscando feriados...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center">
              <Info className="w-8 h-8 text-red-400 mx-auto mb-3" />
              <h3 className="text-red-900 font-bold">Erro ao carregar dados</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <Button 
                variant="outline" 
                className="mt-4 border-red-200 text-red-600 hover:bg-red-100"
                onClick={() => window.location.reload()}
              >
                Tentar novamente
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {holidays.length > 0 ? (
                holidays.map((holiday, idx) => (
                  <div 
                    key={idx}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-slate-300 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex flex-col items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:border-slate-900 transition-all">
                        <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-300 uppercase leading-none">
                          {new Date(holiday.date).toLocaleString('pt-BR', { month: 'short' }).replace('.', '')}
                        </span>
                        <span className="text-sm font-bold text-slate-900 group-hover:text-white leading-none mt-0.5">
                          {new Date(holiday.date).getDate()}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{holiday.localName}</h3>
                        <p className="text-xs text-slate-500">{holiday.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {holiday.global ? (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-md border border-emerald-100 uppercase tracking-tight">
                          Nacional
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md border border-blue-100 uppercase tracking-tight">
                          Regional
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-center">
                  <Globe className="w-12 h-12 mb-4 opacity-20" />
                  <h3 className="text-sm font-semibold text-slate-900">Nenhum feriado próximo</h3>
                  <p className="text-xs mt-1">Não encontramos feriados públicos para o restante do ano.</p>
                </div>
              )}
            </div>
          )}

          <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Dica de Produtividade</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Aproveite os feriados para descansar e recarregar suas energias. 
                Uma mente descansada é muito mais produtiva e criativa!
              </p>
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 blur-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
