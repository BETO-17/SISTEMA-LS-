from django.db import models


#models de abcdario
class Landmark(models.Model):
    letra = models.CharField(max_length=5)
    timestamp = models.DateTimeField(auto_now_add=True)

    # 21 puntos con x, y, z
    for i in range(21):
        locals()[f"x{i}"] = models.FloatField()
        locals()[f"y{i}"] = models.FloatField()
        locals()[f"z{i}"] = models.FloatField()

    def __str__(self):
        return f"{self.letra} - {self.timestamp}"

#model de numero
class NumberLandmark(models.Model):
    numeros = models.CharField(max_length=3)  # número o secuencia de números
    timestamp = models.DateTimeField(auto_now_add=True)

    # 21 puntos con x, y, z
    for i in range(21):
        locals()[f"x{i}"] = models.FloatField()
        locals()[f"y{i}"] = models.FloatField()
        locals()[f"z{i}"] = models.FloatField()

    def __str__(self):
        return f"{self.etiqueta} - {self.timestamp}"
