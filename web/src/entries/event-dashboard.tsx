import { use, useEffect, useState } from "react";
import { useOpenAiGlobal, useMobileView } from "../lib/hooks";
import {Carousel, Checkbox, Select, Card} from "flowbite-react";
import type { EventData } from "../lib/openai";
import ComponenteEjemplo from "../components/ComponenteEjemplo/ComponenteEjemplo";



const EventDashboard = () => {
    
    const FAVORITE_KEY = "event-dashboard-favorites";
    const [favorites, setFavorites] = useState<String[]>([]);

    const toolOutput = useOpenAiGlobal('toolOutput');
    const [events, setEvents] = useState<EventData[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
    const isMobile = useMobileView();

    // tendria que sentido que sea un objeto combinado con filtro (estado del filtro) y cuando cambie llame a una funcion para que modifique el filteredEvents
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState("all");
    const [showFavorites, setShowFavorites] = useState(false);

    const [showOverlay, setShowOverlay] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);

    // Elimina duplicados y agrega "all" al inicio
    const uniqueTags = ["all", ...new Set(events.map(event => event.tag).filter(Boolean))];


    // Tendria que estar las funciones dentro de un Useeffct, fileterdEvents tendria que ser un useState y cuando cambie el seARCHqUERY O SELECTEDtAGS HAGA CAMBIO
    const filteredEvents = events.filter((event) => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFavorite = !showFavorites || favorites.includes(event.id.toString());
        const matchesTag = selectedTag === "all" || event.tag?.includes(selectedTag);
        return matchesSearch && matchesFavorite && matchesTag;
    });


    useEffect(() => {
        if (toolOutput && toolOutput.eventList) {
            setEvents(toolOutput.eventList);
        }
    }, [toolOutput]);

    useEffect(() => {
        if (selectedEvent) {
            setShowOverlay(true);
            setTimeout(() => setShowSidebar(true), 10); // Espera a que el overlay esté visible antes de mostrar el sidebar
        } else {
            setShowSidebar(false);
            setTimeout(() => setShowOverlay(false), 200); // Espera a que el sidebar esté oculto antes de ocultar el overlay
        }
    }, [selectedEvent]);

    // Comprobamos si hay favoritos en local Storage y los cargamos, si no hay dejamos el array vacio

    // Trabajar a traves de un hook, que le pasase por parametro la KEY y el hook me devuelve el getter y el setter
    useEffect(() => {
        const storedFavorites = localStorage.getItem(FAVORITE_KEY);
        if (storedFavorites) {
            try {
                setFavorites(JSON.parse(storedFavorites));
            } catch {
                setFavorites([]);
            }
        } 
        
    }, []);

    // Guardar en local Storage los favoritos
    useEffect(() => {
    localStorage.setItem(
        FAVORITE_KEY,
        JSON.stringify(favorites)
    );
    }, [favorites]);

    // Si el evento ya está en favoritos, lo elimina, si no lo añade
    function toggleFavorite(eventId: string) {
        setFavorites((prev) => {
            if (prev.includes(eventId)) {
                return prev.filter(id => id !== eventId);
            }

            return [...prev, eventId];
        });
    }



    // Devuelve true si el evento está en favoritos, false si no, se podria enviar el objeto y así la funcion se podria usar fuera
    function isFavorite(eventId: string) {
        return favorites.includes(eventId);
    }

    function formatDate(dateString: string) {
        const dateArray = dateString.split("-");
        return (
            <div className="flex flex-col text-center items-center justify-center bg-blue-700 text-white p-1 rounded-md w-20">
                <div className="text-2xl p-1 mt-1 rounded-md font-bold mb-1">
                    {dateArray[2]}
                </div>
                <div>
                    {dateArray[1]}-{dateArray[0]}
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen w-full">
        <div className="relative min-h-screen w-full">
            <div className="relative h-[300px] bg-sky-700 p-8 shadow-xl overflow-hidden flex flex-col items-center" style={{backgroundImage: "url('https://wallpaperaccess.com/full/1127627.jpg')"}}>
                <p className="text-sm uppercase tracking-[0.35em] text-sky-100 mb-3">
                    Eventos destacados
                </p>

                <h1 className="text-5xl font-extrabold text-white">
                    Event Dashboard
                </h1>
                <p className="mt-4 text-sky-100/90">
                    Descubre los eventos destacados
                </p>
                <div className="flex flex-row justify-center items-center mt-6">
                    <div className="flex items-center w-full max-w-xl bg-white rounded-2xl border border-sky-300 shadow-md overflow-hidden">
                        <div className="px-4 text-sky-600">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>

                        <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar eventos..."
                        className="w-full py-4 pr-4 text-black placeholder-gray-400 no-outline"
                        />
                        {events.some(event => event.tag) && (
                        <div className="px-4 w-fit text-sky-600">
                            {/* Cambiar select flowbitre React e Label*/}
                            <Select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                required
                                color="info"
                                sizing="md"
                            >
                                {uniqueTags.map((tag) => (
                                    <option key={tag} value={tag}>
                                        {tag === "all" ? "All events" : tag}
                                    </option>
                                ))}
                            </Select>
                        </div>
                        )}
                        <div className="flex items-center gap-2 px-4 text-sm text-gray-600 w-fit">
                            <Checkbox
                                checked={showFavorites}
                                onChange={() => setShowFavorites(prev => !prev)}
                            />
                            Only favorites
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
                {isMobile ? (
                <div className="relative z-10 -mt-4">

                <div className="h-[400px] sm:h-64 xl:h-80 2xl:h-96">
                <Carousel className="h-full" slide={false} indicators={true} leftControl={<div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white">‹</div>} rightControl={<div className="flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white">›</div>}>
                {filteredEvents.map((event) => (
                    <div className="flex h-full items-center justify-center bg-gray-400 dark:bg-gray-700 dark:text-white">
                        <div className="w-full min-h-[300px] max-w-sm bg-white rounded-lg shadow-md overflow-hidden flex flex-col justify-between">
                            <div className="flex flex-1 flex-col p-4">
                                <div>
                                    <button className="bg-gray-200 text-gray-500 px-2 py-1 rounded-md mb-2" onClick={() => toggleFavorite(event.id.toString())}>
                                        {isFavorite(event.id.toString()) ? 'Remove from Favorites' : 'Add to Favorites'}
                                    </button>
                                </div>
                                <div className="flex flex-row gap-4">
                                    <p className="mt-2 text-sm text-gray-600 font-medium">{formatDate(event.date)}</p>
                                    <div className="mt-2 flex-1">
                                        <h5 className="text-xl font-bold line-clamp-2 text-gray-800">
                                            {event.title}
                                        </h5>
                                        <p className="mt-2 text-sm text-gray-500 flex items-center gap-1 mb-2">
                                            <svg className="w-4 h-4 text-red-500" fill="gray" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                            </svg>
                                            {event.location}
                                        </p>
                                        <div className="min-h-[2rem] mb-2">
                                            {event.tag && (
                                                <div className={`p-1.5 rounded-lg w-fit flex items-center justify-center text-sm font-semibold mb-2 bg-blue-100 text-blue-800`}>
                                                    {event.tag}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <p className="mt-auto line-clamp-3 text-gray-700 text-sm leading-relaxed min-h-[72px] text-justify">
                                    {event.description}
                                </p>
                            </div>
                            <div className="flex items-center mb-4 px-2">
                                    <button
                                    className="flex items-center gap-2 text-blue-600 px-2 font-semibold"
                                    onClick={() => setSelectedEvent(event)}
                                    >
                                    View Details
                                        <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                                />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                </Carousel>
            </div>
                </div>

        ):(

        <div className="relative z-10 -mt-16 px-6">
            <div className="grid grid-cols-1 [884px]:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {filteredEvents.map((event) => (
            <Card key={event.id} className="flex h-full flex-col justify-between shadow-md hover:shadow-xl rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 border border-gray-100 bg-gray-50 border-2">
                <div className="flex flex-1 flex-col p-1">
                    <div>
                        <button className="bg-gray-200 text-gray-500 px-2 py-1 rounded-md mb-2" onClick={() => toggleFavorite(event.id.toString())}>
                            {isFavorite(event.id.toString()) ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>
                    </div>
                    <div className="flex flex-row gap-4">
                        <p className="mt-2 text-sm text-gray-600 font-medium">{formatDate(event.date)}</p>
                        <div className="mt-2">
                            <h5 className="text-xl font-bold line-clamp-2 text-gray-800" >
                                {event.title}
                            </h5>
                            <p className="mt-2 text-sm text-gray-500 flex items-center gap-1 mb-2">
                                <svg className="w-4 h-4 text-red-500" fill="gray" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                {event.location}
                                </p>
                            </div>
                            </div>
                            {event.tag && (
                                <div className={`p-1.5 rounded-lg w-fit flex items-center justify-center text-sm font-semibold mb-2 bg-blue-100 text-blue-800`}>
                                {event.tag}
                                </div>
                            )}
                            <p className="mt-auto line-clamp-3 text-gray-700 text-sm leading-relaxed min-h-[72px] text-justify">
                            {event.description}
                            </p>
                            </div>
                            <div className="flex items-center">

                            <button
                            className="flex items-center gap-2 text-blue-600 px-2 font-semibold"
                            onClick={() => setSelectedEvent(event)}
                            >
                            View Details
                                <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                            </svg>
                        </button>
                    </div>
                </Card>
            ))}
            
            </div>
            </div>    
        )}
        </div>
            
        {/* Fixed hace pantalla completa div con posicion relative con el div con el width total descontando el width del sidebar, encima de este poner un div con absolute, el padre tie que ser relative*/}
        {/* OVERLAY */}
        {/* SIDEBAR */}
        {showOverlay && (
            <div
        className="absolute inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300"
        onClick={() => setSelectedEvent(null)}
    >
        <div
            className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out ${
                showSidebar ? 'translate-x-0' : 'translate-x-full'
            }`}
            onClick={(e) => e.stopPropagation()}
        >
            {selectedEvent && (
                <ComponenteEjemplo 
                    event={selectedEvent} 
                    onClose={() => setSelectedEvent(null)} 
                />
            )}
        </div>
    </div>
        )}
    </div>
    );
};

export default EventDashboard;