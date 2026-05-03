export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
  apiEndpoint: 'https://api.example.com/api',
  
  // Auth Configuration
  auth: {
    tokenKey: 'auth_token',
    userKey: 'current_user',
    endpoint: '/token/'
  },
  
  // API Endpoints
  endpoints: {
    patients: '/patients/',
    observations: '/observations/'
  },
  
  // Pagination
  pageSize: 20,
  
  // Timeouts
  httpTimeout: 30000,
  
  // Logging
  logging: {
    enabled: false
  }
};
