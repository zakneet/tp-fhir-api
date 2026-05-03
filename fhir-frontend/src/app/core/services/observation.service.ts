import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Observation, ObservationListResponse } from '../../models/observation.model';

@Injectable({
  providedIn: 'root'
})
export class ObservationService {
  private readonly API_URL = 'http://localhost:8000/api/observations';

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste de toutes les observations
   */
  getObservations(
    patientId?: string | number,
    observationType?: string,
    dateFrom?: string,
    dateTo?: string,
    page?: number,
    pageSize?: number
  ): Observable<ObservationListResponse> {
    let params = new HttpParams();
    
    if (patientId) {
      params = params.set('patient', patientId.toString());
    }
    if (observationType) {
      params = params.set('observation_type', observationType);
    }
    if (dateFrom) {
      params = params.set('effective_date__gte', dateFrom);
    }
    if (dateTo) {
      params = params.set('effective_date__lte', dateTo);
    }
    if (page) {
      params = params.set('page', page.toString());
    }
    if (pageSize) {
      params = params.set('page_size', pageSize.toString());
    }

    return this.http.get<ObservationListResponse>(this.API_URL, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère une observation par son ID
   */
  getObservation(id: string | number): Observable<Observation> {
    return this.http.get<Observation>(`${this.API_URL}/${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crée une nouvelle observation
   */
  createObservation(observation: Observation): Observable<Observation> {
    if (!observation.resourceType || observation.resourceType !== 'Observation') {
      return throwError(() => new Error('Type de ressource invalide'));
    }
    
    return this.http.post<Observation>(this.API_URL, observation).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Met à jour une observation existante
   */
  updateObservation(id: string | number, observation: Observation): Observable<Observation> {
    return this.http.put<Observation>(`${this.API_URL}/${id}/`, observation).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Supprime une observation
   */
  deleteObservation(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère les observations d'un patient spécifique
   */
  getPatientObservations(
    patientId: string | number,
    dateFrom?: string,
    dateTo?: string
  ): Observable<ObservationListResponse> {
    return this.getObservations(patientId, undefined, dateFrom, dateTo);
  }

  /**
   * Gère les erreurs HTTP
   */
  private handleError(error: any) {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Erreur client
      errorMessage = error.error.message;
    } else if (error.status) {
      // Erreur serveur
      if (error.error && typeof error.error === 'object') {
        const messages = Object.values(error.error).flat();
        errorMessage = messages.join(', ');
      } else {
        errorMessage = `Erreur ${error.status}: ${error.statusText}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
