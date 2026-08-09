import { useState } from "react";
import "./App.css";

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please upload a JPG, PNG, or WEBP image."
      );

      event.target.value = "";
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "This image is too large. Please choose an image smaller than 10 MB."
      );

      event.target.value = "";
      return;
    }

    if (selectedImage?.preview) {
      URL.revokeObjectURL(selectedImage.preview);
    }

    setSelectedImage({
      file: file,
      preview: URL.createObjectURL(file),
    });

    setResult(null);
    setError(null);

    // Allow the same file to be selected again later.
    event.target.value = "";
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    const formData = new FormData();

    formData.append("file", selectedImage.file);

    const apiUrl = import.meta.env.VITE_API_URL;

    if (!apiUrl) {
      setError(
        "The food analysis service is not configured. Please check the frontend API configuration."
      );

      setIsAnalyzing(false);
      return;
    }

    try {
      const response = await fetch(
        `${apiUrl}/predict`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error(
            "The uploaded image could not be processed. Please choose another food image."
          );
        }

        if (response.status === 404) {
          throw new Error(
            "The food information could not be found. Please try another image."
          );
        }

        if (response.status === 500) {
          throw new Error(
            "The food analysis service encountered a problem. Please try again."
          );
        }

        throw new Error(
          `The analysis could not be completed (error ${response.status}).`
        );
      }

      const data = await response.json();

      if (!data || !data.food) {
        throw new Error(
          "The analysis service returned an unexpected response. Please try again."
        );
      }

      setResult(data);

    } catch (err) {
      console.error("Prediction error:", err);

      if (err instanceof TypeError) {
        setError(
          "We couldn't connect to the food analysis service. Please make sure the backend is running and try again."
        );
      } else {
        setError(
          err.message ||
            "We couldn't analyze this image. Please try again."
        );
      }

    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (selectedImage?.preview) {
      URL.revokeObjectURL(selectedImage.preview);
    }

    setSelectedImage(null);
    setResult(null);
    setError(null);
    setIsAnalyzing(false);
  };

  const formatFoodName = (food) => {
    if (!food) {
      return "";
    }

    return food
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const formatIngredients = (ingredients) => {
    if (!ingredients) {
      return "Ingredient information is not available.";
    }

    return ingredients
      .split(",")
      .map((ingredient) =>
        ingredient.trim().toLowerCase()
      )
      .join(" • ");
  };

  const getConfidenceMessage = (confidence) => {
    const percentage = confidence * 100;

    if (percentage >= 80) {
      return "The model assigned a high probability to this food category.";
    }

    if (percentage >= 60) {
      return "The model assigned a moderate-to-high probability to this food category.";
    }

    return "The model assigned a lower probability to this food category, so the result should be verified.";
  };

  const formatServingDescription = (description) => {
    if (!description) {
      return "Serving reference not available.";
    }

    const normalized = description.toLowerCase();

    if (
      normalized.includes("0.333") ||
      normalized.includes("1/3")
    ) {
      return "Approximately 1/3 of the food in the selected USDA entry.";
    }

    if (
      normalized.includes("0.5") ||
      normalized.includes("1/2")
    ) {
      return "Approximately 1/2 of the food in the selected USDA entry.";
    }

    if (
      normalized.includes("0.25") ||
      normalized.includes("1/4")
    ) {
      return "Approximately 1/4 of the food in the selected USDA entry.";
    }

    return description;
  };

  return (
    <div className="app">

      {/* HEADER */}

      <header className="app-header">
        <div className="brand">

          <span className="brand-icon">
            🍽️
          </span>

          <div>
            <h1>
              Food Recognition
            </h1>

            <p>
              AI Food Recognition & Nutrition Assistant
            </p>
          </div>

        </div>
      </header>


      {/* MAIN CONTENT */}

      <main className="main-content">

        {/* HERO */}

        <section className="hero-section">

          <h2>
            Analyze your Food.
          </h2>

          <p>
            Upload a food image to identify the food,
            explore its nutrition information, and
            view helpful nutrition insights.
          </p>

        </section>


        {/* UPLOAD SECTION */}

        <section className="upload-section">

          <div className="upload-card">

            {!selectedImage ? (

              <>
                <div className="upload-icon">
                  📷
                </div>

                <h3>
                  Upload a food image
                </h3>

                <p className="upload-description">
                  Choose a clear image of a food item
                  to get started for the best prediction.
                </p>

                <label className="upload-button">

                  Choose Image

                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    hidden
                  />

                </label>

                <div className="upload-details">

                  <span>
                    JPG, PNG or WEBP
                  </span>

                  <span>
                    •
                  </span>

                  <span>
                    Maximum 10 MB
                  </span>

                </div>

                <p className="upload-hint">
                  💡 For best results, use a well-lit
                  image where the food is clearly visible.
                </p>
              </>

            ) : (

              <>
                <div className="image-preview-container">

                  <img
                    src={selectedImage.preview}
                    alt="Selected food"
                    className="image-preview"
                  />

                </div>

                <h3>
                  Image selected
                </h3>

                <p className="file-name">
                  {selectedImage.file.name}
                </p>

                <button
                  className="analyze-button"
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing
                    ? "Analyzing..."
                    : "Analyze Food"}
                </button>

                <button
                  className="change-image-button"
                  type="button"
                  onClick={() => {
                    if (selectedImage?.preview) {
                      URL.revokeObjectURL(
                        selectedImage.preview
                      );
                    }

                    setSelectedImage(null);
                    setResult(null);
                    setError(null);
                  }}
                  disabled={isAnalyzing}
                >
                  Choose a different image
                </button>

              </>
            )}

          </div>

        </section>


        {/* RESULTS SECTION */}

        <section className="results-section">

          {/* EMPTY STATE */}

          {!result &&
            !error &&
            !isAnalyzing && (

              <div className="empty-results">

                <h2>
                  Your Results
                </h2>

                <p>
                  Your food analysis will appear here
                  after you analyze an image.
                </p>

              </div>
            )}


          {/* LOADING */}

          {isAnalyzing && (

            <div className="loading-state">

              <div className="loading-spinner"></div>

              <h2>
                Analyzing your food...
              </h2>

              <p>
                Our AI is identifying the food and
                retrieving nutrition information.
              </p>

            </div>
          )}


          {/* ERROR */}

          {error && (

            <div
              className="error-card"
              role="alert"
            >

              <div className="error-icon">
                ⚠️
              </div>

              <div>

                <strong>
                  Analysis couldn't be completed
                </strong>

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                  }}
                  className="dismiss-error-button"
                >
                  Dismiss
                </button>

              </div>

            </div>
          )}


          {/* RESULT */}

          {result && (

            <div className="results-container">

              {/* AI PREDICTION */}

              <div className="prediction-card">

                <div className="result-label">
                  AI FOOD PREDICTION
                </div>

                <h2>
                  {formatFoodName(result.food)}
                </h2>

                <div className="confidence-row">

                  <div className="confidence-value">
                    {(result.confidence * 100).toFixed(0)}%
                  </div>

                  <div className="confidence-details">

                    <strong>
                      Model confidence
                    </strong>

                    <div className="confidence-bar">

                      <div
                        className="confidence-fill"
                        style={{
                          width: `${result.confidence * 100}%`,
                        }}
                      ></div>

                    </div>

                    <p>
                      {getConfidenceMessage(
                        result.confidence
                      )}
                    </p>

                    {result.confidence < 0.60 && (
                      <div className="prediction-warning">
                        ⚠️ The model has lower confidence in this prediction.
                        Consider checking the result before using the nutrition
                        information.
                      </div>
                    )}

                  </div>

                </div>

              </div>


              {/* NUTRITION */}

              {result.nutrition && (

                <div className="nutrition-card">

                  <div className="result-label">
                    NUTRITION INFORMATION
                  </div>

                  <h3>
                    Per serving
                  </h3>

                  <div className="nutrition-grid">

                    <div className="nutrition-item">

                      <span className="nutrition-icon">
                        🔥
                      </span>

                      <strong>
                        {result.nutrition.calories}
                      </strong>

                      <span>
                        kcal
                      </span>

                      <small>
                        Calories
                      </small>

                    </div>


                    <div className="nutrition-item">

                      <span className="nutrition-icon">
                        💪
                      </span>

                      <strong>
                        {result.nutrition.protein} g
                      </strong>

                      <small>
                        Protein
                      </small>

                    </div>


                    <div className="nutrition-item">

                      <span className="nutrition-icon">
                        🌾
                      </span>

                      <strong>
                        {result.nutrition.carbohydrates} g
                      </strong>

                      <small>
                        Carbohydrates
                      </small>

                    </div>


                    <div className="nutrition-item">

                      <span className="nutrition-icon">
                        🥑
                      </span>

                      <strong>
                        {result.nutrition.fat} g
                      </strong>

                      <small>
                        Total Fat
                      </small>

                    </div>

                  </div>


                  {/* SERVING INFORMATION */}

                  <div className="serving-info">

                    <strong>
                      🍽️ What does this serving mean?
                    </strong>

                    <p className="serving-size">

                      {result.nutrition.serving_size}{" "}
                      {result.nutrition.serving_size_unit}

                    </p>

                    <p>
                      {formatServingDescription(
                        result.nutrition
                          .serving_description
                      )}
                    </p>

                    <div className="serving-explanation">

                      <strong>
                        Important:
                      </strong>

                      <span>
                        The nutrition values above apply to this
                        reference serving, not necessarily to the
                        entire food shown in your image.
                      </span>

                    </div>

                    <small>
                      The serving size comes from the selected USDA
                      FoodData Central record. Your actual portion may
                      be larger or smaller, and nutrition can vary
                      depending on the recipe, brand, ingredients,
                      and preparation method.
                    </small>

                  </div>


                  {/* HOW TO READ THIS */}

                  <div className="nutrition-explanation">

                    <div className="result-label">
                      HOW TO READ THIS
                    </div>

                    <div className="nutrition-explanation-grid">

                      <div>

                        <strong>
                          Calories
                        </strong>

                        <p>
                          Indicates the amount of energy
                          provided by this serving.
                        </p>

                      </div>


                      <div>

                        <strong>
                          Protein
                        </strong>

                        <p>
                          A nutrient that helps support
                          and maintain body tissues.
                        </p>

                      </div>


                      <div>

                        <strong>
                          Carbohydrates
                        </strong>

                        <p>
                          A major source of energy
                          for the body.
                        </p>

                      </div>


                      <div>

                        <strong>
                          Total fat
                        </strong>

                        <p>
                          Includes the total amount of
                          fat provided by this serving.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              )}


              {/* INGREDIENTS */}

              <div className="information-card">

                <div className="result-label">
                  INGREDIENTS
                </div>

                <h3>
                  What's in this food?
                </h3>

                <p className="ingredients-text">
                  {formatIngredients(
                    result.ingredients
                  )}
                </p>

                <div className="ingredient-note">

                  <strong>
                    ⓘ About these ingredients
                  </strong>

                  <p>
                    These are the ingredients listed in
                    the USDA food entry selected for this
                    prediction. They represent common
                    ingredients associated with this food
                    and may vary depending on the recipe,
                    brand, or preparation.
                  </p>

                </div>

              </div>


              {/* RECOMMENDATION */}

              {Array.isArray(result.recommendation) &&
                result.recommendation.length > 0 && (

                  <div className="recommendation-card">

                    <div className="recommendation-icon">
                      💡
                    </div>

                    <div className="recommendation-content">

                      <div className="result-label">
                        NUTRITION INSIGHT
                      </div>

                      <h3>
                        What does this mean?
                      </h3>

                      <div className="insights-list">

                        {result.recommendation.map(
                          (insight, index) => (

                            <div
                              className="insight-item"
                              key={index}
                            >

                              <div className="insight-header">

                                <strong>
                                  {insight.nutrient}
                                </strong>

                                {insight.daily_value_percentage !==
                                  null &&
                                  insight.daily_value_percentage !==
                                    undefined && (

                                  <span className="insight-dv">
                                    {
                                      insight.daily_value_percentage
                                    }
                                    % DV
                                  </span>
                                )}

                              </div>

                              <p className="recommendation-text">
                                {insight.message}
                              </p>

                            </div>
                          )
                        )}

                      </div>

                      <div className="dv-explanation">

                        <strong>
                          💡 What is %DV?
                        </strong>

                        <p>
                          %DV means Percent Daily Value. It shows how much
                          a nutrient in one serving contributes to the
                          daily reference amount for that nutrient.
                        </p>

                        <p>
                          For example, <strong>21% DV protein</strong> means
                          this serving provides about 21% of the FDA Daily
                          Value used as a general reference.
                        </p>

                        <small>
                          %DV is a general reference and does not determine
                          whether a food is healthy or unhealthy. Individual
                          nutrition needs can vary.
                        </small>

                      </div>

                    </div>

                  </div>
                )}


              {/* USDA SOURCE */}

              <div className="source-card">

                <div className="source-icon">
                  ⓘ
                </div>

                <div>

                  <strong>
                    Where does this nutrition information come from?
                  </strong>

                  <p>
                    Nutrition and ingredient information is
                    retrieved from{" "}

                    <a
                      href="https://fdc.nal.usda.gov/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      USDA FoodData Central
                    </a>{" "}

                    based on the food category identified
                    by the AI model.
                  </p>

                  <p>
                    The values shown are estimates for the
                    selected USDA food record and may differ
                    from the exact food shown in your image.
                  </p>

                </div>

              </div>


              {/* NEW ANALYSIS */}

              <div className="new-analysis-container">

                <button
                  type="button"
                  className="new-analysis-button"
                  onClick={handleReset}
                >
                  ↻ Analyze Another Food
                </button>

                <p>
                  Upload another image to start a new analysis.
                </p>

              </div>


              {/* DISCLAIMER */}

              <div className="disclaimer">

                <strong>
                  ⓘ About this information
                </strong>

                <p>
                  Food recognition is an AI prediction and
                  may not always be correct. Nutrition
                  information comes from the USDA FoodData
                  Central entry selected for the predicted
                  food. Nutrition insights are general
                  informational guidance and are not medical
                  or personalized dietary advice.
                </p>

              </div>

            </div>
          )}

        </section>

      </main>


      {/* FOOTER */}

      <footer className="footer">

        <p>
          AI-powered food recognition for educational
          and informational purposes.
        </p>

      </footer>

    </div>
  );
}

export default App;