# Guide de Validation et Test - FHIR API Application

Guide complet pour tester toutes les fonctionnalités de l'application FHIR.

## Checklist de Validation

### ✅ Configuration

- [ ] Backend Django lancé sur port 8000
- [ ] Frontend Angular lancé sur port 4200  
- [ ] CORS configuré correctement
- [ ] JWT configuré sur le backend
- [ ] Base de données migrée
- [ ] Superuser créé (admin/admin123)

### ✅ Tests d'Authentification

```bash
# Tester le login avec cURL
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Vous devriez recevoir une réponse similaire à:
# {"access": "eyJ0...", "refresh": "eyJ0..."}
```

1. [ ] Accédez à http://localhost:4200
2. [ ] Vous êtes redirigé vers /login
3. [ ] Entrez admin/admin123
4. [ ] Vous êtes redirigé vers /patients
5. [ ] La navbar affiche "admin" en haut à droite

### ✅ Tests Gestion des Patients

#### Liste des Patients

```bash
# Tester avec cURL (remplacer TOKEN par le token obtenu)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/patients/
```

1. [ ] Accédez à /patients
2. [ ] La liste est affichée (vide ou avec patients existants)
3. [ ] La pagination fonctionne
4. [ ] La recherche par nom fonctionne
5. [ ] Le filtrage par genre fonctionne

#### Création d'un Patient

1. [ ] Cliquez sur "+ Ajouter un patient"
2. [ ] Remplissez le formulaire:
   - Nom: Dupont
   - Prénom: Jean
   - Genre: Homme
   - Date de naissance: 15/01/1990
3. [ ] Cliquez "Créer"
4. [ ] Le patient est créé avec succès
5. [ ] Vous êtes redirigé vers le détail du patient

#### Détail d'un Patient

1. [ ] Cliquez sur un patient dans la liste
2. [ ] Les informations du patient s'affichent:
   - Identifier (UUID)
   - Nom complet
   - Genre
   - Date de naissance (calculée en âge)
   - Date de dernière modification
3. [ ] Les observations associées s'affichent

#### Édition d'un Patient

1. [ ] Sur la page de détail, cliquez "Éditer"
2. [ ] Modifiez les données (ex: changez le genre)
3. [ ] Cliquez "Mettre à jour"
4. [ ] Les changements sont appliqués

#### Suppression d'un Patient

1. [ ] Sur la page de détail, cliquez "Supprimer"
2. [ ] Confirmez la suppression
3. [ ] Vous êtes redirigé vers la liste
4. [ ] Le patient n'apparaît plus dans la liste

### ✅ Tests Gestion des Observations

#### Liste des Observations

1. [ ] Cliquez sur "Observations" dans la navbar
2. [ ] La liste des observations s'affiche
3. [ ] Le filtrage par patient fonctionne
4. [ ] Le filtrage par type fonctionne
5. [ ] Le filtrage par date fonctionne

#### Suppression d'une Observation

1. [ ] Sélectionnez une observation
2. [ ] Cliquez "Supprimer"
3. [ ] Confirmez
4. [ ] L'observation est supprimée

### ✅ Tests des Guards et Interceptors

#### Protection des Routes

1. [ ] Déconnectez-vous
2. [ ] Essayez d'accéder directement à /patients
3. [ ] Vous êtes redirigé vers /login

#### Gestion des Erreurs 401

1. [ ] Modifiez le token dans la console du navigateur
2. [ ] Essayez d'accéder à une ressource protégée
3. [ ] Vous êtes redirigé vers /login et déconnecté

### ✅ Tests des Erreurs et Validations

#### Validation Formulaire

1. [ ] Essayez de soumettre vrai formulaire vide
2. [ ] Les messages d'erreur s'affichent
3. [ ] Les champs invalides sont surlignés

#### Gestion des Erreurs Serveur

1. [ ] Essayez de créer un patient avec un nom vide
2. [ ] Un message d'erreur s'affiche
3. [ ] Le formulaire reste accessible pour corriger

## Tests Unitaires

### Frontend

```bash
cd fhir-frontend

# Exécuter tous les tests
ng test

# Tests spécifiques au service d'authentification
ng test --include='**/auth.service.spec.ts'

# Tests spécifiques au service des patients
ng test --include='**/patient.service.spec.ts'

# Tests avec coverage
ng test --code-coverage
```

### Backend

```bash
cd tp-fhir-api
source venv/bin/activate

# Exécuter tous les tests
python manage.py test

# Tests spécifiques
python manage.py test fhir_api.tests
```

## Tests d'Intégration API

### 1. Test complet du flux d'authentification

```bash
# 1. Login et obtenir token
TOKEN=$(curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -s | jq -r '.access')

echo "Token: $TOKEN"

# 2. Accéder à la liste des patients avec le token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/patients/

# 3. Créer un patient
curl -X POST http://localhost:8000/api/patients/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resourceType": "Patient",
    "identifier": [{"system": "test", "value": "PAT-001"}],
    "name": [{"family": "Test", "given": ["User"]}],
    "gender": "male",
    "birthDate": "1990-01-01"
  }'
```

### 2. Test des permissions

```bash
# Essayer d'accéder sans token (devrait retourner 401)
curl http://localhost:8000/api/patients/

# Essayer avec un token invalide
curl -H "Authorization: Bearer invalid_token" \
  http://localhost:8000/api/patients/
```

### 3. Test de pagination

```bash
TOKEN="your_token_here"

# Récupérer page 1
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/patients/?page=1&page_size=10"

# Récupérer page 2
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:8000/api/patients/?page=2&page_size=10"
```

## Performance Tests

### Mesurer le temps de réponse

```bash
# Avec curl
curl -w '@curl-format.txt' -o /dev/null -s \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/patients/
```

Fichier `curl-format.txt`:
```
    time_namelookup:  %{time_namelookup}s
    time_connect:     %{time_connect}s
    time_appconnect:  %{time_appconnect}s
    time_pretransfer: %{time_pretransfer}s
    time_redirect:    %{time_redirect}s
    time_starttransfer: %{time_starttransfer}s
    ----------
    time_total:       %{time_total}s
```

## Test des Modèles FHIR

### Valider la conformité FHIR

1. [ ] Les patients retournent le resourceType "Patient"
2. [ ] Les observations retournent le resourceType "Observation"
3. [ ] Les identifiers sont au bon format
4. [ ] Les dates sont en ISO 8601
5. [ ] Les valeurs quantitatives ont unité et code

## Test des Erreurs Courantes

### 1. CORS Error

**Symptôme**: Erreur CORS dans la console du navigateur

**Solution**:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:4200",
]
```

### 2. Token Expiré

**Symptôme**: Erreur 401 après quelques heures

**Solution**: Le token expire délibérément, implémentez la rotation

### 3. Données Non Mises à Jour

**Symptôme**: Les changements n'apparaissent pas

**Solution**: Actualiser la page ou vérifier la cache

## Checklist Final

Avant de passer en production, vérifiez:

### Backend
- [ ] DEBUG = False en production
- [ ] ALLOWED_HOSTS configuré correctement
- [ ] BASE de données configurée (PostgreSQL recommandé)
- [ ] SECRET_KEY unique et sécurisé
- [ ] HTTPS forcé (SECURE_SSL_REDIRECT = True)
- [ ] CORS restreint aux domaines autorisés
- [ ] Tous les tests passent
- [ ] Coverage > 80%

### Frontend
- [ ] Build de production: `ng build --configuration production`
- [ ] Aucune erreur de console
- [ ] Aucun warning de déploiement
- [ ] ServiceWorker configuré (si nécessaire)
- [ ] Performance: Lighthouse score > 80

## Rapports de Test

### Créer un rapport

```bash
# Frontend
ng test --code-coverage --watch=false
# Les rapports sont dans coverage/

# Backend  
coverage run manage.py test
coverage report
coverage html  # Génère un rapport HTML
```

## Support

Si vous rencontrez des problèmes:
1. Vérifier les logs console (F12 dans le navigateur)
2. Vérifier les logs serveur (terminal Django)
3. Utiliser Postman pour tester les endpoints
4. Consulter la documentation Swagger: http://localhost:8000/api/docs/

## Ressources

- [Swagger/OpenAPI](http://localhost:8000/api/docs/)
- [ReDoc](http://localhost:8000/api/redoc/) (alternative)
- [Django Admin](http://localhost:8000/admin/)

Bonne chance avec vos tests! 🧪
