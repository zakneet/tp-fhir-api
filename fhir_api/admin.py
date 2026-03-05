from django.contrib import admin
from .models import Patient, Observation

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ("id", "identifier", "family_name", "given_name", "gender", "birth_date", "created_at")
    search_fields = ("family_name", "given_name", "identifier")
    list_filter = ("gender",)

@admin.register(Observation)
class ObservationAdmin(admin.ModelAdmin):
    list_display = ("id", "patient", "observation_type", "value", "unit", "effective_date", "created_at")
    list_filter = ("observation_type", "effective_date")
    search_fields = ("patient__family_name", "patient__given_name")
