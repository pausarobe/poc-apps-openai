import { createRoot } from 'react-dom/client';
import { useEffect, useMemo, useState } from "react";
import type { FlightData } from '../lib/types';
import { useOpenAiGlobal } from '../lib/hooks';

const sampleFlights: FlightData[] = [
  {
    flight_date: "2026-01-08",
    flight_status: "active",
    departure: {
      airport: "Dublin International",
      timezone: "Europe/Dublin",
      iata: "DUB",
      icao: "EIDW",
      terminal: "2",
      gate: "2",
      delay: null,
      scheduled: "2026-01-08T09:40:00+00:00",
      estimated: "2026-01-08T09:40:00+00:00",
      actual: "2026-01-08T10:02:00+00:00",
      estimated_runway: "2026-01-08T10:00:00+00:00",
      actual_runway: "2026-01-08T10:02:00+00:00",
    },
    arrival: {
      airport: "Barajas",
      timezone: "Europe/Madrid",
      iata: "MAD",
      icao: "LEMD",
      terminal: "4S",
      gate: null,
      baggage: null,
      scheduled: "2026-01-08T13:20:00+00:00",
      delay: null,
      estimated: "2026-01-08T13:11:00+00:00",
      actual: null,
      estimated_runway: null,
      actual_runway: null,
    },
    airline: { name: "Iberia Express", iata: "I2", icao: "IBS" },
    flight: { number: "1882", iata: "I21882", icao: "IBS1882", codeshared: null },
    aircraft: { registration: null, iata: null, icao: null, icao24: "344455" },
    live: null,
  },
];

// ---------- helpers ----------
const safeLower = (v: any): string => (v ?? "").toString().toLowerCase();

// function fmt(iso: string | null | undefined, tz: string | null | undefined): string {
//   if (!iso) return "—";
//   const d = new Date(iso);
//   return new Intl.DateTimeFormat("es-ES", {
//     timeZone: tz || "UTC",
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//   }).format(d);
// }

function fmtTime(iso: string | null | undefined, tz: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: tz || "UTC",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function minutesDiff(aIso: string | null | undefined, bIso: string | null | undefined): number | null {
  if (!aIso || !bIso) return null;
  const a = new Date(aIso).getTime();
  const b = new Date(bIso).getTime();
  return Math.round((a - b) / 60000);
}

function statusBadge(status: string): { text: string; cls: string } {
  const s = safeLower(status) || "unknown";
  if (s === "active") return { text: "Activo", cls: "bg-blue-100 text-blue-800" };
  if (s === "landed") return { text: "Aterrizado", cls: "bg-green-100 text-green-800" };
  if (s === "scheduled") return { text: "Programado", cls: "bg-gray-100 text-gray-800" };
  if (s === "cancelled") return { text: "Cancelado", cls: "bg-red-100 text-red-800" };
  if (s === "diverted") return { text: "Desviado", cls: "bg-amber-100 text-amber-800" };
  return { text: status || "—", cls: "bg-gray-100 text-gray-800" };
}

function delayBadge(depDelayMin: number | null, arrDelayMin: number | null): { text: string; cls: string } {
  const nums = [depDelayMin, arrDelayMin].filter((x) => typeof x === "number");
  const maxDelay = nums.length ? Math.max(...nums) : 0;

  if (maxDelay > 0) return { text: `Demora +${maxDelay} min`, cls: "bg-amber-100 text-amber-800" };
  if (maxDelay < 0) return { text: `Adelantado ${maxDelay} min`, cls: "bg-emerald-100 text-emerald-800" };
  return { text: "En hora", cls: "bg-green-100 text-green-800" };
}

function deriveFlight(f: FlightData) {
  const depTz = f?.departure?.timezone;
  const arrTz = f?.arrival?.timezone;

  const depDelay = minutesDiff(f?.departure?.actual || f?.departure?.estimated, f?.departure?.scheduled);
  const arrDelay = minutesDiff(f?.arrival?.estimated || f?.arrival?.actual, f?.arrival?.scheduled);

  const key = [
    f?.flight?.iata,
    f?.flight?.number,
    f?.flight?.icao,
    f?.airline?.name,
    f?.departure?.iata,
    f?.departure?.airport,
    f?.arrival?.iata,
    f?.arrival?.airport,
  ]
    .filter(Boolean)
    .join("|")
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

// ---------- UI atoms ----------
function Pill({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  );
}

function Card({ title, value, subtitle }: { title: string; value: number | string; subtitle: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm sm:rounded-2xl sm:p-3">
      <div className="text-[10px] text-gray-500 sm:text-xs">{title}</div>
      <div className="mt-0.5 text-lg font-semibold tracking-tight sm:mt-1 sm:text-xl">{value}</div>
      <div className="mt-1 text-[10px] text-gray-500 sm:text-xs">{subtitle}</div>
    </div>
  );
}

// ---------- header ----------
function TopBar() {
  return (
    <nav className="px-2 pt-2 sm:px-4 sm:pt-4">
      <div className="mx-auto max-w-7xl rounded-xl border border-gray-200 bg-white shadow-sm sm:rounded-2xl">
        <div className="flex flex-col gap-3 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-4 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-gray-900 sm:h-9 sm:w-9 sm:rounded-xl" />
            <div className="min-w-0">
              <div className="truncate text-xs font-semibold leading-4 sm:text-sm">Iberia Express • Ops</div>
              <div className="text-xs text-gray-500">Arrivals Dashboard</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium">
              MAD • Barajas
            </span>
            <span className="hidden items-center rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium sm:inline-flex">
              Europe/Madrid
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ---------- table ----------
function FlightsTable({ flights }: { flights: FlightData[]}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm sm:rounded-2xl">
      <div className="flex flex-col gap-2 border-b border-gray-200 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="text-sm font-semibold">Lista de llegadas</div>
        <div className="hidden text-xs text-gray-500 sm:block">Tip: "Detalles" muestra terminal, puertas, timestamps y runway.</div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
        <table className="w-full min-w-[650px] text-left text-sm text-gray-700 md:min-w-0">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="sticky left-0 z-10 bg-gray-50 px-2 py-2 md:static md:px-3">Vuelo</th>
              <th className="px-2 py-2 md:px-3">Aerolínea</th>
              <th className="px-2 py-2 md:px-3">Origen</th>
              <th className="px-2 py-2 md:px-3">STD</th>
              <th className="px-2 py-2 md:px-3">ATD</th>
              <th className="px-2 py-2 md:px-3">STA</th>
              <th className="px-2 py-2 md:px-3">ETA</th>
              <th className="px-2 py-2 md:px-3">Estado</th>
              <th className="px-2 py-2 text-right md:px-3">Acción</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {flights.map((f) => {
              const d = deriveFlight(f);
              const st = statusBadge(f.flight_status);
              const dl = delayBadge(d.depDelay, d.arrDelay);

              return (
                <tr key={`${f.flight?.iata ?? "—"}-${f.flight_date ?? ""}`} className="hover:bg-gray-50">
                  <td className="sticky left-0 z-10 bg-white px-2 py-2 hover:bg-gray-50 md:static md:px-3">
                    <div className="font-semibold text-gray-900">{f.flight?.iata || "—"}</div>
                    <div className="text-xs text-gray-500">{f.flight?.icao || ""}</div>
                  </td>

                  <td className="px-2 py-2 md:px-3">
                    <div className="font-medium text-gray-900">{f.airline?.name || "—"}</div>
                    <div className="text-xs text-gray-500">
                      {f.airline?.iata || ""} • {f.airline?.icao || ""}
                    </div>
                  </td>

                  <td className="px-2 py-2 md:px-3">
                    <div className="font-medium text-gray-900">
                      {f.departure?.iata || "—"} · {f.departure?.airport || "—"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {f.departure?.terminal ? `T${f.departure.terminal}` : "—"}
                      {f.departure?.gate ? ` • Gate ${f.departure.gate}` : ""}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-2 py-2 md:px-3">{fmtTime(f.departure?.scheduled, d.depTz)}</td>
                  <td className="whitespace-nowrap px-2 py-2 md:px-3">{fmtTime(f.departure?.actual, d.depTz)}</td>
                  <td className="whitespace-nowrap px-2 py-2 md:px-3">{fmtTime(f.arrival?.scheduled, d.arrTz)}</td>

                  <td className="px-2 py-2 md:px-3">
                    <div className="whitespace-nowrap font-medium text-gray-900">{fmtTime(f.arrival?.estimated, d.arrTz)}</div>
                    <div className="whitespace-nowrap text-xs text-gray-500">
                      {typeof d.arrDelay === "number" ? `${d.arrDelay > 0 ? "+" : ""}${d.arrDelay} min` : "—"}
                    </div>
                  </td>

                  <td className="px-2 py-2 md:px-3">
                    <Pill className={st.cls}>{st.text}</Pill>
                    <div className="mt-1">
                      <Pill className={dl.cls}>{dl.text}</Pill>
                    </div>
                  </td>

                  <td className="px-2 py-2 text-right md:px-3">
                    <button
                      type="button"
                      onClick={() => {}}
                      className="whitespace-nowrap rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                      Detalles
                    </button>
                  </td>
                </tr>
              );
            })}

            {flights.length === 0 && (
              <tr>
                <td className="px-2 py-6 text-center text-sm text-gray-500 md:px-3" colSpan={9}>
                  No hay vuelos actualmente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

// ---------- page ----------
export default function ArrivalsDashboard({
  initialFlights = sampleFlights,
}: {
  initialFlights?: FlightData[];
}) {
  const [flights, setFlights] = useState<FlightData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const toolOutput = useOpenAiGlobal('toolOutput');

  useEffect(() => {
    async function getFlightData() {
      try {
        setLoading(true);
        const flightList = toolOutput?.flightList;
        console.log('Flight List:', flightList);

        if (flightList) {
          setFlights(flightList);
        } else {
          setFlights(sampleFlights);
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
    const active = flights.filter((f) => safeLower(f.flight_status) === "active").length;

    const derived = flights.map(deriveFlight);
    const delayed = derived.filter((d) => (d.depDelay || 0) > 0 || (d.arrDelay || 0) > 0).length;

    const next = derived
      .map((d, idx) => ({ ...d, idx, t: d.eta ? new Date(d.eta).getTime() : null }))
      .filter((x) => x.t != null)
      .sort((a, b) => (a.t ?? 0) - (b.t ?? 0))[0];

    const nextEta = next ? fmtTime(next.eta, next.arrTz) : "—";
    const nextMeta = next ? `${flights[next.idx]?.flight?.iata || "—"} desde ${flights[next.idx]?.departure?.iata || "—"}` : "Sin ETA";

    const updatedAt = new Intl.DateTimeFormat("es-ES", { dateStyle: "medium", timeStyle: "short" }).format(new Date());

    return { total, active, delayed, nextEta, nextMeta, updatedAt };
  }, [flights]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <TopBar />

      <main className="mx-auto max-w-7xl px-2 py-3 sm:px-4 sm:py-6">
        <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">Llegadas a Madrid (MAD)</h1>
            <p className="mt-1 text-xs text-gray-600 sm:text-sm">
              Resumen operativo de vuelos entrantes
            </p>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2 sm:mb-6 sm:gap-3">
          <Card title="Total vuelos" value={kpis.total} subtitle="En la lista actual" />
          <Card title="Con demora" value={kpis.delayed} subtitle="Salida o llegada" />
          <Card title="ETA más próxima" value={kpis.nextEta} subtitle={kpis.nextMeta} />
        </div>

        <FlightsTable flights={flights}  />

        <div className="mt-3 flex flex-col gap-2 text-xs text-gray-600 sm:mt-4 sm:flex-row sm:items-center sm:justify-between">
          <div>{flights.length} vuelo(s) mostrados</div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1">⬤ Actualizado</span>
            <span className="text-xs">{kpis.updatedAt}</span>
          </div>
        </div>
      </main>

      {/* <FlightDrawer open={drawerOpen} flight={selectedFlight} onClose={onCloseDetails} /> */}
    </div>
  );
}

// Solo renderizar si no estamos en Ladle/Storybook
if (typeof window !== 'undefined' && document.getElementById('root')) {
  const root = createRoot(document.getElementById('root')!);
  root.render(<ArrivalsDashboard />);
}
