import { cookies } from 'next/headers';

export async function createCookie(name: string, value: string, expires: Date) {
  const isProduction = process.env.NODE_ENV === 'production';
  cookies().set(name, value, {
    httpOnly: true,
    secure: isProduction,
    expires: expires,
    maxAge: expires.getTime() - Date.now(),
    sameSite: 'strict',
    path : '/'
  });
}

export async function getCookie(name: string) {
  const cookie = cookies().get(name);
  return cookie;
}

export async function deleteCookie(name: string) {
  cookies().delete(name);
}