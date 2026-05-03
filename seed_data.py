#!/usr/bin/env python
"""
Script to seed example patients and observations into the database
"""
import os
import django
from datetime import datetime, timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from fhir_api.models import Patient, Observation
from decimal import Decimal

def create_example_patients():
    """Create example patients"""
    patients_data = [
        {
            'family_name': 'racedeau',
            'given_name': 'Jean',
            'gender': 'male',
            'birth_date': '1970-03-15'
        },
        {
            'family_name': 'Martin',
            'given_name': 'Marie',
            'gender': 'female',
            'birth_date': '1985-07-22'
        },
        {
            'family_name': 'Bernard',
            'given_name': 'Pierre',
            'gender': 'male',
            'birth_date': '1965-11-08'
        },
        {
            'family_name': 'Dubois',
            'given_name': 'Sophie',
            'gender': 'female',
            'birth_date': '1992-01-30'
        },
        {
            'family_name': 'Moreau',
            'given_name': 'Luc',
            'gender': 'male',
            'birth_date': '1978-05-12'
        },
    ]
    
    patients = []
    for data in patients_data:
        patient, created = Patient.objects.get_or_create(
            family_name=data['family_name'],
            given_name=data['given_name'],
            defaults={
                'gender': data['gender'],
                'birth_date': data['birth_date']
            }
        )
        patients.append(patient)
        if created:
            print(f"✓ Created patient: {patient.family_name} {patient.given_name}")
        else:
            print(f"→ Patient already exists: {patient.family_name} {patient.given_name}")
    
    return patients

def create_example_observations(patients):
    """Create example observations for patients"""
    observation_data = [
        ('blood-pressure', Decimal('120'), 'mmHg'),
        ('heart-rate', Decimal('72'), 'bpm'),
        ('temperature', Decimal('37.0'), '°C'),
        ('weight', Decimal('75'), 'kg'),
        ('height', Decimal('180'), 'cm'),
    ]
    
    for patient in patients:
        for obs_type, value, unit in observation_data:
            observation, created = Observation.objects.get_or_create(
                patient=patient,
                observation_type=obs_type,
                effective_date=timezone.now() - timedelta(days=1),
                defaults={
                    'value': value,
                    'unit': unit,
                }
            )
            if created:
                print(f"✓ Created observation: {patient.family_name} - {obs_type}")
    
    print(f"\n✓ Created {len(observation_data)} observations for each patient")

if __name__ == '__main__':
    print("🌱 Seeding database with example data...\n")
    patients = create_example_patients()
    create_example_observations(patients)
    print("\n✅ Seed data created successfully!")
