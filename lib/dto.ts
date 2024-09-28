'server only';

import { getUser, getVerifyEmailSession, getOTPSession, getResetPasswordSession } from './dal';

export function getUserData() {
  const user = getUser();
  return user;
}

export function getSessionData(pageType: string) {
  switch (pageType) {
    case 'resetPassword':
      return getResetPasswordSession();
    case 'verifyEmail':
      return getVerifyEmailSession();
    case 'otp':
      return getOTPSession();
    default:
      return getUser();
  }
}

export function verifyPage(pageType: string) {
  switch (pageType) {
    case 'resetPassword':
      return getResetPasswordSession();
    case 'verifyEmail':
      return getVerifyEmailSession();
    case 'otp':
      return getOTPSession();
    default:
      return getUser();
  }
}
