import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { AxiosError } from 'axios'

interface ApiError {
  message: string
  status: number
}

// Generic GET hook
export function useApiQuery<T>(
  key: string[],
  endpoint: string,
  options?: UseQueryOptions<T, AxiosError<ApiError>>
) {
  return useQuery<T, AxiosError<ApiError>>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await apiClient.get<T>(endpoint)
      return data
    },
    ...options,
  })
}

// Generic POST hook
export function useApiMutation<T, V>(
  endpoint: string,
  options?: UseMutationOptions<T, AxiosError<ApiError>, V>
) {
  return useMutation<T, AxiosError<ApiError>, V>({
    mutationFn: async (variables) => {
      const { data } = await apiClient.post<T>(endpoint, variables)
      return data
    },
    ...options,
  })
}

// Generic PUT hook
export function useApiPut<T, V>(
  endpoint: string,
  options?: UseMutationOptions<T, AxiosError<ApiError>, V>
) {
  return useMutation<T, AxiosError<ApiError>, V>({
    mutationFn: async (variables) => {
      const { data } = await apiClient.put<T>(endpoint, variables)
      return data
    },
    ...options,
  })
}

// Generic DELETE hook
export function useApiDelete<T>(
  endpoint: string,
  options?: UseMutationOptions<T, AxiosError<ApiError>, void>
) {
  return useMutation<T, AxiosError<ApiError>, void>({
    mutationFn: async () => {
      const { data } = await apiClient.delete<T>(endpoint)
      return data
    },
    ...options,
  })
} 