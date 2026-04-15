import { useEffect, useState } from "react";
import { useOpenAiGlobal } from "../lib/hooks";
import { Card } from "flowbite-react";
import type { EventData } from "../lib/openai";

const EventDashboard = () => {

    const toolOutput = useOpenAiGlobal('toolOutput');
    const [events, setEvents] = useState<EventData[]>([]);

    useEffect(() => {
        if (toolOutput && toolOutput.eventList) {
            setEvents(toolOutput.eventList);
        }
    }, [toolOutput]);

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
            <Card className="max-w-sm" key={event.id}>
            <img src={event?.sections?.[0]?.image} alt={event.title} className="rounded-t-lg" />
            <h5 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                {event.title}
            </h5>
            <p className="text-lg font-semibold">Date: {event.date}</p>
            <p className="text-gray-500 dark:text-gray-400">{event.description}</p>
            </Card>
        ))}
        </div>
    );
};

export default EventDashboard;