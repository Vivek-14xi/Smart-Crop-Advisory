import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import {
  FiDroplet,
  FiCloudRain,
  FiClock,
  FiActivity,
  FiArrowRight,
  FiCheckCircle,
  FiInfo,
  FiRefreshCw,
  FiSun,
  FiWind,
  FiMapPin,
  FiTrendingDown,
  FiCalendar,
  FiAlertCircle,
} from "react-icons/fi";
import "./SmartIrrigation.css";

const cropProfiles = {
  Rice: { dailyMm: 6, label: "Rice / Paddy" },
  Wheat: { dailyMm: 4, label: "Wheat" },
  Soybean: { dailyMm: 4.5, label: "Soybean" },
  Cotton: { dailyMm: 5, label: "Cotton" },
  Maize: { dailyMm: 4.5, label: "Maize" },
  Tomato: { dailyMm: 5, label: "Tomato" },
  Gram: { dailyMm: 3, label: "Gram / Chickpea" },
  Other: { dailyMm: 4, label: "Other crop" },
};

const soilProfiles = {
  Sandy: { factor: 0.8, label: "Sandy soil" },
  Loamy: { factor: 1, label: "Loamy soil" },
  Clay: { factor: 1.15, label: "Clay soil" },
  Black: { factor: 1.1, label: "Black soil" },
};

const stageFactors = {
  Initial: 0.8,
  Vegetative: 1,
  Flowering: 1.15,
  Maturity: 0.75,
};

function StatCard({ icon: Icon, label, value, unit, note, tone }) {
  return (
    <article className={`si-stat-card si-tone-${tone}`}>
      <div className="si-stat-top">
        <span className="si-stat-icon"><Icon size={20} /></span>
        <span className="si-stat-note">{note}</span>
      </div>
      <p className="si-stat-label">{label}</p>
      <div className="si-stat-value">
        {value}<span>{unit}</span>
      </div>
    </article>
  );
}

function SmartIrrigation({ user, onLogout, onUserUpdate }) {
  const [crop, setCrop] = useState("Soybean");
  const [soil, setSoil] = useState("Black");
  const [area, setArea] = useState("1");
  const [stage, setStage] = useState("Vegetative");
  const [method, setMethod] = useState("Drip");
  const [moisture, setMoisture] = useState("");
  const [rainChance, setRainChance] = useState("20");
  const [submitted, setSubmitted] = useState(false);

  const [location, setLocation] = useState("Balaghat");
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");
  const [advice, setAdvice] = useState("");
  const [aiAvailable, setAiAvailable] = useState(false);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState("");

  const refreshWeather = async () => {
    const requestedLocation = location.trim();

    if (requestedLocation.length < 2) {
      setWeatherError("Enter a valid city or location name.");
      return;
    }

    setWeatherLoading(true);
    setWeatherError("");

    try {
      const response = await axios.get("/api/irrigation/weather", {
        params: { location: requestedLocation },
      });

      setWeather(response.data);

      if (!response.data?.available) {
        setWeatherError(
          response.data?.message ||
          "Live weather is currently unavailable. Please try again."
        );
      }
    } catch (error) {
      setWeatherError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Could not fetch live weather. Check that the backend is running."
      );
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadInitialWeather = async () => {
      setWeatherLoading(true);
      setWeatherError("");

      try {
        const response = await axios.get("/api/irrigation/weather", {
          params: { location: "Balaghat" },
        });

        if (!active) return;

        setWeather(response.data);

        if (!response.data?.available) {
          setWeatherError(
            response.data?.message || "Live weather is currently unavailable."
          );
        }
      } catch (error) {
        if (!active) return;

        setWeatherError(
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Could not load live weather. Check the backend connection."
        );
      } finally {
        if (active) setWeatherLoading(false);
      }
    };

    loadInitialWeather();

    return () => {
      active = false;
    };
  }, []);

  const recommendation = useMemo(() => {
    const areaNumber = Math.max(0, Number(area) || 0);
    const profile = cropProfiles[crop] || cropProfiles.Other;
    const soilProfile = soilProfiles[soil] || soilProfiles.Loamy;
    const stageFactor = stageFactors[stage] || 1;
    const moistureNumber =
      moisture === "" ? null : Math.min(100, Math.max(0, Number(moisture)));
    const rain = Math.min(100, Math.max(0, Number(rainChance) || 0));

    // Planning estimate only; this is not a sensor measurement.
    let dailyMm = profile.dailyMm * soilProfile.factor * stageFactor;

    if (moistureNumber !== null) {
      if (moistureNumber >= 70) dailyMm *= 0.35;
      else if (moistureNumber >= 50) dailyMm *= 0.65;
      else if (moistureNumber < 25) dailyMm *= 1.1;
    }

    if (rain >= 70) dailyMm *= 0.5;
    else if (rain >= 40) dailyMm *= 0.75;

    const efficiency = method === "Drip" ? 0.9 : method === "Sprinkler" ? 0.75 : 0.6;
    const grossMm = dailyMm / efficiency;
    const waterLitres = grossMm * areaNumber * 10000;
    const waterM3 = waterLitres / 1000;

    let status = "Plan irrigation";
    let statusClass = "si-status-normal";
    let action = "Review the field and plan the next irrigation.";
    let urgency = "Normal";

    if (moistureNumber !== null && moistureNumber < 25) {
      status = "Check irrigation soon";
      statusClass = "si-status-warning";
      action = "The entered moisture value is low. Inspect the root zone and irrigate if field conditions confirm it.";
      urgency = "High";
    } else if (moistureNumber !== null && moistureNumber >= 70) {
      status = "Delay and recheck";
      statusClass = "si-status-good";
      action = "The entered moisture value is high. Recheck the soil before adding water.";
      urgency = "Low";
    } else if (rain >= 70) {
      status = "Review rainfall first";
      statusClass = "si-status-good";
      action = "Rain probability is high. Check the local forecast and actual rainfall before irrigating.";
      urgency = "Low";
    }

    return {
      dailyMm,
      waterM3,
      status,
      statusClass,
      action,
      urgency,
      efficiency: Math.round(efficiency * 100),
      rain,
      moistureNumber,
      areaNumber,
      cropLabel: profile.label,
      soilLabel: soilProfile.label,
    };
  }, [crop, soil, area, stage, method, moisture, rainChance]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!location.trim() || location.trim().length < 2) {
      setAdviceError("Enter a valid city or location name.");
      return;
    }

    setAdviceLoading(true);
    setAdviceError("");
    setSubmitted(false);

    try {
      const response = await axios.post("/api/irrigation/advice", {
        location: location.trim(),
        crop,
        soil,
        area_hectares: Number(area),
        growth_stage: stage,
        irrigation_method: method,
        soil_moisture_percent:
          moisture === "" ? null : Number(moisture),
        language: "en",
      });

      setAdvice(response.data?.advice || "No advice was returned.");
      setAiAvailable(Boolean(response.data?.ai_available));
      setSubmitted(true);

      if (response.data?.weather) {
        setWeather(response.data.weather);
      }
    } catch (error) {
      setAdviceError(
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Could not generate irrigation advice. Check the backend and try again."
      );
    } finally {
      setAdviceLoading(false);
    }
  };

  const resetForm = () => {
    setCrop("Soybean");
    setSoil("Black");
    setArea("1");
    setStage("Vegetative");
    setMethod("Drip");
    setMoisture("");
    setRainChance("20");
    setSubmitted(false);
  };

  return (
    <AppLayout user={user} onLogout={onLogout} onUserUpdate={onUserUpdate}>
      <main className="si-page">
        <section className="si-hero">
          <div className="si-hero-copy">
            <div className="si-eyebrow"><FiDroplet /> SMART AGRICULTURE / WATER MANAGEMENT</div>
            <h1>Smart Irrigation</h1>
            <p>
              Make informed irrigation plans using your crop, soil, field area,
              growth stage and optional field observations.
            </p>
            <div className="si-hero-tags">
              <span><FiActivity /> Water planning</span>
              <span><FiCloudRain /> Rainfall-aware</span>
              <span><FiTrendingDown /> Reduce water waste</span>
            </div>
          </div>
          <div className="si-hero-art" aria-hidden="true">
            <div className="si-orbit si-orbit-one" />
            <div className="si-orbit si-orbit-two" />
            <div className="si-water-drop"><FiDroplet size={64} /></div>
            <span className="si-art-dot si-dot-one" />
            <span className="si-art-dot si-dot-two" />
            <span className="si-art-dot si-dot-three" />
          </div>
        </section>

        <div className="si-section-heading">
          <div>
            <span className="si-section-kicker">FIELD OVERVIEW</span>
            <h2>Your irrigation snapshot</h2>
            <p>Planning estimates update when you change the field configuration.</p>
          </div>
          <button className="si-reset-button" type="button" onClick={resetForm}>
            <FiRefreshCw size={15} /> Reset fields
          </button>
        </div>

        <section className="si-stats-grid">
          <StatCard
            icon={FiDroplet}
            label="Estimated daily water"
            value={recommendation.waterM3.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
            unit=" m³"
            note="Planning estimate"
            tone="green"
          />
          <StatCard
            icon={FiMapPin}
            label="Field area"
            value={recommendation.areaNumber.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            unit=" ha"
            note="Your input"
            tone="blue"
          />
          <StatCard
            icon={FiCloudRain}
            label="Rain probability"
            value={recommendation.rain}
            unit="%"
            note="Your input"
            tone="sky"
          />
          <StatCard
            icon={FiClock}
            label="Application efficiency"
            value={recommendation.efficiency}
            unit="%"
            note="Method assumption"
            tone="amber"
          />
        </section>

        <section className="si-main-grid">
          <article className="si-panel si-config-panel">
            <div className="si-panel-heading">
              <div className="si-panel-icon"><FiActivity /></div>
              <div>
                <h2>Field configuration</h2>
                <p>Enter the details for your irrigation plan.</p>
              </div>
            </div>

            <form className="si-form" onSubmit={handleSubmit}>
              <label>
                Field location
                <input
                  type="text"
                  value={location}
                  maxLength={120}
                  placeholder="e.g. Balaghat"
                  required
                  onChange={(e) => setLocation(e.target.value)}
                />
              </label>

              <div className="si-form-row">
                <label>
                  Crop
                  <select value={crop} onChange={(e) => setCrop(e.target.value)}>
                    {Object.entries(cropProfiles).map(([key, item]) => (
                      <option value={key} key={key}>{item.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Soil type
                  <select value={soil} onChange={(e) => setSoil(e.target.value)}>
                    {Object.entries(soilProfiles).map(([key, item]) => (
                      <option value={key} key={key}>{item.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="si-form-row">
                <label>
                  Field area (hectares)
                  <input
                    type="number"
                    min="0.01"
                    max="10000"
                    step="0.01"
                    required
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </label>
                <label>
                  Crop growth stage
                  <select value={stage} onChange={(e) => setStage(e.target.value)}>
                    <option value="Initial">Initial stage</option>
                    <option value="Vegetative">Vegetative growth</option>
                    <option value="Flowering">Flowering / reproductive</option>
                    <option value="Maturity">Maturity</option>
                  </select>
                </label>
              </div>

              <label>
                Irrigation method
                <select value={method} onChange={(e) => setMethod(e.target.value)}>
                  <option value="Drip">Drip irrigation</option>
                  <option value="Sprinkler">Sprinkler irrigation</option>
                  <option value="Flood">Surface / flood irrigation</option>
                </select>
              </label>

              <div className="si-form-row">
                <label>
                  Soil moisture (%), optional
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="e.g. 35"
                    value={moisture}
                    onChange={(e) => setMoisture(e.target.value)}
                  />
                </label>
                <label>
                  Rain probability (%)
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    value={rainChance}
                    onChange={(e) => setRainChance(e.target.value)}
                  />
                </label>
              </div>

              <div className="si-form-note">
                <FiInfo />
                <span>
                  Live weather and forecast are fetched from Open-Meteo.
                  Soil moisture is entered manually; no physical soil sensor
                  is connected. The rainfall field above remains a manual
                  input for the preliminary estimate.
                </span>
              </div>

              <button
                className="si-primary-button"
                type="submit"
                disabled={adviceLoading}
              >
                {adviceLoading
                  ? "Generating AI advice..."
                  : "Generate irrigation advice"}
                {!adviceLoading && <FiArrowRight />}
              </button>

              {adviceLoading && (
                <p className="si-submit-feedback" role="status">
                  Analysing your field inputs and live weather...
                </p>
              )}

              {submitted && (
                <p className="si-submit-feedback" role="status">
                  <FiCheckCircle /> Irrigation advice received successfully.
                </p>
              )}
            </form>
          </article>

          <article className="si-panel si-ai-card">
            <div className="si-panel-heading">
              <div className="si-panel-icon si-panel-icon-light"><FiActivity /></div>
              <div>
                <h2>AI Irrigation Advice</h2>
                <p>Crop-specific guidance using your inputs and available weather</p>
              </div>
            </div>

            {!advice && !adviceLoading && !adviceError && (
              <div className="si-ai-empty">
                <FiInfo size={24} />
                <p>
                  Select your field details and click
                  <strong> Generate irrigation advice </strong>
                  to request a recommendation from the backend AI service.
                </p>
              </div>
            )}

            {adviceLoading && (
              <p className="si-live-message" role="status">
                Preparing advice for {crop} in {location}...
              </p>
            )}

            {adviceError && (
              <p className="si-live-error" role="alert">{adviceError}</p>
            )}

            {advice && (
              <>
                <div className={`si-ai-status ${aiAvailable ? "si-ai-status-live" : "si-ai-status-fallback"}`}>
                  <span className="si-status-indicator" />
                  {aiAvailable
                    ? "AI-generated guidance received"
                    : "Fallback guidance received"}
                </div>
                <div className="si-ai-advice">
                  {advice.split(/\r?\n/).map((line, index) => {
                    const cleanLine = line.replace(/^\s*[-*]\s+/, "").trim();
                    if (!cleanLine) return null;

                    const heading = /^#{1,4}\s+/.test(cleanLine);
                    const content = cleanLine.replace(/^#{1,4}\s+/, "");

                    return heading
                      ? <h3 key={index}>{content}</h3>
                      : <p key={index}>{cleanLine}</p>;
                  })}
                </div>
              </>
            )}

            <div className="si-disclaimer">
              <FiAlertCircle />
              <p>
                Preliminary guidance only. Weather forecasts can change.
                Verify field conditions before irrigation. Manually entered
                moisture is not a sensor measurement.
              </p>
            </div>
          </article>
        </section>

        <section className="si-live-grid" aria-label="Live weather and AI advice">
          <article className="si-panel si-weather-card">
            <div className="si-panel-heading">
              <div className="si-panel-icon"><FiCloudRain /></div>
              <div>
                <h2>Live Weather Intelligence</h2>
                <p>
                  <FiMapPin size={13} /> {weather?.location?.name || location}
                  {weather?.source ? ` ? ${weather.source}` : " · Open-Meteo"}
                </p>
              </div>
            </div>

            <div className="si-location-row">
              <label htmlFor="si-weather-location">Weather location</label>
              <button
                type="button"
                className="si-refresh-button"
                onClick={refreshWeather}
                disabled={weatherLoading}
              >
                <FiRefreshCw className={weatherLoading ? "si-spin" : ""} />
                {weatherLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {weatherLoading && !weather && (
              <p className="si-live-message" role="status">
                Fetching live weather...
              </p>
            )}

            {weatherError && (
              <p className="si-live-error" role="alert">{weatherError}</p>
            )}

            {weather?.current && (
              <>
                <div className="si-current-weather">
                  <div className="si-weather-condition">
                    <FiSun size={28} />
                    <div>
                      <strong>
                        {weather.current.temperature_c ??
                         weather.current.temperature ??
                         weather.current.temp_c ??
                         "--"}&deg;C
                      </strong>
                      <span>
                        {weather.current.condition ||
                         weather.current.description || weather.current.weather_description ||
                         "Current conditions"}
                      </span>
                    </div>
                  </div>

                  <div className="si-weather-metrics">
                    <div>
                      <FiDroplet />
                      <span>Humidity</span>
                      <strong>
                        {weather.current.humidity_percent ??
                         weather.current.humidity ??
                         "--"}%
                      </strong>
                    </div>
                    <div>
                      <FiWind />
                      <span>Wind</span>
                      <strong>
                        {weather.current.wind_kmh ??
                         weather.current.wind_speed_kmh ??
                         weather.current.wind_speed ??
                         "--"} km/h
                      </strong>
                    </div>
                  </div>
                </div>

                {weather.current.observed_at && (
                  <p className="si-weather-updated">
                    Observed: {String(weather.current.observed_at).replace("T", " ")}
                  </p>
                )}
              </>
            )}

            {Array.isArray(weather?.forecast) && weather.forecast.length > 0 && (
              <div className="si-forecast-wrap">
                <h3><FiCalendar /> 5-day forecast</h3>
                <div className="si-forecast-grid">
                  {weather.forecast.slice(0, 5).map((day, index) => (
                    <div
                      className="si-forecast-day"
                      key={day.date || index}
                    >
                      <strong>{day.date || `Day ${index + 1}`}</strong>
                      <span>{day.condition || day.weather_description || day.description || "Daily forecast"}</span>
                      <b>
                        {day.max_temp_c ?? day.temperature_max_c ??
                         day.temperature_2m_max ?? day.temp_max_c ?? "--"}&deg;
                      </b>
                      <span>
                        Low: {day.min_temp_c ?? day.temperature_min_c ??
                        day.temperature_2m_min ?? day.temp_min_c ?? "--"}&deg;
                      </span>
                      <small>
                        Rain: {day.precipitation_mm ??
                          day.rain_mm ?? day.precipitation_sum ?? "--"} mm
                      </small>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!weatherLoading && !weatherError && !weather?.current && (
              <p className="si-live-message">
                Weather data is not available yet. Use Refresh to try again.
              </p>
            )}
          </article>

          <article className="si-panel si-recommendation-panel">
            <div className="si-panel-heading">
              <div className="si-panel-icon si-panel-icon-light"><FiSun /></div>
              <div>
                <h2>Recommendation</h2>
                <p>Rule-based preliminary planning guidance</p>
              </div>
            </div>

            <div className={`si-recommendation-status ${recommendation.statusClass}`}>
              <span className="si-status-indicator" />
              {recommendation.status}
            </div>

            <p className="si-recommendation-copy">{recommendation.action}</p>

            <div className="si-water-estimate">
              <div>
                <span>Estimated water volume</span>
                <strong>
                  {recommendation.waterM3.toLocaleString("en-IN", { maximumFractionDigits: 1 })}
                  <small> m³/day</small>
                </strong>
              </div>
              <div className="si-water-icon"><FiDroplet size={25} /></div>
            </div>

            <div className="si-detail-list">
              <div><span>Selected crop</span><strong>{recommendation.cropLabel}</strong></div>
              <div><span>Soil profile</span><strong>{recommendation.soilLabel}</strong></div>
              <div><span>Growth stage</span><strong>{stage}</strong></div>
              <div><span>Priority indicator</span><strong>{recommendation.urgency}</strong></div>
            </div>

            <div className="si-disclaimer">
              <FiAlertCircle />
              <p>
                This is an illustrative estimate based on simplified crop and
                method factors, not a validated agronomic prescription. Confirm
                local weather, soil conditions and crop-specific guidance before
                irrigation.
              </p>
            </div>
          </article>
        </section>

        <footer className="si-footer">
          <FiInfo />
          <span>
            Smart Irrigation Planner · Preliminary estimates only · No live sensor
            readings are displayed.
          </span>
        </footer>
      </main>
    </AppLayout>
  );
}

export default SmartIrrigation;
