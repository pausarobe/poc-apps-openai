import { createRoot } from 'react-dom/client';
import { useEffect, useMemo, useState } from 'react';
import { Card, Badge, Button } from 'flowbite-react';
import { HiClock, HiLocationMarker, HiStatusOnline } from 'react-icons/hi';
import type { FlightData } from '../lib/types';
import { useOpenAiGlobal } from '../lib/hooks';
import { mcpApp } from '../lib/mcp-app.js';

export const sampleFlights: FlightData[] = [
  {
    flight_date: '2026-01-08',
    flight_status: 'active',
    departure: {
      airport: 'Dublin International',
      timezone: 'Europe/Dublin',
      iata: 'DUB',
      icao: 'EIDW',
      terminal: '2',
      gate: '2',
      delay: null,
      scheduled: '2026-01-08T09:40:00+00:00',
      estimated: '2026-01-08T09:40:00+00:00',
      actual: '2026-01-08T10:02:00+00:00',
      estimated_runway: '2026-01-08T10:00:00+00:00',
      actual_runway: '2026-01-08T10:02:00+00:00',
    },
    arrival: {
      airport: 'Barajas',
      timezone: 'Europe/Madrid',
      iata: 'MAD',
      icao: 'LEMD',
      terminal: '4S',
      gate: null,
      baggage: null,
      scheduled: '2026-01-08T13:20:00+00:00',
      delay: null,
      estimated: '2026-01-08T13:11:00+00:00',
      actual: null,
      estimated_runway: null,
      actual_runway: null,
    },
    airline: { name: 'Iberia Express', iata: 'I2', icao: 'IBS' },
    flight: { number: '1882', iata: 'I21882', icao: 'IBS1882', codeshared: null },
    aircraft: { registration: null, iata: null, icao: null, icao24: '344455' },
    live: null,
  },
];

// ---------- helpers ----------
const safeLower = (v: any): string => (v ?? '').toString().toLowerCase();

function fmtTime(iso: string | null | undefined, tz: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return new Intl.DateTimeFormat('es-ES', {
    timeZone: tz || 'UTC',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function minutesDiff(aIso: string | null | undefined, bIso: string | null | undefined): number | null {
  if (!aIso || !bIso) return null;
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  return Math.round((a - b) / 60000);
}

function statusBadge(status: string): { color: any; text: string } {
  const s = safeLower(status) || 'unknown';
  if (s === 'active') return { color: 'info', text: 'Activo' };
  if (s === 'landed') return { color: 'success', text: 'Aterrizado' };
  if (s === 'scheduled') return { color: 'gray', text: 'Programado' };
  if (s === 'cancelled') return { color: 'failure', text: 'Cancelado' };
  if (s === 'diverted') return { color: 'warning', text: 'Desviado' };
  return { color: 'gray', text: status || '—' };
}

function delayBadge(depDelayMin: number | null, arrDelayMin: number | null): { color: any; text: string } | null {
  const nums = [depDelayMin, arrDelayMin].filter(x => typeof x === 'number');
  const maxDelay = nums.length ? Math.max(...nums) : 0;

  if (maxDelay > 0) return { color: 'warning', text: `Demora +${maxDelay} min` };
  return null;
}

function deriveFlight(f: FlightData) {
  const depTz = f?.departure?.timezone;
  const arrTz = f?.arrival?.timezone;

  const depDelay = minutesDiff(f?.departure?.actual || f?.departure?.estimated, f?.departure?.scheduled);
  const arrDelay = minutesDiff(f?.arrival?.estimated || f?.arrival?.actual, f?.arrival?.scheduled);

  const key = [f?.flight?.iata, f?.flight?.number, f?.flight?.icao, f?.airline?.name, f?.departure?.iata, f?.departure?.airport, f?.arrival?.iata, f?.arrival?.airport]
    .filter(Boolean)
    .join('|')
    .toLowerCase();

  return {
    depTz,
    arrTz,
    depDelay,
    arrDelay,
    key,
    std: f?.departure?.scheduled,
    atd: f?.departure?.actual,
    sta: f?.arrival?.scheduled,
    eta: f?.arrival?.estimated,
  };
}

async function searchFlightDetail(flightIata: string) {
  console.log('Searching flight detail...', flightIata);
  try {
    await mcpApp.sendMessage(
      `Quiero ver el detalle del vuelo. Llama a la herramienta flight-detail con el código IATA '${flightIata}'.`
    );
  } catch (error) {
    console.error('Failed to send message:', error);
  }
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
function TopBar({ type }: { type: 'arrival' | 'departure' }) {
  const isArrival = type === 'arrival';
  const title = isArrival ? 'Llegadas a Madrid (MAD)' : 'Salidas desde Madrid (MAD)';

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm text-white">
            <HiStatusOnline className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">FLIGHT GPT APP • Operations</h1>
            <p className="text-sm text-blue-100 mt-0.5">{title} • Resumen operativo</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-md px-3 py-1.5 shadow-sm">
            <HiLocationMarker className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">MAD • Barajas</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-md px-3 py-1.5 shadow-sm">
            <HiClock className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">Europe/Madrid</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// ---------- table ----------
function FlightsTable({ flights, type }: { flights: FlightData[]; type: 'arrival' | 'departure' }) {
  const isArrival = type === 'arrival';
  const listTitle = isArrival ? 'Lista de llegadas' : 'Lista de salidas';

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-2">
        <h3 className="text-lg font-bold text-gray-900">{listTitle}</h3>
        <p className="hidden text-xs text-gray-600 sm:block">Tip: "Detalles" muestra terminal, puertas, timestamps y runway.</p>
      </div>

      {flights.length === 0 ? (
        <div className="py-8 text-center text-gray-500 bg-white rounded-lg shadow-sm">No hay vuelos actualmente.</div>
      ) : (
        <div className="max-h-[580px] overflow-y-auto rounded-lg pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          <div className="space-y-3">
            {flights.map(f => {
              const d = deriveFlight(f);
              const st = statusBadge(f.flight_status);
              const dl = delayBadge(d.depDelay, d.arrDelay);

              return (
                <Card key={`${f.flight?.iata ?? '—'}-${f.flight_date ?? ''}`} className="bg-gradient-to-br from-slate-700 to-slate-800 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      {/* Vuelo */}
                      <div className="w-20 flex-shrink-0">
                        <p className="text-xs font-medium text-slate-400 mb-1">Vuelo</p>
                        <div className="font-bold text-white text-base">{f.flight?.iata || '—'}</div>
                        <div className="text-xs text-slate-300">{f.flight?.icao || ''}</div>
                      </div>

                      {/* Aerolínea */}
                      <div className="w-28 flex-shrink-0">
                        <p className="text-xs font-medium text-slate-400 mb-1">Aerolínea</p>
                        <div className="font-semibold text-white text-sm leading-tight">{f.airline?.name || '—'}</div>
                      </div>

                      {/* Origen/Destino */}
                      <div className="w-16 flex-shrink-0">
                        <p className="text-xs font-medium text-slate-400 mb-1">{isArrival ? 'Origen' : 'Destino'}</p>
                        <div className="flex items-center gap-1">
                          <HiLocationMarker className="h-4 w-4 text-blue-400" />
                          <span className="font-bold text-white text-base">{isArrival ? f.departure?.iata || '—' : f.arrival?.iata || '—'}</span>
                        </div>
                      </div>

                      {/* Horarios */}
                      <div className="flex gap-6 flex-1 min-w-0">
                        {isArrival ? (
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-400 mb-1">STA / ETA</p>
                            <div className="text-white font-medium text-sm">{fmtTime(f.arrival?.scheduled, d.arrTz)}</div>
                            <div className="text-emerald-300 text-xs font-semibold">
                              {fmtTime(f.arrival?.estimated, d.arrTz)}
                              {typeof d.arrDelay === 'number' && (
                                <span className="ml-1">
                                  ({d.arrDelay > 0 ? '+' : ''}
                                  {d.arrDelay}min)
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-400 mb-1">STD / ETD</p>
                            <div className="text-white font-medium text-sm">{fmtTime(f.departure?.scheduled, d.depTz)}</div>
                            <div className="text-emerald-300 text-xs font-semibold">
                              {fmtTime(f.departure?.estimated, d.depTz)}
                              {typeof d.depDelay === 'number' && (
                                <span className="ml-1">
                                  ({d.depDelay > 0 ? '+' : ''}
                                  {d.depDelay}min)
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Estado */}
                      <div className="w-24 flex-shrink-0">
                        <p className="text-xs font-medium text-slate-400 mb-1">Estado</p>
                        <div className="flex flex-col gap-1">
                          <Badge color={st.color} size="sm">
                            {st.text}
                          </Badge>
                          {dl && (
                            <Badge color={dl.color} size="sm">
                              {dl.text}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Detalle */}
                    <div className="w-20 flex-shrink-0 flex items-center">
                      <Button
                        size="xs"
                        className="bg-blue-500 hover:bg-blue-600 text-white border-0 w-full whitespace-nowrap"
                        onClick={() => searchFlightDetail(f.flight?.iata || '')}
                      >
                        Detalle
                      </Button>
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
export default function FlightDashboard() {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  const toolOutput = useOpenAiGlobal('toolOutput');
  const type = (toolOutput?.type as 'arrival' | 'departure') || 'arrival';

  useEffect(() => {
    async function getFlightData() {
      try {
        setLoading(true);
        const flightList = toolOutput?.flightList;
        console.log('Flight List:', flightList);
        console.log('Type:', toolOutput?.type);

        if (flightList) {
          setFlights(flightList);
        } else {
          setError('No se encontraron vuelos');
        }
      } catch (error) {
        console.error('Error fetching flightList data:', error);
        setError('Error al conectar con el servidor');
      } finally {
        setLoading(false);
      }
    }

    getFlightData();
  }, [toolOutput]);

  const kpis = useMemo(() => {
    const total = flights.length;
    const active = flights.filter(f => safeLower(f.flight_status) === 'active').length;

    const derived = flights.map(deriveFlight);
    const delayed = derived.filter(d => (d.depDelay || 0) > 0 || (d.arrDelay || 0) > 0).length;

    const isArrival = type === 'arrival';

    const next = derived
      .map((d, idx) => ({
        ...d,
        idx,
        t: isArrival ? (d.eta ? new Date(d.eta).getTime() : null) : d.std ? new Date(d.std).getTime() : null,
      }))
      .filter(x => x.t != null)
      .sort((a, b) => (a.t ?? 0) - (b.t ?? 0))[0];

    const nextFlight = next ? flights[next.idx] : null;
    const nextTime = next ? (isArrival ? fmtTime(next.eta, next.arrTz) : fmtTime(nextFlight?.departure?.estimated || next.std, next.depTz)) : '—';
    const nextMeta = next
      ? isArrival
        ? `${flights[next.idx]?.flight?.iata || '—'} desde ${flights[next.idx]?.departure?.iata || '—'}`
        : `${flights[next.idx]?.flight?.iata || '—'} hacia ${flights[next.idx]?.arrival?.iata || '—'}`
      : isArrival
      ? 'Sin ETA'
      : 'Sin ETD';

    const updatedAt = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date());

    return { total, active, delayed, nextTime, nextMeta, updatedAt };
  }, [flights, type]);

  const isArrival = type === 'arrival';
  const nextLabel = isArrival ? 'Llegada más próxima' : 'Salida más próxima';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <TopBar type={type} />

        <div className="bg-transparent">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <KPICard
              title="Total vuelos"
              value={kpis.total}
              subtitle="En la lista actual"
              icon={<HiStatusOnline className="h-6 w-6" />}
              bgColor="bg-gradient-to-br from-blue-500 to-blue-600"
              textColor="text-white"
              iconColor="text-blue-200"
            />
            <KPICard
              title="Con demora"
              value={kpis.delayed}
              subtitle="Salida o llegada"
              icon={<HiClock className="h-6 w-6" />}
              bgColor="bg-gradient-to-br from-amber-500 to-orange-600"
              textColor="text-white"
              iconColor="text-amber-200"
            />
            <KPICard
              title={nextLabel}
              value={kpis.nextTime}
              subtitle={kpis.nextMeta}
              icon={<HiLocationMarker className="h-6 w-6" />}
              bgColor="bg-gradient-to-br from-emerald-500 to-teal-600"
              textColor="text-white"
              iconColor="text-emerald-200"
            />
          </div>
        </div>

        <FlightsTable flights={flights} type={type} />

        <div className="flex flex-col gap-2 text-xs text-gray-600 sm:flex-row sm:items-center sm:justify-between bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="font-medium">{flights.length} vuelo(s) mostrados</div>
          <div className="flex items-center gap-2">
            <Badge color="success">⬤ Actualizado</Badge>
            <span>{kpis.updatedAt}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Solo renderizar si no estamos en Ladle/Storybook
if (typeof window !== 'undefined' && document.getElementById('root')) {
  const root = createRoot(document.getElementById('root')!);
  root.render(<FlightDashboard />);
}
