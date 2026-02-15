import { Route } from '@/types/router';
import { cache } from 'react';
import { get } from './api';
import { ApiResponse } from '@/types/api-response';

export const getRoute = cache(async (url: string): Promise<Route | Record<string, never>> => {
  const { data } = await get<ApiResponse<Route | Record<string, never>>>('/router', { url });
  return data;
});
