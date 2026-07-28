
import streamlit as st
import pandas as pd
import joblib
from sklearn.pipeline import Pipeline # Required to load the model correctly

st.set_page_config(layout="wide")

# Load the trained model
try:
    model = joblib.load("house_price_model.pkl")
except FileNotFoundError:
    st.error("Model file 'house_price_model.pkl' not found. Please ensure it's saved in the same directory.")
    st.stop()

# Load the X template for structure
try:
    X_template = joblib.load("X_template.pkl")
except FileNotFoundError:
    st.error("Feature template file 'X_template.pkl' not found. Please ensure it's saved.")
    st.stop()

st.title("🏠 House Price Prediction System")
st.write("Enter the house details below to predict the selling price.")

# Create input widgets for the key features
with st.sidebar:
    st.header("Adjust House Features")
    
    OverallQual = st.slider("Overall Quality", 1, 10, 5)
    GrLivArea = st.number_input("Ground Living Area (sq.ft)", 500, 6000, 1500)
    GarageCars = st.slider("Garage Capacity (cars)", 0, 5, 2)
    GarageArea = st.number_input("Garage Area (sq.ft)", 0, 1500, 500)
    TotalBsmtSF = st.number_input("Total Basement Area (sq.ft)", 0, 3000, 800)
    FirstFlrSF = st.number_input("1st Floor Area (sq.ft)", 300, 3000, 1000)
    FullBath = st.slider("Full Bathrooms", 0, 5, 2)
    TotRmsAbvGrd = st.slider("Total Rooms Above Ground", 2, 15, 6)
    YearBuilt = st.number_input("Year Built", 1872, 2025, 2000)
    YearRemodAdd = st.number_input("Year Remodeled", 1950, 2025, 2005)

# Create a sample DataFrame for prediction based on the template
input_data = X_template.copy()

# Update the sample DataFrame with user inputs
input_data.loc[input_data.index[0], "OverallQual"] = OverallQual
input_data.loc[input_data.index[0], "GrLivArea"] = GrLivArea
input_data.loc[input_data.index[0], "GarageCars"] = GarageCars
input_data.loc[input_data.index[0], "GarageArea"] = GarageArea
input_data.loc[input_data.index[0], "TotalBsmtSF"] = TotalBsmtSF
input_data.loc[input_data.index[0], "1stFlrSF"] = FirstFlrSF
input_data.loc[input_data.index[0], "FullBath"] = FullBath
input_data.loc[input_data.index[0], "TotRmsAbvGrd"] = TotRmsAbvGrd
input_data.loc[input_data.index[0], "YearBuilt"] = YearBuilt
input_data.loc[input_data.index[0], "YearRemodAdd"] = YearRemodAdd

# Display input values (optional, for debugging)
st.subheader("Current Input Details")
st.dataframe(input_data[['OverallQual', 'GrLivArea', 'GarageCars', 'GarageArea', 'TotalBsmtSF', '1stFlrSF', 'FullBath', 'TotRmsAbvGrd', 'YearBuilt', 'YearRemodAdd']])


if st.button("Predict Price"):
    prediction = model.predict(input_data)
    st.success(f"Estimated House Price: ${prediction[0]:,.2f}")
