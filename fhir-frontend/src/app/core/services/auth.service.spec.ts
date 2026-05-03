import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { LoginRequest, AuthResponse } from '../../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InRlc3R1c2VyIiwiZW1haWwiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNjA0MTU0NDQ0LCJleHAiOjk5OTk5OTk5OTl9.abc';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('login', () => {
    it('should authenticate user and store token', () => {
      const credentials: LoginRequest = { username: 'testuser', password: 'password123' };
      const response: AuthResponse = { access: testToken };

      service.login(credentials).subscribe(() => {
        expect(service.getToken()).toBe(testToken);
        expect(service.isAuthenticated()).toBe(true);
      });

      const req = httpMock.expectOne('http://localhost:8000/api/token/');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(response);
    });

    it('should emit isAuthenticated$ event on login', () => {
      const credentials: LoginRequest = { username: 'testuser', password: 'password123' };
      const response: AuthResponse = { access: testToken };

      service.isAuthenticated$.subscribe(isAuth => {
        if (isAuth) {
          expect(isAuth).toBe(true);
        }
      });

      service.login(credentials).subscribe(() => {});

      const req = httpMock.expectOne('http://localhost:8000/api/token/');
      req.flush(response);
    });
  });

  describe('logout', () => {
    it('should clear token and update authentication state', () => {
      localStorage.setItem('auth_token', testToken);
      service['isAuthenticatedSubject'].next(true);

      service.logout();

      expect(service.getToken()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should return token from localStorage', () => {
      localStorage.setItem('auth_token', testToken);
      expect(service.getToken()).toBe(testToken);
    });

    it('should return null if no token exists', () => {
      expect(service.getToken()).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if valid token exists', () => {
      localStorage.setItem('auth_token', testToken);
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should return false if no token exists', () => {
      expect(service.isAuthenticated()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user', () => {
      const credentials: LoginRequest = { username: 'testuser', password: 'password123' };
      const response: AuthResponse = { access: testToken };

      service.login(credentials).subscribe();

      const req = httpMock.expectOne('http://localhost:8000/api/token/');
      req.flush(response);

      const user = service.getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.username).toBe('testuser');
    });
  });
});
