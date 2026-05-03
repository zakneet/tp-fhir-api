# FHIR Frontend - Application Angular Professionnelle

Application Angular moderne pour la gestion des données FHIR médicales avec intégration complète à l'API Django REST Framework.

## Fonctionnalités Principales

### ✅ Authentification JWT
- Authentification sécurisée avec JWT tokens
- Gestion automatique des tokens via interceptors
- Protection des routes avec guards
- Déconnexion sécurisée

### ✅ Gestion des Patients
- **Liste**: Affichage paginé des patients avec recherche et filtrage
- **Détail**: Consultation complète des informations du patient + observations associées
- **Création**: Formulaire de création de nouveau patient
- **Édition**: Mise à jour des données du patient
- **Suppression**: Suppression sécurisée avec confirmation

### ✅ Gestion des Observations Médicales
- Liste des observations avec filtrage avancé
- Filtrage par patient, type, et date
- Types supportés: PA, FC, Tempé, Poids, Taille
- Pagination complète

## Installation Rapide

### Prérequis
- Node.js >= 18.0.0
- npm >= 9.0.0
- Angular CLI 18+

### Steps
```bash
# Installation des dépendances
npm install

# Démarrer le serveur de développement
ng serve

# L'app sera accessible à http://localhost:4200
```

### Configuration de l'API
Modifier `src/app/core/services/auth.service.ts`:
```typescript
private readonly API_URL = 'http://localhost:8000/api';
```

## Architecture

### Structure
- **core/**: Services, guards, interceptors réutilisables
- **features/**: Composants par domaine (auth, patients, observations)
- **models/**: Interfaces TypeScript pour type-safety
- Standalone Components: Architecture moderne Angular

### Services Principaux
- `AuthService`: Authentification et gestion des tokens
- `PatientService`: Opérations CRUD patients
- `ObservationService`: Opérations CRUD observations

### Guards & Interceptors
- `authGuard`: Protection des routes
- `AuthInterceptor`: Ajoute JWT token automatiquement
- `ErrorInterceptor`: Gère erreurs 401

## Tests

```bash
# Exécuter les tests unitaires
ng test

# Coverage
ng test --code-coverage
```

## Commandes Principales

```bash
# Développement
ng serve

# Production
ng build --configuration production

# Tests
ng test

# Linting
ng lint
```

## Documentation Complète

Voir [DOCUMENTATION.md](./docs/DOCUMENTATION.md) pour les détails complets.

## Architecture Sécurité

- ✅ JWT Authentication
- ✅ Route Guards
- ✅ HTTP Interceptors
- ✅ Client-side Validation
- ✅ Type-Safe TypeScript

## Support Django Backend

Les endpoints de l'API Django utilisés:

```
Authentication:
  POST /api/token/                      Login

Patients:
  GET    /api/patients/                 List
  POST   /api/patients/                 Create
  GET    /api/patients/{id}/            Retrieve
  PUT    /api/patients/{id}/            Update
  DELETE /api/patients/{id}/            Delete

Observations:
  GET    /api/observations/             List
  POST   /api/observations/             Create
  GET    /api/observations/{id}/        Retrieve
  PUT    /api/observations/{id}/        Update
  DELETE /api/observations/{id}/        Delete
```

## License

MIT

## Version

1.0.0 - Avril 2026

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
