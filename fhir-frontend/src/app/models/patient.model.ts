export interface PatientIdentifier {
  system: string;
  value: string;
}

export interface PatientName {
  family: string;
  given: string[];
}

export interface Patient {
  id?: string | number;
  resourceType: 'Patient';
  identifier: PatientIdentifier[];
  name: PatientName[];
  gender: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string;
  meta?: {
    lastUpdated: string;
  };
}

export interface PatientListResponse {
  results: Patient[];
  count?: number;
  next?: string;
  previous?: string;
}
