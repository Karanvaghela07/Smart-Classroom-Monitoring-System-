#!/usr/bin/env python
import sys
import os
import json
import cv2
import numpy as np
import face_recognition

# === PATH ===
ENCODINGS_FILE = r"C:\Users\vaghe\OneDrive\Desktop\smart-class-monitoring\server\python\encodings.json"

# === THRESHOLDS (AMD Optimized) ===
MATCH_THRESHOLD = 0.58
SECOND_BEST_MARGIN = 0.03


# --------------------------------------------------------------------------
# LOAD ENCODINGS
# --------------------------------------------------------------------------
def load_encodings():
    if not os.path.exists(ENCODINGS_FILE):
        return []

    try:
        with open(ENCODINGS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
    except:
        return []

    normalized = []

    for key, entry in data.items():
        studentId = str(entry.get("studentId", "-"))
        name = entry.get("name", key)

        encs = entry.get("encodings", [])
        emb_list = []

        for e in encs:
            arr = np.asarray(e, dtype=np.float32)
            if arr.size == 128:
                emb_list.append(arr)

        if emb_list:
            if "_" in name:
                name = name.split("_", 1)[1]

            normalized.append({
                "studentId": studentId,
                "name": name,
                "encodings": emb_list
            })

    return normalized


# --------------------------------------------------------------------------
# BUILD FLAT ENCODING LIST
# --------------------------------------------------------------------------
def build_known_lists(entries):
    all_encs = []
    meta = []

    for e in entries:
        for enc in e["encodings"]:
            all_encs.append(enc)
            meta.append({
                "studentId": e["studentId"],
                "name": e["name"]
            })

    if not all_encs:
        return np.array([]), []

    stack = np.vstack(all_encs).astype(np.float32)
    return stack, meta


# --------------------------------------------------------------------------
# DIST → CONFIDENCE
# --------------------------------------------------------------------------
def confidence(dist):
    d = max(0.0, min(dist, 1.0))
    return round((1 - d) * 100, 2)


# --------------------------------------------------------------------------
# MAIN RECOGNIZER
# --------------------------------------------------------------------------
def recognize_face(image_path):
    if not os.path.exists(image_path):
        return {"error": "Image missing", "recognized": []}

    img = cv2.imread(image_path)
    if img is None:
        return {"error": "Bad image", "recognized": []}

    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # ⭐ FASTEST ON AMD: HOG MODEL
    face_locations = face_recognition.face_locations(
        rgb,
        model="hog",
        number_of_times_to_upsample=1
    )

    if not face_locations:
        return {"error": "No face detected", "recognized": []}

    encodings = face_recognition.face_encodings(rgb, face_locations)

    entries = load_encodings()
    known_stack, meta = build_known_lists(entries)

    if known_stack.size == 0:
        return {"error": "No encodings available", "recognized": []}

    results = []
    seen = set()

    for fe in encodings:
        fv = np.asarray(fe, dtype=np.float32).reshape(1, -1)

        diff = known_stack - fv
        dists = np.linalg.norm(diff, axis=1)

        best_idx = int(np.argmin(dists))
        best_dist = float(dists[best_idx])

        # second best
        tmp = dists.copy()
        tmp[best_idx] = 999
        second = float(np.min(tmp)) if len(tmp) > 1 else best_dist + 1

        ok = best_dist <= MATCH_THRESHOLD and (second - best_dist) >= SECOND_BEST_MARGIN
        if not ok:
            continue

        stid = meta[best_idx]["studentId"]
        name = meta[best_idx]["name"]

        # replace if better match appeared
        if stid in seen:
            for r in results:
                if r["studentId"] == stid and best_dist < r.get("distance", 999):
                    r["confidence"] = confidence(best_dist)
                    r["distance"] = best_dist
            continue

        seen.add(stid)
        results.append({
            "studentId": stid,
            "name": name,
            "confidence": confidence(best_dist),
            "distance": best_dist
        })

    # sort
    results.sort(key=lambda x: x["distance"])

    # remove internal
    for r in results:
        del r["distance"]

    return {"recognized": results}


# --------------------------------------------------------------------------
# CLI ENTRY
# --------------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No image path", "recognized": []}))
        sys.exit(1)

    out = recognize_face(sys.argv[1])
    print(json.dumps(out))
