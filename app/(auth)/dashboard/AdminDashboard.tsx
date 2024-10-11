"use client";

import CreateAppointments from "./widgets/CreateAppointmentsSchedule.tsx";


export default function AdminDashboard() {
  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6">
        {/* Widget grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          
          <CreateAppointments />

        </div>
      </div>
    </div>
  );
}
