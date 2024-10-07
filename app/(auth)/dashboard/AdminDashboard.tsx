"use client";

import { User } from "@/models/models";
import CreateEventWidget from "./widgets/CreateEventWidget";
import TimeSlotWidget from "./widgets/TimeSlotWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import SignInButton from "@/components/SignInButton";

interface AdminDashboardProps {
  user: User;
  // vercelProjects: VercelProjects; // Pass Vercel projects here as well
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6">
        {/* Widget grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {/* Create Event Widget */}
          {/* <SignInButton user={user}/> */}
          <CalendarWidget />
          <CreateEventWidget />
          {/* Time Slot Widget */}
          <TimeSlotWidget />
        </div>
      </div>
    </div>
  );
}
