import { createRoot } from 'react-dom/client';
import { useMemo, useState } from "react";

interface FlightData {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string | null;
    gate: string | null;
    delay: number | null;
    scheduled: string;
    estimated: string;
    actual: string | null;
    estimated_runway: string | null;
    actual_runway: string | null;
  };
  arrival: {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string | null;
    gate: string | null;
    baggage: string | null;
    scheduled: string;
    delay: number | null;
    estimated: string | null;
    actual: string | null;
    estimated_runway: string | null;
    actual_runway: string | null;
  };
  airline: { name: string; iata: string; icao: string };
  flight: { number: string; iata: string; icao: string; codeshared: any };
  aircraft: { registration: string | null; iata: string | null; icao: string | null; icao24: string };
  live: any;
}

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
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-2 text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

// ---------- header ----------
function TopBar() {
  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gray-900" />
          <div>
            <div className="text-sm font-semibold leading-4">Iberia Express • Ops</div>
            <div className="text-xs text-gray-500">Arrivals Dashboard</div>
          </div>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <span className="text-xs text-gray-500">Aeropuerto</span>
          <span className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium">
            MAD • Barajas
          </span>
          <span className="text-xs text-gray-500">Zona horaria</span>
          <span className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium">
            Europe/Madrid
          </span>
        </div>
      </div>
    </nav>
  );
}

// ---------- table ----------
function FlightsTable({ flights, onOpenDetails }: { flights: FlightData[]; onOpenDetails?: (f: FlightData) => void }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex flex-col gap-2 border-b border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm font-semibold">Lista de llegadas</div>
        <div className="text-xs text-gray-500">Tip: “Detalles” muestra terminal, puertas, timestamps y runway.</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">Vuelo</th>
              <th className="px-4 py-3">Aerolínea</th>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">STD</th>
              <th className="px-4 py-3">ATD</th>
              <th className="px-4 py-3">STA</th>
              <th className="px-4 py-3">ETA</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {flights.map((f) => {
              const d = deriveFlight(f);
              const st = statusBadge(f.flight_status);
              const dl = delayBadge(d.depDelay, d.arrDelay);

              return (
                <tr key={`${f.flight?.iata ?? "—"}-${f.flight_date ?? ""}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{f.flight?.iata || "—"}</div>
                    <div className="text-xs text-gray-500">{f.flight?.icao || ""}</div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{f.airline?.name || "—"}</div>
                    <div className="text-xs text-gray-500">
                      {f.airline?.iata || ""} • {f.airline?.icao || ""}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {f.departure?.iata || "—"} · {f.departure?.airport || "—"}
                    </div>
                    <div className="text-xs text-gray-500">
                      {f.departure?.terminal ? `T${f.departure.terminal}` : "—"}
                      {f.departure?.gate ? ` • Gate ${f.departure.gate}` : ""}
                    </div>
                  </td>

                  <td className="px-4 py-3">{fmtTime(f.departure?.scheduled, d.depTz)}</td>
                  <td className="px-4 py-3">{fmtTime(f.departure?.actual, d.depTz)}</td>
                  <td className="px-4 py-3">{fmtTime(f.arrival?.scheduled, d.arrTz)}</td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{fmtTime(f.arrival?.estimated, d.arrTz)}</div>
                    <div className="text-xs text-gray-500">
                      {typeof d.arrDelay === "number" ? `${d.arrDelay > 0 ? "+" : ""}${d.arrDelay} min` : "—"}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <Pill className={st.cls}>{st.text}</Pill>
                    <div className="mt-1">
                      <Pill className={dl.cls}>{dl.text}</Pill>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => {}}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200"
                    >
                      Detalles
                    </button>
                  </td>
                </tr>
              );
            })}

            {flights.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={9}>
                  No hay vuelos actualmente.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
  const [flights] = useState(initialFlights);

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

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Llegadas a Madrid (MAD)</h1>
            <p className="mt-1 text-sm text-gray-600">
              Resumen operativo de vuelos entrantes (horas formateadas por zona del aeropuerto).
            </p>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card title="Total vuelos" value={kpis.total} subtitle="En la lista actual" />
          <Card title="Activos" value={kpis.active} subtitle="En progreso" />
          <Card title="Con demora" value={kpis.delayed} subtitle="Salida o llegada" />
          <Card title="ETA más próxima" value={kpis.nextEta} subtitle={kpis.nextMeta} />
        </div>

        <FlightsTable flights={flights}  />

        <div className="mt-4 flex items-center justify-between gap-2 text-xs text-gray-600">
          <div>{flights.length} vuelo(s) mostrados</div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1">⬤ Actualizado</span>
            <span>{kpis.updatedAt}</span>
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
