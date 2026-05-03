import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientService } from '../../core/services/patient.service';
import { ObservationService } from '../../core/services/observation.service';
import { Patient } from '../../models/patient.model';
import { Observation } from '../../models/observation.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './patient-detail.component.html',
  styleUrls: ['./patient-detail.component.css']
})
export class PatientDetailComponent implements OnInit, OnDestroy {
  patient: Patient | null = null;
  observations: Observation[] = [];
  loading = false;
  error = '';
  
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private observationService: ObservationService
  ) {}

  ngOnInit(): void {
    this.loadPatient();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge les détails du patient et ses observations
   */
  private loadPatient(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'ID du patient non fourni';
      return;
    }

    this.loading = true;
    this.error = '';

    this.patientService.getPatient(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (patient) => {
          this.patient = patient;
          this.loadObservations(id);
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Charge les observations du patient
   */
  private loadObservations(patientId: string): void {
    this.observationService.getPatientObservations(patientId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.observations = response.results;
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des observations:', error);
          this.loading = false;
        }
      });
  }

  /**
   * Navigue vers l'édition du patient
   */
  editPatient(): void {
    if (this.patient?.id) {
      this.router.navigate(['/patients', this.patient.id, 'edit']);
    }
  }

  /**
   * Supprime le patient
   */
  deletePatient(): void {
    if (this.patient?.id && confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      this.patientService.deletePatient(this.patient.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.router.navigate(['/patients']);
          },
          error: (error) => {
            this.error = error.message;
          }
        });
    }
  }

  /**
   * Retour à la liste
   */
  goBack(): void {
    this.router.navigate(['/patients']);
  }

  /**
   * Calcule l'âge du patient
   */
  getAge(): number | null {
    if (!this.patient?.birthDate) {
      return null;
    }
    const birthDate = new Date(this.patient.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
