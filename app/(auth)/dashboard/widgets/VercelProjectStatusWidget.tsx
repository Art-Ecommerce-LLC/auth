import { CheckCircleIcon, ExclamationIcon, ClockIcon, XCircleIcon } from '@heroicons/react/solid';
import { VercelProject } from '@/models/models';
// import VercelLogo from '@/components/VercelLogo'; // You can create a VercelLogo component for branding
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import table components

// Explicitly type the statusIcons object for Vercel-specific statuses
const vercelStatusIcons: Record<
  'live' | 'building' | 'error' | 'canceled' | 'inactive',
  JSX.Element
> = {
  live: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
  building: <ClockIcon className="h-6 w-6 text-yellow-500" />,
  error: <XCircleIcon className="h-6 w-6 text-red-500" />,
  canceled: <XCircleIcon className="h-6 w-6 text-red-500" />,
  inactive: <ExclamationIcon className="h-6 w-6 text-gray-500" />,
};

interface VercelProjectStatusWidgetProps {
  projects: VercelProject[]; // Assuming you have a type for Vercel projects in models
}

export default function VercelProjectStatusWidget({ projects }: VercelProjectStatusWidgetProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-3">
        {/* <VercelLogo /> Optional Vercel branding */}
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Project Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              {/* Project Name */}
              <TableCell className="font-medium text-gray-700">{project.name}</TableCell>

              {/* Status */}
              <TableCell>
                <span className="flex items-center">
                  {vercelStatusIcons[project.live ? 'live' : 'inactive']}
                  <span className="ml-2 text-gray-500">{project.live ? 'Live' : 'Inactive'}</span>
                </span>
              </TableCell>

              {/* Last Updated */}
              <TableCell className="text-gray-500 text-sm">
                {project.updatedAt ? (
                  <div className="flex flex-col">
                    <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(project.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ) : (
                  'No update info'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
