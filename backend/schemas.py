from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any, List
from datetime import datetime

# Authentication Schemas
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

# House Prediction Schemas
class PropertyInput(BaseModel):
    # Key inputs from the form
    Neighborhood: str = "CollgCr"
    LotArea: float = Field(9000.0, ge=100.0, le=500000.0)
    BedroomAbvGr: int = Field(3, ge=0, le=10)
    FullBath: int = Field(2, ge=0, le=5)
    GrLivArea: float = Field(1500.0, ge=300.0, le=10000.0)
    TotalBsmtSF: float = Field(800.0, ge=0.0, le=6000.0)
    GarageArea: float = Field(400.0, ge=0.0, le=2000.0)
    GarageCars: int = Field(2, ge=0, le=5)
    YearBuilt: int = Field(2000, ge=1800, le=2026)
    YearRemodAdd: int = Field(2000, ge=1950, le=2026)
    BldgType: str = "1Fam"
    HouseStyle: str = "1Story"
    OverallQual: int = Field(6, ge=1, le=10)
    OverallCond: int = Field(5, ge=1, le=10)
    KitchenQual: str = "TA"
    ExterQual: str = "TA"
    BsmtQual: str = "TA"
    CentralAir: str = "Y"
    Fireplaces: int = Field(0, ge=0, le=4)
    
    # Advanced specs (Phase 1)
    LotFrontage: float = 70.0
    MasVnrArea: float = 0.0
    BsmtFinSF1: float = 0.0
    WoodDeckSF: float = 0.0
    OpenPorchSF: float = 0.0
    PoolArea: float = 0.0
    
    # Custom values dictionary for remaining 76 features or overrides
    custom_features: Optional[Dict[str, Any]] = None

class InvestmentAnalysis(BaseModel):
    investment_score: float
    market_score: float
    rental_potential: float
    resale_score: float
    risk_score: float
    roi_estimate: float
    estimated_expenses: float
    cap_rate: float

class PredictionOut(BaseModel):
    id: Optional[int] = None
    property_details: Dict[str, Any]
    predicted_price: float
    confidence: float
    price_category: str
    estimated_market_value: float
    shap_values: Dict[str, float]
    investment_analysis: InvestmentAnalysis
    created_at: datetime

    class Config:
        from_attributes = True

class PredictionHistoryOut(BaseModel):
    id: int
    property_details: Dict[str, Any]
    predicted_price: float
    confidence: float
    investment_score: float
    created_at: datetime

    class Config:
        from_attributes = True

# Analytics Dashboard Schema
class AnalyticsOut(BaseModel):
    average_price: float
    total_predictions: int
    price_distribution: List[Dict[str, Any]]  # Hist bins
    quality_price_trend: List[Dict[str, Any]]  # OverallQual vs AvgPrice
    top_neighborhoods: List[Dict[str, Any]]  # Neighborhood vs AvgPrice
    feature_importance: List[Dict[str, Any]]  # Feature vs Importance
