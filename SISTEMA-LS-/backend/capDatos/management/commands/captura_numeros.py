import cv2
import mediapipe as mp
import csv, os, shutil
from datetime import datetime
from django.core.management.base import BaseCommand
from capDatos.models import NumberLandmark  # 👈 importamos el modelo

DATASET_DIR = "dataset_numbers"
BACKUP_DIR = "backups"
os.makedirs(DATASET_DIR, exist_ok=True)
os.makedirs(os.path.join(BACKUP_DIR, "csv"), exist_ok=True)
os.makedirs(os.path.join(BACKUP_DIR, "db"), exist_ok=True)

mp_drawing = mp.solutions.drawing_utils
mp_hands = mp.solutions.hands

class Command(BaseCommand):
    help = "Captura landmarks para números y guarda en DB + CSV + backup"

    def handle(self, *args, **kwargs):
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
        input_buffer = ""

        with mp_hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            min_detection_confidence=0.7,
            min_tracking_confidence=0.7
        ) as hands:
            self.stdout.write("✅ Sistema iniciado.")
            self.stdout.write("➡ Presiona números (0-9) para armar etiqueta.")
            self.stdout.write("➡ ENTER para confirmar y guardar.")
            self.stdout.write("➡ ESC para salir.")

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

                cv2.putText(frame, f"Etiqueta: {input_buffer}", (50, 50),
                            cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 2)

                cv2.imshow("Captura de manos (Números)", frame)
                key = cv2.waitKey(1) & 0xFF

                if key == 27:  # ESC
                    self.stdout.write("👋 Saliendo...")
                    break

                if 48 <= key <= 57:  # 0–9
                    if len(input_buffer) < 3:
                        input_buffer += chr(key)
                        self.stdout.write(f"[📝] Buffer: {input_buffer}")

                if key == 8 and len(input_buffer) > 0:  # Backspace
                    input_buffer = input_buffer[:-1]
                    self.stdout.write(f"[🔙] Buffer: {input_buffer}")

                if key == 13 and results.multi_hand_landmarks and input_buffer != "":
                    number_label = input_buffer
                    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    self.stdout.write(f"[✔] Guardando captura para número: {number_label}")

                    # CSV
                    csv_file = os.path.join(DATASET_DIR, f"{number_label}.csv")
                    file_exists = os.path.isfile(csv_file)
                    with open(csv_file, mode="a", newline="") as f:
                        writer = csv.writer(f)
                        if not file_exists:
                            header = []
                            for i in range(21):
                                header += [f"x{i}", f"y{i}", f"z{i}"]
                            writer.writerow(header)

                        for hand_landmarks in results.multi_hand_landmarks:
                            data = []
                            for lm in hand_landmarks.landmark:
                                data.extend([lm.x, lm.y, lm.z])
                            writer.writerow(data)

                            # Guardar en DB con ORM
                            landmark = NumberLandmark(
                                numeros =number_label,
                                **{f"x{i}": data[i*3] for i in range(21)},
                                **{f"y{i}": data[i*3+1] for i in range(21)},
                                **{f"z{i}": data[i*3+2] for i in range(21)},
                            )
                            landmark.save()

                    # Backup de la DB
                    shutil.copy2("db.sqlite3",
                                 os.path.join(BACKUP_DIR, "db", f"numbers_{datetime.now().strftime('%H%M%S')}.db"))
                    self.stdout.write("💾 Backup realizado.")

                    input_buffer = ""

        cap.release()
        cv2.destroyAllWindows()
