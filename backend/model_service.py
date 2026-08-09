import json
import numpy as np
import tensorflow as tf
from pathlib import Path
from PIL import Image


# Find the project root directory
PROJECT_ROOT = Path(__file__).resolve().parent


# -----------------------------
# File paths
# -----------------------------

MODEL_PATH = PROJECT_ROOT / "models" / "food101_mobilenetv2_best.keras"

CLASS_NAMES_PATH = PROJECT_ROOT / "metadata" / "food101_class_names.json"


# -----------------------------
# Load model
# -----------------------------

print(f"Loading model from: {MODEL_PATH}")

model = tf.keras.models.load_model(MODEL_PATH)

print("Food-101 model loaded successfully!")


# -----------------------------
# Load class names
# -----------------------------

with open(CLASS_NAMES_PATH, "r") as file:
    class_names = json.load(file)

print(f"Loaded {len(class_names)} Food-101 class names.")

def predict_food(image: Image.Image):
    """
    Predict the food class from an input image.

    Returns:
        dict: Predicted food name and confidence score.
    """

    # Convert image to RGB
    image = image.convert("RGB")

    # Resize image to the model's expected input size
    image = image.resize((224, 224))

    # Convert image to NumPy array
    image_array = np.array(image)

    # Add batch dimension
    image_array = np.expand_dims(image_array, axis=0)

    # MobileNetV2 preprocessing
    image_array = tf.keras.applications.mobilenet_v2.preprocess_input(
        image_array
    )

    # Run prediction
    predictions = model.predict(image_array, verbose=0)

    # Find class with highest probability
    predicted_index = int(np.argmax(predictions[0]))

    # Get confidence score
    confidence = float(predictions[0][predicted_index])

    # Convert class index to food name
    food_name = class_names[predicted_index]

    return {
        "food": food_name,
        "confidence": confidence
    }