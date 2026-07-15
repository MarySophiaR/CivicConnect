import os
import io
from pathlib import Path

import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from tensorflow import keras

# ---------------------------------
# Hide TensorFlow Logs (Optional)
# ---------------------------------
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

# ---------------------------------
# Flask App
# ---------------------------------
app = Flask(__name__)

# ---------------------------------
# Paths
# ---------------------------------
BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "models" / "best_model.keras"

# ---------------------------------
# Class Names
# ---------------------------------
CLASS_NAMES = [
    "drainage",
    "garbage",
    "pothole"
]

# ---------------------------------
# Load Model
# ---------------------------------
print("Loading model...")

model = keras.models.load_model(MODEL_PATH)

print("✅ Model Loaded Successfully!")

# ---------------------------------
# Home Route
# ---------------------------------
@app.route("/")
def home():
    return "Smart Issue Detection ML API is Running!"

# ---------------------------------
# Predict Route
# ---------------------------------
@app.route("/predict", methods=["POST"])
def predict():

    print("\nRequest received...")

    # Check image
    if "image" not in request.files:
        return jsonify({
            "error": "No image uploaded."
        }), 400

    file = request.files["image"]

    try:
        # Read uploaded image
        image = Image.open(io.BytesIO(file.read()))

        # Convert to RGB (handles PNG, RGBA, etc.)
        image = image.convert("RGB")

        # Resize
        image = image.resize((224, 224))

        # Convert to numpy array
        image = np.array(image, dtype=np.float32)

        # Expand dimensions
        image = np.expand_dims(image, axis=0)

        print("Predicting...")

        prediction = model.predict(image, verbose=0)[0]

        predicted_index = np.argmax(prediction)

        predicted_class = CLASS_NAMES[predicted_index]

        confidence = float(prediction[predicted_index] * 100)

        print("Prediction completed!")

        return jsonify({
            "category": predicted_class,
            "confidence": round(confidence, 2)
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        }), 500


# ---------------------------------
# Run App
# ---------------------------------
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)