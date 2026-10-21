import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FiActivity,
  FiArrowLeft,
  FiArrowUpRight,
  FiCloud,
  FiDroplet,
  FiLayers,
  FiMapPin,
  FiCpu,
  FiTrendingUp,
} from "react-icons/fi";
import AppLayout from "../components/AppLayout";
import "./CropSoilAdvisor.css";

const features = [
  {
    number: "01",
    icon: FiDroplet,
    title: "Soil Health Analysis",
    description:
      "Understand your soil condition using soil reports and NPK, pH and organic matter values.",
    tags: ["Soil Report", "NPK Analysis"],
    path: "/soil-analysis",
    className: "soil",
    button: "Analyze Soil",
  },
  {
    number: "02",
    icon: FiLayers,
    title: "AI Crop Recommendation",
    description:
      "Explore suitable crops using soil type, location, season and available environmental conditions.",
    tags: ["Crop Matching", "Season Based"],
    path: "/crop-recommendation/results",
    className: "crop",
    button: "Find Suitable Crops",
  },
  {
    number: "03",
    icon: FiCpu,
    title: "AI Farming Advisor",
    description:
      "Get practical, condition-based farming guidance with clear actions and recommendations—not a chatbot.",
    tags: ["Smart Insights", "Action Plan"],
    path: "/farming-advisor",
    className: "advisor",
    button: "Explore Advisor",
  },
];

function CropSoilAdvisor({ user, onLogout, onUserUpdate }) {
  return (
    <AppLayout
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
    >
      <main className="csa-page">
        <div className="csa-glow csa-glow-one" />
        <div className="csa-glow csa-glow-two" />

        <div className="csa-container">
          <Link to="/dashboard" className="csa-back">
            <FiArrowLeft />
            <span>Back to Dashboard</span>
          </Link>

          <motion.section
            className="csa-hero"
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
          >
            <div className="csa-eyebrow">
              <span className="csa-status-dot" />
              SMART AGRICULTURE PLATFORM
            </div>

            <h1>
              Crop & Soil
              <br />
              <span>Advisor.</span>
            </h1>

            <p className="csa-hero-description">
              Make informed farming decisions with soil insights,
              intelligent crop recommendations and practical AI-powered
              agricultural guidance.
            </p>

            <div className="csa-hero-meta">
              <div>
                <FiActivity />
                <span>Data-driven insights</span>
              </div>
              <div>
                <FiMapPin />
                <span>Location-aware guidance</span>
              </div>
              <div>
                <FiCloud />
                <span>Weather-conscious planning</span>
              </div>
            </div>

            <div className="csa-hero-orbit" aria-hidden="true">
              <div className="csa-orbit-ring csa-ring-one" />
              <div className="csa-orbit-ring csa-ring-two" />
              <div className="csa-orbit-core">
                <FiTrendingUp />
              </div>
              <span className="csa-orbit-leaf">✳</span>
              <span className="csa-orbit-dot" />
            </div>
          </motion.section>

          <section className="csa-features">
            <div className="csa-section-heading">
              <div>
                <span className="csa-section-label">YOUR FARMING TOOLKIT</span>
                <h2>What would you like to explore?</h2>
              </div>
              <span className="csa-feature-count">03 MODULES</span>
            </div>

            <div className="csa-card-grid">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.article
                    key={feature.number}
                    className={`csa-card csa-card-${feature.className}`}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: index * 0.12 }}
                    whileHover={{ y: -6 }}
                  >
                    <div className="csa-card-top">
                      <div className="csa-card-icon">
                        <Icon size={24} />
                      </div>
                      <span className="csa-card-number">
                        / {feature.number}
                      </span>
                    </div>

                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>

                    <div className="csa-tags">
                      {feature.tags.map((tag) => (
                        <span key={tag}>{tag}</span>
                      ))}
                    </div>

                    <Link to={feature.path} className="csa-card-link">
                      <span>{feature.button}</span>
                      <FiArrowUpRight size={19} />
                    </Link>
                  </motion.article>
                );
              })}
            </div>
          </section>

          <footer className="csa-footer">
            <div className="csa-footer-symbol">
              <FiActivity />
            </div>
            <div>
              <strong>Better insights. Smarter farming.</strong>
              <p>
                Use recommendations alongside local agricultural expertise
                and current field conditions.
              </p>
            </div>
          </footer>
        </div>
      </main>
    </AppLayout>
  );
}

export default CropSoilAdvisor;
