from pathlib import Path
import numpy as np
from tensorflow import keras

# --------------------------------
# Paths
# --------------------------------
BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "models" / "best_model.keras"
IMAGE_PATH = BASE_DIR / "sample_images" / "drainage2.jpg"

# --------------------------------
# Class Names
# --------------------------------
CLASS_NAMES = [
    "drainage",
    "garbage",
    "pothole"
]

# --------------------------------
# Check Files Exist
# --------------------------------
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model not found:\n{MODEL_PATH}")

if not IMAGE_PATH.exists():
    raise FileNotFoundError(f"Image not found:\n{IMAGE_PATH}")

# --------------------------------
# Load Model
# --------------------------------
model = keras.models.load_model(MODEL_PATH)

print("✅ Model loaded successfully!")

# --------------------------------
# Load Image
# --------------------------------
image = keras.utils.load_img(
    IMAGE_PATH,
    target_size=(224, 224)
)

image_array = keras.utils.img_to_array(image)
image_array = np.expand_dims(image_array, axis=0)

# --------------------------------
# Predict
# --------------------------------
prediction = model.predict(image_array, verbose=0)[0]

predicted_index = np.argmax(prediction)

predicted_class = CLASS_NAMES[predicted_index]

confidence = prediction[predicted_index] * 100

# --------------------------------
# Print Confidence of All Classes
# --------------------------------
print("\nPrediction Probabilities")
print("-------------------------")

for i, class_name in enumerate(CLASS_NAMES):
    print(f"{class_name:<10}: {prediction[i]*100:.2f}%")

# --------------------------------
# Final Result
# --------------------------------
print("\nPrediction Result")
print("------------------")
print(f"Predicted Class : {predicted_class}")
print(f"Confidence      : {confidence:.2f}%")