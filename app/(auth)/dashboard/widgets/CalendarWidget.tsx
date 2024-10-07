// app/components/CalendarWidget.tsx
import React, { useEffect, useState } from 'react';

// Define the type for Google Calendar Event
interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
}

// Calendar Widget component to fetch and display events
const CalendarWidget: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the calendar events from the API
    const fetchEvents = async () => {
      try {
        const response = await fetch('/api/calendar/events');
        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const data = await response.json();
        setEvents(data);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>Error loading events: {error}</div>;
  }

  return (
    <div>
      <h2>Upcoming Google Calendar Events</h2>
      <ul>
        {events.length === 0 ? (
          <li>No upcoming events found.</li>
        ) : (
          events.map((event) => (
            <li key={event.id}>
              <strong>{event.summary}</strong>
              <br />
              {event.start.dateTime
                ? new Date(event.start.dateTime).toLocaleString()
                : new Date(event.start.date!).toLocaleDateString()}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default CalendarWidget;
