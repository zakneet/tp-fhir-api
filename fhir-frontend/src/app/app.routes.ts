import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { PatientListComponent } from './features/patients/patient-list.component';
import { PatientDetailComponent } from './features/patients/patient-detail.component';
import { PatientFormComponent } from './features/patients/patient-form.component';
import { ObservationListComponent } from './features/observations/observation-list.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/patients', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  
  {
    path: 'patients',
    canActivate: [authGuard],
    children: [
      { path: '', component: PatientListComponent },
      { path: 'new', component: PatientFormComponent },
      { path: ':id', component: PatientDetailComponent },
      { path: ':id/edit', component: PatientFormComponent }
    ]
  },
  
  {
    path: 'observations',
    canActivate: [authGuard],
    children: [
      { path: '', component: ObservationListComponent },
      { path: 'new', component: PatientListComponent }
    ]
  },
  
  { path: '**', redirectTo: '/patients' }
];
