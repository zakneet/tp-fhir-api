import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PatientService } from './patient.service';
import { Patient, PatientIdentifier, PatientName } from '../../models/patient.model';

describe('PatientService', () => {
  let service: PatientService;
  let httpMock: HttpTestingController;

  const mockPatient: Patient = {
    id: '1',
    resourceType: 'Patient',
    identifier: [{
      system: 'https://hopital.fr/identifiers',
      value: 'PAT-001'
    }] as PatientIdentifier[],
    name: [{
      family: 'Dupont',
      given: ['Jean']
    }] as PatientName[],
    gender: 'male',
    birthDate: '1990-01-15'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PatientService]
    });

    service = TestBed.inject(PatientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getPatients', () => {
    it('should fetch patients list', () => {
      const mockResponse = {
        results: [mockPatient],
        count: 1
      };

      service.getPatients().subscribe(response => {
        expect(response.results.length).toBe(1);
        expect(response.results[0].id).toBe('1');
      });

      const req = httpMock.expectOne('http://localhost:8000/api/patients');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should support gender filter', () => {
      const mockResponse = { results: [mockPatient], count: 1 };

      service.getPatients('male').subscribe(() => {});

      const req = httpMock.expectOne(request =>
        request.url === 'http://localhost:8000/api/patients' &&
        request.params.get('gender') === 'male'
      );
      req.flush(mockResponse);
    });
  });

  describe('getPatient', () => {
    it('should fetch a single patient', () => {
      service.getPatient('1').subscribe(patient => {
        expect(patient.id).toBe('1');
        expect(patient.name[0].family).toBe('Dupont');
      });

      const req = httpMock.expectOne('http://localhost:8000/api/patients/1/');
      expect(req.request.method).toBe('GET');
      req.flush(mockPatient);
    });
  });

  describe('createPatient', () => {
    it('should create a new patient', () => {
      const newPatient = { ...mockPatient };
      delete newPatient.id;

      service.createPatient(newPatient).subscribe(createdPatient => {
        expect(createdPatient.id).toBe('1');
      });

      const req = httpMock.expectOne('http://localhost:8000/api/patients');
      expect(req.request.method).toBe('POST');
      req.flush(mockPatient);
    });

    it('should reject patient with invalid resourceType', () => {
      const invalidPatient: any = {
        ...mockPatient,
        resourceType: 'InvalidType'
      };

      service.createPatient(invalidPatient).subscribe({
        error: (error) => {
          expect(error.message).toContain('invalide');
        }
      });
    });
  });

  describe('updatePatient', () => {
    it('should update an existing patient', () => {
      const updatedPatient = { ...mockPatient, name: [{ family: 'Martin', given: ['Pierre'] }] as PatientName[] };

      service.updatePatient('1', updatedPatient).subscribe(patient => {
        expect(patient.name[0].family).toBe('Martin');
      });

      const req = httpMock.expectOne('http://localhost:8000/api/patients/1/');
      expect(req.request.method).toBe('PUT');
      req.flush(updatedPatient);
    });
  });

  describe('deletePatient', () => {
    it('should delete a patient', () => {
      service.deletePatient('1').subscribe(() => {});

      const req = httpMock.expectOne('http://localhost:8000/api/patients/1/');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });
});

