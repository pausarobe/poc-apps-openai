import { useState } from "react";
import type {EventData} from "../../lib/openai";

// Aquí sideboard
interface Props {
  event: EventData;
  onClose: () => void;
}

export default function ComponenteEjemplo({ event, onClose }: Props) {

  const [activeSection, setActiveSection] = useState<number>(0);

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
    <div className="h-full flex flex-col p-4 overflow-y-auto">
        <div className="flex justify-between pb-4 sticky top-0 bg-white z-10 flex-col">
            <div className="flex justify-between flex-col mb- gap-4">
                <div className="flex justify-between flex-row-reverse mb- gap-4">
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-all duration-200"
                    >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                </div>
                <div className="relative mb-3">

                {event.image && (
                    <img
                    src={event.image}
                    className="w-full h-40 object-cover rounded-md shadow-sm"
                    />
                )}
                <p className="mt-2 text-sm text-gray-600 font-medium absolute bottom-0 left-0">
                    {formatDate(event.date)}
                </p>
                </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 flex-1 pr-4">
                    {event.title}
                </h2>
                <div className="flex flex-row gap-4 mt-2 mb-3">
                        <p className="mt-2 text-sm text-gray-600 font-medium flex items-center gap-1">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="gray" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {event.date}
                        </p>
                        <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
                            <svg className="w-4 h-4 text-red-500" fill="gray" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            {event.location}
                        </p>
                </div>
                {event.tag && (
                    <div className={`p-1.5 rounded-lg w-fit flex items-center justify-center text-sm font-semibold mb-2 bg-blue-100 text-blue-800`}>
                        {event.tag}
                    </div>
                )}
            </div>

            {/* NAVEGACIÓN POR TABS */}
            <div className="flex gap-1 mb-4 overflow-x-auto pb-2 ">
                {event.sections?.map((section, index) => (
                    <button
                        key={index}
                        onClick={(e) => {
                            e.stopPropagation(); 
                            setActiveSection(index);
                        }}
                        className={`
                            px-3 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200
                            ${activeSection === index 
                                ? 'bg-blue-500 text-white shadow-md' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
                        `}
                    >
                        {section.tabTitle}
                    </button>
                ))}
            </div>

            {/* SOLO SECCIÓN ACTIVA */}
            <div className="flex-1 overflow-y-auto pr-2">
                {event.sections?.[activeSection] && (
                    <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 animate-slideIn">
                        <h3 className="font-bold mb-2 text-lg text-gray-900">
                            {event.sections[activeSection].sectionTitle}
                        </h3>
                        <p className="text-sm text-gray-700 leading-relaxed text-justify">
                            {event.sections[activeSection].sectionContent}
                        </p>
                    </div>
                )}
            </div>             
    </div>
  );
}