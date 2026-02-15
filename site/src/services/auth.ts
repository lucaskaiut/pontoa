import { cookies } from 'next/headers';
import { get, post } from './api';
import { User } from '@/types/user';

const login = async (email: string, password: string, document?: string) => {
  const response: User & { token: string } = await post('/login', { email, password, document });

  if (!response) {
    return false;
  }

  const cookie = await cookies();

  cookie.set('authToken', response.token);

  return true;
};

const validateAuth = async () => {
  const authToken = (await cookies()).get('authToken');

  if (!authToken) {
    return null;
  }

  const user: User | null = await get('/me', {}, { Authorization: `Bearer ${authToken}` });

  return user;
};

export { login, validateAuth };
