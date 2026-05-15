
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import os
import json
from tensorflow.keras.applications.efficientnet import preprocess_input as efficientnet_preprocess_input
from tensorflow.keras.applications.mobilenet_v2 import (
    MobileNetV2,
    preprocess_input as imagenet_preprocess_input,
    decode_predictions,
)

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────
# LOAD MODEL
# ─────────────────────────────────────────
backend_dir = os.path.dirname(__file__)

MODEL_FILENAME = os.environ.get("MODEL_FILENAME")
if MODEL_FILENAME:
    MODEL_PATH = os.path.join(backend_dir, MODEL_FILENAME)
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"MODEL_FILENAME set but not found: {MODEL_PATH}")
else:
    candidates = [
        f for f in os.listdir(backend_dir)
        if f.lower().endswith((".keras", ".h5"))
    ]
    if not candidates:
        raise FileNotFoundError(f"No .keras/.h5 model found in {backend_dir}")
    candidates.sort(
        key=lambda f: os.path.getmtime(os.path.join(backend_dir, f)),
        reverse=True
    )
    MODEL_PATH = os.path.join(backend_dir, candidates[0])

print(f"Loading model: {MODEL_PATH}")
model = tf.keras.models.load_model(MODEL_PATH)

print("Loading ImageNet OOD guard model...")
imagenet_model = MobileNetV2(weights="imagenet")

# ─────────────────────────────────────────
# LOAD CLASS LABELS
# ─────────────────────────────────────────
class_indices_path = os.path.join(backend_dir, "class_indices.json")
if not os.path.exists(class_indices_path):
    raise FileNotFoundError("class_indices.json not found in backend folder.")

with open(class_indices_path) as f:
    class_indices = json.load(f)

class_names_dict = {int(v): k for k, v in class_indices.items()}
class_names      = [class_names_dict[i] for i in range(len(class_names_dict))]

# Not_a_Pet index — used only to block random images
not_a_pet_idx = class_indices.get("Not_a_Pet", None)
if not_a_pet_idx is not None:
    not_a_pet_idx = int(not_a_pet_idx)
    print(f"Not_a_Pet guard active at index {not_a_pet_idx}")
else:
    print("WARNING: Not_a_Pet class not found — random image guard is OFF")

print(f"Total classes: {len(class_names)}")


# ─────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────
def preprocess_image(image: Image.Image) -> np.ndarray:
    image = image.resize((224, 224))
    image = np.array(image)
    image = efficientnet_preprocess_input(image)
    image = np.expand_dims(image, axis=0)
    return image


def preprocess_imagenet_image(image: Image.Image) -> np.ndarray:
    image = image.resize((224, 224))
    image = np.array(image)
    image = imagenet_preprocess_input(image)
    image = np.expand_dims(image, axis=0)
    return image


def is_likely_pet_image(image: Image.Image) -> dict:
    scores = {
        "pet": 0.0,
        "non_pet": 0.0,
        "top": [],
    }

    preds = imagenet_model.predict(preprocess_imagenet_image(image))[0]
    decoded = decode_predictions(np.expand_dims(preds, axis=0), top=3)[0]

    pet_keywords = [
        "dog", "cat", "puppy", "kitten", "tabby", "Siamese", "Persian",
        "Labrador", "golden retriever", "beagle", "pug", "husky", "chihuahua",
        "pomeranian", "dachshund", "rottweiler", "poodle", "corgi", "shepherd",
        "lynx", "tiger", "cougar", "snow leopard", "Egyptian cat", "Sphynx",
    ]
    non_pet_keywords = [
        "laptop", "screen", "monitor", "keyboard", "desk", "room", "office",
        "window", "door", "book", "phone", "telephone", "television", "tv",
        "car", "truck", "bus", "train", "airplane", "ship", "boat", "shoe",
        "person", "man", "woman", "face", "human", "cup", "bottle", "plate",
        "chair", "sofa", "couch", "table", "plant", "flower", "wall", "floor",
        "bed", "wardrobe", "cabinet", "closet", "bookshelf", "rug", "carpet",
        "grass", "dirt", "soil", "sand", "cliff", "rock", "stone", "river",
        "lake", "pond", "sky", "mountain", "building", "house", "barn",
        "aloe", "pineapple", "clock", "lamp",
    ]

    scores["top_labels"] = []
    scores["top_probs"] = []
    scores["has_pet_label"] = False
    scores["has_non_pet_label"] = False

    for _, name, prob in decoded:
        normalized = name.replace("_", " ").lower()
        scores["top"].append({"name": normalized, "prob": float(prob)})
        scores["top_labels"].append(normalized)
        scores["top_probs"].append(float(prob))

        if any(keyword.lower() in normalized for keyword in pet_keywords):
            scores["pet"] += float(prob)
            scores["has_pet_label"] = True
        if any(keyword.lower() in normalized for keyword in non_pet_keywords):
            scores["non_pet"] += float(prob)
            scores["has_non_pet_label"] = True

    scores["top_label"] = scores["top_labels"][0] if scores["top_labels"] else ""
    scores["top_prob"] = scores["top_probs"][0] if scores["top_probs"] else 0.0
    return scores


# ─────────────────────────────────────────
# PREDICT ENDPOINT
# ─────────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "Missing file field: image"}), 400

    file  = request.files["image"]
    image = Image.open(file).convert("RGB")

    img_array = preprocess_image(image)
    preds     = model.predict(img_array)[0]   # raw softmax

    # ── IMAGE OOD GUARD ───────────────────────────────────────────────────
    imagenet_scores = is_likely_pet_image(image)
    top_label = imagenet_scores["top_label"]
    top_prob  = imagenet_scores["top_prob"]
    top_labels = imagenet_scores["top_labels"]
    pet_score = imagenet_scores["pet"]
    non_pet_score = imagenet_scores["non_pet"]
    has_pet_label = imagenet_scores["has_pet_label"]
    has_non_pet_label = imagenet_scores["has_non_pet_label"]

    top_non_pet_count = sum(
        1 for label in top_labels
        if any(keyword in label for keyword in [
            "laptop", "screen", "monitor", "keyboard", "desk", "room",
            "door", "book", "phone", "television", "tv", "car", "truck",
            "bus", "train", "airplane", "ship", "boat", "shoe", "person",
            "face", "human", "cup", "bottle", "plate", "chair", "sofa",
            "couch", "table", "wall", "floor", "bed", "wardrobe", "cabinet",
            "closet", "bookshelf", "rug", "carpet", "grass", "dirt", "soil",
            "sand", "rock", "stone", "river", "lake", "pond", "sky",
            "mountain", "building", "house", "barn", "lamp",
        ])
    )

    # Reject if the top label is confidently non-pet and there is no pet evidence.
    if has_non_pet_label and not has_pet_label and top_prob > 0.30:
        return jsonify({
            "rejected": True,
            "reason"  : (
                "This image looks like a non-pet scene or object, not a cat/dog. "
                "Please upload a clear photo of the affected pet skin/coat area."
            ),
            "debug": {
                "imagenet_top": top_label,
                "imagenet_top_prob": top_prob,
                "imagenet_pet_score": pet_score,
                "imagenet_non_pet_score": non_pet_score,
                "imagenet_top_non_pet_count": top_non_pet_count,
            }
        }), 200

    # Reject if two or more of the top 3 labels indicate non-pet content.
    if top_non_pet_count >= 2 and non_pet_score > 0.35 and not has_pet_label:
        return jsonify({
            "rejected": True,
            "reason"  : (
                "This image looks like a non-pet scene or object, not a cat/dog. "
                "Please upload a clear photo of the affected pet skin/coat area."
            ),
            "debug": {
                "imagenet_top": top_label,
                "imagenet_top_prob": top_prob,
                "imagenet_pet_score": pet_score,
                "imagenet_non_pet_score": non_pet_score,
                "imagenet_top_non_pet_count": top_non_pet_count,
            }
        }), 200

    # Keep the guard conservative: only reject if there is virtually no pet signal.
    if pet_score < 0.08 and non_pet_score > 0.30 and not has_pet_label:
        return jsonify({
            "rejected": True,
            "reason"  : (
                "This image does not appear to show a pet clearly enough. "
                "Please upload a closer, well-lit photo of a cat or dog."
            ),
            "debug": {
                "imagenet_top": top_label,
                "imagenet_top_prob": top_prob,
                "imagenet_pet_score": pet_score,
                "imagenet_non_pet_score": non_pet_score,
                "imagenet_top_non_pet_count": top_non_pet_count,
            }
        }), 200

    # keep the original not-a-pet class guard if your model supports it
    if not_a_pet_idx is not None:
        nap_conf = float(preds[not_a_pet_idx])
        if int(np.argmax(preds)) == not_a_pet_idx or nap_conf > 0.40:
            return jsonify({
                "rejected": True,
                "reason"  : (
                    "This doesn't look like a pet skin image. "
                    "Please upload a clear photo of the affected area."
                )
            }), 200

    # ── YOUR ORIGINAL WORKING CODE BELOW — UNCHANGED ─────────────────────

    # Temperature sharpening (your original logic)
    temperature = 0.5
    preds = np.exp(preds / temperature) / np.sum(np.exp(preds / temperature))

    cat_idxs = [i for i, name in enumerate(class_names) if name.lower().startswith("cat-")]
    dog_idxs = [i for i, name in enumerate(class_names) if name.lower().startswith("dog-")]

    if not cat_idxs or not dog_idxs:
        top2_idx_fallback = preds.argsort()[-2:][::-1]
        top1    = {"disease": class_names[top2_idx_fallback[0]], "confidence": float(preds[top2_idx_fallback[0]]) * 100}
        top2_out = {"disease": class_names[top2_idx_fallback[1]], "confidence": float(preds[top2_idx_fallback[1]]) * 100}
        return jsonify({"top1": top1, "top2": top2_out})

    cat_prob = float(preds[cat_idxs].sum()) * 100.0
    dog_prob = float(preds[dog_idxs].sum()) * 100.0

    user_animal = request.form.get("animal_type")
    if user_animal in ["cat", "dog"]:
        predicted_animal = user_animal
    else:
        predicted_animal = "cat" if cat_prob >= dog_prob else "dog"

    selected_idxs  = cat_idxs if predicted_animal == "cat" else dog_idxs
    filtered_preds = preds[selected_idxs]
    local_sorted   = filtered_preds.argsort()[::-1]

    top1_idx = selected_idxs[local_sorted[0]]

    top2_idx = top1_idx
    for local_idx in local_sorted[1:]:
        cand_idx = selected_idxs[local_idx]
        if "healthy" not in class_names[cand_idx].lower():
            top2_idx = cand_idx
            break

    top1_prob = float(preds[top1_idx]) * 100
    top2_prob = float(preds[top2_idx]) * 100

    # Your original confidence boosting — kept exactly as before
    if top1_prob < 50.0:
        top1_prob = 52.0 + (top1_prob * 0.4)
    if top2_prob >= top1_prob:
        top2_prob = max(1.0, top1_prob - 2.5)

    top1    = {"disease": class_names[top1_idx], "confidence": top1_prob}
    top2_out = {"disease": class_names[top2_idx], "confidence": top2_prob}

    cat_local_top2 = preds[cat_idxs].argsort()[-2:][::-1]
    dog_local_top2 = preds[dog_idxs].argsort()[-2:][::-1]

    cat_top1_idx = cat_idxs[int(cat_local_top2[0])]
    cat_top2_idx = cat_idxs[int(cat_local_top2[1])]
    dog_top1_idx = dog_idxs[int(dog_local_top2[0])]
    dog_top2_idx = dog_idxs[int(dog_local_top2[1])]

    catTop2 = {
        "top1": {"disease": class_names[cat_top1_idx], "confidence": float(preds[cat_top1_idx]) * 100.0},
        "top2": {"disease": class_names[cat_top2_idx], "confidence": float(preds[cat_top2_idx]) * 100.0},
    }
    dogTop2 = {
        "top1": {"disease": class_names[dog_top1_idx], "confidence": float(preds[dog_top1_idx]) * 100.0},
        "top2": {"disease": class_names[dog_top2_idx], "confidence": float(preds[dog_top2_idx]) * 100.0},
    }

    return jsonify({
        "top1"  : top1,
        "top2"  : top2_out,
        "animal": {"cat": cat_prob, "dog": dog_prob, "predicted": predicted_animal},
        "catTop2": catTop2,
        "dogTop2": dogTop2,
    })


# ─────────────────────────────────────────
# HEALTH CHECK
# ─────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "classes": len(class_names)}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)