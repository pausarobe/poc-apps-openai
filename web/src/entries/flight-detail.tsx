import { createRoot } from 'react-dom/client';
import { Card, Badge } from 'flowbite-react';
// import { useState } from 'react';
import { HiArrowRight, HiClock, HiLocationMarker } from 'react-icons/hi';
import { useOpenAiGlobal } from '../lib/hooks.js';
import type { FlightData } from '../lib/types.js';

function FlightDetail() {
  const toolOutput = useOpenAiGlobal('toolOutput');
  // const [flightDetail, setFlightDetail] = useState<FlightData | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  const flightDetail: FlightData | null = toolOutput?.flightDetail || null;
  console.log('Flight Detail:', flightDetail);

  // if (!flightDetail) {
  //   setLoading(true);
  // } else {
  //   setLoading(false);
  // }

  // useEffect(() => {
  //   async function getFlightData() {
  //     try {
  //       setLoading(true);
  //       const flight = toolOutput?.flightDetail;
  //       console.log('Flight Detail:', flight);

  //       if (flight) {
  //         setFlightDetail(flight);
  //       } else {
  //         setError('No se encontró información del vuelo');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching flight data:', error);
  //       setError('Error al conectar con el servidor');
  //     } finally {
  //       setLoading(false);
  //     }
  //   }

  //   getFlightData();
  // }, []);

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

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
  //       <div className="text-center">
  //         <Spinner size="xl" />
  //         <p className="mt-4 text-gray-600 text-lg">Cargando información del vuelo...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
  //       <Card className="max-w-md">
  //         <div className="text-center">
  //           <div className="text-red-500 text-5xl mb-4">⚠️</div>
  //           <h3 className="text-xl font-bold text-gray-900 mb-2">Error</h3>
  //           <p className="text-gray-600">{error}</p>
  //         </div>
  //       </Card>
  //     </div>
  //   );
  // }

  if (!flightDetail) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <p className="text-center text-gray-600">No hay información de vuelo disponible</p>
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
                <HiLocationMarker className="w-6 h-6" />
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
                <HiLocationMarker className="w-6 h-6" />
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
                {flightDetail.departure.delay > 0 && (
                  <Badge color="warning" size="lg">
                    ⏰ Retraso en salida: {flightDetail.departure.delay} min
                  </Badge>
                )}
                {flightDetail.arrival.delay > 0 && (
                  <Badge color="warning" size="lg">
                    ⏰ Retraso en llegada: {flightDetail.arrival.delay} min
                  </Badge>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Flight Timeline */}
        {/* <Card className="shadow-xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <HiStatusOnline className="w-6 h-6 text-blue-600" />
            Estado del Vuelo
          </h3>

          <ol className="relative border-l border-gray-300">
            <li className="mb-10 ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                <HiClock className="w-4 h-4 text-blue-600" />
              </span>
              <time className="mb-1 text-sm font-normal leading-none text-gray-500">{formatTime(flightDetail.departure.scheduled)}</time>
              <h3 className="text-lg font-semibold text-gray-900">Salida Programada</h3>
              <p className="text-base font-normal text-gray-600">
                Desde {flightDetail.departure.airport} ({flightDetail.departure.iata}){flightDetail.departure.terminal && ` - Terminal ${flightDetail.departure.terminal}`}
                {flightDetail.departure.gate && `, Puerta ${flightDetail.departure.gate}`}
              </p>
            </li>

            {flightDetail.departure.actual && (
              <li className="mb-10 ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-green-100 rounded-full -left-4 ring-4 ring-white">
                  <HiCheckCircle className="w-4 h-4 text-green-600" />
                </span>
                <time className="mb-1 text-sm font-normal leading-none text-gray-500">{formatTime(flightDetail.departure.actual)}</time>
                <h3 className="text-lg font-semibold text-gray-900">Despegue Real</h3>
                <p className="text-base font-normal text-gray-600">
                  El vuelo despegó correctamente
                  {flightDetail.departure.delay > 0 && ` con un retraso de ${flightDetail.departure.delay} minutos`}
                </p>
              </li>
            )}

            <li className="mb-10 ml-6">
              <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                <HiClock className="w-4 h-4 text-blue-600" />
              </span>
              <time className="mb-1 text-sm font-normal leading-none text-gray-500">{formatTime(flightDetail.arrival.scheduled)}</time>
              <h3 className="text-lg font-semibold text-gray-900">Llegada Programada</h3>
              <p className="text-base font-normal text-gray-600">
                A {flightDetail.arrival.airport} ({flightDetail.arrival.iata}){flightDetail.arrival.terminal && ` - Terminal ${flightDetail.arrival.terminal}`}
                {flightDetail.arrival.gate && `, Puerta ${flightDetail.arrival.gate}`}
              </p>
            </li>

            {flightDetail.arrival.actual && (
              <li className="ml-6">
                <span className="absolute flex items-center justify-center w-8 h-8 bg-green-100 rounded-full -left-4 ring-4 ring-white">
                  <HiLocationMarker className="w-4 h-4 text-green-600" />
                </span>
                <time className="mb-1 text-sm font-normal leading-none text-gray-500">{formatTime(flightDetail.arrival.actual)}</time>
                <h3 className="text-lg font-semibold text-gray-900">Aterrizaje Real</h3>
                <p className="text-base font-normal text-gray-600">
                  El vuelo aterrizó exitosamente
                  {flightDetail.arrival.baggage && ` - Recogida de equipaje: ${flightDetail.arrival.baggage}`}
                </p>
              </li>
            )}
          </ol>
        </Card> */}

        {/* Additional Info Card */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Información del Vuelo</h3>
            <dl className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-600">Número de vuelo:</dt>
                <dd className="font-semibold text-gray-900">{flightDetail.flight.iata}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-600">Código ICAO:</dt>
                <dd className="font-semibold text-gray-900">{flightDetail.flight.icao}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-600">Fecha:</dt>
                <dd className="font-semibold text-gray-900">{flightDetail.flight_date}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Estado:</dt>
                <dd>{getStatusBadge(flightDetail.flight_status)}</dd>
              </div>
            </dl>
          </Card>

          <Card className="shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Información de la Aerolínea</h3>
            <dl className="space-y-3">
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-600">Nombre:</dt>
                <dd className="font-semibold text-gray-900">{flightDetail.airline.name}</dd>
              </div>
              <div className="flex justify-between border-b pb-2">
                <dt className="text-gray-600">Código IATA:</dt>
                <dd className="font-semibold text-gray-900">{flightDetail.airline.iata}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Código ICAO:</dt>
                <dd className="font-semibold text-gray-900">{flightDetail.airline.icao}</dd>
              </div>
            </dl>
          </Card>
        </div> */}
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<FlightDetail />);
