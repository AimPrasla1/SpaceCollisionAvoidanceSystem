from fastapi import FastAPI
from backend.collision_detection import predict_collisions

app = FastAPI()

@app.get("/predict-collisions")
def predict_collisions_endpoint():
    return {"collisions": predict_collisions()}
