

import { Role, PlanStatus } from '@prisma/client'

export interface SessionData {
    isAuth: boolean;
    mfaVerified?: boolean;
    userId?: string;
    username?: string;
    email?: string;
    emailVerified?: boolean;
    image?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripeScheduleId?: string;
    role?: Role;
    planStatus?: PlanStatus;
    currentPeriodEnd?: Date;
    googleToken?: string;
    serviceToken?: string;
    error?: string;
}
export interface SessionPayload {
  userId?: string;
  sessionId?: string;
  expiresAt?: string;
  token?: string;
}
