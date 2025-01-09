from fastapi import FastAPI
from backend.collision_detection import predict_collisions
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://your-frontend-domain.vercel.app"],  # Add Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Original endpoint for local development
@app.get("/predict-collisions")
def predict_collisions_endpoint_local():
    """
    API endpoint for local development.
    """
    return {"collisions": predict_collisions()}

# Updated endpoint for production
@app.get("/api/predict-collisions")
def predict_collisions_endpoint():
    """
    API endpoint to predict collisions and recommend maneuvers.
    """
    try:
        collisions = predict_collisions()
        return {"collisions": collisions}
    except Exception as e:
        return {"error": str(e)}

# Health Check Endpoint
@app.get("/api/health")
def health_check():
    """
    Health check endpoint to ensure the backend is running.
    """
    return {"status": "ok"}
