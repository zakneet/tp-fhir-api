export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access: string;
  refresh?: string;
}

export interface User {
  id?: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface DecodedToken {
  user_id?: number;
  username?: string;
  email?: string;
  iat?: number;
  exp?: number;
}
