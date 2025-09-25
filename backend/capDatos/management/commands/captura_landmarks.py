import cv2
import mediapipe as mp
import csv, os, shutil
from datetime import datetime
from django.core.management.base import BaseCommand
from capDatos.models import Landmark

DATASET_DIR = "dataset"
BACKUP_DIR = "backups"
os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(os.path.join(BACKUP_DIR, "csv"), exist_ok=True)
os.makedirs(os.path.join(BACKUP_DIR, "db"), exist_ok=True)

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

def backup_csv(file_path, letra):
    if os.path.exists(file_path):
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_name = os.path.join(BACKUP_DIR, "csv", f"{letra}_{timestamp}.csv")
        shutil.copy(file_path, backup_name)

class Command(BaseCommand):
    help = "Captura landmarks de la cámara y guarda en DB + CSV + backup"

    def handle(self, *args, **kwargs):
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)

        with mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=2,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        ) as hands:

            self.stdout.write("✅ Presiona una letra (A-Z) para capturar, ESC para salir.")

            while True:
                ret, frame = cap.read()
                if not ret:
                    self.stdout.write("❌ No se pudo acceder a la cámara")
                    break

                frame = cv2.flip(frame, 1)
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                results = hands.process(frame_rgb)

                if results.multi_hand_landmarks:
                    for hand_landmarks in results.multi_hand_landmarks:
                        mp_drawing.draw_landmarks(frame, hand_landmarks, mp_hands.HAND_CONNECTIONS)

                cv2.imshow("Captura de manos", frame)
                key = cv2.waitKey(1) & 0xFF

                if key == 27:  # ESC
                    self.stdout.write("👋 Saliendo...")
                    break

                if results.multi_hand_landmarks and (65 <= key <= 90 or 97 <= key <= 122):
                    letra = chr(key).upper()
                    csv_file = os.path.join(DATASET_DIR, f"{letra}.csv")
                    file_exists = os.path.isfile(csv_file)

                    with open(csv_file, mode="a", newline="") as f:
                        writer = csv.writer(f)
                        if not file_exists:
                            header = []
                            for i in range(21):
                                header += [f"x{i}", f"y{i}", f"z{i}"]
                            writer.writerow(["letra"] + header)

                        for hand_landmarks in results.multi_hand_landmarks:
                            data = []
                            for lm in hand_landmarks.landmark:
                                data.extend([lm.x, lm.y, lm.z])

                            # Guardar en BD
                            landmark = Landmark(
                                letra=letra,
                                **{f"x{i}": data[i*3] for i in range(21)},
                                **{f"y{i}": data[i*3+1] for i in range(21)},
                                **{f"z{i}": data[i*3+2] for i in range(21)},
                            )
                            landmark.save()

                            # Guardar en CSV
                            writer.writerow([letra] + data)

                    backup_csv(csv_file, letra)
                    self.stdout.write(f"[✔] Guardado en CSV, BD y backup para letra '{letra}'")

        cap.release()
        cv2.destroyAllWindows()
