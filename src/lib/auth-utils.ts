import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function getTokenFromRequest(request: NextRequest) {
  try {
    const body = await request.json();
    return { token: body.token, body };
  } catch (error) {
    return null;
  }
}

export async function verifyRequestToken(request: NextRequest) {
  const result = await getTokenFromRequest(request);
  
  if (!result) {
    return { error: 'No request body', status: 400 };
  }

  const { token, body } = result;
  
  if (!token) {
    return { error: 'No authentication token', status: 401 };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { error: 'Invalid token', status: 401 };
  }

  return { payload, body };
}
