

import { Role, PlanStatus } from '@prisma/client'

export interface UserPayload {
  id: string
  username: string
  emailVerified: boolean
  image: string | null
  role: Role
  planStatus: PlanStatus
  currentPeriodEnd: Date | null
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  googleToken: string | null
  serviceToken: string
}

export type AuthSuccess = { isAuth: true; user: UserPayload }
export type AuthFailure = { isAuth: false }

export type AuthResult = AuthSuccess | AuthFailure

export type RenderProject = {
    name: string;
    commit: string;  // Allow commit to be undefined
    status: "created" | "build_in_progress" | "update_in_progress" | "live" | "deactivated" | "build_failed" | "update_failed" | "canceled" | "pre_deploy_in_progress" | "pre_deploy_failed";  // Allow status to be undefined
    updatedAt: string;
}

 export type RenderProjects = RenderProject[];
