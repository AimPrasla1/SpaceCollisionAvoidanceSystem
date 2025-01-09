from fastapi import FastAPI
from backend.collision_detection import predict_collisions
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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
