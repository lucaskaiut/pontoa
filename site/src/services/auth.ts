import { cookies } from 'next/headers';
import { get, post } from './api';
import { ApiResponse } from '@/types/api-response';
import { User, UserWithToken } from '@/types/user';

const login = async (email: string, password: string, document?: string) => {
  const { data } = await post<ApiResponse<UserWithToken | null>>('/login', {
    email,
    password,
    document,
  });

  if (!data) {
    return false;
  }

  const cookie = await cookies();

  cookie.set('authToken', data.token);

  return true;
};

const validateAuth = async () => {
  const authToken = (await cookies()).get('authToken');

  if (!authToken) {
    return null;
  }

  const { data: user } = await get<ApiResponse<User | null>>('/me', {}, {
    Authorization: `Bearer ${authToken}`,
  });

  return user;
};

export { login, validateAuth };
