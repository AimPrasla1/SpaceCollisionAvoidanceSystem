from fastapi import FastAPI
from backend.collision_detection import predict_collisions
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Update allowed origins to include your Vercel frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://satellite-collision-monitoring-system.vercel.app"  # Vercel deployment
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/predict-collisions")
def predict_collisions_endpoint():
    """
    API endpoint to predict collisions and recommend maneuvers.
    """
    return {"collisions": predict_collisions()}

# Health Check Endpoint
@app.get("/health")
def health_check():
    """
    Health check endpoint to ensure the backend is running.
    """
    return {"status": "ok"}
