import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ObservationService } from './observation.service';
import { Observation } from '../../models/observation.model';

describe('ObservationService', () => {
  let service: ObservationService;
  let httpMock: HttpTestingController;

  const mockObservation: Observation = {
    id: '1',
    resourceType: 'Observation',
    status: 'final',
    code: {
      coding: [{
        system: 'http://loinc.org',
        code: '8867-4',
        display: 'Fréquence cardiaque'
      }]
    },
    subject: {
      reference: 'Patient/1',
      display: 'Jean Dupont'
    },
    effectiveDateTime: '2023-09-01T10:30:00Z',
    valueQuantity: {
      value: 72,
      unit: 'bpm',
      system: 'http://unitsofmeasure.org',
      code: 'bpm'
    },
    issued: '2023-09-01T10:30:00Z'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ObservationService]
    });

    service = TestBed.inject(ObservationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('getObservations', () => {
    it('should fetch observations list', () => {
      const mockResponse = {
        results: [mockObservation],
        count: 1
      };

      service.getObservations().subscribe(response => {
        expect(response.results.length).toBe(1);
        expect(response.results[0].id).toBe('1');
      });

      const req = httpMock.expectOne('http://localhost:8000/api/observations');
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });

    it('should support patient filter', () => {
      const mockResponse = { results: [mockObservation], count: 1 };

      service.getObservations('1').subscribe(() => {});

      const req = httpMock.expectOne(request =>
        request.url === 'http://localhost:8000/api/observations' &&
        request.params.get('patient') === '1'
      );
      req.flush(mockResponse);
    });
  });

  describe('getObservation', () => {
    it('should fetch a single observation', () => {
      service.getObservation('1').subscribe(observation => {
        expect(observation.id).toBe('1');
        expect(observation.valueQuantity.value).toBe(72);
      });

      const req = httpMock.expectOne('http://localhost:8000/api/observations/1/');
      expect(req.request.method).toBe('GET');
      req.flush(mockObservation);
    });
  });

  describe('createObservation', () => {
    it('should create a new observation', () => {
      const newObservation = { ...mockObservation };
      delete newObservation.id;

      service.createObservation(newObservation).subscribe(created => {
        expect(created.id).toBe('1');
      });

      const req = httpMock.expectOne('http://localhost:8000/api/observations');
      expect(req.request.method).toBe('POST');
      req.flush(mockObservation);
    });
  });

  describe('deleteObservation', () => {
    it('should delete an observation', () => {
      service.deleteObservation('obs1').subscribe(() => {});

      const req = httpMock.expectOne('http://localhost:8000/api/observations/obs1/');
      expect(req.request.method).toBe('DELETE');
      req.flush({});
    });
  });

  describe('getPatientObservations', () => {
    it('should fetch observations for a specific patient', () => {
      const mockResponse = { results: [mockObservation], count: 1 };

      service.getPatientObservations('1').subscribe(() => {});

      const req = httpMock.expectOne(request =>
        request.url === 'http://localhost:8000/api/observations' &&
        request.params.get('patient') === '1'
      );
      req.flush(mockResponse);
    });
  });
});
