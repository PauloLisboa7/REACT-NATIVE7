import { useState, useCallback, useRef, useEffect } from 'react';

interface UseFetchOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook para chamadas assíncronas com loading e error handling
 */
export const useFetch = <T,>(options?: UseFetchOptions) => {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (asyncFunction: () => Promise<T>) => {
      setState({ data: null, loading: true, error: null });

      try {
        const response = await asyncFunction();

        if (isMountedRef.current) {
          setState({ data: response, loading: false, error: null });
          options?.onSuccess?.(response);
        }

        return response;
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');

        if (isMountedRef.current) {
          setState({ data: null, loading: false, error: err });
          options?.onError?.(err);
        }

        throw err;
      }
    },
    [options]
  );

  const reset = useCallback(() => {
    if (isMountedRef.current) {
      setState({ data: null, loading: false, error: null });
    }
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
};
