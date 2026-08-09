from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from PIL import Image
from io import BytesIO
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from model_service import predict_food

from nutrition_service import (
    search_food,
    select_best_food,
    extract_nutrition,
    extract_ingredients
)

from recommendation_service import generate_recommendation

class NutritionResponse(BaseModel):
    calories: Optional[float] = None
    protein: Optional[float] = None
    carbohydrates: Optional[float] = None
    fat: Optional[float] = None
    serving_size: Optional[float] = None
    serving_size_unit: Optional[str] = None
    serving_description: Optional[str] = None
    
class RecommendationInsight(BaseModel):
    nutrient: str
    daily_value_percentage: int | None = None
    message: str

class PredictionResponse(BaseModel):
    food: str
    confidence: float
    nutrition: dict
    ingredients: str | None = None
    recommendation: list[RecommendationInsight]

app = FastAPI(
    title="Food Recognition and Nutrition Assistant",
    description="Backend API for the Food-101 MobileNetV2 application",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://ai-food-recognition-web.onrender.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Food Recognition API is running!"
    }


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)):
    """
    Receive an uploaded food image and return the predicted food.
    """

    # Check that the uploaded file is an image
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image file."
        )

    try:
        # Read the uploaded file
        image_bytes = await file.read()

        # Convert bytes into a PIL Image
        image = Image.open(BytesIO(image_bytes))

        # Run the trained model
        prediction = predict_food(image)

        food_name = prediction["food"]
        confidence = prediction["confidence"]

        # Default values if USDA information is unavailable
        nutrition = None
        ingredients = None
        selected_food = None

        try:
        # Search USDA FoodData Central
            usda_result = search_food(food_name)
        
            foods = usda_result.get("foods", [])    
            if foods:
                # Select the best USDA food record
                selected_food = select_best_food(
                    foods,
                    food_name
                )

                # Extract nutrition information
                nutrition = extract_nutrition(
                    selected_food
                )

                # Extract ingredients
                ingredients = extract_ingredients(
                    selected_food
                )
        except Exception as e:
            print(f"USDA nutrition lookup failed: {e}")

        # Generate general nutrition recommendation
        recommendation = generate_recommendation(
            nutrition
        )


        # Return complete result
        return {
            "food": food_name,
            "confidence": confidence,
            "nutrition": nutrition,
            "ingredients": ingredients,
            "recommendation": recommendation
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unable to process the image: {str(e)}"
        )