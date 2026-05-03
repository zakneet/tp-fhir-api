import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AuthResponse, LoginRequest, User, DecodedToken } from '../../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8000/api'; // À configurer
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';
  
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private currentUserSubject = new BehaviorSubject<User | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  /**
   * Initialise l'état d'authentification depuis le stockage local
   */
  private initializeAuth(): void {
    const token = this.getToken();
    if (token && this.isTokenValid(token)) {
      this.isAuthenticatedSubject.next(true);
      const user = this.getUserFromToken(token);
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
  }

  /**
   * Authentifie un utilisateur
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/token/`, credentials).pipe(
      tap(response => {
        this.setToken(response.access);
        this.isAuthenticatedSubject.next(true);
        const user = this.getUserFromToken(response.access);
        if (user) {
          this.currentUserSubject.next(user);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Erreur d\'authentification'));
      })
    );
  }

  /**
   * Déconnecte l'utilisateur
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
  }

  /**
   * Récupère le token JWT
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Stocke le token JWT
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && this.isTokenValid(token);
  }

  /**
   * Vérifie la validité du token
   */
  private isTokenValid(token: string): boolean {
    try {
      const decoded = this.decodeToken(token);
      if (!decoded || !decoded.exp) {
        return false;
      }
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Décode le token JWT (sans vérification de signature)
   */
  private decodeToken(token: string): DecodedToken | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const decoded = JSON.parse(atob(parts[1]));
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Extrait les informations utilisateur du token
   */
  private getUserFromToken(token: string): User | null {
    const decoded = this.decodeToken(token);
    if (!decoded) {
      return null;
    }
    return {
      id: decoded.user_id?.toString(),
      username: decoded.username || '',
      email: decoded.email
    };
  }

  /**
   * Obtient l'utilisateur actuellement connecté
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
