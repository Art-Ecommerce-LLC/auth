"use client";

import { User } from "@/models/models";
import ProjectStatusWidget from "./widgets/ProjectStatusWidget";
import { PlusCircleIcon } from "@heroicons/react/solid";

// Sample project data (this would come from your API or state in a real-world app)
const projects: { name: string; status: "completed" | "inProgress" | "pending" | "failed"; }[] = [
    { name: "Project Alpha", status: "completed" },
    { name: "Project Beta", status: "inProgress" },
    { name: "Project Gamma", status: "pending" },
    { name: "Project Delta", status: "failed" },
];
export default function AdminDashboard({ user }: { user: User }) {
    return (
      <div className="flex h-screen">
        
  
        {/* Main Content */}
        <div className="flex-1 bg-gray-100 p-6">
          {/* Top bar */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          </div>
  
          <p className="mb-8 text-gray-600">Welcome, {user.username},</p>
  
          {/* Widget grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <ProjectStatusWidget projects={projects} />
            {/* More widgets can be added here */}
          </div>
        </div>
      </div>
    );
  }