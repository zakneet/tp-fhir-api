import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../core/services/patient.service';
import { Patient } from '../../models/patient.model';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.css']
})
export class PatientListComponent implements OnInit, OnDestroy {
  patients: Patient[] = [];
  loading = false;
  error = '';
  
  // Filtre
  searchText = '';
  selectedGender = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;

  // Math for template
  Math = Math;

  private destroy$ = new Subject<void>();
  private searchSubject$ = new Subject<string>();

  constructor(
    private patientService: PatientService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Configure la recherche avec debounce
   */
  private setupSearch(): void {
    this.searchSubject$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadPatients();
      });
  }

  /**
   * Charge la liste des patients
   */
  loadPatients(): void {
    this.loading = true;
    this.error = '';

    this.patientService.getPatients(
      this.selectedGender || undefined,
      this.searchText || undefined,
      this.currentPage,
      this.pageSize
    ).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.patients = response.results;
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
   * Gère le changement de texte de recherche
   */
  onSearchChange(value: string): void {
    this.searchText = value;
    this.searchSubject$.next(value);
  }

  /**
   * Gère le changement de filtre de genre
   */
  onGenderFilter(gender: string): void {
    this.selectedGender = gender;
    this.currentPage = 1;
    this.loadPatients();
  }

  /**
   * Navigue vers le détail d'un patient
   */
  viewPatient(id?: string | number): void {
    if (id) {
      this.router.navigate(['/patients', id]);
    }
  }

  /**
   * Navigue vers le formulaire de création
   */
  createPatient(): void {
    this.router.navigate(['/patients', 'new']);
  }

  /**
   * Supprime un patient
   */
  deletePatient(id?: string | number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (id && confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      this.patientService.deletePatient(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadPatients();
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
      this.loadPatients();
    }
  }

  /**
   * Calcule le nombre total de pages
   */
  get totalPages(): number {
    return Math.ceil(this.totalCount / this.pageSize);
  }

  /**
   * Génère un tableau de numéros de page
   */
  get paginationArray(): number[] {
    const pages = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  }
}
