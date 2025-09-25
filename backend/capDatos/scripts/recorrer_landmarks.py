from capDatos.models import Landmark

def recorrer_landmarks():
    # Obtenemos todos los registros
    landmarks = Landmark.objects.all()

    for lm in landmarks:
        print(f"Letra: {lm.letra} | Timestamp: {lm.timestamp}")

        puntos = []
        for i in range(21):  # 21 puntos de mediapipe
            x = getattr(lm, f"x{i}")
            y = getattr(lm, f"y{i}")
            z = getattr(lm, f"z{i}")
            puntos.append((x, y, z))

        # Mostrar o procesar los landmarks
        for idx, (x, y, z) in enumerate(puntos):
            print(f" Punto {idx}: x={x}, y={y}, z={z}")

        print("="*40)


