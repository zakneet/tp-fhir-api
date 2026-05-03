from rest_framework import serializers
from .models import Patient, Observation
from fhir.resources.patient import Patient as FHIRPatient
from fhir.resources.observation import Observation as FHIRObservation
from drf_spectacular.utils import extend_schema_field


class PatientFHIRSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = ['id', 'identifier', 'family_name', 'given_name', 'gender', 'birth_date']
        examples = [
            {
                "id": 1,
                "identifier": "123e4567-e89b-12d3-a456-426614174000",
                "family_name": "Dupont",
                "given_name": "Jean",
                "gender": "male",
                "birth_date": "1970-03-15"
            },
            {
                "id": 2,
                "identifier": "987e6543-e89b-12d3-a456-426614174111",
                "family_name": "Martin",
                "given_name": "Marie",
                "gender": "female",
                "birth_date": "1985-07-22"
            }
        ]

    def to_representation(self, instance):
        fhir_data = {
            "resourceType": "Patient",
            "id": str(instance.id),
            "identifier": [{
                "system": "https://hopital.fr/identifiers",
                "value": str(instance.identifier)
            }],
            "name": [{
                "family": instance.family_name,
                "given": [instance.given_name]
            }],
            "gender": instance.gender,
            "birthDate": instance.birth_date.isoformat(),
            "meta": {"lastUpdated": instance.updated_at.isoformat()}
        }
        try:
            return FHIRPatient(**fhir_data).dict()
        except Exception:
            # fallback si validation FHIR échoue
            return fhir_data

    def to_internal_value(self, data):
        if data.get('resourceType') != 'Patient':
            raise serializers.ValidationError({"resourceType": "Doit être 'Patient'"})

        internal_data = {
            "identifier": data['identifier'][0]['value'] if data.get('identifier') else None,
            "family_name": data['name'][0]['family'] if data.get('name') else None,
            "given_name": data['name'][0]['given'][0] if data.get('name') else None,
            "gender": data.get('gender'),
            "birth_date": data.get('birthDate')
        }
        return super().to_internal_value(internal_data)


class ObservationFHIRSerializer(serializers.ModelSerializer):
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(),
        source='patient',
        write_only=True
    )

    class Meta:
        model = Observation
        fields = ['id', 'patient_id', 'observation_type', 'value', 'unit', 'effective_date']

    def to_representation(self, instance):
        loinc = {
            'blood-pressure': '85354-9',
            'heart-rate': '8867-4',
            'temperature': '8310-5',
            'weight': '29463-7',
            'height': '8302-2'
        }

        fhir_data = {
            "resourceType": "Observation",
            "id": str(instance.id),
            "status": "final",
            "code": {
                "coding": [{
                    "system": "http://loinc.org",
                    "code": loinc.get(instance.observation_type, 'unknown'),
                    "display": instance.get_observation_type_display()
                }]
            },
            "subject": {
                "reference": f"Patient/{instance.patient.id}",
                "display": f"{instance.patient.family_name} {instance.patient.given_name}"
            },
            "effectiveDateTime": instance.effective_date.isoformat(),
            "valueQuantity": {
                "value": float(instance.value),
                "unit": instance.unit,
                "system": "http://unitsofmeasure.org",
                "code": instance.unit
            },
            "issued": instance.created_at.isoformat()
        }

        # optionnel: validation stricte via fhir.resources
        try:
            FHIRObservation(**fhir_data)
        except Exception:
            pass
        
        return fhir_data

        return fhir_data