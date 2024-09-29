import { CheckCircleIcon, ExclamationIcon, ClockIcon, XCircleIcon } from '@heroicons/react/solid';
import { RenderProject } from '@/models/models';
import RenderLogo from '@/components/RenderLogo'; // Import RenderLogo
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Import table components

// Explicitly type the statusIcons object to include all possible statuses
const statusIcons: Record<
  "live" | "build_in_progress" | "update_in_progress" | "deactivated" | "build_failed" | 
  "update_failed" | "pre_deploy_failed" | "canceled" | "pre_deploy_in_progress" | "created",
  JSX.Element
> = {
  live: <CheckCircleIcon className="h-6 w-6 text-green-500" />,
  build_in_progress: <ClockIcon className="h-6 w-6 text-yellow-500" />,
  update_in_progress: <ClockIcon className="h-6 w-6 text-yellow-500" />,
  deactivated: <ExclamationIcon className="h-6 w-6 text-blue-500" />,
  build_failed: <XCircleIcon className="h-6 w-6 text-red-500" />,
  update_failed: <XCircleIcon className="h-6 w-6 text-red-500" />,
  pre_deploy_failed: <XCircleIcon className="h-6 w-6 text-red-500" />,
  canceled: <XCircleIcon className="h-6 w-6 text-red-500" />,
  pre_deploy_in_progress: <ClockIcon className="h-6 w-6 text-yellow-500" />,
  created: <ClockIcon className="h-6 w-6 text-gray-500" />,
};

interface RenderProjectStatusWidgetProps {
  projects: RenderProject[];
}

export default function RenderProjectStatusWidget({ projects }: RenderProjectStatusWidgetProps) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
    <div className='mb-3'>
      <RenderLogo/> {/* Render the logo above the table */}
    </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Project Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Commit</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.name}>
              {/* Project Name */}
              <TableCell className="font-medium text-gray-700">{project.name}</TableCell>

              {/* Status */}
              <TableCell>
                <span className="flex items-center">
                  {statusIcons[project.status as keyof typeof statusIcons]}
                  <span className="ml-2 text-gray-500">{project.status}</span>
                </span>
              </TableCell>

              {/* Commit */}
              <TableCell className="text-gray-500 text-sm">
                {project.commit ? project.commit : 'No commit info'}
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
