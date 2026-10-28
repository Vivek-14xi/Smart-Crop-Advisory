import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import i18n, { SUPPORTED_LANGS, setStoredLanguage, getStoredLanguage } from "../../i18n";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Home, Landmark, Bot, Sprout, CloudSun, ScanSearch, Droplet, CalendarDays,
  TrendingUp, ShieldCheck, Search, Bell, ChevronDown, ChevronRight, ArrowRight,
  Menu, MapPin, Leaf, Zap, Clock, BarChart3,
} from "lucide-react";
import "./Dashboard.css";

/* ── 1. CONNECT HERE ─────────────────────────────────────────────
   Put your existing backend paths below. null = "Not connected yet"
   state is shown (nothing is faked). Map response fields in the
   render functions further down if your field names differ. */
const ENDPOINTS = {
  stats: null, weather: null, crop: null, alerts: null,
  activity: null, performance: null, market: null,
};

/* Swap this for your existing API client so auth headers are reused. */
const BASE = import.meta.env.VITE_API_URL || "";
const request = (path) =>
  fetch(BASE + path, {
    headers: { Accept: "application/json" },
  }).then((r) => {
    if (!r.ok) throw new Error(r.status);
    return r.json();
  });

/* Exact order required. Adjust `route` to your existing routes. */
const FEATURES = [
  { name: "Government Schemes", desc: "Explore schemes & get benefits", icon: Landmark, tone: "green", route: "/government-schemes" },
  { name: "Farming Assistant", desc: "Get instant help and expert advice", icon: Bot, tone: "blue", route: "/crop-recommendation" },
  { name: "Crop & Soil Advisor", desc: "Personalized crop and soil guidance", icon: Sprout, tone: "green", route: "/soil-analysis" },
  { name: "Weather Intelligence", desc: "Real-time weather & forecast", icon: CloudSun, tone: "sky", route: "/weather" },
  { name: "Pest and Disease Examine", desc: "Detect and manage crop issues", icon: ScanSearch, tone: "orange", route: "/disease-detection" },
  { name: "Smart Irrigation", desc: "Optimize water usage", icon: Droplet, tone: "teal", route: "/soil-analysis" },
  { name: "Farming Calendar", desc: "Plan your farming activities", icon: CalendarDays, tone: "purple", route: "/crop-recommendation" },
  { name: "Profit and Market Analyzer", desc: "Check prices & maximize profit", icon: TrendingUp, tone: "pink", route: "/market-prices" },
  { name: "Crop Health Monitor", desc: "Track crop health in real-time", icon: ShieldCheck, tone: "mint", route: "/disease-detection" },
];

function useData(path) {
  const [s, setS] = useState({ data: null, loading: !!path, error: null });
  useEffect(() => {
    if (!path) return;
    let off = false;
    request(path)
      .then((data) => !off && setS({ data, loading: false, error: null }))
      .catch((e) => !off && setS({ data: null, loading: false, error: e.message }));
    return () => { off = true; };
  }, [path]);
  return s;
}

/* Handles not-connected / loading / error / empty / data for every panel. */
function Panel({ title, icon: Icon, ep, className = "", children }) {
  const { data, loading, error } = useData(ep);
  const empty = !data || (Array.isArray(data) && !data.length);
  let body;
  if (!ep) body = <p className="cad-note">Not connected yet. Set this panel's endpoint in ENDPOINTS.</p>;
  else if (loading) body = <div className="cad-skel" aria-label="Loading" />;
  else if (error) body = <p className="cad-note err">Couldn't load this data (error {error}). Check the backend and try again.</p>;
  else if (empty) body = <p className="cad-note">Nothing here yet.</p>;
  else body = children(data);
  return (
    <section className={`cad-panel ${className}`}>
      <header><h3>{Icon && <Icon size={18} />} {title}</h3></header>
      {body}
    </section>
  );
}

const List = ({ items, primary = "title", secondary = "detail" }) => (
  <ul className="cad-list">
    {items.map((a, i) => (
      <li key={a.id ?? i}>
        <span className="dot" />
        <div><b>{a[primary]}</b>{a[secondary] && <small>{a[secondary]}</small>}<em>{a.time}</em></div>
      </li>
    ))}
  </ul>
);

function Trend({ points }) {
  const vals = points.map((p) => p.value);
  const max = Math.max(...vals, 1);
  const xy = vals.map((v, i) => `${(i / Math.max(vals.length - 1, 1)) * 100},${40 - (v / max) * 36}`).join(" ");
  return (
    <svg viewBox="0 0 100 42" preserveAspectRatio="none" className="cad-trend">
      <polygon points={`0,40 ${xy} 100,40`} fill="rgba(27,122,69,.15)" />
      <polyline points={xy} fill="none" stroke="#1b7a45" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function Dashboard({ user = {}, onLogout, onUserUpdate }) {
  const { t } = useTranslation();
  const currentLang = i18n.language || user?.language || getStoredLanguage() || "en";
  const handleLanguageChange = async (lang) => {
    if (user?.id && onUserUpdate) {
      try {
        const { data } = await axios.put(`/api/auth/user/${user.id}?language=${lang}`);
        onUserUpdate(data);
      } catch (error) {
        console.error("Could not update language preference:", error);
      }
    }
    setStoredLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const h = new Date().getHours();
  const greet = h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <div className="cad">
      <aside className={`cad-side ${open ? "open" : ""}`}>
        <div className="cad-logo"><Leaf size={30} /> Krishi Astra</div>
        <nav className="cad-nav" onClick={() => setOpen(false)}>
          <NavLink to="/dashboard" end><Home size={20} /> Dashboard</NavLink>
          {FEATURES.map((f) => (
            <NavLink key={f.name} to={f.route}><f.icon size={20} /> {f.name}</NavLink>
          ))}
        </nav>
        <p className="cad-tag">Better Farming<br />Higher Yield<br />Brighter Future</p>
      </aside>

      <div className="cad-wrap">
        <header className="cad-top">
          
          <label className="cad-search"><Search size={18} /><input placeholder="Search for crops, diseases, soil, schemes or advice…" /></label>
          <select
            className="cad-language"
            aria-label="Select language"
            value={currentLang}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{ padding: "8px", borderRadius: "8px", border: "1px solid #ddd", background: "#fff" }}
          >
            {SUPPORTED_LANGS.map((lang) => (
              <option key={lang.code} value={lang.code}>{lang.label}</option>
            ))}
          </select>
          <button className="cad-bell" aria-label="Notifications"><Bell size={20} /></button>
          <div className="cad-user"><span className="av">{(user.name || "U")[0]}</span><b>{user.name}</b><ChevronDown size={16} /></div>
        </header>

        <div className="cad-body">
          <main>
            <section className="cad-banner">
              <div>
                <h1>{greet}{user.name ? `, ${user.name}` : ""}!</h1>
                <p>Smart farming decisions for a healthier crop and better tomorrow.</p>
                {user.location && <span><MapPin size={16} /> Your Location: {user.location}</span>}
              </div>
              <q>Healthy Soil<br />Better Yields<br />Sustainable Farming</q>
            </section>

            <div className="cad-features">
              {FEATURES.map((f) => (
                <button key={f.name} className={`cad-card t-${f.tone}`} onClick={() => nav(f.route)}>
                  <span className="ic"><f.icon size={22} /></span>
                  <b>{f.name}</b><small>{f.desc}</small><ArrowRight size={14} />
                </button>
              ))}
            </div>

            <div className="cad-grid">
              <Panel title="Weather Today" icon={CloudSun} ep={ENDPOINTS.weather}>
                {(d) => (<>
                  <div className="cad-big">{d.temperature}°C <small>{d.condition}</small></div>
                  <ul className="cad-kv"><li>Humidity <b>{d.humidity}%</b></li><li>Wind <b>{d.wind} km/h</b></li><li>Rainfall <b>{d.rainfall} mm</b></li></ul>
                  <div className="cad-fc">{d.forecast?.map((f) => <div key={f.day}>{f.day}<b>{f.max}°/{f.min}°</b></div>)}</div>
                </>)}
              </Panel>

              <Panel title="Crop & Soil Overview" icon={Sprout} ep={ENDPOINTS.crop}>
                {(d) => (<>
                  <div className="cad-big">{d.name} <small className="pill">{d.status}</small></div>
                  <p className="cad-sub">Current Growth Stage: {d.stage}</p>
                  <div className="cad-tiles"><div>Soil pH<b>{d.ph}</b></div><div>Soil Moisture<b>{d.moisture}%</b></div><div>Nutrient Level<b>{d.nutrients}</b></div></div>
                </>)}
              </Panel>

              <Panel title="Recent Alerts" icon={Bell} ep={ENDPOINTS.alerts}>{(d) => <List items={d} />}</Panel>

              <Panel title="Farm Performance" icon={BarChart3} ep={ENDPOINTS.performance}>
                {(d) => (<>
                  <div className="cad-tiles"><div>Total Area<b>{d.area}</b></div><div>Production<b>{d.production}</b></div><div>Est. Profit<b>{d.profit}</b></div></div>
                  {d.trend?.length > 1 && <Trend points={d.trend} />}
                </>)}
              </Panel>

              <Panel title="Market Price" icon={TrendingUp} ep={ENDPOINTS.market}>
                {(d) => (
                  <ul className="cad-market">
                    {d.map((m, i) => (
                      <li key={m.id ?? i}><span>{m.crop}</span><b>{m.price}</b><em className={m.change < 0 ? "dn" : "up"}>{m.change > 0 ? "↑" : "↓"} {Math.abs(m.change)}%</em></li>
                    ))}
                  </ul>
                )}
              </Panel>

              <section className="cad-panel">
                <header><h3><Zap size={18} /> Quick Actions</h3></header>
                <ul className="cad-actions">
                  {[["Ask Farming Assistant", 1], ["Check Government Schemes", 0], ["Get Crop Recommendation", 2], ["View Farming Calendar", 6]].map(([t, i]) => (
                    <li key={t}><button onClick={() => nav(FEATURES[i].route)}>{t}<ChevronRight size={16} /></button></li>
                  ))}
                </ul>
              </section>
            </div>
          </main>

          <aside className="cad-right">
            <Panel title="Quick Stats" icon={BarChart3} ep={ENDPOINTS.stats}>
              {(d) => (
                <div className="cad-stats">
                  <div>Total Crops<b>{d.crops}</b></div><div>Active Alerts<b>{d.alerts}</b></div>
                  <div>Schemes Available<b>{d.schemes}</b></div><div>Market Insights<b>{d.insights}</b></div>
                </div>
              )}
            </Panel>
            <Panel title="Recent Activity" icon={Clock} ep={ENDPOINTS.activity}>{(d) => <List items={d} secondary={null} />}</Panel>
            <section className="cad-promo">
              <h3>Grow More<br />With Smart Decisions</h3>
              <button onClick={() => nav(FEATURES[2].route)}>Get Started <ArrowRight size={14} /></button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}






