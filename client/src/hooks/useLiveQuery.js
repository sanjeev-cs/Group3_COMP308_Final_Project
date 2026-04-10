import { useQuery } from '@apollo/client';

const DEFAULT_LIVE_QUERY_OPTIONS = {
  pollInterval: 5000,
  fetchPolicy: 'cache-and-network',
  nextFetchPolicy: 'cache-first',
  notifyOnNetworkStatusChange: false,
  returnPartialData: true,
};

const useLiveQuery = (query, options = {}) => useQuery(query, {
  ...DEFAULT_LIVE_QUERY_OPTIONS,
  ...options,
});

export default useLiveQuery;
