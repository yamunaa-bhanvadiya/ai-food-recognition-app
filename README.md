# 🍽️ Food Recognition and Nutrition Assistant

A full-stack AI-powered web application that recognizes food items from images using a **MobileNetV2 transfer learning model trained on the Food-101 dataset**. After identifying the food, the application retrieves reference nutrition and ingredient information and generates general nutrition recommendations.

## 🚀 Live Application

**Frontend:**
https://ai-food-recognition-web.onrender.com

**Backend API:**
https://ai-food-recognition-app-rbwn.onrender.com

**GitHub Repository:**
https://github.com/yamunaa-bhanvadiya/ai-food-recognition-app

---

## 📌 Project Overview

The Food Recognition and Nutrition Assistant combines computer vision, web development, and nutrition data retrieval into a single application.

Users can upload an image of a food item, and the application:

1. Accepts the uploaded food image.
2. Uses a trained MobileNetV2 model to classify the food.
3. Returns the predicted Food-101 category and confidence score.
4. Searches USDA FoodData Central for a matching food record.
5. Retrieves nutrition and ingredient information.
6. Generates general nutrition insights based on the retrieved values.
7. Displays the complete result through the web interface.

> **Important:** Nutrition information is reference data retrieved from USDA FoodData Central. It is not directly estimated from the image, and the application does not determine the actual portion size of the food.

---

# 🧠 Machine Learning Model

The application uses **MobileNetV2** with transfer learning for food image classification.

### Model details

* **Architecture:** MobileNetV2
* **Learning approach:** Transfer Learning
* **Dataset:** Food-101
* **Number of classes:** 101
* **Training images:** 68,175
* **Validation images:** 7,575
* **Final training:** 5 epochs
* **Best Validation accuracy:** approximately 53.11%

The pretrained MobileNetV2 convolutional base is used to extract visual features, followed by a global average pooling layer, dropout, and a dense classification layer containing 101 output classes.

The trained model is saved in Keras format:

```text
backend/models/food101_mobilenetv2_best.keras
```

Food class names are stored in:

```text
backend/metadata/food101_class_names.json
```

---

# 💻 Technology Stack

## Frontend

* React
* Vite
* JavaScript
* HTML
* CSS

## Backend

* Python
* FastAPI
* Uvicorn
* Pydantic
* Python Multipart

## Machine Learning

* TensorFlow
* Keras
* MobileNetV2
* NumPy
* Pillow

## Nutrition Data

* USDA FoodData Central API
* Requests

## Deployment

* Render
* GitHub

---

# 🔧 Local Backend Setup

### 1. Clone the repository

```bash
git clone https://github.com/yamunaa-bhanvadiya/ai-food-recognition-app.git
cd ai-food-recognition-app
```

### 2. Navigate to the backend

```bash
cd backend
```

### 3. Create a virtual environment

Windows:

```bash
python -m venv venv
```

Activate it:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
python3 -m venv venv
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Configure environment variables

Create a `.env` file inside the `backend` directory.

Add the required USDA API configuration used by the application.

Example:

```text
USDA_API_KEY=your_api_key_here
```

Do **not** commit `.env` or API keys to GitHub.

### 6. Start the FastAPI server

From the `backend` directory:

```bash
uvicorn main:app --reload
```

The backend will normally be available at:

```text
http://127.0.0.1:8000
```

FastAPI documentation can be accessed at:

```text
http://127.0.0.1:8000/docs
```

---

# 🌐 Local Frontend Setup

Open another terminal.

From the project root:

```bash
cd frontend
```

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Configure the backend URL

Create a frontend environment file if required by the project:

```text
.env.local
```

Set:

```text
VITE_API_URL=http://127.0.0.1:8000
```

### 3. Start the frontend

```bash
npm run dev
```

The Vite development server will provide a local URL, normally:

```text
http://localhost:5173
```

Open the URL in a browser and upload a food image.

---

# ⚠️ Limitations

### Food classification

The model is trained only on the 101 categories included in Food-101. Images containing foods outside these categories may produce incorrect predictions.

### Model performance

The final validation accuracy was approximately **50.5%**, meaning predictions are not guaranteed to be correct.

### Nutrition information

Nutrition values are retrieved from USDA FoodData Central after food classification. They are not directly calculated from the image.

### Portion size

The application does not estimate the actual quantity or portion size visible in an image. Therefore, nutrition values should be interpreted as reference values rather than an exact measurement of the uploaded meal.

### Recommendations

The recommendations are generated using predefined nutritional rules and are intended for general informational purposes.

### Deployment

The application is hosted using cloud services, and free hosting resources may have limitations such as cold starts, resource constraints, or temporary service delays.

---


# 📚 Data Sources

The project uses:

* **Food-101** for food image classification.
* **USDA FoodData Central** for nutrition and ingredient reference information.

Food-101 contains 101 food categories and is used to train and evaluate the image classification model.

---

# 👥 Contributions

The project integrates machine learning, backend API development, frontend development, nutrition data retrieval, recommendation logic, testing, and deployment.


---


# 📄 License

This project was developed as an academic project for educational and demonstration purposes.

---

## 👩‍💻 Project

**Food Recognition and Nutrition Assistant**

Built using **React, FastAPI, TensorFlow, MobileNetV2, Food-101, USDA FoodData Central, and Render.**
