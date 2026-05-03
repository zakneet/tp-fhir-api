export interface CodeableConcept {
  coding: Array<{
    system: string;
    code: string;
    display: string;
  }>;
}

export interface Quantity {
  value: number;
  unit: string;
  system: string;
  code: string;
}

export interface Reference {
  reference: string;
  display?: string;
}

export interface Observation {
  id?: string | number;
  resourceType: 'Observation';
  status: 'final' | 'preliminary' | 'amended' | 'corrected' | 'cancelled';
  code: CodeableConcept;
  subject: Reference;
  effectiveDateTime: string;
  valueQuantity: Quantity;
  issued: string;
}

export interface ObservationListResponse {
  results: Observation[];
  count?: number;
  next?: string;
  previous?: string;
}

export type ObservationType = 'blood-pressure' | 'heart-rate' | 'temperature' | 'weight' | 'height';

export const OBSERVATION_TYPES = {
  'blood-pressure': 'Tension artérielle',
  'heart-rate': 'Fréquence cardiaque',
  'temperature': 'Température corporelle',
  'weight': 'Poids',
  'height': 'Taille'
} as const;
