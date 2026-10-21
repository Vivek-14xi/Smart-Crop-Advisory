import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { getEffectiveLanguage } from "../i18n";
import { motion } from "framer-motion";
import {
  ArrowLeft, Sprout, MapPin, CloudRain, Droplets,
  Target, ChevronDown, ChevronUp, LoaderCircle,
  RotateCcw, AlertCircle, CheckCircle2, Leaf
} from "lucide-react";
import AppLayout from "../components/AppLayout";
import AdvisoryMarkdown from "../components/AdvisoryMarkdown";
import "./CropRecommendation.css";

const initialForm = {
  soil_type: "Loamy",
  location: "",
  season: "Kharif",
  temperature: "",
};

function CropRecommendation({ user, onLogout, onUserUpdate }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    ...initialForm,
    location: user?.location || "",
  });
  const [irrigation, setIrrigation] = useState("rainfed");
  const [goal, setGoal] = useState("balanced");
  const [rainfall, setRainfall] = useState("");
  const [previousCrop, setPreviousCrop] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (key, value) => {
    setFormData((previous) => ({ ...previous, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await axios.post("/api/crop/recommend", {
        soil_type: formData.soil_type,
        location: formData.location,
        season: formData.season,
        ...(formData.temperature.trim() !== "" && {
          temperature: Number(formData.temperature),
        }),
        user_id: user?.id || null,
        language: getEffectiveLanguage(user),
      });

      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        "Unable to generate recommendations. Check the backend and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setError("");
  };

  const crops = Array.isArray(result?.recommended_crops)
    ? result.recommended_crops.slice(0, 3)
    : [];

  return (
    <AppLayout user={user} onLogout={onLogout} onUserUpdate={onUserUpdate}>
      <main className="feature-page crx-page">
        <div className="crx-shell">
          <Link to="/dashboard" className="back-link crx-back">
            <ArrowLeft size={16} />
            {t("common.backToDashboard")}
          </Link>

          <header className="crx-heading">
            <div className="crx-heading-icon">
              <Sprout size={23} />
            </div>
            <div>
              <div className="crx-eyebrow">SMART FARMING / DECISION SUPPORT</div>
              <h1>{t("crop.title")}</h1>
              <p>Find crops that match your farm conditions and growing goals.</p>
            </div>
          </header>

          <div className="crx-workspace">
            <section className="crx-panel crx-form-panel">
              <div className="crx-panel-heading">
                <div>
                  <span className="crx-step">01 / FARM PROFILE</span>
                  <h2>Tell us about your farm</h2>
                </div>
                <Sprout size={20} />
              </div>

              <form onSubmit={handleSubmit} className="crx-form">
                <div className="crx-field">
                  <label htmlFor="crx-location">
                    <MapPin size={15} /> Farm location
                  </label>
                  <input
                    id="crx-location"
                    value={formData.location}
                    onChange={(event) => updateField("location", event.target.value)}
                    placeholder="e.g. Balaghat, Madhya Pradesh"
                    required
                    maxLength={120}
                  />
                </div>

                <div className="crx-field-grid">
                  <div className="crx-field">
                    <label htmlFor="crx-season">Growing season</label>
                    <select
                      id="crx-season"
                      value={formData.season}
                      onChange={(event) => updateField("season", event.target.value)}
                      required
                    >
                      <option value="Kharif">Kharif · Monsoon</option>
                      <option value="Rabi">Rabi · Winter</option>
                      <option value="Summer">Summer</option>
                    </select>
                  </div>

                  <div className="crx-field">
                    <label htmlFor="crx-soil">Soil type</label>
                    <select
                      id="crx-soil"
                      value={formData.soil_type}
                      onChange={(event) => updateField("soil_type", event.target.value)}
                      required
                    >
                      {["Loamy", "Clay", "Sandy", "Silty", "Red Soil", "Black Soil", "Alluvial"].map((soil) => (
                        <option key={soil} value={soil}>{soil}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="crx-field">
                  <label>Water availability</label>
                  <div className="crx-choice-row">
                    {[
                      { value: "rainfed", label: "Rain-fed" },
                      { value: "limited", label: "Limited" },
                      { value: "assured", label: "Assured irrigation" },
                    ].map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        className={`crx-choice ${irrigation === option.value ? "is-active" : ""}`}
                        onClick={() => setIrrigation(option.value)}
                        aria-pressed={irrigation === option.value}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="crx-field">
                  <label><Target size={15} /> Farming priority</label>
                  <div className="crx-choice-row">
                    {[
                      { value: "balanced", label: "Balanced" },
                      { value: "profit", label: "Profit focus" },
                      { value: "water", label: "Save water" },
                      { value: "low-risk", label: "Lower risk" },
                    ].map((option) => (
                      <button
                        type="button"
                        key={option.value}
                        className={`crx-choice ${goal === option.value ? "is-active" : ""}`}
                        onClick={() => setGoal(option.value)}
                        aria-pressed={goal === option.value}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  className="crx-advanced-toggle"
                  onClick={() => setAdvanced((previous) => !previous)}
                  aria-expanded={advanced}
                >
                  <span>Additional conditions <small>Optional</small></span>
                  {advanced ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                </button>

                {advanced && (
                  <div className="crx-advanced-fields">
                    <div className="crx-field-grid">
                      <div className="crx-field">
                        <label htmlFor="crx-temperature">Temperature (°C)</label>
                        <input
                          id="crx-temperature"
                          type="number"
                          min="-10"
                          max="60"
                          step="0.1"
                          value={formData.temperature}
                          onChange={(event) => updateField("temperature", event.target.value)}
                          placeholder="e.g. 28"
                        />
                      </div>
                      <div className="crx-field">
                        <label htmlFor="crx-rainfall">
                          <CloudRain size={15} /> Rainfall (mm)
                        </label>
                        <input
                          id="crx-rainfall"
                          type="number"
                          min="0"
                          max="10000"
                          value={rainfall}
                          onChange={(event) => setRainfall(event.target.value)}
                          placeholder="If known"
                        />
                      </div>
                    </div>

                    <div className="crx-field">
                      <label htmlFor="crx-previous">Previous crop</label>
                      <input
                        id="crx-previous"
                        value={previousCrop}
                        onChange={(event) => setPreviousCrop(event.target.value)}
                        placeholder="e.g. Rice, soybean, wheat"
                        maxLength={100}
                      />
                    </div>

                    <p className="crx-input-note">
                      Additional fields are collected in this interface. They will affect recommendations only after backend integration.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="crx-error" role="alert">
                    <AlertCircle size={17} />
                    <span>{typeof error === "string" ? error : JSON.stringify(error)}</span>
                  </div>
                )}

                <button className="crx-submit" type="submit" disabled={loading}>
                  {loading ? (
                    <><LoaderCircle className="crx-spin" size={18} /> Analysing farm conditions…</>
                  ) : (
                    <><Sprout size={18} /> Generate recommendations <span>→</span></>
                  )}
                </button>

                <p className="crx-footnote">
                  <Droplets size={13} /> Recommendations depend on the quality and availability of agricultural data.
                </p>
              </form>
            </section>

            <aside className="crx-panel crx-insight-panel">
              {!result ? (
                <>
                  <div className="crx-insight-top">
                    <span className="crx-live-dot" />
                    FARM DECISION ENGINE
                  </div>
                  <div className="crx-orbit">
                    <div className="crx-orbit-ring crx-ring-one" />
                    <div className="crx-orbit-ring crx-ring-two" />
                    <div className="crx-orbit-core"><Leaf size={34} /></div>
                    <span className="crx-orbit-point" />
                  </div>
                  <h2>Make your next crop decision with context.</h2>
                  <p className="crx-insight-description">
                    Compare crop metadata against your soil, season and location. Add more farm details as the recommendation engine evolves.
                  </p>
                  <div className="crx-capabilities">
                    <div><CheckCircle2 size={17} /><span>Soil and season matching</span></div>
                    <div><CheckCircle2 size={17} /><span>Location-aware crop evaluation</span></div>
                    <div><CheckCircle2 size={17} /><span>AI-generated advisory, when available</span></div>
                  </div>
                  <div className="crx-data-note">
                    <span>NOTE</span>
                    A match score is not a yield forecast or a guarantee of profit.
                  </div>
                </>
              ) : (
                <div className="crx-result-summary">
                  <div className="crx-insight-top">
                    <span className="crx-live-dot" />
                    ANALYSIS COMPLETE
                  </div>
                  <div className="crx-result-count">{crops.length.toString().padStart(2, "0")}</div>
                  <h2>Top matching crops</h2>
                  <p className="crx-insight-description">
                    {result.total_recommendations ?? crops.length} matching crop options returned by the recommendation engine.
                  </p>
                  <button type="button" className="crx-reset" onClick={resetForm}>
                    <RotateCcw size={15} /> Edit farm details
                  </button>
                </div>
              )}
            </aside>
          </div>

          {result && (
            <motion.section
              className="crx-results"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="crx-results-heading">
                <div>
                  <span className="crx-step">02 / ANALYSIS</span>
                  <h2>Crop recommendations</h2>
                </div>
                <span className="crx-result-badge">{crops.length} results shown</span>
              </div>

              {crops.length > 0 ? (
                <div className="crx-crop-grid">
                  {crops.map((crop, index) => (
                    <article className="crx-crop-card" key={`${crop.name}-${index}`}>
                      <div className="crx-crop-card-top">
                        <span className="crx-crop-number">0{index + 1}</span>
                        {index === 0 && <span className="crx-top-pick">TOP MATCH</span>}
                      </div>
                      <h3>{crop.name}</h3>
                      {crop.local_name && <p className="crx-local-name">{crop.local_name}</p>}

                      {typeof crop.suitability_score === "number" && (
                        <div className="crx-score">
                          <div className="crx-score-label">
                            <span>Metadata match</span><strong>{crop.suitability_score}%</strong>
                          </div>
                          <div className="crx-score-track">
                            <span style={{ width: `${Math.max(0, Math.min(100, crop.suitability_score))}%` }} />
                          </div>
                        </div>
                      )}

                      <div className="crx-crop-meta">
                        <div><span>Growing duration</span><strong>{crop.growing_duration || "Unavailable"}</strong></div>
                        <div><span>Minimum rainfall</span><strong>{crop.rainfall_min != null ? `${crop.rainfall_min} mm` : "Unavailable"}</strong></div>
                      </div>

                      {Array.isArray(crop.reasons) && crop.reasons.length > 0 && (
                        <div className="crx-reasons">
                          <strong>Matching factors</strong>
                          <ul>{crop.reasons.map((reason, index) => <li key={index}>{reason}</li>)}</ul>
                        </div>
                      )}

                      {Array.isArray(crop.warnings) && crop.warnings.length > 0 && (
                        <div className="crx-warnings">
                          <strong>Consider before planting</strong>
                          <ul>{crop.warnings.map((warning, index) => <li key={index}>{warning}</li>)}</ul>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              ) : (
                <div className="crx-empty">
                  No crops matched the available criteria. Try different farm details or consult a local agricultural expert.
                </div>
              )}

              {result.explanation && (
                <div className="crx-advisory">
                  <div className="crx-advisory-heading">
                    <Sprout size={19} />
                    <div><span>AI ASSISTANT</span><h3>Farm advisory</h3></div>
                  </div>
                  <AdvisoryMarkdown
                    content={result.explanation}
                    className="advisory-content"
                    language={getEffectiveLanguage(user)}
                  />
                </div>
              )}

              <p className="crx-disclaimer">
                Scores reflect available crop database metadata. They are not validated probabilities of crop success, yield or profitability.
              </p>
              <button type="button" className="crx-reset crx-reset-bottom" onClick={resetForm}>
                <RotateCcw size={15} /> Try different conditions
              </button>
            </motion.section>
          )}
        </div>
      </main>
    </AppLayout>
  );
}

export default CropRecommendation;


