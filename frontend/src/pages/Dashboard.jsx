import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { motion } from "framer-motion";
import AppLayout from "../components/AppLayout";
import {
  FiDroplet,
  FiCloudRain,
  FiActivity,
  FiTrendingUp,
  FiBookOpen,
  FiMessageCircle,
  FiDollarSign,
  FiArrowUpRight,
  FiMic,
  FiLayers,
} from "react-icons/fi";
import "./Dashboard.css";

function Dashboard({ user, onLogout, onUserUpdate }) {
  const { t } = useTranslation();

  const FEATURES = [
    {
      icon: FiBookOpen,
      title: "Government Scheme",
      desc: "Explore government schemes for farmers",
      path: "/government-schemes",
    },
    {
      icon: FiLayers,
      title: "Crop & Soil",
      desc: "Smart crop and soil recommendations",
      path: "/crop-recommendation",
    },
    {
      icon: FiCloudRain,
      title: "Weather Intel",
      desc: "Weather forecasts and alerts",
      path: "/weather",
    },
    {
      icon: FiActivity,
      title: "Pest Doctor",
      desc: "Detect crop pests and diseases",
      path: "/disease-detection",
    },
    {
      icon: FiDroplet,
      title: "Smart Irrigation",
      desc: "Water management suggestions",
      path: "/soil-analysis",
    },
{
      icon: FiDollarSign,
      title: "Farm Finance",
      desc: "Explore market prices and farm profit",
      path: "/market-prices",
    },
    {
      icon: FiMic,
      title: "Farm Assistant",
      desc: "Your future AI farming companion",
      path: "/crop-recommendation",
    },
];

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(false);
  const [cropCount, setCropCount] = useState(null);
  const [cropCountLoading, setCropCountLoading] = useState(true);
  const [cropNames, setCropNames] = useState([]);
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(
          `/api/weather/alerts/user/${user.id}?unread_only=true&limit=3`,
        );
        const data = res.data;
        setAlerts(Array.isArray(data) ? data : data?.alerts || []);
      } catch {
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [user.id]);
  useEffect(() => {
    let cancelled = false;

    const fetchWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(false);

      try {
        const userLocation =
  typeof user?.location === "string" ? user.location.trim() : "";

const location =
  !userLocation ||
  ["andhra pradesh", "madhya pradesh"].includes(
    userLocation.toLowerCase()
  )
    ? "Balaghat, Madhya Pradesh, India"
    : userLocation;

// console.log("Weather location being searched:", location);
console.log("Weather location being searched:", location);

        const geoResponse = await axios.get(
          "https://geocoding-api.open-meteo.com/v1/search",
          {
            params: {
              name: location,
              count: 1,
              language: "en",
              format: "json",
            },
          },
        );

        const place = geoResponse.data?.results?.[0];

        if (!place) {
          throw new Error("Location not found");
        }

        const weatherResponse = await axios.get(
          "https://api.open-meteo.com/v1/forecast",
          {
            params: {
              latitude: place.latitude,
              longitude: place.longitude,
              current:
                "temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m",
              timezone: "auto",
            },
          },
        );

        if (!cancelled) {
          setWeather({
            ...weatherResponse.data.current,
            location: place.name,
          });
        }
      } catch (error) {
        console.error("Weather fetch failed:", error);

        if (!cancelled) {
          setWeather(null);
          setWeatherError(true);
        }
      } finally {
        if (!cancelled) {
          setWeatherLoading(false);
        }
      }
    };

    fetchWeather();

    return () => {
      cancelled = true;
    };
  }, [user?.location]);

  const getWeatherCondition = (code) => {
    if (code === 0) return t("dashboard.clearSky");
    if ([1, 2].includes(code)) return t("dashboard.partlyCloudy");
    if (code === 3) return t("dashboard.overcast");
    if ([45, 48].includes(code)) return t("dashboard.foggy");
    if ([51, 53, 55, 56, 57].includes(code)) return t("dashboard.drizzle");
    if ([61, 63, 65, 66, 67].includes(code)) return t("dashboard.rain");
    if ([71, 73, 75, 77].includes(code)) return t("dashboard.snow");
    if ([80, 81, 82].includes(code)) return t("dashboard.rainShowers");
    if ([95, 96, 99].includes(code)) return t("dashboard.thunderstorm");

    return t("dashboard.weatherUnavailable");
  };

  useEffect(() => {
    let cancelled = false;

    const fetchCropCount = async () => {
      setCropCountLoading(true);

      try {
        const response = await axios.get("/api/crop/all");
        const crops = response.data?.crops;

        if (!cancelled) {
          if (Array.isArray(crops)) {
            setCropCount(crops.length);

            setCropNames(
              crops
                .map((crop) =>
                  typeof crop === "string"
                    ? crop
                    : crop?.name || crop?.crop_name,
                )
                .filter(Boolean),
            );
          } else {
            setCropCount(null);
            setCropNames([]);
          }
        }
      } catch (error) {
        console.error("Crop count fetch failed:", error);

        if (!cancelled) {
          setCropCount(null);
          setCropNames([]);
        }
      } finally {
        if (!cancelled) {
          setCropCountLoading(false);
        }
      }
    };

    fetchCropCount();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppLayout user={user} onLogout={onLogout} onUserUpdate={onUserUpdate}>
      <div className="dashboard">
        <div className="container">
          <motion.div
            className="dashboard-hero"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
            }}
          >
            <h1 className="dashboard-title">
              {t("dashboard.welcome", { name: user.name })}
            </h1>
            <p className="dashboard-subtitle">
              {user.location || t("dashboard.farmingDashboard")}
            </p>
            <p className="dashboard-tip">
              {t("dashboard.tip")}
            </p>
          </motion.div>
{/* 
          {alerts.length > 0 && (
            <motion.section
              className="alerts-section"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="section-heading">{t("dashboard.activeAlerts")}</h2>

              <div className="alerts-grid">
                {alerts.map((alert) => (
                  <Link
                    key={alert.id}
                    to={`/alert/${alert.id}`}
                    className={`alert-card severity-${alert.severity}`}
                  >
                    <span className="alert-badge">{alert.severity}</span>
                    <h3>{alert.title}</h3>
                    <p>{alert.description}</p>
                  </Link>
                ))}
              </div>
            </motion.section>
          )} */}
          {/* Dashboard Statistics */}
          <section className="dashboard-stats" aria-label={t("dashboard.farmStatistics")}>
            <div className="stat-card">
              <div className="stat-icon stat-icon-green">🌱</div>

              <div className="stat-info">
                <div className="stat-info">
                  <p className="stat-label">{t("dashboard.cropVarieties")}</p>

                  <h2 className="stat-value">
                    {cropCountLoading
                      ? t("dashboard.loading")
                      : cropCount !== null
                        ? cropCount
                        : "--"}
                  </h2>
                  <p className="stat-description">{t("dashboard.availableCropVarieties")}</p>
                  {/* <p className="stat-description">Crop information available</p> */}
                  <p className="stat-description crop-names">
                    {cropCountLoading
                      ? t("dashboard.loadingCropNames")
                      : cropNames.length > 0
                        ? cropNames.map((name) => {
                          const normalized = String(name)
                            .trim()
                            .toLowerCase()
                            .replace(/[_-]+/g, " ")
                            .replace(/\s+/g, " ");

                          const cropKeyMap = {
                            "rice": "rice",
                            "paddy": "rice",
                            "wheat": "wheat",
                            "cotton": "cotton",
                            "groundnut": "groundnut",
                            "peanut": "groundnut",
                            "sugarcane": "sugarcane",
                            "sugar cane": "sugarcane",
                            "maize": "maize",
                            "corn": "maize",
                            "pulses (tur)": "pulsesTur",
                            "tur": "pulsesTur",
                            "arhar": "pulsesTur",
                            "pigeon pea": "pulsesTur",
                            "jowar": "jowar",
                            "sorghum": "jowar",
                            "jowar (sorghum)": "jowar",
                            "pearl millet": "pearlMillet",
                            "bajra": "pearlMillet",
                            "pearl millet (bajra)": "pearlMillet",
                            "tomato": "tomato",
                            "potato": "potato",
                            "onion": "onion",
                            "chilli": "chilli",
                            "chili": "chilli",
                            "tobacco": "tobacco",
                            "turmeric": "turmeric"
                          };

                          const key = cropKeyMap[normalized];
                          return key ? t(`cropNames.${key}`) : name;
                        }).join(", ")
                        : t("dashboard.cropNamesUnavailable")}
                  </p>
                </div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-blue">🌦️</div>

              <div className="stat-info">
                <p className="stat-label">{t("dashboard.weather")}</p>

                <h2 className="stat-value">
                  {weatherLoading
                    ? t("dashboard.loading")
                    : weather
                      ? `${Math.round(weather.temperature_2m)}°C`
                      : t("dashboard.unavailable")}
                </h2>

                <p className="stat-description">
                  {weatherLoading
                    ? t("dashboard.fetchingWeather")
                    : weather
                      ? `${getWeatherCondition(weather.weather_code)} · ${weather.location}`
                      : weatherError
                        ? t("dashboard.unableToFetchWeather")
                        : t("dashboard.weatherDataUnavailable")}
                </p>

              {weather && !weatherLoading && (
  <div className="stat-extra-info">
    <div className="stat-detail">
      <span className="stat-detail-icon">💧</span>
      <div>
        <span className="stat-detail-label">{t("dashboard.humidity")}-</span>
        <strong className="dashboard-weather-value">{weather.relative_humidity_2m ?? weather.current?.relative_humidity_2m ?? weather.current?.humidity ?? "—"}{(weather.relative_humidity_2m ?? weather.current?.relative_humidity_2m ?? weather.current?.humidity) != null ? "%" : ""}</strong>
      </div>
    </div>

    <div className="stat-detail">
      <span className="stat-detail-icon">💨</span>
      <div>
        <span className="stat-detail-label">{t("dashboard.windSpeed")}-</span>
        <strong className="dashboard-weather-value">{weather.wind_speed_10m ?? weather.current?.wind_speed_10m ?? weather.current?.wind_kmh ?? weather.current?.wind_speed_kmh ?? "—"}{(weather.wind_speed_10m ?? weather.current?.wind_speed_10m ?? weather.current?.wind_kmh ?? weather.current?.wind_speed_kmh) != null ? " km/h" : ""}</strong>
      </div>
    </div>
  </div>
)}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-purple">💧</div>
              <div className="stat-info">
                <p className="stat-label">{t("dashboard.smartIrrigation")}</p>

                <h2 className="stat-value">
                  {weatherLoading
                    ? t("dashboard.checking")
                    : weather
                      ? weather.precipitation > 0
                        ? t("dashboard.checkRainfall")
                        : t("dashboard.checkSoil")
                      : t("dashboard.unavailable")}
                </h2>
<div className="stat-extra-info">
  <div className="stat-detail">
    <span className="stat-detail-icon">🌧️</span>
    <div>
      <span className="stat-detail-label">{t("dashboard.rainfall")}-</span>
      <strong>
        {weatherLoading
          ? t("dashboard.checking")
          : weather
            ? `${weather.precipitation ?? weather.current?.precipitation ?? "—"}${(weather.precipitation ?? weather.current?.precipitation) != null ? " mm" : ""}`
            : t("dashboard.unavailable")}
      </strong>
    </div>
  </div>

  <p className="stat-description">
    {weatherLoading
      ? t("dashboard.checkingCurrentWeather")
      : weather
        ? weather.precipitation > 0
          ? t("dashboard.rainDetected")
          : t("dashboard.checkSoilMoisture")
        : t("dashboard.irrigationAdviceLimited")}
  </p>
</div>
                <p className="stat-description">
                  {weatherLoading
                    ? t("dashboard.checkingCurrentWeather")
                    : weather
                      ? weather.precipitation > 0
                        ? t("dashboard.currentPrecipitationMessage", { value: weather.precipitation ?? weather.current?.precipitation ?? "—" })
                        : t("dashboard.checkSoilBeforeWatering")
                      : t("dashboard.weatherDataUnavailable")}
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon stat-icon-orange">🐛</div>

              <div className="stat-info">
                <p className="stat-label">{t("dashboard.cropAlerts")}</p>

                <h2 className="stat-value">
                  {loading ? t("dashboard.loading") : alerts.length}
                </h2>
                   
              <div className="stat-extra-info">
  <div className="stat-detail">
    <span className="stat-detail-icon">🔔</span>
    <div>
      <span className="stat-detail-label">{t("dashboard.alertStatus")}</span>
      <strong>
        {loading
          ? t("dashboard.checking")
          : alerts.length > 0
            ? t("dashboard.actionRequired")
            : t("dashboard.allClear")}
      </strong>
    </div>
  </div>

  <p className="stat-description">
    {loading
      ? t("dashboard.checkingCropAlerts")
      : alerts.length > 0
        ? t("dashboard.unreadAlertsNeedAttention", { count: alerts.length })
        : t("dashboard.noUnreadAlerts")}
  </p>
</div>
              </div>
            </div>
          </section>
          {/* <section className="features-section">
            <h2 className="section-heading">Smart Farming Tools</h2>

            <div className="features-grid">
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i }}
                >
                  <Link to={feat.path} className={`feature-card ${feat.path === "/disease-detection" ? "pest-doctor-card" : ""}`}>
                    <div className="feature-icon">
                      <feat.icon size={24} />
                    </div>

                    <h3>{feat.title}</h3>
                    <p>{feat.desc}</p>

                    <span className="feature-arrow" aria-label={t("dashboard.openFeature")}>
                      <FiArrowUpRight size={18} />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section> */}
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;



