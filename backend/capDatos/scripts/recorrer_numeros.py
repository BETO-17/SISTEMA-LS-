from django.core.management.base import BaseCommand
from capDatos.models import NumberLandmark

def recorrer_numeros():
    # Obtenemos todos los registros de la tabla
    numeros= NumberLandmark.objects.all()

    for num in numeros:
        print(f"Número: {num.numero} | Timestamp: {num.timestamp}")

        puntos = []
        for i in range(21):  # 21 puntos de mediapipe
            x = getattr(num, f"x{i}")
            y = getattr(num, f"y{i}")
            z = getattr(num, f"z{i}")
            puntos.append((x, y, z))

        # Mostrar o procesar los landmarks
        for idx, (x, y, z) in enumerate(puntos):
            print(f" Punto {idx}: x={x}, y={y}, z={z}")

        print("=" * 40)
