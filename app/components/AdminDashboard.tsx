"use client";

import AppointmentsComponent from "@/app/components/form/CreateAppointmentsForm";
import DeleteAppointmentsCompomnent from "@/app/components/form/DeleteAppointmentsForm";

export default function AdminDashboard() {
  return (
    <div className="flex h-screen w-screen">
      {/* Main Content */}
      <div className="flex flex-col w-full h-full items-center">
          <h1 className="text-4xl font-weight-500"> Create Appointments</h1>
          <AppointmentsComponent  />
          <h1 className="text-4xl font-weight-500">Delete Appointments</h1>
          <DeleteAppointmentsCompomnent />
        </div>
    </div>
  );
}
