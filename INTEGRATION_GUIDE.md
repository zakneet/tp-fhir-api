# Guide d'Intégration Frontend Angular avec Backend Django FHIR

## Configuration du Backend Django

### 1. Installation des Dépendances

```bash
# Dans le virtualenv du projet Django
pip install django-cors-headers djangorestframework drf-spectacular
```

### 2. Configuration DC `settings.py`

Ajouter à la liste `INSTALLED_APPS`:

```python
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party apps
    'corsheaders',
    'rest_framework',
    'drf_spectacular',
    
    # Local apps
    'fhir_api',
]
```

### 3. Middleware CORS

Ajouter à la liste `MIDDLEWARE`:

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # ← AVANT les autres middleware
    'django.middleware.common.CommonMiddleware',
    # ... autres middleware
]
```

### 4. Configuration CORS

Ajouter à la fin de `settings.py`:

```python
# CORS Configuration
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",      # Angular dev server
    "http://localhost:3000",      # Alternative dev server
    "http://127.0.0.1:4200",
    # En production:
    # "https://yourdomain.com",
]

CORS_EXPOSE_HEADERS = [
    'Content-Type',
    'X-CSRFToken',
]

CORS_ALLOW_CREDENTIALS = True
```

### 5. Configuration JWT (Optional mais Recommandé)

Installer `djangorestframework-simplejwt`:

```bash
pip install djangorestframework-simplejwt
```

Ajouter à `settings.py`:

```python
from datetime import timedelta

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': False,
}
```

### 6. Configurer les URLs

Dans `config/urls.py`:

```python
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # JWT Token endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API Routes
    path('api/', include('fhir_api.urls')),
]
```

## Configuration du Frontend Angular

### 1. Mettre à jour les Services

Dans `src/app/core/services/auth.service.ts`:

```typescript
private readonly API_URL = 'http://localhost:8000/api';

login(credentials: LoginRequest): Observable<AuthResponse> {
  return this.http.post<AuthResponse>(
    `${this.API_URL}/token/`,
    credentials
  ).pipe(
    tap(response => {
      this.setToken(response.access);
      this.isAuthenticatedSubject.next(true);
      // ...
    })
  );
}
```

### 2. Configuration de l'Environnement

Mettre à jour `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  apiEndpoint: 'http://localhost:8000/api',
  auth: {
    tokenKey: 'auth_token',
    endpoint: '/token/'
  }
};
```

## Guide de Déploiement

### Développement Local

```bash
# Terminal 1: Django Backend
cd tp-fhir-api
python manage.py runserver 0.0.0.0:8000

# Terminal 2: Angular Frontend
cd fhir-frontend
ng serve

# Accédez à http://localhost:4200
```

### Production avec Docker (Optional)

**Dockerfile** pour le backend Django:

```dockerfile
FROM python:3.11

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

**Dockerfile** pour le frontend Angular:

```dockerfile
FROM node:18 as builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build -- --configuration production

FROM nginx:alpine
COPY --from=builder /app/dist/fhir-frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml**:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: fhir_db
      POSTGRES_USER: fhir_user
      POSTGRES_PASSWORD: fhir_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./tp-fhir-api
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000
    ports:
      - "8000:8000"
    environment:
      DEBUG: "False"
      ALLOWED_HOSTS: localhost,127.0.0.1,backend
      DATABASES: postgresql://fhir_user:fhir_password@postgres:5432/fhir_db
    depends_on:
      - postgres
    volumes:
      - ./tp-fhir-api:/app

  frontend:
    build: ./fhir-frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

## Dépannage

### Erreur CORS

```
Access to XMLHttpRequest at 'http://localhost:8000/api/...' from origin 
'http://localhost:4200' has been blocked by CORS policy
```

**Solution**: Vérifier la configuration CORS dans Django `settings.py`

### Erreur d'Authentification 401

- Vérifier que le token JWT est correctement stocké
- Vérifier que le token n'a pas expiré
- Vérifier l'en-tête `Authorization: Bearer <token>`

### Erreur 404 sur les Endpoints

- Vérifier que les URLs sont correctement configurées
- Vérifier l'URL de l'API dans les services Angular
- Tester avec Postman ou curl

## Testing Integration

### Tester avec cURL

```bash
# Login
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin"}'

# Response:
# {"access":"eyJ0...","refresh":"eyJ0..."}

# Utiliser le token pour accéder aux patients
curl -H "Authorization: Bearer eyJ0..." \
  http://localhost:8000/api/patients/
```

## Documentation API

Accédez à la documentation Swagger à:
```
http://localhost:8000/api/docs/
```

## Prochaines Étapes

1. Configurer la base de données en production (PostgreSQL)
2. Implémenter le cache Redis
3. Ajouter les tests E2E Cypress
4. Configurer CI/CD (GitHub Actions, GitLab CI)
5. Implémenter la rotation des tokens JWT
6. Ajouter les logs structurés
7. Configurer le monitoring (Sentry, etc.)

## Support

Pour des questions ou des problèmes, consultez la documentation ou créez une issue.
