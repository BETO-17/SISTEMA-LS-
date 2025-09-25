from django.shortcuts import render
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .models import Landmark, NumberLandmark


#guarda los landamark de letras
@csrf_exempt
def guardar_landmarks(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            letra = data.get("letra")
            puntos = data.get("puntos")  # lista de 21 elementos con [x,y,z]

            if not letra or not puntos or len(puntos) != 21:
                return JsonResponse({"error": "Datos inválidos"}, status=400)

            landmark = Landmark(
                letra=letra,
                **{f"x{i}": puntos[i][0] for i in range(21)},
                **{f"y{i}": puntos[i][1] for i in range(21)},
                **{f"z{i}": puntos[i][2] for i in range(21)},
            )
            landmark.save()

            return JsonResponse({"success": True, "id": landmark.id})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método no permitido"}, status=405)


#guarda los landamark de numeros 
@csrf_exempt
def guardar_numeros(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            etiqueta = data.get("etiqueta")  # ej: "5", "10", "123"
            puntos = data.get("puntos")      # lista de 21 elementos con [x,y,z]

            if not etiqueta or not puntos or len(puntos) != 21:
                return JsonResponse({"error": "Datos inválidos"}, status=400)

            numero = NumberLandmark(
                etiqueta=etiqueta,
                **{f"x{i}": puntos[i][0] for i in range(21)},
                **{f"y{i}": puntos[i][1] for i in range(21)},
                **{f"z{i}": puntos[i][2] for i in range(21)},
            )
            numero.save()

            return JsonResponse({"success": True, "id": numero.id})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método no permitido"}, status=405)