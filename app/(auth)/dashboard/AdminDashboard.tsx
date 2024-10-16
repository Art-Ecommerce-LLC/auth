"use client";

import AppointmentsComponent from "@/components/form/CreateAppointmentsForm";


export default function AdminDashboard() {
  return (
    <div className="flex flex-col h-screen w-screen">
      {/* Main Content */}
      <div className="w-[40vw] h-full items-center">
          <AppointmentsComponent  />
        </div>
    </div>
  );
}
