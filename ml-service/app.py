import os
import io
from pathlib import Path

import numpy as np
from PIL import Image
from flask import Flask, request, jsonify
from tensorflow import keras
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input


# ---------------------------------
# Hide TensorFlow Logs
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

# IMPORTANT:
# Use the fine-tuned model that achieved 96.09% test accuracy.
MODEL_PATH = BASE_DIR / "models" / "fine_tuned_best_model.keras"


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
print("Loading fine-tuned model...")

model = keras.models.load_model(
    MODEL_PATH,
    custom_objects={
        "preprocess_input": preprocess_input
    },
    safe_mode=False
)

print("✅ Fine-tuned model loaded successfully!")
print("Classes:", CLASS_NAMES)


# ---------------------------------
# Home Route
# ---------------------------------
@app.route("/")
def home():
    return "Smart Issue Detection ML API is Running!"


# ---------------------------------
# Predict Route
# Strictly In-Memory / RAM
# ---------------------------------
@app.route("/predict", methods=["POST"])
def predict():

    # ---------------------------------
    # Check image payload
    # ---------------------------------
    if "image" not in request.files:
        return jsonify({
            "error": "No image uploaded."
        }), 400

    file = request.files["image"]

    # ---------------------------------
    # Check filename
    # ---------------------------------
    if not file.filename:
        return jsonify({
            "error": "No image filename provided."
        }), 400

    try:

        # ---------------------------------
        # Read uploaded image into RAM
        # ---------------------------------
        image_bytes = file.read()

        if not image_bytes:
            return jsonify({
                "error": "Uploaded image is empty."
            }), 400

        # ---------------------------------
        # Open image
        # ---------------------------------
        image = Image.open(
            io.BytesIO(image_bytes)
        )

        # ---------------------------------
        # Convert to RGB
        # Handles:
        # JPG
        # JPEG
        # PNG
        # WEBP
        # RGBA
        # ---------------------------------
        image = image.convert("RGB")

        # ---------------------------------
        # Resize to MobileNetV2 input size
        # ---------------------------------
        image = image.resize(
            (224, 224)
        )

        # ---------------------------------
        # Convert image to NumPy array
        # ---------------------------------
        image_array = np.array(
            image,
            dtype=np.float32
        )

        # ---------------------------------
        # IMPORTANT
        #
        # DO NOT do:
        #
        # image_array = image_array / 255.0
        #
        # The fine-tuned model already contains
        # MobileNetV2 preprocess_input.
        # ---------------------------------

        # Add batch dimension
        #
        # Shape:
        # (224, 224, 3)
        #
        # becomes:
        # (1, 224, 224, 3)
        # ---------------------------------
        input_tensor = np.expand_dims(
            image_array,
            axis=0
        )

        # ---------------------------------
        # Predict
        # ---------------------------------
        prediction = model.predict(
            input_tensor,
            verbose=0
        )[0]

        # ---------------------------------
        # Find highest probability
        # ---------------------------------
        predicted_index = int(
            np.argmax(prediction)
        )

        predicted_class = CLASS_NAMES[
            predicted_index
        ]

        confidence = float(
            prediction[predicted_index] * 100
        )

        # ---------------------------------
        # Prepare all probabilities
        # Useful for debugging
        # ---------------------------------
        probabilities = {
            CLASS_NAMES[i]: round(
                float(prediction[i] * 100),
                2
            )
            for i in range(len(CLASS_NAMES))
        }

        # ---------------------------------
        # Print prediction information
        # ---------------------------------
        print("\n===================================")
        print("IMAGE:", file.filename)
        print("PREDICTED:", predicted_class)
        print("CONFIDENCE:", round(confidence, 2), "%")
        print("PROBABILITIES:", probabilities)
        print("===================================\n")

        # ---------------------------------
        # Return prediction
        # ---------------------------------
        return jsonify({
            "category": predicted_class,
            "confidence": round(confidence, 2),
            "probabilities": probabilities,
            "filename": file.filename
        })

    except Exception as e:

        print(
            "Prediction Server Error:",
            str(e)
        )

        return jsonify({
            "error": str(e)
        }), 500


# ---------------------------------
# Run Flask App
# ---------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False,
        use_reloader=False
    )