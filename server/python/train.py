# server/python/train.py
import os
import json
import face_recognition
import numpy as np

# edit if your folder differs
PHOTOS_DIR = r"C:\Users\vaghe\OneDrive\Desktop\smart-class-monitoring\server\uploads\student_photos"
ENCODINGS_FILE = r"C:\Users\vaghe\OneDrive\Desktop\smart-class-monitoring\server\python\encodings.json"

def load_existing():
    if os.path.exists(ENCODINGS_FILE):
        try:
            with open(ENCODINGS_FILE, "r", encoding="utf-8") as f:
                return json.load(f) or {}
        except:
            return {}
    return {}

def save(data):
    with open(ENCODINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print("Saved encodings:", ENCODINGS_FILE)

def extract_student_id(filename):
    # expected STU001_Name.ext or STU001NAME.ext - take first underscore or first non-alnum boundary
    base = os.path.splitext(filename)[0]
    parts = base.split("_", 1)
    if len(parts) >= 2:
        return parts[0]
    # fallback: take first contiguous alpha-numeric prefix that contains digits
    for i in range(3, len(base)+1):
        prefix = base[:i]
        if any(c.isdigit() for c in prefix) and prefix.startswith("ST"):
            return prefix
    return base

def main():
    if not os.path.exists(PHOTOS_DIR):
        print("Photo dir missing:", PHOTOS_DIR)
        return

    out = load_existing()

    files = [f for f in os.listdir(PHOTOS_DIR) if f.lower().endswith((".jpg", ".jpeg", ".png"))]
    print("Processing", len(files), "files")

    for fname in files:
        path = os.path.join(PHOTOS_DIR, fname)
        try:
            img = face_recognition.load_image_file(path)
            # detect with hog for speed (or 'cnn' if you have GPU)
            locs = face_recognition.face_locations(img, model="hog")
            if not locs:
                print("No face in", fname)
                continue

            encs = face_recognition.face_encodings(img, known_face_locations=locs)
            if not encs:
                print("No encodings in", fname)
                continue

            enc = encs[0].tolist()
            studentId = extract_student_id(fname)
            key = fname  # keep filename as key (compatible)

            # if key exists, append to encodings list; else create new
            entry = out.get(key, None)
            if entry is None:
                out[key] = {
                    "studentId": studentId,
                    "name": key.replace(".jpg", "").replace(".png", "").replace(".jpeg", ""),
                    "encodings": [enc]
                }
            else:
                # support existing 'encoding' or 'encodings' older formats:
                if "encodings" in entry and isinstance(entry["encodings"], list):
                    entry["encodings"].append(enc)
                elif "encoding" in entry:
                    entry["encodings"] = [entry.get("encoding"), enc]
                    entry.pop("encoding", None)
                else:
                    entry["encodings"] = [enc]

            print("Encoded", fname, "-> studentId:", studentId)
        except Exception as e:
            print("Error processing", fname, e)

    # Save consolidated file
    save(out)
    print("Training complete. Total students (file-keys):", len(out))

if __name__ == "__main__":
    main()
