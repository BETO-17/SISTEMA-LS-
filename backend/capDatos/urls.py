from django.urls import path
from .views import guardar_landmarks, guardar_numeros

urlpatterns = [
    path("guardar/letras/", guardar_landmarks, name="guardar_landmarks"),
    path("guardar/numeros/", guardar_numeros, name="guardar_numeros"),
]