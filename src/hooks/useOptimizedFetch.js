import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for optimized polling with cleanup and error handling
 * Prevents memory leaks and unnecessary re-renders
 */
export const usePolling = (fetchFunction, interval = 5000, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);
  const lastFetchRef = useRef(0);

  const fetchData = useCallback(async (isRetry = false) => {
    // Prevent duplicate fetches within 1 second
    const now = Date.now();
    if (now - lastFetchRef.current < 1000 && !isRetry) {
      return;
    }
    lastFetchRef.current = now;

    if (isRetry) {
      setRetrying(true);
    }

    try {
      const result = await fetchFunction();
      
      // Only update if component is still mounted
      if (mountedRef.current) {
        setData(result);
        setError(null);
        setLoading(false);
        setRetrying(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.response?.data?.message || 'Failed to fetch data');
        setLoading(false);
        setRetrying(false);
      }
      console.error('Fetch error:', err);
    }
  }, [fetchFunction]);

  const retry = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  useEffect(() => {
    mountedRef.current = true;
    
    // Initial fetch
    fetchData();

    // Set up polling only if interval is provided
    if (interval > 0) {
      intervalRef.current = setInterval(() => {
        if (mountedRef.current && document.visibilityState === 'visible') {
          fetchData();
        }
      }, interval);
    }

    // Cleanup function
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [...dependencies, interval]);

  // Pause polling when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && intervalRef.current) {
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchData]);

  return { data, loading, error, retry, retrying };
};

/**
 * Custom hook for debounced search/filter
 * Prevents excessive API calls during typing
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef(null);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for optimized local storage with caching
 * Reduces unnecessary re-renders from storage updates
 */
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};

/**
 * Custom hook for throttled function execution
 * Useful for scroll handlers, resize handlers, etc.
 */
export const useThrottle = (callback, delay = 300) => {
  const lastRun = useRef(Date.now());
  const timeoutRef = useRef(null);

  const throttledCallback = useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRun.current;

    if (timeSinceLastRun >= delay) {
      callback(...args);
      lastRun.current = now;
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
        lastRun.current = Date.now();
      }, delay - timeSinceLastRun);
    }
  }, [callback, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
};

/**
 * Custom hook for previous value tracking
 * Useful for comparing previous and current values
 */
export const usePrevious = (value) => {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

/**
 * Custom hook for intersection observer (lazy loading)
 * Improves performance by loading content only when visible
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const targetRef = useRef(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [options, hasIntersected]);

  return { targetRef, isIntersecting, hasIntersected };
};

/**
 * Custom hook for window size with debouncing
 * Prevents excessive re-renders on window resize
 */
export const useWindowSize = (debounceDelay = 200) => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    let timeoutId = null;

    const handleResize = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        setWindowSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, debounceDelay);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [debounceDelay]);

  return windowSize;
};

/**
 * Custom hook for async operation with loading state
 * Prevents memory leaks from async operations
 */
export const useAsync = (asyncFunction, immediate = true) => {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const execute = useCallback(async (...params) => {
    setStatus('pending');
    setData(null);
    setError(null);

    try {
      const response = await asyncFunction(...params);
      if (mountedRef.current) {
        setData(response);
        setStatus('success');
      }
      return response;
    } catch (error) {
      if (mountedRef.current) {
        setError(error);
        setStatus('error');
      }
      throw error;
    }
  }, [asyncFunction]);

  useEffect(() => {
    mountedRef.current = true;
    
    if (immediate) {
      execute();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [execute, immediate]);

  return { execute, status, data, error, loading: status === 'pending' };
};
