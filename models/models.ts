

export type User = {
    id: string;
    username: string;
    emailVerified: boolean;
    image: string | null;
    role: string;
}

export type RenderProject = {
    name: string;
    commit: string;  // Allow commit to be undefined
    status: "created" | "build_in_progress" | "update_in_progress" | "live" | "deactivated" | "build_failed" | "update_failed" | "canceled" | "pre_deploy_in_progress" | "pre_deploy_failed";  // Allow status to be undefined
    updatedAt: string;
}

 export type RenderProjects = RenderProject[];

 export type VercelProject = {
    id: string;  // Project ID
    accountId: string;  // Vercel account ID
    name: string;  // Project name
    framework: string;  // Project framework (e.g., 'nextjs')
    createdAt: number;  // Timestamp when the project was created
    updatedAt: number | null;  // Timestamp when the project was last updated
    live: boolean;  // Project live status
    buildCommand?: string | null;  // Build command
    nodeVersion: string;  // Node.js version used
    serverlessFunctionRegion: string;  // Region for serverless functions
    autoAssignCustomDomains: boolean;  // Whether custom domains are auto-assigned
    latestDeployments?: VercelDeployment[];  // Array of latest deployments
  }
  
  export type VercelDeployment = {
    id: string;  // Deployment ID
    url: string;  // Deployment URL
    state: 'READY' | 'ERROR' | 'BUILDING';  // Deployment state
    createdAt: number;  // Timestamp when the deployment was created
    creator: {
      username: string;  // Username of the person who triggered the deployment
    };
  }

  export type VercelProjects = VercelProject[]