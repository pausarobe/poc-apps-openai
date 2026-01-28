import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import { Card, Badge } from 'flowbite-react';
import { HiClock, HiLocationMarker, HiStatusOnline } from 'react-icons/hi';
import type { Trip } from '../lib/types';
import { useOpenAiGlobal } from '../lib/hooks';

// ---------- helpers ----------
function fmtTime(iso: string | null | undefined, tz?: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: tz || 'UTC',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function secondsToHM(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  return `${hours.toString().padStart(2, '0')}h${minutes.toString().padStart(2, '0')}min`;
}

// ---------- UI atoms ----------
function KPICard({
  title,
  value,
  subtitle,
  icon,
  bgColor,
  textColor,
  iconColor,
}: {
  title: string;
  value: number | string;
  subtitle: string;
  icon?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
  iconColor?: string;
}) {
  return (
    <div className={`${bgColor || 'bg-white'} rounded-lg shadow-md p-3`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium ${textColor || 'text-gray-700'}`}>{title}</p>
          <p className={`mt-0.5 text-xl font-bold ${textColor || 'text-gray-900'}`}>{value}</p>
          <p className={`mt-0.5 text-xs ${textColor || 'text-gray-600'} truncate`}>{subtitle}</p>
        </div>
        {icon && <div className={`${iconColor || 'text-gray-300'} flex-shrink-0`}>{icon}</div>}
      </div>
    </div>
  );
}

// ---------- header ----------
function TopBar() {
  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white">
            <img src="https://yt3.googleusercontent.com/Os6I-pmIOYEApiwFmmYNnTtXqxNHRMlvtqvizSLpCv-JX0vZ9fW3m3vLpzp2ZngKPhwuYzj2wtQ=s900-c-k-c0x00ffffff-no-rj" alt=""></img>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Renfe GPT APP • Operations</h1>
            <p className="text-sm text-blue-100 mt-0.5">Llegadas a Barcelona-Sants • Resumen operativo</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-md px-3 py-1.5 shadow-sm">
            <HiLocationMarker className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">BCN • Barcelona-Sants</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-md px-3 py-1.5 shadow-sm">
            <HiClock className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Europe/Barcelona</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ---------- table ----------
function FlightsTable({ trips }: { trips: any[] }) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-2">
        <h3 className="text-lg font-bold text-gray-900">Lista de llegadas</h3>
        <p className="hidden text-xs text-gray-600 sm:block">Tip: "Detalles" muestra terminal, puertas, timestamps y runway.</p>
      </div>

      {trips.length === 0 ? (
        <div className="py-8 text-center text-gray-500 bg-white rounded-lg shadow-sm">No hay trenes actualmente.</div>
      ) : (
        <div className="max-h-[580px] overflow-y-auto rounded-lg pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <div className="space-y-3">
            {trips.map((t, i) => {
              return (
                <Card key={i} className="bg-gradient-to-br from-slate-700 to-slate-800 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex gap-8 justify-between">
                    <div className="">
                      <p className="text-xs font-medium text-slate-400 mb-1">Hora salida</p>
                      <div className="text-white font-medium text-sm">{fmtTime(t.start)}</div>
                    </div>

                    <div className="">
                      <p className="text-xs font-medium text-slate-400 mb-1">Hora llegada</p>
                      <div className="text-white font-medium text-sm">{fmtTime(t.end)}</div>
                      <div className="text-xs text-slate-300">{secondsToHM(t.duration || 0)}</div>
                    </div>

                    <div className="">
                      <p className="text-xs font-medium text-slate-400 mb-1">Tren</p>
                      <div className="font-bold text-white text-base">{t.legs[0].route.shortName || '—'}</div>
                      <div className="text-xs text-slate-300">{t.legs[0].agency.name || ''}</div>
                    </div>

                    <div className="">
                      <p className="text-xs font-medium text-slate-400 mb-1">Origen</p>
                      <div className="flex items-center gap-1">
                        <HiLocationMarker className="h-4 w-4 text-blue-400" />
                        <div className="font-semibold text-white text-sm leading-tight">{t.legs[0].from.name || '—'}</div>
                      </div>
                    </div>

                    <div className="">
                      <p className="text-xs font-medium text-slate-400 mb-1">Destino</p>
                      <div className="flex items-center gap-1">
                        <HiLocationMarker className="h-4 w-4 text-blue-400" />
                        <div className="font-semibold text-white text-sm leading-tight">{t.legs[0].to.name || '—'}</div>
                      </div>
                    </div>

                    <div className="w-24">
                      <p className="text-xs font-medium text-slate-400 mb-1">Estado</p>
                      <div className="flex flex-col gap-1">
                        {i === 0 ? (
                          <Badge color="info" size="sm">
                            Activo
                          </Badge>
                        ) : (
                          <Badge color="gray" size="sm">
                            Programado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- page ----------
export default function TrainDashboard() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const toolOutput = useOpenAiGlobal('toolOutput');
  const updatedAt = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());

  useEffect(() => {
    async function getTripsData() {
      try {
        setLoading(true);
        const tripList = toolOutput?.trainList?.data;
        if (tripList) {
          setTrips(tripList);
        } else {
          setError('No se encontraron trenes');
        }
      } catch (error) {
        console.error('Error fetching trainList data:', error);
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    }

    getTripsData();
  }, [toolOutput]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <TopBar />

        <div className="bg-transparent">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KPICard
              title="Total trenes"
              value={trips.length}
              subtitle="En la lista actual"
              icon={<HiStatusOnline className="h-6 w-6" />}
              bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
              textColor="text-white"
              iconColor="text-blue-200"
            />
            <KPICard
              title="Con demora"
              value={0}
              subtitle="Salida o llegada"
              icon={<HiClock className="h-6 w-6" />}
              bgColor="bg-gradient-to-br from-amber-500 to-orange-600"
              textColor="text-white"
              iconColor="text-amber-200"
            />
            <KPICard
              title="Llegada más próxima"
              value={fmtTime(trips[0]?.start)}
              subtitle={trips[0]?.legs[0]?.route.shortName || '—'}
              icon={<HiLocationMarker className="h-6 w-6" />}
              bgColor="bg-gradient-to-br from-emerald-500 to-teal-600"
              textColor="text-white"
              iconColor="text-emerald-200"
            />
          </div>
        </div>

        <FlightsTable trips={trips} />

        <div className="flex flex-col gap-2 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="font-medium">{trips.length} viaje(s) mostrados</div>
          <div className="flex items-center gap-2">
            <Badge color="success">⬤ Actualizado</Badge>
            <span>{updatedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Solo renderizar si no estamos en Ladle/Storybook
if (typeof window !== 'undefined' && document.getElementById('root')) {
  const root = createRoot(document.getElementById('root')!);
  root.render(<TrainDashboard />);
}
