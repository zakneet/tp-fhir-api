# Quick Start Guide - FHIR API Application

Démarrez rapidement l'application FHIR complète avec Django Backend + Angular Frontend.

## Prérequis

### Backend Django
- Python 3.10+
- pip
- virtualenv

### Frontend Angular
- Node.js 18+
- npm ou yarn
- Angular CLI 18+

## Installation Rapide (5 minutes)

### 1. Setup Backend Django

```bash
# Accéder au répertoire backend
cd tp-fhir-api

# Créer et activer virtualenv (si pas déjà fait)
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\Activate.ps1

# Installer les dépendances
pip install -r requirements.txt

# Migrations DB
python manage.py migrate

# Créer un superuser pour tester
python manage.py createsuperuser
# Username: admin
# Password: admin123

# Lancer le serveur Django
python manage.py runserver
```

Le backend sera accessible à : `http://localhost:8000`

### 2. Setup Frontend Angular

```bash
# Accéder au répertoire frontend
cd fhir-frontend

# Installer les dépendances
npm install

# Lancer le serveur Angular
ng serve
```

Le frontend sera accessible à : `http://localhost:4200`

## Premiers Pas

### 1. Accédez à l'Application

Ouvrez votre navigateur et allez à : `http://localhost:4200`

### 2. Connexion

Vous serrez redirigé vers `/login`

```
Username: admin
Password: admin123
```

### 3. Explorez les Fonctionnalités

1. **Patients**: Cliquez sur l'onglet "Patients" dans la navbar
   - Voir la liste des patients (si aucun, créer un)
   - Cliquer sur un patient pour voir les détails
   - Créer un nouveau patient avec le bouton "+ Ajouter un patient"

2. **Observations**: Cliquez sur "Observations"
   - Voir les observations médicales
   - Filtrer par patient, type, date
   - Supprimer des observations

### 4. Créer des Données de Test

```bash
# Utiliser l'interface Django Admin
# http://localhost:8000/admin/
# Connectez-vous avec admin/admin123
```

## Commandes Principales

### Backend

```bash
# Activer virtualenv
source venv/bin/activate  # Linux/Mac
venv\Scripts\Activate.ps1  # Windows

# Lancer le serveur
python manage.py runserver

# Migrations
python manage.py migrate
python manage.py makemigrations

# Shell Django
python manage.py shell

# Tests
python manage.py test

# Créer superuser
python manage.py createsuperuser
```

### Frontend

```bash
# Serveur de développement
ng serve

# Build production
ng build --configuration production

# Tests unitaires
ng test

# Linting
ng lint

# Exécuter les tests
ng test
```

## Endpoints Disponibles

### Authentification

```
POST /api/token/              Obtenir un token JWT
POST /api/token/refresh/      Rafraîchir le token
```

### Patients

```
GET    /api/patients/           Liste des patients
POST   /api/patients/           Créer un patient
GET    /api/patients/{id}/      Détail d'un patient
PUT    /api/patients/{id}/      Modifier un patient
DELETE /api/patients/{id}/      Supprimer un patient
GET    /api/patients/{id}/observations/  Observations du patient
```

### Observations

```
GET    /api/observations/       Liste des observations
POST   /api/observations/       Créer une observation
GET    /api/observations/{id}/  Détail d'une observation
PUT    /api/observations/{id}/  Modifier une observation
DELETE /api/observations/{id}/  Supprimer une observation
```

## Endpoints Utiles

```
API Documentation: http://localhost:8000/api/docs/
Django Admin:      http://localhost:8000/admin/
```

## Troubleshooting

### Port déjà utilisé

```bash
# Changer le port Django
python manage.py runserver 0.0.0.0:8001

# Changer le port Angular
ng serve --port 4201
```

### Erreur CORS

Vérifier que la configuration CORS est correcte dans `config/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
]
```

### Erreur d'authen

- Vérifier que le token est stocké dans localStorage
- Vérifier l'expiration du token
- Vérifier l'en-tête `Authorization: Bearer <token>`

### Base de données non trouvée

```bash
# Réinitialiser la base de données
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

## Ressources Utiles

- [Documentation Angular](https://angular.io/docs)
- [Documentation Django REST Framework](https://www.django-rest-framework.org/)
- [Documentation FHIR](https://www.hl7.org/fhir/)
- [JWT Pour les Nuls](https://jwt.io/)

## Support

Si vous avez des problèmes:
1. Vérifiez les logs du terminal
2. Ouvrez la console du navigateur (F12)
3. Consultez le documentation complète dans [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)

## Prochaines Étapes

1. Lire la [Documentation Complète](./README.md)
2. Consulter le [Guide d'Intégration](./INTEGRATION_GUIDE.md)
3. Exécuter les tests: `ng test` et `python manage.py test`
4. Créer plus de données de test
5. Explorer la documentation Swagger à `http://localhost:8000/api/docs/`

Bonne chance ! 🚀
