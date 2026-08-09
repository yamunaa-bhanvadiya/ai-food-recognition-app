# recommendation_service.py
#
# Generates neutral, educational nutrition insights
# using FDA Daily Value reference values.
#
# These values are reference values for general nutrition
# label interpretation and are NOT personalized dietary
# or medical recommendations.


# ---------------------------------------------------------
# FDA Daily Values
# ---------------------------------------------------------
#
# Reference Daily Values for adults and children age 4+.
#
# Protein: 50 g
# Total Carbohydrate: 275 g
# Total Fat: 78 g
#
# Source:
# U.S. Food and Drug Administration (FDA)
# Nutrition Facts Label guidance.

FDA_DAILY_VALUES = {
    "protein": 50,
    "carbohydrates": 275,
    "fat": 78,
}


# ---------------------------------------------------------
# Calculate Daily Value Percentage
# ---------------------------------------------------------

def calculate_daily_value_percentage(
    amount,
    daily_value
):
    """
    Calculate the approximate percentage of the
    FDA Daily Value represented by one serving.

    Parameters
    ----------
    amount : float
        Amount of the nutrient in one serving.

    daily_value : float
        FDA reference Daily Value for that nutrient.

    Returns
    -------
    float or None
        Calculated percentage of Daily Value.
    """

    if amount is None or daily_value <= 0:
        return None

    return (amount / daily_value) * 100


# ---------------------------------------------------------
# Generate Nutrition Insights
# ---------------------------------------------------------

def generate_recommendation(nutrition):
    """
    Generate structured, neutral nutrition insights.

    The function compares selected nutrients with
    FDA Daily Value reference values.

    This is intended for general educational purposes
    and is NOT personalized dietary or medical advice.

    Parameters
    ----------
    nutrition : dict
        Nutrition information returned by the USDA
        FoodData Central service.

    Returns
    -------
    list
        A list of structured nutrition insight objects.
    """

    # -----------------------------------------------------
    # Handle missing nutrition information
    # -----------------------------------------------------

    if not nutrition:
        return [
            {
                "nutrient": "Nutrition",
                "daily_value_percentage": None,
                "message": (
                    "Nutrition information is unavailable, "
                    "so no nutrition insight could be generated."
                ),
            }
        ]

    # -----------------------------------------------------
    # Get nutrient values
    # -----------------------------------------------------

    protein = nutrition.get("protein")
    carbohydrates = nutrition.get("carbohydrates")
    fat = nutrition.get("fat")

    insights = []

    # -----------------------------------------------------
    # Protein
    # -----------------------------------------------------

    if protein is not None:

        protein_dv = calculate_daily_value_percentage(
            protein,
            FDA_DAILY_VALUES["protein"]
        )

        # 20% DV or more
        if protein_dv >= 20:

            insights.append({
                "nutrient": "Protein",
                "daily_value_percentage": round(protein_dv),
                "message": (
                    f"This serving provides about "
                    f"{protein_dv:.0f}% of the FDA Daily Value "
                    f"for protein."
                ),
            })

        # 5% DV or less
        elif protein_dv <= 5:

            insights.append({
                "nutrient": "Protein",
                "daily_value_percentage": round(protein_dv),
                "message": (
                    f"This serving provides about "
                    f"{protein_dv:.0f}% of the FDA Daily Value "
                    f"for protein."
                ),
            })

    # -----------------------------------------------------
    # Total Fat
    # -----------------------------------------------------

    if fat is not None:

        fat_dv = calculate_daily_value_percentage(
            fat,
            FDA_DAILY_VALUES["fat"]
        )

        # 20% DV or more
        if fat_dv >= 20:

            insights.append({
                "nutrient": "Total Fat",
                "daily_value_percentage": round(fat_dv),
                "message": (
                    f"This serving provides about "
                    f"{fat_dv:.0f}% of the FDA Daily Value "
                    f"for total fat."
                ),
            })

    # -----------------------------------------------------
    # Carbohydrates
    # -----------------------------------------------------

    if carbohydrates is not None:

        carbohydrate_dv = calculate_daily_value_percentage(
            carbohydrates,
            FDA_DAILY_VALUES["carbohydrates"]
        )

        # 20% DV or more
        if carbohydrate_dv >= 20:

            insights.append({
                "nutrient": "Carbohydrates",
                "daily_value_percentage": round(carbohydrate_dv),
                "message": (
                    f"This serving provides about "
                    f"{carbohydrate_dv:.0f}% of the FDA Daily Value "
                    f"for carbohydrates."
                ),
            })

    # -----------------------------------------------------
    # Fallback
    # -----------------------------------------------------

    if not insights:

        insights.append({
            "nutrient": "General",
            "daily_value_percentage": None,
            "message": (
                "None of the evaluated nutrients reach "
                "20% of the FDA Daily Value for this serving."
            ),
        })

    return insights