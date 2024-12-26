import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib

def train_collision_model():
    # Load collision data
    data = pd.read_csv("data/collision_data.csv")
    
    X = data[['relative_velocity', 'distance', 'sat_mass', 'debris_mass']]
    y = data['collision_risk'] 

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(random_state=42)
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Accuracy: {accuracy:.2f}")

    joblib.dump(model, "data/model/collision_model.pkl")
    print("Model saved successfully!")

if __name__ == "__main__":
    train_collision_model()
