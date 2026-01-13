import { createRoot } from 'react-dom/client';
import { Card, Badge, Spinner } from 'flowbite-react';
import { useState } from 'react';
import { HiArrowRight, HiClock, HiCursorClick, HiExclamationCircle } from 'react-icons/hi';
import { LuPlaneLanding, LuPlaneTakeoff } from 'react-icons/lu';
import { useOpenAiGlobal } from '../lib/hooks.js';
import type { FlightData } from '../lib/types.js';

export default function FlightDetail() {
  const toolOutput = useOpenAiGlobal('toolOutput');
  // const [flightDetail, setFlightDetail] = useState<FlightData | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);
  const [callError, setCallError] = useState(false);

  const flightDetail: FlightData | null = toolOutput?.flightDetail || null;
  // const flightDetail = {
  //   flight_date: '2026-01-09',
  //   flight_status: 'cancelled',
  //   departure: {
  //     airport: 'Singapore Changi',
  //     timezone: 'Asia/Singapore',
  //     iata: 'SIN',
  //     icao: 'WSSS',
  //     terminal: '1',
  //     gate: '1',
  //     delay: 123,
  //     scheduled: '2026-01-09T00:40:00+00:00',
  //     estimated: '2026-01-09T00:40:00+00:00',
  //     actual: null,
  //     estimated_runway: '2026-01-09T00:40:00+00:00',
  //     actual_runway: null,
  //   },
  //   arrival: {
  //     airport: 'Ninoy Aquino International',
  //     timezone: 'Asia/Manila',
  //     iata: 'MNL',
  //     icao: 'RPLL',
  //     terminal: '1',
  //     gate: null,
  //     baggage: null,
  //     scheduled: '2026-01-09T04:25:00+00:00',
  //     delay: 321,
  //     estimated: null,
  //     actual: null,
  //     estimated_runway: null,
  //     actual_runway: null,
  //   },
  //   airline: {
  //     name: 'Singapore Airlines',
  //     iata: 'SQ',
  //     icao: 'SIA',
  //   },
  //   flight: {
  //     number: '5056',
  //     iata: 'SQ5056',
  //     icao: 'SIA5056',
  //     codeshared: {
  //       airline_name: 'philippine airlines',
  //       airline_iata: 'pr',
  //       airline_icao: 'pal',
  //       flight_number: '510',
  //       flight_iata: 'pr510',
  //       flight_icao: 'pal510',
  //     },
  //   },
  //   aircraft: null,
  //   live: null,
  // };
  console.log('Flight Detail:', flightDetail);

  // useEffect(() => {
  //   async function getFlightData() {
  //     try {
  //       // setLoading(true);
  //       const flight = toolOutput?.flightDetail;
  //       console.log('Flight Detail:', flight);

  //       if (flight) {
  //         setFlightDetail(flight);
  //       } else {
  //         // setError('No se encontró información del vuelo');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching flight data:', error);
  //       // setError('Error al conectar con el servidor');
  //     } finally {
  //       // setLoading(false);
  //     }
  //   }

  //   getFlightData();
  // }, [toolOutput]);

  async function searchRentalCars() {
    console.log('Searching rental cars...', window);
    if (!window.openai?.callTool) {
      setCallError(true);
      return;
    }
    setCallError(false);
    await window.openai?.callTool('rental-car-list', {});
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      scheduled: { color: 'info', label: 'Programado' },
      active: { color: 'success', label: 'En vuelo' },
      landed: { color: 'success', label: 'Aterrizado' },
      cancelled: { color: 'failure', label: 'Cancelado' },
      incident: { color: 'warning', label: 'Incidente' },
      diverted: { color: 'warning', label: 'Desviado' },
    };

    const statusInfo = statusMap[status] || { color: 'gray', label: status };
    return (
      <Badge color={statusInfo.color as any} size="lg">
        {statusInfo.label}
      </Badge>
    );
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  if (!flightDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <div className="flex gap-4 items-center">
            <Spinner color="purple" aria-label="cargando" />
            <p className="text-center text-gray-600">Estamos buscando tu vuelo</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="shadow-2xl border-t-4 border-blue-600">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Vuelo {flightDetail.flight.iata}</h1>
                {getStatusBadge(flightDetail.flight_status)}
              </div>
              <p className="text-gray-600 flex items-center gap-2">
                <HiClock className="w-5 h-5" />
                {formatDate(flightDetail.flight_date)}
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-gray-500">Aerolínea</p>
              <p className="text-2xl font-bold text-blue-600">{flightDetail.airline.name}</p>
              <p className="text-sm text-gray-500">{flightDetail.airline.iata}</p>
            </div>
          </div>
        </Card>

        {/* Route Card - Boarding Pass Style */}
        <Card className="shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Departure */}
            <div className="text-center md:text-left h-full">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <LuPlaneTakeoff className="w-6 h-6" />
                <p className="text-sm font-semibold opacity-90">Salida</p>
              </div>
              <h2 className="text-5xl font-bold mb-2">{flightDetail.departure.iata}</h2>
              <p className="text-lg opacity-90 mb-4">{flightDetail.departure.airport}</p>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between md:justify-start md:gap-4">
                  <span className="opacity-75">Programado:</span>
                  <span className="font-semibold">{formatTime(flightDetail.departure.scheduled)}</span>
                </div>
                {flightDetail.departure.estimated && (
                  <div className="flex justify-between md:justify-start md:gap-4">
                    <span className="opacity-75">Estimado:</span>
                    <span className="font-semibold">{formatTime(flightDetail.departure.estimated)}</span>
                  </div>
                )}
                {flightDetail.departure.actual && (
                  <div className="flex justify-between md:justify-start md:gap-4">
                    <span className="opacity-75">Real:</span>
                    <span className="font-semibold">{formatTime(flightDetail.departure.actual)}</span>
                  </div>
                )}
                {flightDetail.departure.terminal && (
                  <div className="flex justify-between md:justify-start md:gap-4">
                    <span className="opacity-75">Terminal:</span>
                    <span className="font-semibold">{flightDetail.departure.terminal}</span>
                  </div>
                )}
                {flightDetail.departure.gate && (
                  <div className="flex justify-between md:justify-start md:gap-4">
                    <span className="opacity-75">Puerta:</span>
                    <span className="font-semibold">{flightDetail.departure.gate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Arrow */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center">
                <HiArrowRight className="w-16 h-16 animate-pulse" />
                <p className="text-sm mt-2 opacity-75">En ruta</p>
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center md:text-right h-full">
              <div className="flex items-center justify-center md:justify-end gap-2 mb-2">
                <p className="text-sm font-semibold opacity-90">Llegada</p>
                <LuPlaneLanding className="w-6 h-6" />
              </div>
              <h2 className="text-5xl font-bold mb-2">{flightDetail.arrival.iata}</h2>
              <p className="text-lg opacity-90 mb-4">{flightDetail.arrival.airport}</p>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between md:justify-end md:gap-4">
                  <span className="opacity-75">Programado:</span>
                  <span className="font-semibold">{formatTime(flightDetail.arrival.scheduled)}</span>
                </div>
                {flightDetail.arrival.estimated && (
                  <div className="flex justify-between md:justify-end md:gap-4">
                    <span className="opacity-75">Estimado:</span>
                    <span className="font-semibold">{formatTime(flightDetail.arrival.estimated)}</span>
                  </div>
                )}
                {flightDetail.arrival.actual && (
                  <div className="flex justify-between md:justify-end md:gap-4">
                    <span className="opacity-75">Real:</span>
                    <span className="font-semibold">{formatTime(flightDetail.arrival.actual)}</span>
                  </div>
                )}
                {flightDetail.arrival.terminal && (
                  <div className="flex justify-between md:justify-end md:gap-4">
                    <span className="opacity-75">Terminal:</span>
                    <span className="font-semibold">{flightDetail.arrival.terminal}</span>
                  </div>
                )}
                {flightDetail.arrival.gate && (
                  <div className="flex justify-between md:justify-end md:gap-4">
                    <span className="opacity-75">Puerta:</span>
                    <span className="font-semibold">{flightDetail.arrival.gate}</span>
                  </div>
                )}
                {flightDetail.arrival.baggage && (
                  <div className="flex justify-between md:justify-end md:gap-4">
                    <span className="opacity-75">Equipaje:</span>
                    <span className="font-semibold">{flightDetail.arrival.baggage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Delay Warnings */}
          {flightDetail.departure?.delay && flightDetail.arrival?.delay && (flightDetail.departure.delay > 0 || flightDetail.arrival.delay > 0) && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex flex-wrap gap-4 justify-center">
                {flightDetail.departure.delay && (
                  <Badge color="warning" size="lg">
                    <div className="flex items-center gap-2">
                      <HiExclamationCircle />
                      Retraso en salida: {flightDetail.departure.delay} min
                    </div>
                  </Badge>
                )}
                {flightDetail.arrival.delay && (
                  <Badge color="warning" size="lg">
                    <div className="flex items-center gap-2">
                      <HiExclamationCircle />
                      Retraso en llegada: {flightDetail.arrival.delay} min
                    </div>
                  </Badge>
                )}
              </div>
            </div>
          )}
        </Card>

        <div className="grid gap-6" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <a href="https://www.iberia.com" target="_blank" rel="noopener noreferrer">
            <Card className="shadow-xl h-full">
              <div className="flex gap-6 items-center justify-center">
                <HiCursorClick className="font-bold text-blue-600 text-2xl" />
                <p className="font-bold">Haz tu check-in</p>
              </div>
            </Card>
          </a>
          <button onClick={() => searchRentalCars()}>
            <Card className="shadow-xl text-center h-full">
              {!callError && (
                <p>
                  Busca coches de alquiler en <span className="font-bold text-blue-600">{flightDetail.arrival.airport}</span>
                </p>
              )}
              {callError && <p className="text-red-600 font-bold">No se pudo iniciar la búsqueda de coches de alquiler. Por favor, inténtalo de nuevo.</p>}
            </Card>
          </button>
        </div>
      </div>
    </div>
  );
}

if (typeof window !== 'undefined' && document.getElementById('root')) {
  const root = createRoot(document.getElementById('root')!);
  root.render(<FlightDetail />);
}
