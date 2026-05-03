from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from drf_spectacular.utils import extend_schema, extend_schema_field, OpenApiExample
from drf_spectacular.openapi import OpenApiTypes

from .models import Patient, Observation
from .serializers import PatientFHIRSerializer, ObservationFHIRSerializer
from rest_framework.permissions import IsAuthenticated


class PatientViewSet(viewsets.ModelViewSet):
    """
    API endpoint for FHIR-compliant Patient resource management.
    
    Supports CRUD operations on patient records.
    """
    queryset = Patient.objects.all().order_by('-created_at')
    serializer_class = PatientFHIRSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = ['gender', 'family_name']
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=PatientFHIRSerializer,
        responses=PatientFHIRSerializer,
        examples=[
            OpenApiExample(
                'Patient Example 1',
                value={
                    "id": 1,
                    "identifier": "123e4567-e89b-12d3-a456-426614174000",
                    "family_name": "Dupont",
                    "given_name": "Jean",
                    "gender": "male",
                    "birth_date": "1970-03-15"
                },
            ),
            OpenApiExample(
                'Patient Example 2',
                value={
                    "id": 2,
                    "identifier": "987e6543-e89b-12d3-a456-426614174111",
                    "family_name": "Martin",
                    "given_name": "Marie",
                    "gender": "female",
                    "birth_date": "1985-07-22"
                },
            ),
        ]
    )
    def create(self, request, *args, **kwargs):
        """Create a new patient record."""
        return super().create(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def observations(self, request, pk=None):
        """Get all observations for a specific patient."""
        obs = self.get_object().observations.all()

        date_from = request.query_params.get('date_from')
        if date_from:
            obs = obs.filter(effective_date__gte=date_from)

        date_to = request.query_params.get('date_to')
        if date_to:
            obs = obs.filter(effective_date__lte=date_to)

        return Response(ObservationFHIRSerializer(obs, many=True).data)


class ObservationViewSet(viewsets.ModelViewSet):
    """
    API endpoint for FHIR-compliant Observation resource management.
    
    Represents clinical measurements and observations associated with patients.
    """
    queryset = Observation.objects.select_related('patient').all().order_by('-effective_date')
    serializer_class = ObservationFHIRSerializer
    filter_backends = [filters.DjangoFilterBackend]
    filterset_fields = {
        'patient': ['exact'],
        'observation_type': ['exact'],
        'effective_date': ['gte', 'lte', 'exact'],
        'value': ['gte', 'lte'],
    }
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request=ObservationFHIRSerializer,
        responses=ObservationFHIRSerializer,
        examples=[
            OpenApiExample(
                'Blood Pressure Observation',
                value={
                    "id": 1,
                    "patient_id": 1,
                    "observation_type": "blood-pressure",
                    "value": "120",
                    "unit": "mmHg",
                    "effective_date": "2026-04-21T10:30:00Z"
                },
            ),
            OpenApiExample(
                'Heart Rate Observation',
                value={
                    "id": 2,
                    "patient_id": 1,
                    "observation_type": "heart-rate",
                    "value": "72",
                    "unit": "bpm",
                    "effective_date": "2026-04-21T10:30:00Z"
                },
            ),
            OpenApiExample(
                'Temperature Observation',
                value={
                    "id": 3,
                    "patient_id": 2,
                    "observation_type": "temperature",
                    "value": "37.0",
                    "unit": "°C",
                    "effective_date": "2026-04-21T11:00:00Z"
                },
            ),
        ]
    )
    def create(self, request, *args, **kwargs):
        """Create a new observation record."""
        return super().create(request, *args, **kwargs)