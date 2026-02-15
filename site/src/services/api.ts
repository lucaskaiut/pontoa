import { mockApi } from '@/mocks/api';
import { ApiListResponse, ApiResponse } from '@/types/api-response';

const delay = (min = 200, max = 500) => {
  const time = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, time));
};

type PayloadType = Record<string, string | number | boolean | string[] | undefined>;

const findData = (url: string, query?: PayloadType, headers?: HeadersInit): unknown => {
  const endpoint = mockApi[url];

  if (!endpoint) {
    throw new Error(`Endpoint ${url} not found in mock API`);
  }

  return typeof endpoint === 'function' ? endpoint(query, headers) : endpoint;
};

const enhanceHeaders = async (headers?: HeadersInit): Promise<HeadersInit> => {
  return {
    ...headers,
  };
};

export const get = async <T extends ApiResponse<unknown> | ApiListResponse<unknown>>(
  url: string,
  query?: PayloadType,
  headers?: HeadersInit
): Promise<T> => {
  await delay();
  await enhanceHeaders(headers);

  const result = findData(url, query, headers);

  if (result === undefined || result === null) {
    throw new Error(`Mock for GET ${url} not found`);
  }
  return result as T;
};

export const post = async <T extends ApiResponse<unknown> | ApiListResponse<unknown> = ApiResponse<unknown>>(
  url: string,
  body?: PayloadType,
  headers?: HeadersInit
): Promise<T> => {
  await delay();
  await enhanceHeaders(headers);
  const result = findData(url, body, headers);
  if (result === undefined || result === null) throw new Error(`Mock for POST ${url} not found`);
  return result as T;
};

export const put = async <ResponseType = unknown, ResponseBody = unknown>(
  url: string,
  body?: PayloadType,
  headers?: HeadersInit
): Promise<ResponseType> => {
  await delay();
  const finalHeaders = await enhanceHeaders(headers);
  const data = findData(url, body, headers);
  if (!data) throw new Error(`Mock for PUT ${url} not found`);
  return data as ResponseType;
};

export const patch = async <ResponseType = unknown, ResponseBody = unknown>(
  url: string,
  body?: PayloadType,
  headers?: HeadersInit
): Promise<ResponseType> => {
  await delay();
  const finalHeaders = await enhanceHeaders(headers);
  const data = findData(url, body, headers);
  if (!data) throw new Error(`Mock for PATCH ${url} not found`);
  return data as ResponseType;
};

export const del = async <ResponseType = unknown>(
  url: string,
  headers?: HeadersInit
): Promise<ResponseType> => {
  await delay();
  const finalHeaders = await enhanceHeaders(headers);
  const data = findData(url, {}, headers);
  if (!data) throw new Error(`Mock for DELETE ${url} not found`);
  return data as ResponseType;
};
