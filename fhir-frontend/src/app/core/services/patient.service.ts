import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Patient, PatientListResponse } from '../../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly API_URL = 'http://localhost:8000/api/patients';

  constructor(private http: HttpClient) {}

  /**
   * Récupère la liste de tous les patients
   */
  getPatients(
    gender?: string,
    familyName?: string,
    page?: number,
    pageSize?: number
  ): Observable<PatientListResponse> {
    let params = new HttpParams();
    
    if (gender) {
      params = params.set('gender', gender);
    }
    if (familyName) {
      params = params.set('family_name', familyName);
    }
    if (page) {
      params = params.set('page', page.toString());
    }
    if (pageSize) {
      params = params.set('page_size', pageSize.toString());
    }

    return this.http.get<PatientListResponse>(this.API_URL, { params }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Récupère un patient par son ID
   */
  getPatient(id: string | number): Observable<Patient> {
    return this.http.get<Patient>(`${this.API_URL}/${id}/`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Crée un nouveau patient
   */
  createPatient(patient: Patient): Observable<Patient> {
    if (!patient.resourceType || patient.resourceType !== 'Patient') {
      return throwError(() => new Error('Type de ressource invalide'));
    }
    
    return this.http.post<Patient>(this.API_URL, patient).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Met à jour un patient existant
   */
  updatePatient(id: string | number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.API_URL}/${id}/`, patient).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Supprime un patient
   */
  deletePatient(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}/`).pipe(
      catchError(this.handleError)
    );
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
        // Extricate les messages d'erreur de la réponse
        const messages = Object.values(error.error).flat();
        errorMessage = messages.join(', ');
      } else {
        errorMessage = `Erreur ${error.status}: ${error.statusText}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
