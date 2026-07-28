import os
import io
import pandas as pd
from fastapi.testclient import TestClient
import sys

# Ensure backend directory is in python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import app
import database

client = TestClient(app)

def cleanup_db():
    # Remove sqlite db if it exists to start fresh
    if os.path.exists("./house_prices.db"):
        try:
            os.remove("./house_prices.db")
        except Exception:
            pass

def test_full_flow():
    cleanup_db()
    
    # Manually create tables for TestClient (since TestClient outside context block doesn't trigger lifespan)
    import models
    from database import engine
    models.Base.metadata.create_all(bind=engine)
    
    print("\n--- Running Backend Tests ---")
    import time
    test_email = f"john_{int(time.time())}@example.com"
    
    # 1. Register User
    print("Testing /register...")
    reg_response = client.post("/register", json={
        "name": "John Doe",
        "email": test_email,
        "password": "password123"
    })
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["name"] == "John Doe"
    assert user_data["email"] == test_email
    print("Register user passed!")
    
    # 2. Login User
    print("Testing /login...")
    login_response = client.post("/login", data={
        "username": test_email,
        "password": "password123"
    })
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login passed!")
    
    # 3. Get Profile
    print("Testing /profile...")
    profile_response = client.get("/profile", headers=headers)
    assert profile_response.status_code == 200
    assert profile_response.json()["name"] == "John Doe"
    print("Profile passed!")
    
    # 4. Predict (Guest)
    print("Testing /predict (Guest)...")
    predict_guest_res = client.post("/predict", json={
        "Neighborhood": "CollgCr",
        "LotArea": 10000.0,
        "GrLivArea": 1800.0,
        "BedroomAbvGr": 3,
        "FullBath": 2,
        "GarageCars": 2,
        "YearBuilt": 2005,
        "OverallQual": 7
    })
    assert predict_guest_res.status_code == 200
    guest_result = predict_guest_res.json()
    assert guest_result["predicted_price"] > 0
    assert guest_result["confidence"] > 60
    assert "OverallQual" in guest_result["shap_values"]
    assert guest_result["investment_analysis"]["investment_score"] > 0
    print("Guest prediction passed!")
    
    # 5. Predict (Logged-in User - should save to history)
    print("Testing /predict (Authenticated)...")
    predict_auth_res = client.post("/predict", json={
        "Neighborhood": "NoRidge",
        "LotArea": 15000.0,
        "GrLivArea": 2500.0,
        "BedroomAbvGr": 4,
        "FullBath": 3,
        "GarageCars": 3,
        "YearBuilt": 2010,
        "OverallQual": 9
    }, headers=headers)
    assert predict_auth_res.status_code == 200
    auth_result = predict_auth_res.json()
    assert auth_result["id"] is not None
    prediction_id = auth_result["id"]
    print(f"Authenticated prediction saved to history with ID: {prediction_id}!")
    
    # 6. Direct Guest PDF Report
    print("Testing /predict/report (on-the-fly PDF)...")
    pdf_guest_res = client.post("/predict/report", json={
        "Neighborhood": "CollgCr",
        "LotArea": 10000.0,
        "GrLivArea": 1800.0,
        "BedroomAbvGr": 3,
        "FullBath": 2
    })
    if pdf_guest_res.status_code != 200:
        print("PDF GUEST ERROR:", pdf_guest_res.text)
    assert pdf_guest_res.status_code == 200
    assert pdf_guest_res.headers["content-type"] == "application/pdf"
    assert len(pdf_guest_res.content) > 0
    print("Guest report PDF download passed!")
    
    # 7. Get History
    print("Testing /history...")
    history_res = client.get("/history", headers=headers)
    assert history_res.status_code == 200
    history_list = history_res.json()
    assert len(history_list) == 1
    assert history_list[0]["id"] == prediction_id
    print("Get history list passed!")
    
    # 8. Saved Report PDF
    print(f"Testing /history/{prediction_id}/report...")
    pdf_history_res = client.get(f"/history/{prediction_id}/report", headers=headers)
    assert pdf_history_res.status_code == 200
    assert pdf_history_res.headers["content-type"] == "application/pdf"
    assert len(pdf_history_res.content) > 0
    print("Saved prediction report PDF passed!")
    
    # 9. Batch Prediction CSV
    print("Testing /batch-predict...")
    csv_data = "Neighborhood,LotArea,GrLivArea,BedroomAbvGr,FullBath,GarageCars,YearBuilt,OverallQual\n" \
               "CollgCr,9500,1600,3,2,2,2002,6\n" \
               "StoneBr,12000,2200,4,2.5,3,2008,8\n"
    csv_file = io.BytesIO(csv_data.encode('utf-8'))
    
    batch_res = client.post(
        "/batch-predict",
        files={"file": ("test.csv", csv_file, "text/csv")},
        headers=headers
    )
    assert batch_res.status_code == 200
    assert batch_res.headers["content-type"] == "text/csv; charset=utf-8"
    
    res_df = pd.read_csv(io.BytesIO(batch_res.content))
    assert "Predicted_Price" in res_df.columns
    assert "Confidence_Score" in res_df.columns
    assert "Investment_Score" in res_df.columns
    assert len(res_df) == 2
    print("Batch prediction passed!")
    
    # 10. Analytics Dashboard
    print("Testing /analytics...")
    # Add one more prediction so we have multiple entries
    client.post("/predict", json={
        "Neighborhood": "StoneBr",
        "LotArea": 11000.0,
        "GrLivArea": 2000.0,
        "BedroomAbvGr": 3,
        "FullBath": 2,
        "GarageCars": 2,
        "YearBuilt": 2006,
        "OverallQual": 8
    }, headers=headers)
    
    analytics_res = client.get("/analytics", headers=headers)
    assert analytics_res.status_code == 200
    an_data = analytics_res.json()
    assert an_data["total_predictions"] == 4  # 1 auth, 2 from batch (saved since headers included!), 1 final auth
    assert an_data["average_price"] > 0
    assert len(an_data["price_distribution"]) > 0
    assert len(an_data["quality_price_trend"]) > 0
    assert len(an_data["feature_importance"]) > 0
    print("Analytics dashboard data passed!")
    
    # 11. Delete prediction
    print(f"Testing delete /history/{prediction_id}...")
    del_res = client.delete(f"/history/{prediction_id}", headers=headers)
    assert del_res.status_code == 200
    
    history_res = client.get("/history", headers=headers)
    assert len(history_res.json()) == 3  # Remaining 3 (the batch ones + the second auth)
    print("Delete prediction passed!")
    
    print("\nALL BACKEND TESTS PASSED SUCCESSFULLY! SUCCESS")

if __name__ == "__main__":
    test_full_flow()
