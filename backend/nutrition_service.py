import os
import requests
from dotenv import load_dotenv


# Load variables from .env
load_dotenv()


# Get USDA API key
FDC_API_KEY = os.getenv("FDC_API_KEY")

# USDA FoodData Central search endpoint
FDC_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search"


def search_food(food_name: str):
    """
    Search USDA FoodData Central for a food name.
    """

    if not FDC_API_KEY:
        raise ValueError("FDC_API_KEY is not configured.")

    params = {
        "api_key": FDC_API_KEY,
        "query": food_name,
        "pageSize": 5
    }

    response = requests.get(
        FDC_SEARCH_URL,
        params=params,
        timeout=10
    )

    response.raise_for_status()

    return response.json()

def extract_nutrition(food_record: dict):
    """
    Extract nutrition information and serving details
    from a USDA FoodData Central food record.
    """

    nutrition = {
        "calories": None,
        "protein": None,
        "carbohydrates": None,
        "fat": None,
        "serving_size": food_record.get("servingSize"),
        "serving_size_unit": food_record.get("servingSizeUnit"),
        "serving_description": food_record.get(
            "householdServingFullText"
        )
    }

    # Read nutrient information from the USDA record
    for nutrient in food_record.get("foodNutrients", []):

        nutrient_id = nutrient.get("nutrientId")
        value = nutrient.get("value")

        if nutrient_id == 1008:
            nutrition["calories"] = value

        elif nutrient_id == 1003:
            nutrition["protein"] = value

        elif nutrient_id == 1005:
            nutrition["carbohydrates"] = value

        elif nutrient_id == 1004:
            nutrition["fat"] = value

    return nutrition

def select_best_food(foods: list, food_name: str):
    """
    Select the most appropriate USDA food record
    from the search results.
    """

    if not foods:
        return None

    # Normalize the predicted food name
    search_name = food_name.replace("_", " ").lower().strip()

    # First, look for an exact description match
    for food in foods:
        description = food.get("description", "").lower().strip()

        if description == search_name:
            return food

    # If there is no exact match, use the first USDA result
    return foods[0]

def extract_ingredients(food_record: dict):
    """
    Extract ingredients from a USDA food record.
    """

    ingredients = food_record.get("ingredients")

    if ingredients:
        return ingredients

    return None