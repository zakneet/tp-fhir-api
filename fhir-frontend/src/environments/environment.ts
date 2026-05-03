// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  apiEndpoint: 'http://localhost:8000/api',
  
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
  pageSize: 10,
  
  // Timeouts
  httpTimeout: 30000, // 30 seconds
  
  // Logging
  logging: {
    enabled: true,
    level: 'debug'
  }
};
