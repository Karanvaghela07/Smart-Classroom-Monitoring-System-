# encode_single.py - FIXED TO USE SAME FORMAT AS train.py
import sys
import os
import json
import face_recognition

# Path to encodings.json
ENCODINGS_FILE = r"C:\Users\vaghe\OneDrive\Desktop\smart-class-monitoring\server\python\encodings.json"

def load_encodings():
    """Load existing encodings."""
    if not os.path.exists(ENCODINGS_FILE):
        return {}
    try:
        with open(ENCODINGS_FILE, "r", encoding="utf-8") as f:
            return json.load(f) or {}
    except:
        return {}

def save_encodings(data):
    """Save encodings to JSON file."""
    with open(ENCODINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)

def main():
    if len(sys.argv) < 4:
        print(json.dumps({"error": "usage: encode_single.py <image_path> <studentId> <name>"}))
        return

    image_path = sys.argv[1]
    studentId = sys.argv[2]
    name = sys.argv[3]

    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image not found: {image_path}"}))
        return

    # Load image
    img = face_recognition.load_image_file(image_path)
    
    # 🔥 FIX: Use CNN model for better detection (same as recognize.py)
    face_locations = face_recognition.face_locations(img, model="cnn")
    
    if not face_locations:
        print(json.dumps({"error": "No face found in image"}))
        return
    
    # Get encodings
    encodings = face_recognition.face_encodings(img, face_locations)

    if not encodings:
        print(json.dumps({"error": "No face encodings generated"}))
        return

    # Load existing json
    data = load_encodings()

    # Use filename as key (same as train.py)
    key = os.path.basename(image_path)

    # 🔥 FIX: Use "encodings" array format (same as train.py)
    # This ensures compatibility with recognize.py
    data[key] = {
        "studentId": studentId,
        "name": name,
        "encodings": [encodings[0].tolist()]  # Array of encodings
    }

    save_encodings(data)

    print(json.dumps({"success": True, "key": key, "studentId": studentId}))

if __name__ == "__main__":
    main()