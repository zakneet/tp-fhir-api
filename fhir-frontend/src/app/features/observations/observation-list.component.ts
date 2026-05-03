import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ObservationService } from '../../core/services/observation.service';
import { PatientService } from '../../core/services/patient.service';
import { Observation, OBSERVATION_TYPES } from '../../models/observation.model';
import { Patient } from '../../models/patient.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-observation-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './observation-list.component.html',
  styleUrls: ['./observation-list.component.css']
})
export class ObservationListComponent implements OnInit, OnDestroy {
  observations: Observation[] = [];
  patients: Patient[] = [];
  loading = false;
  error = '';

  // Filtres
  selectedPatientId = '';
  selectedObsType = '';
  dateFrom = '';
  dateTo = '';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  // Types d'observation pour le dropdown
  observationTypes = OBSERVATION_TYPES;

  private destroy$ = new Subject<void>();

  constructor(
    private observationService: ObservationService,
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.loadObservations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Charge la liste des patients pour le filtre
   */
  private loadPatients(): void {
    this.patientService.getPatients(undefined, undefined, 1, 100)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.patients = response.results;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des patients:', error);
        }
      });
  }

  /**
   * Charge la liste des observations
   */
  loadObservations(): void {
    this.loading = true;
    this.error = '';

    this.observationService.getObservations(
      this.selectedPatientId || undefined,
      this.selectedObsType || undefined,
      this.dateFrom || undefined,
      this.dateTo || undefined,
      this.currentPage,
      this.pageSize
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.observations = response.results;
          this.totalCount = response.count || 0;
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Gère les changements de filtres
   */
  onFilterChange(): void {
    this.currentPage = 1;
    this.loadObservations();
  }

  /**
   * Navigue vers le détail d'une observation
   */
  viewObservation(id?: string | number): void {
    if (id) {
      this.router.navigate(['/observations', id]);
    }
  }

  /**
   * Navigue vers la création d'une observation
   */
  createObservation(): void {
    this.router.navigate(['/observations', 'new']);
  }

  /**
   * Supprime une observation
   */
  deleteObservation(id?: string | number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (id && confirm('Êtes-vous sûr de vouloir supprimer cette observation ?')) {
      this.observationService.deleteObservation(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadObservations();
          },
          error: (error) => {
            this.error = error.message;
          }
        });
    }
  }

  /**
   * Change de page
   */
  goToPage(page: number): void {
    if (page > 0 && page <= Math.ceil(this.totalCount / this.pageSize)) {
      this.currentPage = page;
      this.loadObservations();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  get paginationArray(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  /**
   * Récupère le nom du patient
   */
  getPatientName(patientId: string): string {
    const patient = this.patients.find(p => p.id?.toString() === patientId);
    return patient
      ? `${patient.name[0]?.family} ${patient.name[0]?.given[0]}`
      : 'Inconnu';
  }
}
