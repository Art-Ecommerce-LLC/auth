// /widgets/ProjectStatusWidget.tsx

import { CheckCircleIcon, ExclamationIcon, ClockIcon, XCircleIcon } from '@heroicons/react/solid';

interface Project {
    name: string;
    status: 'completed' | 'inProgress' | 'pending' | 'failed';
}

interface ProjectStatusWidgetProps {
    projects: Project[];
}

export default function ProjectStatusWidget({ projects }: ProjectStatusWidgetProps) {
    const statusIcons = {
        completed: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
        inProgress: <ClockIcon className="h-6 w-6 text-yellow-500" />,
        pending: <ExclamationIcon className="h-6 w-6 text-blue-500" />,
        failed: <XCircleIcon className="h-6 w-6 text-red-500" />,
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6 w-80">
            <h2 className="text-lg font-bold mb-4">Project Status</h2>
            <ul className="space-y-4">
                {projects.map((project) => (
                    <li key={project.name} className="flex items-center justify-between">
                        <span className="text-gray-700">{project.name}</span>
                        <span>{statusIcons[project.status]}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
