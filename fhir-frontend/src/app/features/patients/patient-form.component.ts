import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PatientService } from '../../core/services/patient.service';
import { Patient, PatientIdentifier, PatientName } from '../../models/patient.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.css']
})
export class PatientFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  submitted = false;
  loading = false;
  error = '';
  isEditing = false;
  patientId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.checkIfEditing();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Vérifie si on édite un patient existant
   */
  private checkIfEditing(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    if (this.patientId && this.patientId !== 'new') {
      this.isEditing = true;
      this.loadPatient(this.patientId);
    }
  }

  /**
   * Initialise le formulaire
   */
  private initializeForm(): void {
    this.form = this.formBuilder.group({
      familyName: ['', [Validators.required, Validators.minLength(2)]],
      givenName: ['', [Validators.required, Validators.minLength(2)]],
      gender: ['unknown', Validators.required],
      birthDate: ['', Validators.required]
    });
  }

  /**
   * Charge les données du patient pour édition
   */
  private loadPatient(id: string): void {
    this.loading = true;
    this.patientService.getPatient(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (patient) => {
          this.populateForm(patient);
          this.loading = false;
        },
        error: (error) => {
          this.error = error.message;
          this.loading = false;
        }
      });
  }

  /**
   * Remplit le formulaire avec les données du patient
   */
  private populateForm(patient: Patient): void {
    this.form.patchValue({
      familyName: patient.name[0]?.family || '',
      givenName: patient.name[0]?.given[0] || '',
      gender: patient.gender || 'unknown',
      birthDate: patient.birthDate || ''
    });
  }

  /**
   * Soumet le formulaire
   */
  onSubmit(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const patientData = this.buildPatientData();

    const request = this.isEditing && this.patientId
      ? this.patientService.updatePatient(this.patientId, patientData)
      : this.patientService.createPatient(patientData);

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (patient) => {
        this.router.navigate(['/patients', patient.id]);
      },
      error: (error) => {
        this.error = error.message;
        this.loading = false;
      }
    });
  }

  /**
   * Construit l'objet Patient à partir des données du formulaire
   */
  private buildPatientData(): Patient {
    const { familyName, givenName, gender, birthDate } = this.form.value;

    return {
      resourceType: 'Patient',
      identifier: [{
        system: 'https://hopital.fr/identifiers',
        value: this.generateUUID()
      }] as PatientIdentifier[],
      name: [{
        family: familyName,
        given: [givenName]
      }] as PatientName[],
      gender: gender,
      birthDate: birthDate
    };
  }

  /**
   * Génère un UUID simple
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Annule et retour à la liste ou au détail
   */
  cancel(): void {
    if (this.isEditing && this.patientId) {
      this.router.navigate(['/patients', this.patientId]);
    } else {
      this.router.navigate(['/patients']);
    }
  }

  get f() {
    return this.form.controls;
  }
}
