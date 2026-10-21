import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiArrowLeft,
  FiCpu,
  FiMapPin,
  FiDroplet,
  FiSun,
  FiFeather,
  FiActivity,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiSend,
} from "react-icons/fi";

import AppLayout from "../components/AppLayout";
import "./FarmingAdvisor.css";

const initialForm = {
  crop: "",
  growth_stage: "Vegetative growth",
  location: "",
  soil_type: "Unknown",
  irrigation: "Drip irrigation",
  problem: "",
  language: "Hindi",
};

const stages = [
  "Before sowing",
  "Germination",
  "Seedling",
  "Vegetative growth",
  "Flowering",
  "Fruiting / grain filling",
  "Maturity / harvesting",
];

const soilTypes = [
  "Unknown",
  "Black soil",
  "Alluvial soil",
  "Red soil",
  "Sandy soil",
  "Clay soil",
  "Loamy soil",
  "Other",
];

const irrigationTypes = [
  "Drip irrigation",
  "Sprinkler irrigation",
  "Flood / furrow irrigation",
  "Rain-fed",
  "Other",
];

const languages = [
  "Hindi",
  "English",
  "Marathi",
  "Gujarati",
  "Bengali",
];

const suggestions = [
  {
    icon: FiDroplet,
    title: "Water management",
    prompt: "How should I manage irrigation at my current crop stage?",
  },
  {
    icon: FiActivity,
    title: "Crop health",
    prompt: "What symptoms should I monitor and what information is needed to diagnose a crop problem?",
  },
  {
    icon: FiFeather,
    title: "Nutrition planning",
    prompt: "How can I assess my crop's nutrient needs safely?",
  },
];

function FarmingAdvisor({ user, onLogout, onUserUpdate }) {
  const [form, setForm] = useState(initialForm);
  const [advisory, setAdvisory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const updateField = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const generateAdvisory = async (event) => {
    event?.preventDefault();

    if (!form.crop.trim()) {
      setError("Please enter the name of your crop.");
      return;
    }

    if (form.problem.trim().length < 5) {
      setError("Please describe your farming question in at least 5 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setAdvisory("");

    try {
      const apiBase = (
        import.meta.env.VITE_API_URL || "http://localhost:8000"
      ).replace(/\/+$/, "");

      const response = await axios.post(
        `${apiBase}/api/farming-advisor/generate`,
        {
          ...form,
          crop: form.crop.trim(),
          location: form.location.trim() || "Not provided",
          problem: form.problem.trim(),
        },
        { timeout: 90000 }
      );

      setAdvisory(response.data.advisory || "");
      if (!response.data.advisory) {
        setError("The AI did not return an advisory. Please try again.");
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        typeof detail === "string"
          ? detail
          : "Unable to generate advice. Check that the backend is running and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const chooseSuggestion = (prompt) => {
    setForm((current) => ({ ...current, problem: prompt }));
    setError("");
    document.getElementById("advisor-problem")?.focus();
  };

  return (
    <AppLayout
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
    >
      <main className="ai-farm-advisor">
        <div className="afa-shell">
          <Link to="/crop-recommendation" className="afa-back">
            <FiArrowLeft />
            <span>Back to Crop &amp; Soil Advisor</span>
          </Link>

          <motion.section
            className="afa-hero"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <div className="afa-hero-copy">
              <span className="afa-eyebrow">
                <span className="afa-live-dot" />
                YOUR PERSONAL FARMING GUIDE
              </span>

              <h1>
                Better decisions.
                <br />
                <span>Healthier harvests.</span>
              </h1>

              <p>
                Describe your crop and field conditions to receive a practical
                AI-generated farming action plan tailored to the information
                you provide.
              </p>

              <div className="afa-trust-row">
                <span><FiCheckCircle /> Crop-specific guidance</span>
                <span><FiCheckCircle /> Actionable steps</span>
                <span><FiCheckCircle /> Regional language support</span>
              </div>
            </div>

            <div className="afa-hero-visual" aria-hidden="true">
              <div className="afa-orbit afa-orbit-one" />
              <div className="afa-orbit afa-orbit-two" />
              <div className="afa-visual-core">
                <FiFeather />
              </div>
              <span className="afa-float-chip afa-chip-top">
                <FiActivity /> Smart insights
              </span>
              <span className="afa-float-chip afa-chip-bottom">
                <FiDroplet /> Field care
              </span>
            </div>
          </motion.section>

          <div className="afa-section-heading">
            <div>
              <span className="afa-section-kicker">LET'S UNDERSTAND YOUR FIELD</span>
              <h2>Build your farming action plan</h2>
              <p>Fill in what you know. Unknown field details can be left as unknown.</p>
            </div>
            <div className="afa-step-badge">
              <FiCpu />
              <span>AI ASSISTED</span>
            </div>
          </div>

          <div className="afa-workspace">
            <motion.form
              className="afa-form-card"
              onSubmit={generateAdvisory}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.4 }}
            >
              <div className="afa-card-heading">
                <div className="afa-card-icon"><FiFeather /></div>
                <div>
                  <h3>Your farm profile</h3>
                  <p>Tell us about your crop and current conditions.</p>
                </div>
              </div>

              <div className="afa-field">
                <label htmlFor="advisor-crop">Crop name <span>*</span></label>
                <input
                  id="advisor-crop"
                  name="crop"
                  value={form.crop}
                  onChange={updateField}
                  placeholder="e.g. Soybean, wheat, rice, cotton"
                  maxLength={100}
                  required
                />
              </div>

              <div className="afa-field">
                <label htmlFor="advisor-stage">Growth stage</label>
                <select
                  id="advisor-stage"
                  name="growth_stage"
                  value={form.growth_stage}
                  onChange={updateField}
                >
                  {stages.map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </div>

              <div className="afa-field">
                <label htmlFor="advisor-location">
                  <FiMapPin /> Farm location
                </label>
                <input
                  id="advisor-location"
                  name="location"
                  value={form.location}
                  onChange={updateField}
                  placeholder="Village / district / state"
                  maxLength={150}
                />
              </div>

              <div className="afa-field-row">
                <div className="afa-field">
                  <label htmlFor="advisor-soil">Soil type</label>
                  <select
                    id="advisor-soil"
                    name="soil_type"
                    value={form.soil_type}
                    onChange={updateField}
                  >
                    {soilTypes.map((soil) => (
                      <option key={soil}>{soil}</option>
                    ))}
                  </select>
                </div>

                <div className="afa-field">
                  <label htmlFor="advisor-irrigation">
                    <FiDroplet /> Irrigation
                  </label>
                  <select
                    id="advisor-irrigation"
                    name="irrigation"
                    value={form.irrigation}
                    onChange={updateField}
                  >
                    {irrigationTypes.map((method) => (
                      <option key={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="afa-field">
                <label htmlFor="advisor-language">Response language</label>
                <select
                  id="advisor-language"
                  name="language"
                  value={form.language}
                  onChange={updateField}
                >
                  {languages.map((language) => (
                    <option key={language}>{language}</option>
                  ))}
                </select>
              </div>

              <div className="afa-field">
                <label htmlFor="advisor-problem">
                  What do you need help with? <span>*</span>
                </label>
                <textarea
                  id="advisor-problem"
                  name="problem"
                  value={form.problem}
                  onChange={updateField}
                  placeholder="Describe crop symptoms, watering concerns, nutrient questions or your farming goal..."
                  rows={5}
                  maxLength={3000}
                  required
                />
                <div className="afa-character-count">
                  {form.problem.length}/3000
                </div>
              </div>

              {error && (
                <div className="afa-error" role="alert">
                  <FiAlertCircle />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                className="afa-generate-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="afa-button-spinner" />
                    Preparing your advice...
                  </>
                ) : (
                  <>
                    <FiSend />
                    Generate farming action plan
                  </>
                )}
              </button>

              <p className="afa-form-note">
                Advice is based on the information you provide. Verify
                high-impact fertilizer and crop-protection decisions locally.
              </p>
            </motion.form>

            <section className="afa-results-column">
              <motion.div
                className="afa-result-card"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.4 }}
              >
                <div className="afa-result-header">
                  <div className="afa-card-icon afa-result-icon"><FiCpu /></div>
                  <div>
                    <span className="afa-section-kicker">YOUR FIELD BRIEFING</span>
                    <h3>AI farming recommendations</h3>
                  </div>
                </div>

                {loading ? (
                  <div className="afa-loading-state" aria-live="polite">
                    <div className="afa-loading-orb"><FiFeather /></div>
                    <h4>Preparing your farming action plan</h4>
                    <p>Reviewing your crop details and question...</p>
                    <div className="afa-loading-track"><span /></div>
                  </div>
                ) : advisory ? (
                  <div className="afa-advisory-output">
                    <div className="afa-success-banner">
                      <FiCheckCircle />
                      <span>Your advisory is ready</span>
                    </div>
                    <div className="afa-advisory-text">{advisory}</div>
                    <button
                      type="button"
                      className="afa-secondary-button"
                      onClick={() => {
                        setAdvisory("");
                        setError("");
                      }}
                    >
                      <FiRefreshCw /> Start a new advisory
                    </button>
                  </div>
                ) : (
                  <div className="afa-empty-state">
                    <div className="afa-empty-illustration">
                      <FiSun />
                      <FiFeather />
                    </div>
                    <h4>Your next farming decision starts here.</h4>
                    <p>
                      Complete your crop profile and describe your question.
                      Your AI-generated action plan will appear in this panel.
                    </p>
                    <div className="afa-empty-points">
                      <span><FiCheckCircle /> Practical next steps</span>
                      <span><FiCheckCircle /> Important precautions</span>
                      <span><FiCheckCircle /> Follow-up observations</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {!advisory && !loading && (
                <div className="afa-quick-card">
                  <div className="afa-quick-heading">
                    <div>
                      <span className="afa-section-kicker">NEED A STARTING POINT?</span>
                      <h3>Explore common farm questions</h3>
                    </div>
                  </div>

                  <div className="afa-suggestions">
                    {suggestions.map(({ icon: Icon, title, prompt }) => (
                      <button
                        key={title}
                        type="button"
                        className="afa-suggestion"
                        onClick={() => chooseSuggestion(prompt)}
                      >
                        <span className="afa-suggestion-icon"><Icon /></span>
                        <span className="afa-suggestion-copy">
                          <strong>{title}</strong>
                          <small>{prompt}</small>
                        </span>
                        <FiArrowLeft className="afa-suggestion-arrow" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="afa-disclaimer">
                <FiAlertCircle />
                <p>
                  <strong>Important:</strong> AI guidance is decision support,
                  not a substitute for soil testing, verified weather data,
                  product labels or advice from a local agricultural expert.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}

export default FarmingAdvisor;

