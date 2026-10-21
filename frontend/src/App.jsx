import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import i18n, { getStoredLanguage, setStoredLanguage } from "./i18n";
import Landing from "./pages/Landing";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SoilAnalysis from "./pages/SoilAnalysis";
import CropRecommendation from "./pages/CropRecommendation";
import CropSoilAdvisor from "./pages/CropSoilAdvisor";
import FarmingAdvisor from "./pages/FarmingAdvisor";
import FarmingAssistant from "./pages/FarmingAssistant";
import Weather from "./pages/Weather";
import DiseaseDetection from "./pages/DiseaseDetection";
import SoilTypeDetection from "./pages/SoilTypeDetection";
import ProfitMarketAnalyzer from "./pages/ProfitMarketAnalyzer";
import SmartIrrigation from "./pages/SmartIrrigation";
import AlertDetail from "./pages/AlertDetail";
import GovernmentSchemes from "./pages/GovernmentSchemes";
import AlertBanner from "./components/AlertBanner";

function App() {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Could not restore saved user:", error);
      localStorage.removeItem("user");
      return null;
    }
  });

  const [authInitialized, setAuthInitialized] = useState(false);

  // Restore the saved application language on startup.
  useEffect(() => {
    i18n.changeLanguage(getStoredLanguage());
    setAuthInitialized(true);
  }, []);

  const handleLogin = (userData) => {
    const language = getStoredLanguage();
    const updatedUser = { ...userData, language };

    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setStoredLanguage(language);
    i18n.changeLanguage(language);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  if (!authInitialized) {
    return <div style={{ padding: "24px" }}>Loading...</div>;
  }

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* Global Alert Banner - shows on all authenticated pages */}
      {user && <AlertBanner user={user} />}

      <Routes>
        <Route
          path="/government-schemes"
          element={
            user ? (
              <GovernmentSchemes
                user={user}
                onLogout={handleLogout}
                onUserUpdate={handleLogin}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/" element={<Landing />} />
                <Route path="/credit" element={<About />} />
        <Route path="/about" element={<Navigate to="/credit" replace />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard
                user={user}
                onLogout={handleLogout}
                onUserUpdate={handleLogin}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/soil-analysis"
          element={
            user ? (
              <SoilAnalysis
                user={user}
                onLogout={handleLogout}
                onUserUpdate={handleLogin}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/crop-recommendation"
          element={
            user ? (
              <CropSoilAdvisor
                user={user}
                onLogout={handleLogout}
                onUserUpdate={handleLogin}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
                <Route
          path="/crop-recommendation/results"
          element={
            user ? (
              <CropRecommendation
                user={user}
                onLogout={handleLogout}
                onUserUpdate={handleLogin}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/weather"
          element={
            user ? (
              <Weather
                user={user}
                onLogout={handleLogout}
                onUserUpdate={handleLogin}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/disease-detection"
          element={
            user ? (
              <DiseaseDetection
                user={user}
                onLogout={handleLogout}
                onUserUpdate={handleLogin}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/soil-detection"
          element={
            user ? (
              <SoilTypeDetection
                user={user}
                onLogout={handleLogout}
                onUserUpdate={handleLogin}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/market-prices"
          element={
            user ? (
              <ProfitMarketAnalyzer
                user={user}
                onLogout={handleLogout}
                onUserUpdate={handleLogin}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/irrigation"
          element={
            user ? (
              <SmartIrrigation
                user={user}
                onLogout={handleLogout}
                onUserUpdate={handleLogin}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />        <Route
          path="/alert/:id"
          element={
            user ? (
              <AlertDetail
                user={user}
                onLogout={handleLogout}
                onUserUpdate={handleLogin}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/farming-advisor"
          element={
            user ? (
              <FarmingAdvisor
                user={user}
                onLogout={handleLogout}
                onUserUpdate={handleLogin}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />        <Route
          path="/farming-assistant"
          element={
            user ? (
              <FarmingAssistant
                user={user}
                onLogout={handleLogout}
                onUserUpdate={handleLogin}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;









