import React from 'react';
import DashboardLayout from '../DashboardLayout';
import { Calendar as CalendarIcon } from '@phosphor-icons/react';

const Calendar = () => {
  // Sample calendar events
  const events = [
    { id: 1, title: 'Farm Inspection', date: '2025-05-10', time: '10:00 AM' },
    { id: 2, title: 'Vet Visit', date: '2025-05-15', time: '3:00 PM' },
    { id: 3, title: 'Feed Delivery', date: '2025-05-18', time: '9:00 AM' },
    { id: 4, title: 'Staff Meeting', date: '2025-05-20', time: '11:00 AM' },
    { id: 5, title: 'Maintenance Work', date: '2025-05-25', time: '2:00 PM' },
  ];

  // Get current month name
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <button className="bg-amber-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <CalendarIcon size={20} weight="duotone" />
            Add Event
          </button>
        </div>

        {/* Calendar Header */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-amber-50 p-4 border-b">
            <h2 className="text-xl font-semibold text-center">{currentMonth}</h2>
          </div>

          {/* Events List */}
          <div className="divide-y">
            {events.map(event => (
              <div key={event.id} className="p-4 hover:bg-gray-50 transition duration-150">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                    <button className="text-red-500 hover:text-red-700 text-sm">Cancel</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Calendar;