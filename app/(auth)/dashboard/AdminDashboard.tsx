"use client";

import { User, RenderProjects, VercelProjects } from "@/models/models";
import RenderProjectStatusWidget from "./widgets/RenderProjectStatusWidget";
import VercelProjectStatusWidget from "./widgets/VercelProjectStatusWidget";

interface AdminDashboardProps {
  user: User;
  renderProjects: RenderProjects;
  vercelProjects: VercelProjects; // Pass Vercel projects here as well
}

export default function AdminDashboard({ user, renderProjects, vercelProjects }: AdminDashboardProps) {
  return (
    <div className="flex h-screen">
      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6">
        {/* Widget grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <RenderProjectStatusWidget projects={renderProjects} />
          <VercelProjectStatusWidget projects={vercelProjects} />
          {/* Add more widgets here */}
        </div>
      </div>
    </div>
  );
}
