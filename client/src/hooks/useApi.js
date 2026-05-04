import { useState, useCallback } from 'react';

/**
 * Custom hook for handling API calls with loading and error states
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} - { data, loading, error, execute }
 */
export const useApi = (apiFunction) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFunction(...args);
      setData(response.data);
      return response.data;
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return { data, loading, error, execute, reset };
};

export default useApi;