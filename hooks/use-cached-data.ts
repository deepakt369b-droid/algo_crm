import useSWR from 'swr';

export function useCachedData<T>(key: string, fetcher: () => Promise<T>, fallbackData?: T) {
  const { data, error, isLoading, mutate } = useSWR<T>(
    key, 
    fetcher,
    {
      fallbackData,
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnMount: typeof fallbackData === 'undefined',
      dedupingInterval: 60000, // 1 minute
    }
  );

  return {
    data: data as T,
    error,
    isLoading,
    mutate
  };
}
