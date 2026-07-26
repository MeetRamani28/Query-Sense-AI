import axios from 'axios';
import type { QueryRequestPayload, QueryResponseData } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, 
});

export const submitAnalyticsQuery = async (
  question: string
): Promise<QueryResponseData> => {
  try {
    const payload: QueryRequestPayload = { question };
    const response = await apiClient.post<QueryResponseData>('/api/v1/query', payload);
    return response.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.detail || 'Failed to process query on server', {
          cause: error,
        });
      } else {
        throw new Error('Network error: Unable to reach Query-Sense API backend.', { cause: error });
      }
    }
    throw new Error('An unexpected error occurred.', { cause: error });
  }
};