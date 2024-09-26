'use server'

import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

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

export async function deleteCookie(name: string, req: NextRequest) {
  console.log('Deleting cookie', name);

  const serverCookies = cookies();
  console.log('serverCookies', serverCookies);
  console.log('requestCookies', req.cookies);
  serverCookies.delete(name);

  serverCookies.set(name, '', {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
    maxAge: 0,
    sameSite: 'strict',
    path : '/'
  });

}