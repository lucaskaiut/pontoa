import { Route } from '@/types/router';
import { cache } from 'react';
import { get } from './api';

export const getRoute = cache(async (url: string): Promise<Route> => {
  return get('/router', { url });
});
