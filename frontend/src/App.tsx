import { useState, useEffect } from "react";
import { 
  Calculator, History, BarChart3, UploadCloud, GitCompare, 
  LogOut, User, LogIn, Plus, Search, Download, Trash2, 
  CheckCircle2, AlertTriangle, TrendingUp, Coins, 
  Building, Check, Settings, Info, Sparkles, Menu, X, MapPin,
  ChevronRight, RefreshCw
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  LineChart, Line, CartesianGrid, Cell
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "./api";
import type { PropertyInputs, PredictionResult, HistoryItem, AnalyticsData } from "./api";

// Neighborhood options based on Ames data
const NEIGHBORHOODS = [
  { value: "CollgCr", label: "College Creek (CollgCr)" },
  { value: "Veenker", label: "Veenker (Veenker)" },
  { value: "Crawfor", label: "Crawford (Crawfor)" },
  { value: "NoRidge", label: "Northridge (NoRidge)" },
  { value: "NridgHt", label: "Northridge Heights (NridgHt)" },
  { value: "Somerst", label: "Somerset (Somerst)" },
  { value: "StoneBr", label: "Stone Brook (StoneBr)" },
  { value: "Timber", label: "Timberland (Timber)" },
  { value: "Gilbert", label: "Gilbert (Gilbert)" },
  { value: "NWAmes", label: "Northwest Ames (NWAmes)" },
  { value: "SawyerW", label: "Sawyer West (SawyerW)" },
  { value: "ClearCr", label: "Clear Creek (ClearCr)" },
  { value: "Mitchel", label: "Mitchell (Mitchel)" },
  { value: "NAmes", label: "North Ames (NAmes)" },
  { value: "OldTown", label: "Old Town (OldTown)" },
  { value: "BrkSide", label: "Brookside (BrkSide)" },
  { value: "Sawyer", label: "Sawyer (Sawyer)" },
  { value: "IDOTRR", label: "Iowa DOT & Railroad (IDOTRR)" },
  { value: "MeadowV", label: "Meadow Valley (MeadowV)" },
  { value: "Edwards", label: "Edwards (Edwards)" },
  { value: "SWISU", label: "South & West ISU (SWISU)" },
  { value: "NPkVill", label: "Northpark Villa (NPkVill)" },
  { value: "Blmngtn", label: "Bloomington Heights (Blmngtn)" },
  { value: "BrDale", label: "Briardale (BrDale)" },
  { value: "Blueste", label: "Bluestem (Blueste)" }
];

const BLDG_TYPES = [
  { value: "1Fam", label: "Single Family Detached" },
  { value: "2fmCon", label: "Two-Family Conversion" },
  { value: "Duplex", label: "Duplex" },
  { value: "Twnhs", label: "Townhouse Inner Unit" },
  { value: "TwnhsE", label: "Townhouse End Unit" }
];

const HOUSE_STYLES = [
  { value: "1Story", label: "One Story" },
  { value: "2Story", label: "Two Story" },
  { value: "1.5Fin", label: "One and a Half Story (Finished)" },
  { value: "1.5Unf", label: "One and a Half Story (Unfinished)" },
  { value: "2.5Fin", label: "Two and a Half Story (Finished)" },
  { value: "2.5Unf", label: "Two and a Half Story (Unfinished)" },
  { value: "SFoyer", label: "Split Foyer" },
  { value: "SLvl", label: "Split Level" }
];

const QUALITY_PILLS = [
  { value: "Ex", label: "Excellent" },
  { value: "Gd", label: "Good" },
  { value: "TA", label: "Average / Typical" },
  { value: "Fa", label: "Fair" }
];

const NEIGHBORHOOD_COORDS: Record<string, { lat: number; lng: number }> = {
  CollgCr: { lat: 42.020, lng: -93.685 },
  Veenker: { lat: 42.040, lng: -93.655 },
  Crawfor: { lat: 42.015, lng: -93.645 },
  NoRidge: { lat: 42.050, lng: -93.650 },
  NridgHt: { lat: 42.060, lng: -93.645 },
  Somerst: { lat: 42.045, lng: -93.635 },
  StoneBr: { lat: 42.060, lng: -93.625 },
  Timber: { lat: 42.005, lng: -93.665 },
  Gilbert: { lat: 42.045, lng: -93.615 },
  NWAmes: { lat: 42.048, lng: -93.628 },
  SawyerW: { lat: 42.033, lng: -93.682 },
  ClearCr: { lat: 42.025, lng: -93.715 },
  Mitchel: { lat: 42.008, lng: -93.605 },
  NAmes: { lat: 42.040, lng: -93.620 },
  OldTown: { lat: 42.030, lng: -93.615 },
  BrkSide: { lat: 42.035, lng: -93.625 },
  Sawyer: { lat: 42.033, lng: -93.665 },
  IDOTRR: { lat: 42.022, lng: -93.622 },
  MeadowV: { lat: 41.995, lng: -93.605 },
  Edwards: { lat: 42.018, lng: -93.665 },
  SWISU: { lat: 42.015, lng: -93.655 },
  NPkVill: { lat: 42.050, lng: -93.625 },
  Blmngtn: { lat: 42.060, lng: -93.635 },
  BrDale: { lat: 42.053, lng: -93.615 },
  Blueste: { lat: 42.010, lng: -93.645 }
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("landing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(api.isLoggedIn());
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null);
  const [authModal, setAuthModal] = useState<{ open: boolean; mode: "login" | "register" }>({ open: false, mode: "login" });
  const [authName, setAuthName] = useState<string>("");
  const [authEmail, setAuthEmail] = useState<string>("");
  const [authPassword, setAuthPassword] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Prediction form inputs
  const [formInputs, setFormInputs] = useState<PropertyInputs>({
    Neighborhood: "CollgCr",
    LotArea: 9000,
    BedroomAbvGr: 3,
    FullBath: 2,
    GrLivArea: 1500,
    TotalBsmtSF: 800,
    GarageArea: 400,
    GarageCars: 2,
    YearBuilt: 2000,
    YearRemodAdd: 2000,
    BldgType: "1Fam",
    HouseStyle: "1Story",
    OverallQual: 6,
    OverallCond: 5,
    KitchenQual: "TA",
    ExterQual: "TA",
    BsmtQual: "TA",
    CentralAir: "Y",
    Fireplaces: 0,
    LotFrontage: 70,
    MasVnrArea: 0,
    BsmtFinSF1: 0,
    WoodDeckSF: 0,
    OpenPorchSF: 0,
    PoolArea: 0
  });

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  const [formStep, setFormStep] = useState<number>(1);
  const [predictLoading, setPredictLoading] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);
  const [predictError, setPredictError] = useState<string>("");

  // Mortgage & Rental Simulator states (Phase 2)
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [loanTerm, setLoanTerm] = useState<number>(30);
  const [customRent, setCustomRent] = useState<number>(0);
  const [customExpenses, setCustomExpenses] = useState<number>(0);

  useEffect(() => {
    if (predictionResult) {
      setCustomRent(predictionResult.investment_analysis.rental_potential);
      setCustomExpenses(predictionResult.investment_analysis.estimated_expenses);
    }
  }, [predictionResult]);

  // History state
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historySearch, setHistorySearch] = useState<string>("");
  const [historyReportDownloading, setHistoryReportDownloading] = useState<number | null>(null);

  // Batch prediction state
  const [batchFile, setBatchFile] = useState<File | null>(null);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);
  const [batchError, setBatchError] = useState<string>("");
  const [batchSuccess, setBatchSuccess] = useState<boolean>(false);

  // Administrative training & Model Selection states (Phase 4)
  const [modelType, setModelType] = useState<string>("random_forest");
  const [trainFile, setTrainFile] = useState<File | null>(null);
  const [trainLoading, setTrainLoading] = useState<boolean>(false);
  const [trainSuccess, setTrainSuccess] = useState<any | null>(null);
  const [trainError, setTrainError] = useState<string>("");

  // Analytics state
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);

  // Property comparison state
  const [comparisonList, setComparisonList] = useState<PredictionResult[]>([]);

  // FAQ open indexes
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);

  // Load profile if logged in
  useEffect(() => {
    if (isLoggedIn) {
      api.getProfile()
        .then(profile => setUserProfile(profile))
        .catch(() => {
          api.logout();
          setIsLoggedIn(false);
        });
    }
  }, [isLoggedIn]);

  // Load history when history tab is open
  useEffect(() => {
    if (currentTab === "history" && isLoggedIn) {
      loadHistory();
    }
  }, [currentTab, isLoggedIn]);

  // Load analytics when analytics tab is open
  useEffect(() => {
    if (currentTab === "analytics" && isLoggedIn) {
      loadAnalytics();
    }
  }, [currentTab, isLoggedIn]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await api.getHistory({ neighborhood: historySearch });
      setHistoryList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const data = await api.getAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Run loadHistory on search trigger
  useEffect(() => {
    if (currentTab === "history" && isLoggedIn) {
      const delayDebounce = setTimeout(() => {
        loadHistory();
      }, 500);
      return () => clearTimeout(delayDebounce);
    }
  }, [historySearch]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      if (authModal.mode === "login") {
        await api.login(authEmail, authPassword);
        setIsLoggedIn(true);
        setAuthModal({ open: false, mode: "login" });
      } else {
        await api.register(authName, authEmail, authPassword);
        // Automatically login
        await api.login(authEmail, authPassword);
        setIsLoggedIn(true);
        setAuthModal({ open: false, mode: "login" });
      }
      // Reset inputs
      setAuthName("");
      setAuthEmail("");
      setAuthPassword("");
    } catch (err: any) {
      setAuthError(err.message || "Authentication failed");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    api.logout();
    setIsLoggedIn(false);
    setUserProfile(null);
    setHistoryList([]);
    setAnalyticsData(null);
    setComparisonList([]);
    setCurrentTab("landing");
  };

  const handlePredictSubmit = async () => {
    setPredictError("");
    setPredictLoading(true);
    try {
      const result = await api.predict(formInputs, modelType);
      setPredictionResult(result);
      setFormStep(4); // Move to results step
    } catch (err: any) {
      setPredictError(err.message || "Failed to predict price");
    } finally {
      setPredictLoading(false);
    }
  };

  const handleLiveSimChange = async (field: keyof PropertyInputs, value: any) => {
    if (!predictionResult) return;
    const updatedInputs = {
      ...predictionResult.property_details,
      [field]: value
    };
    setFormInputs(updatedInputs);
    try {
      const res = await api.predict(updatedInputs, modelType);
      setPredictionResult(res);
    } catch (err) {
      console.error("Live simulation prediction failed:", err);
    }
  };

  const handleBatchPredict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchFile) return;
    setBatchError("");
    setBatchLoading(true);
    setBatchSuccess(false);
    try {
      const blob = await api.batchPredict(batchFile);
      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "Batch_Predictions_Result.csv");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      setBatchSuccess(true);
      setBatchFile(null);
    } catch (err: any) {
      setBatchError(err.message || "Batch prediction failed");
    } finally {
      setBatchLoading(false);
    }
  };

  const handleTrainSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trainFile) return;
    setTrainError("");
    setTrainLoading(true);
    setTrainSuccess(null);
    try {
      const result = await api.trainModel(trainFile);
      setTrainSuccess(result);
      setTrainFile(null);
    } catch (err: any) {
      setTrainError(err.message || "Model re-training failed");
    } finally {
      setTrainLoading(false);
    }
  };

  const downloadReport = async (inputs: PropertyInputs) => {
    try {
      const blob = await api.downloadGuestReport(inputs, modelType);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Valuation_Report_${inputs.Neighborhood}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert("Could not download report: " + err);
    }
  };

  const downloadHistoryReport = async (id: number) => {
    setHistoryReportDownloading(id);
    try {
      const blob = await api.downloadHistoryReport(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Valuation_Report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert("Could not download report: " + err);
    } finally {
      setHistoryReportDownloading(null);
    }
  };

  const deleteHistoryItem = async (id: number) => {
    if (!confirm("Are you sure you want to delete this prediction from your history?")) return;
    try {
      await api.deleteHistory(id);
      setHistoryList(historyList.filter(item => item.id !== id));
      setComparisonList(comparisonList.filter(item => item.id !== id));
    } catch (err) {
      alert("Could not delete item: " + err);
    }
  };

  const handleAddToComparison = (result: PredictionResult) => {
    if (comparisonList.some(item => item.id === result.id && item.predicted_price === result.predicted_price)) {
      alert("This property is already added to comparison!");
      return;
    }
    if (comparisonList.length >= 3) {
      alert("You can compare up to 3 properties side-by-side.");
      return;
    }
    setComparisonList([...comparisonList, result]);
    alert("Property added to comparison list!");
  };

  const handleNav = (tab: string) => {
    setCurrentTab(tab);
    setMobileMenuOpen(false);
  };



  interface WaterfallData {
    name: string;
    start: number;
    size: number;
    displayVal: number;
    color: string;
  }

  const getWaterfallData = (shapValues: Record<string, number>, finalVal: number): WaterfallData[] => {
    const baseVal = shapValues._baseline || 180000;
    const data: WaterfallData[] = [];
    
    // 1. Baseline
    data.push({
      name: "Baseline Avg",
      start: 0,
      size: baseVal,
      displayVal: baseVal,
      color: "#3b82f6" // blue
    });
    
    let runningTotal = baseVal;
    
    // Sort other contributions by absolute magnitude
    const entries = Object.entries(shapValues)
      .filter(([key]) => !key.startsWith("_"))
      .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
      .slice(0, 6); // keep top 6 drivers
      
    entries.forEach(([key, val]) => {
      if (val >= 0) {
        data.push({
          name: key,
          start: runningTotal,
          size: val,
          displayVal: val,
          color: "#10b981" // green
        });
        runningTotal += val;
      } else {
        const absVal = Math.abs(val);
        runningTotal -= absVal;
        data.push({
          name: key,
          start: runningTotal,
          size: absVal,
          displayVal: val,
          color: "#ef4444" // red
        });
      }
    });
    
    // 3. Final Estimate
    data.push({
      name: "Final Value",
      start: 0,
      size: finalVal,
      displayVal: finalVal,
      color: "#0c92eb" // brand blue
    });
    
    return data;
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen flex flex-col relative text-slate-100">
      {/* Decorative Blur Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 glass-panel shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNav("landing")}>
              <div className="p-2 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-xl shadow-inner">
                <Building className="h-6 w-6 text-white" />
              </div>
              <span className="font-extrabold text-xl bg-gradient-to-r from-white via-slate-200 to-blue-400 bg-clip-text text-transparent tracking-wide">
                HomeValuator
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              <button 
                onClick={() => handleNav("landing")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentTab === "landing" ? "bg-white/5 text-blue-400 border border-white/5" : "text-slate-400 hover:text-white"}`}
              >
                Home
              </button>
              <button 
                onClick={() => { handleNav("prediction"); setFormStep(1); }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentTab === "prediction" ? "bg-white/5 text-blue-400 border border-white/5" : "text-slate-400 hover:text-white"}`}
              >
                Estimate Price
              </button>
              
              {isLoggedIn ? (
                <>
                  <button 
                    onClick={() => handleNav("history")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentTab === "history" ? "bg-white/5 text-blue-400 border border-white/5" : "text-slate-400 hover:text-white"}`}
                  >
                    History
                  </button>
                  <button 
                    onClick={() => handleNav("batch")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentTab === "batch" ? "bg-white/5 text-blue-400 border border-white/5" : "text-slate-400 hover:text-white"}`}
                  >
                    Batch Upload
                  </button>
                  <button 
                    onClick={() => handleNav("analytics")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentTab === "analytics" ? "bg-white/5 text-blue-400 border border-white/5" : "text-slate-400 hover:text-white"}`}
                  >
                    Analytics
                  </button>
                  {comparisonList.length > 0 && (
                    <button 
                      onClick={() => handleNav("compare")}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all relative ${currentTab === "compare" ? "bg-white/5 text-blue-400 border border-white/5" : "text-slate-400 hover:text-white"}`}
                    >
                      Compare
                      <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                        {comparisonList.length}
                      </span>
                    </button>
                  )}
                </>
              ) : (
                <button 
                  onClick={() => setAuthModal({ open: true, mode: "login" })}
                  className="text-slate-400 hover:text-white px-3 py-2 rounded-lg text-sm font-medium"
                >
                  History & Dashboard (Sign In)
                </button>
              )}
            </nav>

            {/* Auth Buttons / Profile Panel */}
            <div className="hidden md:flex items-center space-x-4">
              {isLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5">
                    <User className="h-4 w-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-300 max-w-[120px] truncate">
                      {userProfile?.name || "User"}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => setAuthModal({ open: true, mode: "login" })}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white rounded-xl text-sm font-medium transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1.5"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-400 hover:text-white p-2 rounded-lg focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden glass-panel border-t border-white/5 px-2 pt-2 pb-4 space-y-1 shadow-xl"
            >
              <button 
                onClick={() => handleNav("landing")}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Home
              </button>
              <button 
                onClick={() => { handleNav("prediction"); setFormStep(1); }}
                className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Estimate Price
              </button>
              
              {isLoggedIn ? (
                <>
                  <button 
                    onClick={() => handleNav("history")}
                    className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    Prediction History
                  </button>
                  <button 
                    onClick={() => handleNav("batch")}
                    className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    Batch Predict (CSV)
                  </button>
                  <button 
                    onClick={() => handleNav("analytics")}
                    className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                  >
                    Market Analytics
                  </button>
                  {comparisonList.length > 0 && (
                    <button 
                      onClick={() => handleNav("compare")}
                      className="block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-slate-300 hover:bg-white/5 hover:text-white"
                    >
                      Compare Properties ({comparisonList.length})
                    </button>
                  )}
                  <div className="border-t border-white/5 pt-2 mt-2">
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Signed in as {userProfile?.name}</span>
                      <button 
                        onClick={handleLogout}
                        className="text-red-400 hover:text-red-300 text-sm font-semibold flex items-center space-x-1"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button 
                  onClick={() => setAuthModal({ open: true, mode: "login" })}
                  className="block w-full text-left px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-medium transition-all"
                >
                  Sign In
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Page Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- LANDING TAB --- */}
        {currentTab === "landing" && (
          <div className="space-y-16 pb-12">
            {/* Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-8">
              <div className="space-y-6">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-400">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400 animate-pulse" />
                  <span>State of the Art Machine Learning Valuation</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-slate-100 to-blue-400 bg-clip-text text-transparent">
                  AI-Powered Real Estate Valuation. <br />
                  <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">Fast & Explainable.</span>
                </h1>
                
                <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                  Estimate market values for residential properties instantly. Get transparent feature breakdowns powered by SHAP (Explainable AI), analyze resale and cashflow potential, and download comprehensive PDF reports.
                </p>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    onClick={() => { handleNav("prediction"); setFormStep(1); }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all flex items-center space-x-2 group"
                  >
                    <span>Start Free Valuation</span>
                    <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                  </button>
                  {!isLoggedIn && (
                    <button 
                      onClick={() => setAuthModal({ open: true, mode: "register" })}
                      className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-semibold rounded-xl transition-all"
                    >
                      Create Free Account
                    </button>
                  )}
                </div>
              </div>

              {/* Decorative App Mockup / Visual */}
              <div className="relative flex justify-center items-center">
                <div className="absolute w-[80%] h-[80%] bg-blue-500/5 rounded-full blur-[80px] -z-10" />
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8 }}
                  className="w-full max-w-md p-6 glass-panel rounded-3xl border border-white/10 shadow-2xl relative animate-float"
                >
                  <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <span className="text-xs text-slate-500 font-mono">valuation_pipeline.py</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Valuation Estimate</p>
                        <h3 className="text-3xl font-extrabold text-blue-400 mt-1">$284,500.00</h3>
                      </div>
                      <span className="px-2.5 py-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                        94.8% Confidence
                      </span>
                    </div>

                    {/* Progress bars matching SHAP factors */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">AI Explanations (Top Drivers)</p>
                      
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300">Overall Quality (Excellent)</span>
                          <span className="text-emerald-400 font-bold">+$32,400</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[85%]" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300">Living Area (2,100 sq.ft)</span>
                          <span className="text-emerald-400 font-bold">+$22,800</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-[70%]" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-300">Year Built (1955)</span>
                          <span className="text-red-400 font-bold">-$8,500</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-red-500 rounded-full w-[35%]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Quick Metrics Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 glass-panel rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-3xl font-extrabold text-blue-500">R² &ge; 0.90</h4>
                <p className="text-sm font-semibold text-slate-300">Random Forest Accuracy</p>
                <p className="text-xs text-slate-500">Trained on historic Ames Housing Transactions with Scikit-Learn cross-validation.</p>
              </div>
              <div className="p-6 glass-panel rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-3xl font-extrabold text-emerald-500">&lt; 50 ms</h4>
                <p className="text-sm font-semibold text-slate-300">Explainable AI Computation</p>
                <p className="text-xs text-slate-500">SHAP explanations computed instantly using TreeExplainer algorithms optimized on the fly.</p>
              </div>
              <div className="p-6 glass-panel rounded-2xl border border-white/5 space-y-2">
                <h4 className="text-3xl font-extrabold text-purple-500">Full PropTech</h4>
                <p className="text-sm font-semibold text-slate-300">Enterprise Ready Features</p>
                <p className="text-xs text-slate-500">Batch predictions, dashboard charts, investment ROI outlook, and downloadable PDF reports.</p>
              </div>
            </div>

            {/* Benefits & How it Works */}
            <div className="space-y-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-center">Valuation Pipeline Process</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { step: "1", title: "Specifications", desc: "Submit key parameters such as size, rooms, year, and qualities." },
                  { step: "2", title: "ML Prediction", desc: "Our Random Forest regression estimates fair market value." },
                  { step: "3", title: "Explainable AI", desc: "SHAP highlights positive and negative value-driving factors." },
                  { step: "4", title: "ROI Summary", desc: "Generates investment metrics, rental yield estimates, and exports PDF." }
                ].map((item, index) => (
                  <div key={index} className="p-5 glass-panel rounded-2xl relative border border-white/5">
                    <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
                      {item.step}
                    </span>
                    <h5 className="font-bold text-lg text-slate-200 mt-2 mb-1">{item.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonials */}
            <div className="space-y-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-center">What Real Estate Professionals Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-6 glass-panel rounded-2xl border border-white/5 space-y-4">
                  <p className="text-slate-400 italic text-sm">
                    "HomeValuator has revolutionized my pricing strategy. The SHAP explanations are perfect for explaining valuations to homeowners who think their properties are worth 50% more than the market rate. The PDF report exports are incredibly professional."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm">MS</div>
                    <div>
                      <h6 className="font-semibold text-sm">Mohammad Shoheb</h6>
                      <p className="text-[10px] text-slate-500">Real Estate Consultant</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 glass-panel rounded-2xl border border-white/5 space-y-4">
                  <p className="text-slate-400 italic text-sm">
                    "The property comparison screen and batch prediction uploads saves me hours of manual excel mapping. I can run predictions for an entire portfolio in a few seconds, download the results, and review localized metrics on the analytics dashboard."
                  </p>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-sm">AD</div>
                    <div>
                      <h6 className="font-semibold text-sm">Sarah Jenkins</h6>
                      <p className="text-[10px] text-slate-500">Real Estate Investor</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="space-y-6 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-bold text-center">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {[
                  { q: "How accurate are the predictions?", a: "The predictions are generated using a Random Forest regressor trained on the Ames Housing Dataset. The model has achieved an R² score greater than 0.90, indicating that it accounts for over 90% of pricing variations in the market." },
                  { q: "What is Explainable AI (SHAP)?", a: "SHAP (SHapley Additive exPlanations) is a game-theoretic approach to explain individual predictions. It shows the exact dollar amount each feature adds to or subtracts from the baseline market price, ensuring complete transparency in how the estimate was generated." },
                  { q: "How is the confidence score calculated?", a: "The confidence score is computed based on the consensus among the decision trees in our Random Forest ensemble. High consensus yields a higher score (e.g. 95%+), whereas high variance/disagreement among trees indicates an unusual property or layout, resulting in a lower confidence score." },
                  { q: "How does batch prediction work?", a: "You can upload a CSV containing details for multiple properties. The system processes each row, overrides missing features with verified defaults, runs predictions, and outputs the identical CSV file enriched with Predicted Price, Confidence, and Investment scores." }
                ].map((faq, idx) => (
                  <div key={idx} className="glass-panel rounded-xl border border-white/5 overflow-hidden">
                    <button 
                      onClick={() => setFaqOpenIndex(faqOpenIndex === idx ? null : idx)}
                      className="w-full px-5 py-4 text-left font-semibold text-slate-200 hover:bg-white/5 flex justify-between items-center transition-all"
                    >
                      <span>{faq.q}</span>
                      <span className="text-blue-500 font-bold">{faqOpenIndex === idx ? "−" : "+"}</span>
                    </button>
                    {faqOpenIndex === idx && (
                      <div className="px-5 pb-4 text-sm text-slate-400 border-t border-white/5 pt-3 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- VALUATION FORM / RESULTS TAB --- */}
        {currentTab === "prediction" && (
          <div className="max-w-4xl mx-auto pb-12">
            
            {/* Step Progress Tracker */}
            <div className="flex items-center justify-between mb-8 px-4">
              {[
                { step: 1, label: "Structure & Area" },
                { step: 2, label: "Interior & Garage" },
                { step: 3, label: "Quality & Details" },
                { step: 4, label: "Valuation Results" }
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center flex-1 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 z-10 ${
                    formStep === s.step 
                      ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-500/20" 
                      : formStep > s.step 
                        ? "bg-emerald-600 border-emerald-500 text-white" 
                        : "bg-slate-900 border-slate-700 text-slate-400"
                  }`}>
                    {formStep > s.step ? <Check className="h-4 w-4" /> : s.step}
                  </div>
                  <span className={`text-[10px] sm:text-xs mt-2 font-medium transition-all ${formStep === s.step ? "text-blue-400" : "text-slate-400"}`}>
                    {s.label}
                  </span>
                  
                  {s.step < 4 && (
                    <div className={`absolute top-4 left-[50%] right-[-50%] h-0.5 -z-10 ${
                      formStep > s.step ? "bg-emerald-600" : "bg-slate-700"
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Error alerts */}
            {predictError && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center space-x-2 text-sm">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{predictError}</span>
              </div>
            )}

            {/* Glass panel container */}
            <div className="glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl relative">
              
              {/* Form Step 1: Structure & Area */}
              {formStep === 1 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                      <Building className="h-5 w-5 text-blue-500" />
                      <span>Property Location & Layout Specs</span>
                    </h2>
                    <span className="text-xs text-slate-500">Step 1 of 3</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Valuation Model</label>
                      <select 
                        value={modelType} 
                        onChange={(e) => setModelType(e.target.value)}
                        className="w-full px-4 py-3 glass-input text-sm border-blue-500/30"
                      >
                        <option value="random_forest">Random Forest Regressor (Default)</option>
                        <option value="linear">Ridge Linear Regression (Simulated)</option>
                        <option value="gradient_boosting">Gradient Boosting Machine (Simulated)</option>
                      </select>
                      <p className="text-[10px] text-slate-500">Toggle between prediction algorithms.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Neighborhood</label>
                      <select 
                        value={formInputs.Neighborhood} 
                        onChange={(e) => setFormInputs({ ...formInputs, Neighborhood: e.target.value })}
                        className="w-full px-4 py-3 glass-input text-sm"
                      >
                        {NEIGHBORHOODS.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                      </select>
                      <p className="text-[10px] text-slate-500">Choose location matching standard Ames areas.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lot Size (Area in sq.ft)</label>
                      <input 
                        type="number" 
                        value={formInputs.LotArea} 
                        onChange={(e) => setFormInputs({ ...formInputs, LotArea: Number(e.target.value) })}
                        className="w-full px-4 py-3 glass-input text-sm"
                        min="100" max="500000"
                      />
                      <p className="text-[10px] text-slate-500">Total land plot size in square feet (e.g. 5,000 - 20,000).</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Ground Living Area (sq.ft)</label>
                      <input 
                        type="number" 
                        value={formInputs.GrLivArea} 
                        onChange={(e) => setFormInputs({ ...formInputs, GrLivArea: Number(e.target.value) })}
                        className="w-full px-4 py-3 glass-input text-sm"
                        min="300" max="10000"
                      />
                      <p className="text-[10px] text-slate-500">Above grade finished living area size in square feet.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Building Classification</label>
                      <select 
                        value={formInputs.BldgType} 
                        onChange={(e) => setFormInputs({ ...formInputs, BldgType: e.target.value })}
                        className="w-full px-4 py-3 glass-input text-sm"
                      >
                        {BLDG_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Property Style / Design</label>
                      <select 
                        value={formInputs.HouseStyle} 
                        onChange={(e) => setFormInputs({ ...formInputs, HouseStyle: e.target.value })}
                        className="w-full px-4 py-3 glass-input text-sm"
                      >
                        {HOUSE_STYLES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Basement Size (sq.ft)</label>
                      <input 
                        type="number" 
                        value={formInputs.TotalBsmtSF} 
                        onChange={(e) => setFormInputs({ ...formInputs, TotalBsmtSF: Number(e.target.value) })}
                        className="w-full px-4 py-3 glass-input text-sm"
                        min="0" max="6000"
                      />
                      <p className="text-[10px] text-slate-500">Total area of the basement foundation in square feet.</p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-white/5">
                    <button 
                      onClick={() => setFormStep(2)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5"
                    >
                      <span>Continue</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Form Step 2: Interior & Garage */}
              {formStep === 2 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                      <Coins className="h-5 w-5 text-blue-500" />
                      <span>Rooms, Garage & Construction Year</span>
                    </h2>
                    <span className="text-xs text-slate-500">Step 2 of 3</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bedrooms Above Ground</label>
                      <input 
                        type="number" 
                        value={formInputs.BedroomAbvGr} 
                        onChange={(e) => setFormInputs({ ...formInputs, BedroomAbvGr: Number(e.target.value) })}
                        className="w-full px-4 py-3 glass-input text-sm"
                        min="0" max="10"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Bathrooms</label>
                      <input 
                        type="number" 
                        value={formInputs.FullBath} 
                        onChange={(e) => setFormInputs({ ...formInputs, FullBath: Number(e.target.value) })}
                        className="w-full px-4 py-3 glass-input text-sm"
                        min="0" max="5"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Garage Capacity (Car Spaces)</label>
                      <input 
                        type="number" 
                        value={formInputs.GarageCars} 
                        onChange={(e) => setFormInputs({ ...formInputs, GarageCars: Number(e.target.value) })}
                        className="w-full px-4 py-3 glass-input text-sm"
                        min="0" max="5"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Garage Area (sq.ft)</label>
                      <input 
                        type="number" 
                        value={formInputs.GarageArea} 
                        onChange={(e) => setFormInputs({ ...formInputs, GarageArea: Number(e.target.value) })}
                        className="w-full px-4 py-3 glass-input text-sm"
                        min="0" max="2000"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Year Built</label>
                      <input 
                        type="number" 
                        value={formInputs.YearBuilt} 
                        onChange={(e) => setFormInputs({ ...formInputs, YearBuilt: Number(e.target.value) })}
                        className="w-full px-4 py-3 glass-input text-sm"
                        min="1800" max="2026"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Year Remodeled / Renovated</label>
                      <input 
                        type="number" 
                        value={formInputs.YearRemodAdd} 
                        onChange={(e) => setFormInputs({ ...formInputs, YearRemodAdd: Number(e.target.value) })}
                        className="w-full px-4 py-3 glass-input text-sm"
                        min="1950" max="2026"
                      />
                      <p className="text-[10px] text-slate-500">If no remodeling has been done, match the Year Built.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fireplaces</label>
                      <input 
                        type="number" 
                        value={formInputs.Fireplaces} 
                        onChange={(e) => setFormInputs({ ...formInputs, Fireplaces: Number(e.target.value) })}
                        className="w-full px-4 py-3 glass-input text-sm"
                        min="0" max="4"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4 border-t border-white/5">
                    <button 
                      onClick={() => setFormStep(1)}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-semibold transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={() => setFormStep(3)}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center space-x-1.5"
                    >
                      <span>Continue</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Form Step 3: Quality & Details */}
              {formStep === 3 && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                      <Settings className="h-5 w-5 text-blue-500" />
                      <span>Property Quality & Finishing Grades</span>
                    </h2>
                    <span className="text-xs text-slate-500">Step 3 of 3</span>
                  </div>

                  <div className="space-y-6">
                    {/* Overall Quality (1-10 slider) */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Material & Finish Quality</label>
                        <span className="text-sm font-bold text-blue-400">{formInputs.OverallQual} / 10</span>
                      </div>
                      <input 
                        type="range" 
                        value={formInputs.OverallQual} 
                        onChange={(e) => setFormInputs({ ...formInputs, OverallQual: Number(e.target.value) })}
                        className="w-full accent-blue-600"
                        min="1" max="10" step="1"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>Very Poor</span>
                        <span>Average</span>
                        <span>Excellent / Custom</span>
                      </div>
                    </div>

                    {/* Overall Condition (1-10 slider) */}
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Condition Rating</label>
                        <span className="text-sm font-bold text-blue-400">{formInputs.OverallCond} / 10</span>
                      </div>
                      <input 
                        type="range" 
                        value={formInputs.OverallCond} 
                        onChange={(e) => setFormInputs({ ...formInputs, OverallCond: Number(e.target.value) })}
                        className="w-full accent-blue-600"
                        min="1" max="10" step="1"
                      />
                      <div className="flex justify-between text-[9px] text-slate-500">
                        <span>Very Poor</span>
                        <span>Average</span>
                        <span>Excellent</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kitchen Quality</label>
                        <div className="grid grid-cols-4 gap-2">
                          {QUALITY_PILLS.map(p => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => setFormInputs({ ...formInputs, KitchenQual: p.value })}
                              className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                                formInputs.KitchenQual === p.value 
                                  ? "bg-blue-600/20 border-blue-500 text-blue-400" 
                                  : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-white"
                              }`}
                            >
                              {p.label.split(" ")[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Exterior Material Quality</label>
                        <div className="grid grid-cols-4 gap-2">
                          {QUALITY_PILLS.map(p => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => setFormInputs({ ...formInputs, ExterQual: p.value })}
                              className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                                formInputs.ExterQual === p.value 
                                  ? "bg-blue-600/20 border-blue-500 text-blue-400" 
                                  : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-white"
                              }`}
                            >
                              {p.label.split(" ")[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Basement Height / Condition</label>
                        <div className="grid grid-cols-4 gap-2">
                          {QUALITY_PILLS.map(p => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => setFormInputs({ ...formInputs, BsmtQual: p.value })}
                              className={`py-2 text-[10px] font-bold rounded-lg border transition-all ${
                                formInputs.BsmtQual === p.value 
                                  ? "bg-blue-600/20 border-blue-500 text-blue-400" 
                                  : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-white"
                              }`}
                            >
                              {p.label.split(" ")[0]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Central Air Conditioning</label>
                        <div className="flex items-center space-x-3">
                          <button
                            type="button"
                            onClick={() => setFormInputs({ ...formInputs, CentralAir: "Y" })}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                              formInputs.CentralAir === "Y" 
                                ? "bg-emerald-600/20 border-emerald-500 text-emerald-400" 
                                : "bg-slate-900/50 border-white/5 text-slate-400"
                            }`}
                          >
                            Air Conditioned (Yes)
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormInputs({ ...formInputs, CentralAir: "N" })}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                              formInputs.CentralAir === "N" 
                                ? "bg-red-600/20 border-red-500 text-red-400" 
                                : "bg-slate-900/50 border-white/5 text-slate-400"
                            }`}
                          >
                            No Cooling (No)
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advanced Specifications Accordion (Phase 1) */}
                  <div className="border border-white/5 rounded-2xl overflow-hidden mt-6 bg-slate-900/10">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full px-5 py-3.5 text-left font-bold text-xs text-slate-300 hover:bg-white/5 flex justify-between items-center transition-all uppercase tracking-wider"
                    >
                      <span className="flex items-center space-x-2">
                        <Settings className="h-4 w-4 text-blue-400" />
                        <span>Advanced Specifications (Optional Override)</span>
                      </span>
                      <span className="text-blue-400 text-sm font-semibold">{showAdvanced ? "Hide −" : "Show +"}</span>
                    </button>
                    
                    {showAdvanced && (
                      <div className="p-5 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Lot Frontage (ft)</label>
                          <input 
                            type="number"
                            value={formInputs.LotFrontage || 0}
                            onChange={(e) => setFormInputs({ ...formInputs, LotFrontage: Number(e.target.value) })}
                            className="w-full px-3 py-2 glass-input text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Masonry Veneer Area (sq.ft)</label>
                          <input 
                            type="number"
                            value={formInputs.MasVnrArea || 0}
                            onChange={(e) => setFormInputs({ ...formInputs, MasVnrArea: Number(e.target.value) })}
                            className="w-full px-3 py-2 glass-input text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Basement Finished Area (sq.ft)</label>
                          <input 
                            type="number"
                            value={formInputs.BsmtFinSF1 || 0}
                            onChange={(e) => setFormInputs({ ...formInputs, BsmtFinSF1: Number(e.target.value) })}
                            className="w-full px-3 py-2 glass-input text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Wood Deck Area (sq.ft)</label>
                          <input 
                            type="number"
                            value={formInputs.WoodDeckSF || 0}
                            onChange={(e) => setFormInputs({ ...formInputs, WoodDeckSF: Number(e.target.value) })}
                            className="w-full px-3 py-2 glass-input text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Open Porch Area (sq.ft)</label>
                          <input 
                            type="number"
                            value={formInputs.OpenPorchSF || 0}
                            onChange={(e) => setFormInputs({ ...formInputs, OpenPorchSF: Number(e.target.value) })}
                            className="w-full px-3 py-2 glass-input text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Pool Area (sq.ft)</label>
                          <input 
                            type="number"
                            value={formInputs.PoolArea || 0}
                            onChange={(e) => setFormInputs({ ...formInputs, PoolArea: Number(e.target.value) })}
                            className="w-full px-3 py-2 glass-input text-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-6 border-t border-white/5">
                    <button 
                      onClick={() => setFormStep(2)}
                      className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl text-sm font-semibold transition-all"
                    >
                      Back
                    </button>
                    <button 
                      onClick={handlePredictSubmit}
                      disabled={predictLoading}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-emerald-500 hover:from-blue-700 hover:to-emerald-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2"
                    >
                      {predictLoading ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Computing Valuation...</span>
                        </>
                      ) : (
                        <>
                          <Calculator className="h-4 w-4" />
                          <span>Generate Valuation</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Form Step 4: Results Display */}
              {formStep === 4 && predictionResult && (
                <div className="space-y-8">
                  {/* Executive Header Banner */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 border border-white/5 p-6 rounded-2xl">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">Estimated Market Value</p>
                      <h2 className="text-4xl font-extrabold text-blue-400">
                        {formatPrice(predictionResult.predicted_price)}
                      </h2>
                      <p className="text-xs text-slate-500">
                        Price Bracket: <span className="text-slate-300 font-semibold">{predictionResult.price_category}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400">AI Confidence:</span>
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                          predictionResult.confidence >= 90 
                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" 
                            : predictionResult.confidence >= 80 
                              ? "bg-amber-500/10 border border-amber-500/20 text-amber-400" 
                              : "bg-red-500/10 border border-red-500/20 text-red-400"
                        }`}>
                          {predictionResult.confidence}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500">
                        Est. Range: <span className="text-slate-300 font-semibold">{predictionResult.estimated_range}</span>
                      </p>
                    </div>
                  </div>

                  {/* Buttons Toolbar */}
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => downloadReport(predictionResult.property_details)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-md shadow-blue-500/10"
                    >
                      <Download className="h-4 w-4" />
                      <span>Download PDF Report</span>
                    </button>
                    {isLoggedIn && (
                      <button 
                        onClick={() => handleAddToComparison(predictionResult)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/5 rounded-xl text-xs font-semibold flex items-center space-x-1.5"
                      >
                        <GitCompare className="h-4 w-4 text-emerald-400" />
                        <span>Compare This Property</span>
                      </button>
                    )}
                    <button 
                      onClick={() => setFormStep(1)}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-semibold border border-white/5"
                    >
                      Configure New Estimate
                    </button>
                  </div>

                  {/* Two Column Section: SHAP Explanations & Investment Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Column 1: SHAP Explanations Waterfall Chart */}
                    <div className="glass-panel-light rounded-2xl border border-white/5 p-5 space-y-4">
                      <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                        <span>AI Valuation Waterfall (SHAP)</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        This chart traces how the model starts from the Ames baseline average (~{formatPrice(predictionResult.shap_values._baseline || 180921)}) and adds/subtracts values based on property features.
                      </p>

                      <div className="h-64 pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            layout="vertical"
                            data={getWaterfallData(predictionResult.shap_values, predictionResult.predicted_price)}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                            <XAxis type="number" stroke="#ffffff60" fontSize={10} tickFormatter={(val) => `$${(val/1000).toFixed(0)}k`} />
                            <YAxis type="category" dataKey="name" stroke="#ffffff60" fontSize={9} width={90} />
                            <Tooltip 
                              formatter={(_value: any, _name: any, props: any) => {
                                const val = props.payload.displayVal;
                                return [formatPrice(val), "Impact/Value"];
                              }}
                              contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                            />
                            {/* Hidden transparent bar for baseline padding */}
                            <Bar dataKey="start" stackId="a" fill="transparent" />
                            {/* Visible bar showing contribution size */}
                            <Bar dataKey="size" stackId="a" radius={[0, 4, 4, 0]}>
                              {getWaterfallData(predictionResult.shap_values, predictionResult.predicted_price).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Column 2: Investment Outlook */}
                    <div className="glass-panel-light rounded-2xl border border-white/5 p-5 space-y-4">
                      <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                        <span>Investment Suitability Outlook</span>
                      </h4>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 text-center relative overflow-hidden">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Investment Score</p>
                          <h5 className="text-2xl font-black text-blue-400 mt-1">
                            {predictionResult.investment_analysis.investment_score}
                          </h5>
                          <span className="text-[9px] text-slate-500">out of 100</span>
                        </div>

                        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 text-center">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Projected 5-Yr ROI</p>
                          <h5 className="text-2xl font-black text-emerald-400 mt-1">
                            {predictionResult.investment_analysis.roi_estimate}%
                          </h5>
                          <span className="text-[9px] text-slate-500">total appreciation</span>
                        </div>

                        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 text-center">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Est. Monthly Rent</p>
                          <h5 className="text-2xl font-black text-purple-400 mt-1">
                            {formatPrice(predictionResult.investment_analysis.rental_potential)}
                          </h5>
                          <span className="text-[9px] text-slate-500">per month</span>
                        </div>

                        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 text-center">
                          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Investment Risk</p>
                          <h5 className={`text-2xl font-black mt-1 ${
                            predictionResult.investment_analysis.risk_score > 60 
                              ? "text-red-400" 
                              : predictionResult.investment_analysis.risk_score > 35 
                                ? "text-amber-400" 
                                : "text-emerald-400"
                          }`}>
                            {predictionResult.investment_analysis.risk_score}
                          </h5>
                          <span className="text-[9px] text-slate-500">lower is safer</span>
                        </div>
                      </div>

                      {/* Summary Bullet Metrics */}
                      <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/5">
                        <div className="flex justify-between">
                          <span>Market Health Index:</span>
                          <span className="font-semibold text-slate-200">{predictionResult.investment_analysis.market_score} / 100</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Resale Liquidity Rating:</span>
                          <span className="font-semibold text-slate-200">{predictionResult.investment_analysis.resale_score} / 100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial & Investment Calculators Row (Phase 2) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* Mortgage Calculator Card */}
                    <div className="glass-panel-light rounded-2xl border border-white/5 p-5 space-y-4">
                      <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                        <Calculator className="h-4 w-4 text-blue-400" />
                        <span>Interactive Mortgage Calculator</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Estimate your monthly mortgage payments (EMI) based on the estimated home value of <span className="font-bold text-white">{formatPrice(predictionResult.predicted_price)}</span>.
                      </p>
                      
                      <div className="space-y-4 pt-2 text-xs">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Down Payment ({downPaymentPercent}%)</span>
                            <span className="font-bold text-white">
                              {formatPrice(predictionResult.predicted_price * downPaymentPercent / 100)}
                            </span>
                          </div>
                          <input 
                            type="range"
                            min="0" max="80" step="5"
                            value={downPaymentPercent}
                            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Interest Rate ({interestRate}%)</span>
                            <span className="font-bold text-white">{interestRate}%</span>
                          </div>
                          <input 
                            type="range"
                            min="2.5" max="10.0" step="0.1"
                            value={interestRate}
                            onChange={(e) => setInterestRate(Number(e.target.value))}
                            className="w-full accent-blue-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <span className="text-slate-400 block mb-1">Loan Term</span>
                          <div className="flex space-x-2">
                            {[15, 30].map(term => (
                              <button
                                key={term}
                                type="button"
                                onClick={() => setLoanTerm(term)}
                                className={`flex-1 py-1.5 rounded-lg border font-bold text-[10px] uppercase transition-all ${
                                  loanTerm === term 
                                    ? "bg-blue-600/20 border-blue-500 text-blue-400" 
                                    : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-white"
                                }`}
                              >
                                {term} Year Fixed
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* EMI Results */}
                        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold block">Estimated Monthly Payment</span>
                            <span className="text-lg font-black text-blue-400">
                              {(() => {
                                const P = predictionResult.predicted_price;
                                const DP = P * downPaymentPercent / 100;
                                const L = P - DP;
                                const r = (interestRate / 100) / 12;
                                const n = loanTerm * 12;
                                const emi = r > 0 ? (L * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1) : L / n;
                                return formatPrice(isNaN(emi) ? 0 : emi);
                              })()}
                            </span>
                          </div>
                          <div className="text-right text-[10px] text-slate-500">
                            <span>Principal: {formatPrice(predictionResult.predicted_price - (predictionResult.predicted_price * downPaymentPercent / 100))}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rental Cashflow Simulator Card */}
                    <div className="glass-panel-light rounded-2xl border border-white/5 p-5 space-y-4">
                      <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                        <Coins className="h-4 w-4 text-purple-400" />
                        <span>Rental Yield & Cashflow Simulator</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Simulate investment performance and capitalization rates by adjusting rental income and monthly operating expenses.
                      </p>
                      
                      <div className="space-y-4 pt-2 text-xs">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Monthly Gross Rent</span>
                            <span className="font-bold text-purple-400">{formatPrice(customRent)}</span>
                          </div>
                          <input 
                            type="range"
                            min={Math.round(predictionResult.investment_analysis.rental_potential * 0.5) || 500}
                            max={Math.round(predictionResult.investment_analysis.rental_potential * 1.8) || 3000}
                            step="50"
                            value={customRent}
                            onChange={(e) => setCustomRent(Number(e.target.value))}
                            className="w-full accent-purple-600"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Monthly Operating Expenses</span>
                            <span className="font-bold text-red-400">{formatPrice(customExpenses)}</span>
                          </div>
                          <input 
                            type="range"
                            min={Math.round(predictionResult.investment_analysis.estimated_expenses * 0.4) || 100}
                            max={Math.round(predictionResult.investment_analysis.estimated_expenses * 2.0) || 1500}
                            step="20"
                            value={customExpenses}
                            onChange={(e) => setCustomExpenses(Number(e.target.value))}
                            className="w-full accent-red-600"
                          />
                        </div>

                        {/* Cashflow Results */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">Net Cash Flow / Mo</span>
                            <span className={`text-base font-black ${customRent - customExpenses >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                              {formatPrice(customRent - customExpenses)}
                            </span>
                          </div>

                          <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-bold block">Cap Rate (Yield)</span>
                            <span className="text-base font-black text-purple-400">
                              {(() => {
                                const netAnnual = (customRent - customExpenses) * 12;
                                const yieldPercent = (netAnnual / predictionResult.predicted_price) * 100;
                                return isNaN(yieldPercent) ? "0.00%" : `${yieldPercent.toFixed(2)}%`;
                              })()}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-950/40 px-3 py-2 rounded-lg border border-white/5 text-[10px] text-slate-400 leading-relaxed">
                          <span className="font-bold text-slate-300 block mb-0.5">Calculated ROI Summary</span>
                          An annual net income of <span className="font-bold text-white">{formatPrice(Math.max(0, (customRent - customExpenses) * 12))}</span> yields a capitalization rate of <span className="font-bold text-white">{(((customRent - customExpenses) * 12 / predictionResult.predicted_price) * 100).toFixed(2)}%</span> against the property valuation.
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Specification breakdown grid */}
                  <div className="glass-panel-light rounded-2xl border border-white/5 p-5 space-y-4">
                    <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                      <Building className="h-4 w-4 text-slate-400" />
                      <span>Property Configuration Summary</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500 block">Neighborhood</span>
                        <span className="font-semibold text-slate-200">{predictionResult.property_details.Neighborhood}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Ground Living Area</span>
                        <span className="font-semibold text-slate-200">{predictionResult.property_details.GrLivArea} sq.ft</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Bedrooms / Baths</span>
                        <span className="font-semibold text-slate-200">
                          {predictionResult.property_details.BedroomAbvGr} beds / {predictionResult.property_details.FullBath} baths
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Garage capacity</span>
                        <span className="font-semibold text-slate-200">{predictionResult.property_details.GarageCars} cars</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Lot plot size</span>
                        <span className="font-semibold text-slate-200">{predictionResult.property_details.LotArea} sq.ft</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Foundation Basement</span>
                        <span className="font-semibold text-slate-200">{predictionResult.property_details.TotalBsmtSF} sq.ft</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Overall quality</span>
                        <span className="font-semibold text-slate-200">{predictionResult.property_details.OverallQual} / 10</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Year built</span>
                        <span className="font-semibold text-slate-200">{predictionResult.property_details.YearBuilt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Grid for Map & Live Sandbox (Phase 3) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Mock Map Preview (Phase 1) */}
                    <div className="glass-panel-light rounded-2xl border border-white/5 p-5 space-y-4">
                      <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-emerald-400" />
                        <span>Property Location Map (Ames Geographic Context)</span>
                      </h4>
                      <div className="relative h-48 bg-slate-900/60 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
                        
                        <div className="absolute top-2 left-2 text-[9px] text-slate-500 font-mono">
                          Ames, IA Neighborhood Coordinates
                        </div>
                        
                        <div className="z-10 bg-slate-950/80 px-4 py-3 rounded-lg border border-white/5 text-center space-y-1">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">Active Coordinates</span>
                          <div className="text-sm font-black text-blue-400 flex items-center justify-center space-x-1">
                            <MapPin className="h-3.5 w-3.5 text-emerald-400 animate-bounce" />
                            <span>
                              {NEIGHBORHOOD_COORDS[predictionResult.property_details.Neighborhood]?.lat || 42.02}, 
                              {NEIGHBORHOOD_COORDS[predictionResult.property_details.Neighborhood]?.lng || -93.65}
                            </span>
                          </div>
                          <span className="text-[9px] text-slate-500 block font-semibold">
                            Neighborhood: {predictionResult.property_details.Neighborhood} Area
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Live Valuation Sandbox (Phase 3) */}
                    <div className="glass-panel-light rounded-2xl border border-white/5 p-5 space-y-4">
                      <h4 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center space-x-2">
                        <RefreshCw className="h-4 w-4 text-blue-400 animate-spin-slow" />
                        <span>Live Valuation Sandbox</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Tweak key property attributes in real-time to simulate changes in estimated value and ROI instantly.
                      </p>
                      
                      <div className="space-y-3 pt-1 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Active Valuation Model</label>
                          <select 
                            value={modelType}
                            onChange={async (e) => {
                              const selected = e.target.value;
                              setModelType(selected);
                              try {
                                const res = await api.predict(predictionResult.property_details, selected);
                                setPredictionResult(res);
                              } catch (err) {
                                console.error(err);
                              }
                            }}
                            className="w-full px-3 py-2 glass-input text-xs border-blue-500/20"
                          >
                            <option value="random_forest">Random Forest Regressor</option>
                            <option value="linear">Ridge Linear Regression</option>
                            <option value="gradient_boosting">Gradient Boosting Machine</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Ground Living Area</span>
                            <span className="font-bold text-white">{predictionResult.property_details.GrLivArea} sq.ft</span>
                          </div>
                          <input 
                            type="range"
                            min="500" max="6000" step="50"
                            value={predictionResult.property_details.GrLivArea}
                            onChange={(e) => handleLiveSimChange("GrLivArea", Number(e.target.value))}
                            className="w-full accent-blue-600 cursor-ew-resize"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Overall Finish Quality</span>
                            <span className="font-bold text-white">{predictionResult.property_details.OverallQual} / 10</span>
                          </div>
                          <input 
                            type="range"
                            min="1" max="10" step="1"
                            value={predictionResult.property_details.OverallQual}
                            onChange={(e) => handleLiveSimChange("OverallQual", Number(e.target.value))}
                            className="w-full accent-blue-600 cursor-ew-resize"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Garage Cars Capacity</span>
                            <span className="font-bold text-white">{predictionResult.property_details.GarageCars} cars</span>
                          </div>
                          <input 
                            type="range"
                            min="0" max="4" step="1"
                            value={predictionResult.property_details.GarageCars}
                            onChange={(e) => handleLiveSimChange("GarageCars", Number(e.target.value))}
                            className="w-full accent-blue-600 cursor-ew-resize"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </div>
        )}

        {/* --- BATCH UPLOAD TAB --- */}
        {currentTab === "batch" && (
          <div className="max-w-2xl mx-auto pb-12 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-extrabold">Batch Valuation (CSV Upload)</h2>
              <p className="text-slate-400 text-sm max-w-lg mx-auto">
                Predict prices for hundreds of properties simultaneously. Upload a CSV file and download the prediction results immediately.
              </p>
            </div>

            {batchError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center space-x-2 text-sm">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{batchError}</span>
              </div>
            )}

            {batchSuccess && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center space-x-2 text-sm">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                <span>Batch valuation completed successfully! Your file has been processed and downloaded.</span>
              </div>
            )}

            <div className="glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6">
              <form onSubmit={handleBatchPredict} className="space-y-6">
                
                {/* Drag and Drop Zone */}
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center hover:border-blue-500/50 transition-all cursor-pointer relative bg-slate-900/20">
                  <input 
                    type="file" 
                    onChange={(e) => setBatchFile(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".csv"
                  />
                  <div className="space-y-3">
                    <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {batchFile ? batchFile.name : "Click to upload CSV"}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Only .csv files supported. Maximum size 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button 
                    type="submit"
                    disabled={batchLoading || !batchFile}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-blue-500/20 flex items-center space-x-2"
                  >
                    {batchLoading ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Processing CSV...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="h-4 w-4" />
                        <span>Upload & Run Predictions</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Instructions */}
              <div className="border-t border-white/5 pt-6 space-y-3 text-xs text-slate-400 leading-relaxed">
                <h5 className="font-bold text-slate-200 flex items-center space-x-1.5">
                  <Info className="h-4 w-4 text-blue-400" />
                  <span>Formatting Guidelines</span>
                </h5>
                <p>
                  To ensure successful processing, format your CSV columns with correct capitalizations. You do not need to provide all 76 features; missing ones are auto-filled with median defaults.
                </p>
                <div className="bg-slate-950/80 p-3 rounded-lg border border-white/5 font-mono text-[9px] overflow-x-auto text-slate-300">
                  <p>Neighborhood,LotArea,GrLivArea,BedroomAbvGr,FullBath,GarageCars,YearBuilt,OverallQual</p>
                  <p>CollgCr,9500,1600,3,2,2,2002,6</p>
                  <p>StoneBr,12000,2200,4,2,3,2008,8</p>
                </div>
                <p className="text-[10px] text-slate-500">
                  * Note: Output file contains all your input columns plus three new columns: <strong>Predicted_Price</strong>, <strong>Confidence_Score</strong>, and <strong>Investment_Score</strong>.
                </p>
              </div>
            </div>

            {/* Admin Model Training (Phase 4) */}
            {isLoggedIn && (
              <div className="glass-panel rounded-3xl border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 mt-8">
                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold flex items-center space-x-2 text-blue-400">
                    <Settings className="h-5 w-5 animate-spin-slow" />
                    <span>Administrative AI Model Re-Training</span>
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Re-fit the machine learning models on a new set of Ames housing records. Upload a training CSV including target <span className="font-mono text-white text-[10px]">SalePrice</span>.
                  </p>
                </div>

                {trainError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center space-x-2 text-xs">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>{trainError}</span>
                  </div>
                )}

                {trainSuccess && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center space-x-2 font-bold">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      <span>{trainSuccess.message}</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-[10px] text-slate-300 font-mono">
                      <div>Rows Fitted: <span className="text-white font-bold">{trainSuccess.metrics.rows_processed}</span></div>
                      <div>Features Used: <span className="text-white font-bold">{trainSuccess.metrics.features_used}</span></div>
                      <div>R² Score: <span className="text-white font-bold">{trainSuccess.metrics.r2_score}</span></div>
                      <div>RMSE: <span className="text-white font-bold">${trainSuccess.metrics.rmse.toLocaleString()}</span></div>
                      <div>Time: <span className="text-white font-bold">{trainSuccess.metrics.training_time_seconds}s</span></div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleTrainSubmit} className="space-y-4">
                  {/* Upload Dropzone */}
                  <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center hover:border-blue-500/50 transition-all cursor-pointer relative bg-slate-900/10">
                    <input 
                      type="file" 
                      onChange={(e) => setTrainFile(e.target.files ? e.target.files[0] : null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".csv"
                    />
                    <div className="space-y-2">
                      <div className="mx-auto w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold">
                          {trainFile ? trainFile.name : "Select training CSV file"}
                        </p>
                        <p className="text-[9px] text-slate-500">
                          File must contain columns: SalePrice, GrLivArea, OverallQual, YearBuilt.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button 
                      type="submit"
                      disabled={trainLoading || !trainFile}
                      className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2"
                    >
                      {trainLoading ? (
                        <>
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Re-fitting Models...</span>
                        </>
                      ) : (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          <span>Fit & Update Models</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        )}

        {/* --- HISTORY TAB --- */}
        {currentTab === "history" && (
          <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-3xl font-extrabold">Valuation History</h2>
                <p className="text-slate-400 text-sm">Review your past property valuations and download PDF reports.</p>
              </div>

              {/* Search input */}
              <div className="w-full sm:w-72 relative">
                <input 
                  type="text" 
                  placeholder="Search by neighborhood..."
                  value={historySearch} 
                  onChange={(e) => setHistorySearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 glass-input text-xs"
                />
                <Search className="absolute left-3.5 top-3.5 h-3.5 w-3.5 text-slate-500" />
              </div>
            </div>

            {historyLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                <span className="text-sm text-slate-400">Loading prediction history...</span>
              </div>
            ) : historyList.length === 0 ? (
              <div className="glass-panel rounded-3xl border border-white/5 p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
                  <History className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-200">No predictions found</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    You haven't run any valuations yet, or none match your search filter.
                  </p>
                </div>
                <button 
                  onClick={() => { handleNav("prediction"); setFormStep(1); }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-500/10 inline-flex items-center space-x-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Estimate</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {historyList.map((item) => (
                  <div key={item.id} className="glass-panel rounded-2xl border border-white/5 p-5 space-y-4 relative hover:border-white/10 transition-all flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                          <h4 className="font-bold text-lg text-slate-200 mt-0.5">{item.property_details.Neighborhood}</h4>
                        </div>
                        <span className="px-2 py-0.5 text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-md">
                          Score: {item.investment_score}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                        <div>
                          <span className="text-slate-500 block">Living Area</span>
                          <span className="text-slate-300 font-semibold">{item.property_details.GrLivArea} sq.ft</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Bedrooms / Baths</span>
                          <span className="text-slate-300 font-semibold">{item.property_details.BedroomAbvGr}b / {item.property_details.FullBath}ba</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Year Built</span>
                          <span className="text-slate-300 font-semibold">{item.property_details.YearBuilt}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Quality Rating</span>
                          <span className="text-slate-300 font-semibold">{item.property_details.OverallQual} / 10</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/5">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Predicted Selling Price</span>
                        <h3 className="text-2xl font-black text-blue-400 mt-0.5">{formatPrice(item.predicted_price)}</h3>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-white/5 mt-2">
                      <button 
                        onClick={() => downloadHistoryReport(item.id)}
                        disabled={historyReportDownloading === item.id}
                        className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1"
                      >
                        {historyReportDownloading === item.id ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Download className="h-3 w-3" />
                        )}
                        <span>Report</span>
                      </button>
                      <button 
                        onClick={async () => {
                          setPredictLoading(true);
                          try {
                            const detail = await api.predict(item.property_details);
                            setPredictionResult(detail);
                            setFormStep(4);
                            setCurrentTab("prediction");
                          } catch (err) {
                            alert("Could not load details");
                          } finally {
                            setPredictLoading(false);
                          }
                        }}
                        className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-lg border border-white/5 text-[10px] font-bold"
                      >
                        Details
                      </button>
                      <button 
                        onClick={() => deleteHistoryItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        title="Delete prediction"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- COMPARISON TAB --- */}
        {currentTab === "compare" && (
          <div className="space-y-6 pb-12">
            <div>
              <h2 className="text-3xl font-extrabold">Property Comparison</h2>
              <p className="text-slate-400 text-sm">Compare up to 3 predictions side-by-side to make data-driven buying or selling decisions.</p>
            </div>

            {comparisonList.length === 0 ? (
              <div className="glass-panel border border-white/5 rounded-3xl p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
                  <GitCompare className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-200">Comparison list is empty</h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  Run a valuation first, and click "Compare This Property" on the results screen to build your comparison deck.
                </p>
                <button 
                  onClick={() => { handleNav("prediction"); setFormStep(1); }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center space-x-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Start Valuation</span>
                </button>
              </div>
            ) : (
              <div className="glass-panel border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-900/80 border-b border-white/10 text-xs uppercase tracking-wider text-slate-400">
                        <th className="p-4 text-left font-bold min-w-[200px]">Specification</th>
                        {comparisonList.map((_, idx) => (
                          <th key={idx} className="p-4 text-center font-bold relative min-w-[200px] border-l border-white/5">
                            <div className="flex justify-between items-center px-2">
                              <span>Property #{idx + 1}</span>
                              <button 
                                onClick={() => setComparisonList(comparisonList.filter((_, i) => i !== idx))}
                                className="text-slate-500 hover:text-red-400"
                                title="Remove comparison"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      <tr className="bg-blue-600/5">
                        <td className="p-4 font-bold text-slate-200">Predicted Price</td>
                        {comparisonList.map((item, idx) => (
                          <td key={idx} className="p-4 text-center font-black text-lg text-blue-400 border-l border-white/5">
                            {formatPrice(item.predicted_price)}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-bold">AI Confidence</td>
                        {comparisonList.map((item, idx) => (
                          <td key={idx} className="p-4 text-center font-semibold border-l border-white/5">
                            {item.confidence}%
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-bold">Investment Score</td>
                        {comparisonList.map((item, idx) => (
                          <td key={idx} className="p-4 text-center font-bold text-emerald-400 border-l border-white/5">
                            {item.investment_analysis.investment_score} / 100
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-bold font-semibold">Projected 5-Yr ROI</td>
                        {comparisonList.map((item, idx) => (
                          <td key={idx} className="p-4 text-center border-l border-white/5">
                            {item.investment_analysis.roi_estimate}%
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-bold">Neighborhood</td>
                        {comparisonList.map((item, idx) => (
                          <td key={idx} className="p-4 text-center border-l border-white/5">
                            {item.property_details.Neighborhood}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-bold">Living Area</td>
                        {comparisonList.map((item, idx) => (
                          <td key={idx} className="p-4 text-center border-l border-white/5">
                            {item.property_details.GrLivArea} sq.ft
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-bold">Bedrooms / Baths</td>
                        {comparisonList.map((item, idx) => (
                          <td key={idx} className="p-4 text-center border-l border-white/5">
                            {item.property_details.BedroomAbvGr} beds / {item.property_details.FullBath} baths
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-bold">Garage Capacity</td>
                        {comparisonList.map((item, idx) => (
                          <td key={idx} className="p-4 text-center border-l border-white/5">
                            {item.property_details.GarageCars} cars ({item.property_details.GarageArea} sq.ft)
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-bold">Year Built / Remodeled</td>
                        {comparisonList.map((item, idx) => (
                          <td key={idx} className="p-4 text-center border-l border-white/5">
                            {item.property_details.YearBuilt} / {item.property_details.YearRemodAdd}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-bold">Overall Quality</td>
                        {comparisonList.map((item, idx) => (
                          <td key={idx} className="p-4 text-center border-l border-white/5">
                            {item.property_details.OverallQual} / 10
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-bold">Rental Yield potential</td>
                        {comparisonList.map((item, idx) => (
                          <td key={idx} className="p-4 text-center border-l border-white/5 text-purple-400 font-semibold">
                            {formatPrice(item.investment_analysis.rental_potential)}/mo
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="p-4 font-bold">Risk Index</td>
                        {comparisonList.map((item, idx) => (
                          <td key={idx} className={`p-4 text-center border-l border-white/5 font-semibold ${
                            item.investment_analysis.risk_score > 60 ? "text-red-400" : "text-emerald-400"
                          }`}>
                            {item.investment_analysis.risk_score} (lower is safer)
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- ANALYTICS TAB --- */}
        {currentTab === "analytics" && (
          <div className="space-y-8 pb-12">
            <div>
              <h2 className="text-3xl font-extrabold">Market Dashboard & Analytics</h2>
              <p className="text-slate-400 text-sm">Aggregated pricing trends, local variations, and model feature importances from your history.</p>
            </div>

            {analyticsLoading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
                <span className="text-sm text-slate-400">Loading analytics dashboard data...</span>
              </div>
            ) : !analyticsData || analyticsData.total_predictions === 0 ? (
              <div className="glass-panel border border-white/5 rounded-3xl p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto text-slate-500">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h4 className="font-bold text-slate-200">No analytical data available</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Run multiple valuations and save them to your prediction history. The platform needs data records to generate distribution charts and regression lines.
                </p>
                <button 
                  onClick={() => { handleNav("prediction"); setFormStep(1); }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-all inline-flex items-center space-x-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Start Free Valuation</span>
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Scorecards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Valuations Run</p>
                      <h3 className="text-3xl font-extrabold text-blue-400">{analyticsData.total_predictions}</h3>
                      <p className="text-[10px] text-slate-500">Total properties predicted in profile history.</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
                      <Building className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Average Predicted Price</p>
                      <h3 className="text-3xl font-extrabold text-emerald-400">{formatPrice(analyticsData.average_price)}</h3>
                      <p className="text-[10px] text-slate-500">Mean estimation value across your portfolio.</p>
                    </div>
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Top Driving Metric</p>
                      <h3 className="text-3xl font-extrabold text-purple-400">
                        {analyticsData.feature_importance[0]?.feature || "N/A"}
                      </h3>
                      <p className="text-[10px] text-slate-500">Most statistically significant pricing factor.</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400">
                      <Sparkles className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Chart 1: Price Distribution */}
                  <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Price Bracket Distribution</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.price_distribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                          <XAxis dataKey="range" stroke="#ffffff60" fontSize={8} />
                          <YAxis stroke="#ffffff60" fontSize={8} />
                          <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }} />
                          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 2: Quality vs Avg Price */}
                  <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Quality Score vs. Average Price</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData.quality_price_trend} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                          <XAxis dataKey="quality" stroke="#ffffff60" fontSize={8} label={{ value: "Quality Rating (1-10)", position: "insideBottom", offset: -5, fill: "#ffffff60" }} />
                          <YAxis stroke="#ffffff60" fontSize={8} tickFormatter={(val) => `$${val/1000}k`} />
                          <Tooltip formatter={(val) => formatPrice(Number(val))} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }} />
                          <Line type="monotone" dataKey="average_price" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 3: Neighborhood valuation differences */}
                  <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Top Neighborhoods by Average Price</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={analyticsData.top_neighborhoods} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                          <XAxis type="number" stroke="#ffffff60" fontSize={8} tickFormatter={(val) => `$${val/1000}k`} />
                          <YAxis type="category" dataKey="neighborhood" stroke="#ffffff60" fontSize={8} width={60} />
                          <Tooltip formatter={(val) => formatPrice(Number(val))} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }} />
                          <Bar dataKey="average_price" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Chart 4: RF Global Feature Importances */}
                  <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Random Forest Model Feature Weights</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.feature_importance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                          <XAxis dataKey="feature" stroke="#ffffff60" fontSize={8} />
                          <YAxis stroke="#ffffff60" fontSize={8} tickFormatter={(val) => `${val}%`} />
                          <Tooltip formatter={(val) => [`${val}%`, "Global Weight"]} contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }} />
                          <Bar dataKey="importance" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-12 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs text-slate-500">
            &copy; 2026 HomeValuator. AI House Price Prediction Platform. All rights reserved.
          </p>
          <p className="text-[10px] text-slate-600 max-w-xl mx-auto leading-relaxed">
            HomeValuator estimates property values using machine learning algorithms trained on historical transactions in Ames, Iowa. Predictions are for informational and research purposes only, not financial or investment advice.
          </p>
        </div>
      </footer>

      {/* --- AUTH MODAL --- */}
      {authModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md p-6 glass-panel rounded-3xl border border-white/10 shadow-2xl space-y-6 relative"
          >
            {/* Close button */}
            <button 
              onClick={() => setAuthModal({ ...authModal, open: false })}
              className="absolute top-4 right-4 text-slate-500 hover:text-white p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2 text-center">
              <h3 className="text-2xl font-extrabold">
                {authModal.mode === "login" ? "Welcome Back" : "Create Account"}
              </h3>
              <p className="text-xs text-slate-400">
                {authModal.mode === "login" 
                  ? "Sign in to save predictions, upload CSVs, and view analytics." 
                  : "Sign up to unlock advanced valuation analytics and export tools."}
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-xs flex items-center space-x-1.5">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authModal.mode === "register" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Full Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter your name"
                    value={authName} 
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full px-4 py-2.5 glass-input text-xs"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com"
                  value={authEmail} 
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="Min. 6 characters"
                  value={authPassword} 
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full px-4 py-2.5 glass-input text-xs"
                />
              </div>

              <button 
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center space-x-2"
              >
                {authLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>{authModal.mode === "login" ? "Sign In" : "Sign Up"}</span>
                )}
              </button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-2 border-t border-white/5">
              {authModal.mode === "login" ? (
                <p>
                  Don't have an account?{" "}
                  <button 
                    onClick={() => { setAuthModal({ open: true, mode: "register" }); setAuthError(""); }}
                    className="text-blue-400 hover:underline font-bold"
                  >
                    Register here
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button 
                    onClick={() => { setAuthModal({ open: true, mode: "login" }); setAuthError(""); }}
                    className="text-blue-400 hover:underline font-bold"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
