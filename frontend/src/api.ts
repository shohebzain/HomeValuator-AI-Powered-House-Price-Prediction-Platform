const API_BASE_URL = "http://127.0.0.1:8000";

// Helper to get headers with JWT authorization
function getHeaders(isMultipart = false): HeadersInit {
  const headers: Record<string, string> = {};
  if (!isMultipart) {
    headers["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("house_predict_token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export interface PropertyInputs {
  Neighborhood: string;
  LotArea: number;
  BedroomAbvGr: number;
  FullBath: number;
  GrLivArea: number;
  TotalBsmtSF: number;
  GarageArea: number;
  GarageCars: number;
  YearBuilt: number;
  YearRemodAdd: number;
  BldgType: string;
  HouseStyle: string;
  OverallQual: number;
  OverallCond: number;
  KitchenQual: string;
  ExterQual: string;
  BsmtQual: string;
  CentralAir: string;
  Fireplaces: number;
  LotFrontage?: number;
  MasVnrArea?: number;
  BsmtFinSF1?: number;
  WoodDeckSF?: number;
  OpenPorchSF?: number;
  PoolArea?: number;
  custom_features?: Record<string, any>;
}

export interface PredictionResult {
  id: number | null;
  property_details: PropertyInputs;
  predicted_price: number;
  confidence: number;
  price_category: string;
  estimated_market_value: number;
  estimated_range: string;
  shap_values: Record<string, number>;
  investment_analysis: {
    investment_score: number;
    market_score: number;
    rental_potential: number;
    resale_score: number;
    risk_score: number;
    roi_estimate: number;
    estimated_expenses: number;
    cap_rate: number;
  };
  created_at: string;
}

export interface HistoryItem {
  id: number;
  property_details: PropertyInputs;
  predicted_price: number;
  confidence: number;
  investment_score: number;
  created_at: string;
}

export interface AnalyticsData {
  average_price: number;
  total_predictions: number;
  price_distribution: Array<{ range: string; count: number }>;
  quality_price_trend: Array<{ quality: number; average_price: number }>;
  top_neighborhoods: Array<{ neighborhood: string; average_price: number }>;
  feature_importance: Array<{ feature: string; importance: number }>;
}

export const api = {
  // Auth API
  async register(name: string, email: string, password: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Registration failed");
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<string> {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Incorrect email or password");
    }
    const data = await res.json();
    localStorage.setItem("house_predict_token", data.access_token);
    return data.access_token;
  },

  logout(): void {
    localStorage.removeItem("house_predict_token");
  },

  isLoggedIn(): boolean {
    return !!localStorage.getItem("house_predict_token");
  },

  async getProfile(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/profile`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Could not load user profile");
    }
    return res.json();
  },

  // Prediction API
  async predict(inputs: PropertyInputs, modelType = "random_forest"): Promise<PredictionResult> {
    const res = await fetch(`${API_BASE_URL}/predict?model_type=${modelType}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(inputs),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Prediction failed");
    }
    return res.json();
  },

  // Batch Predict API
  async batchPredict(file: File): Promise<Blob> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE_URL}/batch-predict`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Batch prediction failed");
    }
    return res.blob();
  },

  // History API
  async getHistory(filters?: { neighborhood?: string; minPrice?: number; maxPrice?: number }): Promise<HistoryItem[]> {
    let url = `${API_BASE_URL}/history`;
    const params = new URLSearchParams();
    if (filters?.neighborhood) params.append("neighborhood", filters.neighborhood);
    if (filters?.minPrice !== undefined) params.append("min_price", filters.minPrice.toString());
    if (filters?.maxPrice !== undefined) params.append("max_price", filters.maxPrice.toString());
    
    const queryStr = params.toString();
    if (queryStr) {
      url += `?${queryStr}`;
    }

    const res = await fetch(url, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Could not retrieve prediction history");
    }
    return res.json();
  },

  async deleteHistory(predictionId: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/history/${predictionId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Delete failed");
    }
  },

  // Analytics API
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch(`${API_BASE_URL}/analytics`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error("Could not retrieve dashboard analytics");
    }
    return res.json();
  },

  // PDF Report Download helpers
  getHistoryReportUrl(predictionId: number): string {
    const token = localStorage.getItem("house_predict_token");
    return `${API_BASE_URL}/history/${predictionId}/report?token=${token}`;
  },

  async downloadHistoryReport(predictionId: number): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/history/${predictionId}/report`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      throw new Error("PDF download failed");
    }
    return res.blob();
  },

  async downloadGuestReport(inputs: PropertyInputs, modelType = "random_forest"): Promise<Blob> {
    const res = await fetch(`${API_BASE_URL}/predict/report?model_type=${modelType}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inputs),
    });
    if (!res.ok) {
      throw new Error("Guest PDF generation failed");
    }
    return res.blob();
  },

  async trainModel(file: File): Promise<any> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${API_BASE_URL}/train`, {
      method: "POST",
      headers: getHeaders(true),
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Model training failed");
    }
    return res.json();
  }
};
