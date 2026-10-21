import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AppLayout from "../components/AppLayout";
import {
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiMapPin,
  FiSearch,
  FiRefreshCw,
  FiInfo,
  FiPieChart,
  FiBarChart2,
  FiActivity,
  FiAlertCircle,
} from "react-icons/fi";
import "./ProfitMarketAnalyzer.css";

const CROPS = [
  "Rice",
  "Wheat",
  "Maize",
  "Cotton",
  "Soybean",
  "Chilli",
  "Groundnut",
  "Tomato",
  "Onion",
  "Turmeric",
];

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);

const numberValue = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
};

function StatCard({ icon: Icon, label, value, detail, type = "" }) {
  return (
    <article className={`pma-stat-card ${type}`}>
      <div className="pma-stat-top">
        <span className="pma-stat-label">{label}</span>
        <span className="pma-stat-icon">
          <Icon size={19} />
        </span>
      </div>
      <div className="pma-stat-value">{value}</div>
      <p className="pma-stat-detail">{detail}</p>
    </article>
  );
}

function ProfitMarketAnalyzer({ user, onLogout, onUserUpdate }) {
  const [crop, setCrop] = useState("Soybean");
  const [area, setArea] = useState("2");
  const [yieldPerAcre, setYieldPerAcre] = useState("12");
  const [sellingPrice, setSellingPrice] = useState("4500");
  const [costPerAcre, setCostPerAcre] = useState("25000");
  const [otherCosts, setOtherCosts] = useState("5000");

  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [marketPrices, setMarketPrices] = useState([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketError, setMarketError] = useState("");
  const [marketStatus, setMarketStatus] = useState("idle");
  const [lastUpdated, setLastUpdated] = useState("");

  const [marketSearch, setMarketSearch] = useState("");

  const results = useMemo(() => {
    const acres = numberValue(area);
    const yieldValue = numberValue(yieldPerAcre);
    const price = numberValue(sellingPrice);
    const cost = numberValue(costPerAcre);
    const additional = numberValue(otherCosts);

    const production = acres * yieldValue;
    const investment = acres * cost + additional;
    const revenue = production * price;
    const profit = revenue - investment;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const roi = investment > 0 ? (profit / investment) * 100 : 0;

    return {
      acres,
      production,
      investment,
      revenue,
      profit,
      margin,
      roi,
      price,
    };
  }, [area, yieldPerAcre, sellingPrice, costPerAcre, otherCosts]);

  useEffect(() => {
    let active = true;

    axios
      .get("/api/market/states")
      .then((response) => {
        if (!active) return;
        const data = response.data;
        const list = Array.isArray(data)
          ? data
          : data?.states || data?.data || [];

        setStates(
          list
            .map((item) =>
              typeof item === "string"
                ? item
                : item?.state || item?.name || item?.state_name || "",
            )
            .filter(Boolean),
        );
      })
      .catch(() => {
        if (active) setStates([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const loadMarketPrices = async (requestedCrop = crop) => {
    setMarketLoading(true);
    setMarketError("");
    setMarketStatus("loading");
    setMarketPrices([]);

    try {
      const params = { days: 30 };
      if (selectedState) params.state = selectedState;

      const response = await axios.get(
        `/api/market/prices/${encodeURIComponent(requestedCrop)}`,
        { params },
      );

      const data = response.data;
      const list = Array.isArray(data)
        ? data
        : data?.prices || data?.records || data?.data || [];

      const normalized = list
        .map((item) => ({
          market: item.market || item.market_name || item.mandi || "Market",
          state: item.state || item.state_name || selectedState || "Unknown",
          price: Number(
            item.price ?? item.modal_price ?? item.modalPrice ?? item.min_price,
          ),
          date: item.date || item.arrival_date || "",
          source: item.source || item.data_source || "",
        }))
        .filter((item) => Number.isFinite(item.price) && item.price > 0);

      setMarketPrices(normalized);
      setLastUpdated(new Date().toLocaleString("en-IN"));

      if (normalized.length === 0) {
        setMarketStatus("empty");
        setMarketError(
          "Live government mandi records are unavailable for this selection. No simulated prices are shown.",
        );
      } else {
        setMarketStatus("loaded");
      }
    } catch (error) {
      setMarketStatus("error");
      setMarketError(
        error.response?.data?.detail ||
          "Market data load nahi ho saka. Backend connection aur API response check karein.",
      );
    } finally {
      setMarketLoading(false);
    }
  };

  const filteredMarkets = useMemo(() => {
    const query = marketSearch.trim().toLowerCase();

    return [...marketPrices]
      .filter(
        (item) =>
          !query ||
          item.market.toLowerCase().includes(query) ||
          item.state.toLowerCase().includes(query),
      )
      .sort((a, b) => b.price - a.price);
  }, [marketPrices, marketSearch]);

  const averageMarketPrice =
    marketPrices.length > 0
      ? marketPrices.reduce((sum, item) => sum + item.price, 0) /
        marketPrices.length
      : null;

  const highestMarket = filteredMarkets[0] || null;
  const lowestMarket =
    filteredMarkets.length > 0
      ? filteredMarkets[filteredMarkets.length - 1]
      : null;

  const useMarketPrice = (price) => {
    setSellingPrice(String(Math.round(price)));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppLayout
      user={user}
      onLogout={onLogout}
      onUserUpdate={onUserUpdate}
    >
      <main className="pma-page">
        <header className="pma-hero">
          <div className="pma-hero-copy">
            <div className="pma-eyebrow">
              <FiActivity size={15} />
              FARM BUSINESS INTELLIGENCE
            </div>
            <h1>Profit &amp; Market Analyzer</h1>
            <p>
              Apni farming investment, expected income aur mandi prices ko
              ek hi jagah analyze karein.
            </p>
            <div className="pma-hero-tags">
              <span><FiPieChart size={14} /> Profit planning</span>
              <span><FiBarChart2 size={14} /> Market comparison</span>
            </div>
          </div>
          <div className="pma-hero-art" aria-hidden="true">
            <div className="pma-art-orbit pma-orbit-one" />
            <div className="pma-art-orbit pma-orbit-two" />
            <div className="pma-art-center">
              <FiTrendingUp size={42} />
            </div>
            <span className="pma-art-dot pma-dot-one" />
            <span className="pma-art-dot pma-dot-two" />
          </div>
        </header>

        <section className="pma-stat-grid" aria-label="Profit summary">
          <StatCard
            icon={FiDollarSign}
            label="Total Investment"
            value={formatINR(results.investment)}
            detail="Estimated farming expenses"
          />
          <StatCard
            icon={FiBarChart2}
            label="Expected Revenue"
            value={formatINR(results.revenue)}
            detail={`${results.production.toLocaleString("en-IN")} estimated production units`}
          />
          <StatCard
            icon={results.profit >= 0 ? FiTrendingUp : FiTrendingDown}
            label={results.profit >= 0 ? "Expected Net Profit" : "Expected Loss"}
            value={formatINR(results.profit)}
            detail="Revenue minus estimated costs"
            type={results.profit >= 0 ? "pma-positive" : "pma-negative"}
          />
          <StatCard
            icon={FiPieChart}
            label="Profit Margin"
            value={`${results.margin.toFixed(1)}%`}
            detail={`Return on investment: ${results.roi.toFixed(1)}%`}
            type={results.profit >= 0 ? "pma-positive" : "pma-negative"}
          />
        </section>

        <div className="pma-content-grid">
          <section className="pma-panel pma-calculator">
            <div className="pma-section-heading">
              <div className="pma-heading-icon"><FiDollarSign /></div>
              <div>
                <h2>Farm Profit Calculator</h2>
                <p>Apni crop aur estimated expenses enter karein.</p>
              </div>
            </div>

            <div className="pma-form-grid">
              <label className="pma-field pma-full-field">
                <span>Crop</span>
                <select value={crop} onChange={(event) => setCrop(event.target.value)}>
                  {CROPS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="pma-field">
                <span>Land area (acres)</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                />
              </label>

              <label className="pma-field">
                <span>Expected yield per acre</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={yieldPerAcre}
                  onChange={(event) => setYieldPerAcre(event.target.value)}
                />
                <small>Production unit aapke input par depend karta hai.</small>
              </label>

              <label className="pma-field">
                <span>Selling price per unit (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={sellingPrice}
                  onChange={(event) => setSellingPrice(event.target.value)}
                />
              </label>

              <label className="pma-field">
                <span>Cost per acre (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={costPerAcre}
                  onChange={(event) => setCostPerAcre(event.target.value)}
                />
              </label>

              <label className="pma-field pma-full-field">
                <span>Other total expenses (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={otherCosts}
                  onChange={(event) => setOtherCosts(event.target.value)}
                />
                <small>Transport, storage ya additional labour jaise costs.</small>
              </label>
            </div>

            <div className="pma-calculation-note">
              <FiInfo size={17} />
              <p>
                <strong>Calculation:</strong> Revenue = area × yield per acre ×
                selling price. Profit = revenue − total expenses.
              </p>
            </div>

            <div className="pma-results-breakdown">
              <div>
                <span>Total production</span>
                <strong>{results.production.toLocaleString("en-IN")}</strong>
              </div>
              <div>
                <span>Total expenses</span>
                <strong>{formatINR(results.investment)}</strong>
              </div>
              <div>
                <span>Break-even selling price per unit</span>
                <strong>
                  {results.production > 0
                    ? formatINR(results.investment / results.production)
                    : "—"}
                </strong>
              </div>
            </div>
          </section>

          <section className="pma-panel pma-market-panel">
            <div className="pma-section-heading">
              <div className="pma-heading-icon pma-market-icon"><FiTrendingUp /></div>
              <div>
                <h2>Market Price Explorer</h2>
                <p>Backend se available crop prices check karein.</p>
              </div>
            </div>

            <label className="pma-field">
              <span>Crop to search</span>
              <select
                value={crop}
                onChange={(event) => {
                  setCrop(event.target.value);
                  setMarketPrices([]);
                  setMarketStatus("idle");
                  setMarketError("");
                }}
              >
                {CROPS.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label className="pma-field pma-location-field">
              <span><FiMapPin size={14} /> State (optional)</span>
              <select
                value={selectedState}
                onChange={(event) => setSelectedState(event.target.value)}
              >
                <option value="">All available states</option>
                {states.map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </label>

            <button
              className="pma-primary-button"
              onClick={() => loadMarketPrices(crop)}
              disabled={marketLoading}
              type="button"
            >
              {marketLoading ? (
                <><FiRefreshCw className="pma-spin" /> Loading prices...</>
              ) : (
                <><FiSearch /> Explore market prices</>
              )}
            </button>

            {marketStatus === "idle" && (
              <div className="pma-market-empty">
                <div className="pma-empty-icon"><FiBarChart2 size={26} /></div>
                <h3>Market insights start here</h3>
                <p>
                  Crop select karke button dabayein. Available market records
                  yahan show honge.
                </p>
              </div>
            )}

            {marketStatus === "loading" && (
              <div className="pma-inline-status">
                <FiRefreshCw className="pma-spin" />
                <span>Market records fetch ho rahe hain...</span>
              </div>
            )}

            {(marketStatus === "empty" || marketStatus === "error") && (
              <div className="pma-error-box">
                <FiAlertCircle size={20} />
                <div>
                  <strong>
                    {marketStatus === "error" ? "Data unavailable" : "No market records"}
                  </strong>
                  <p>{marketError}</p>
                </div>
              </div>
            )}

            {marketStatus === "loaded" && (
              <div className="pma-market-results">
                <div className="pma-market-summary">
                  <div>
                    <span>Records found</span>
                    <strong>{marketPrices.length}</strong>
                  </div>
                  <div>
                    <span>Average listed price</span>
                    <strong>{formatINR(averageMarketPrice)}</strong>
                  </div>
                </div>

                <div className="pma-source-note">
                  <FiInfo size={16} />
                  <span>
                    Backend response ki data provenance verify karein.
                    In prices ko verified live rates tabhi maanein jab source
                    confirm ho.
                  </span>
                </div>

                <label className="pma-search-field">
                  <FiSearch size={17} />
                  <input
                    type="search"
                    placeholder="Search market or state..."
                    value={marketSearch}
                    onChange={(event) => setMarketSearch(event.target.value)}
                  />
                </label>

                <div className="pma-market-list">
                  {filteredMarkets.map((item, index) => (
                    <article className="pma-market-row" key={`${item.market}-${item.state}-${index}`}>
                      <div className="pma-market-rank">{index + 1}</div>
                      <div className="pma-market-info">
                        <strong>{item.market}</strong>
                        <span>{item.state}{item.date ? ` · ${item.date}` : ""}</span>
                      </div>
                      <div className="pma-market-price">
                        <strong>{formatINR(item.price)}</strong>
                        <button
                          type="button"
                          onClick={() => useMarketPrice(item.price)}
                          title="Use this price in profit calculator"
                        >
                          Use price
                        </button>
                      </div>
                    </article>
                  ))}
                  {filteredMarkets.length === 0 && (
                    <p className="pma-no-match">Search ke liye koi market match nahi hua.</p>
                  )}
                </div>

                {lastUpdated && (
                  <p className="pma-updated">Fetched at: {lastUpdated}</p>
                )}
              </div>
            )}
          </section>
        </div>

        {marketStatus === "loaded" && marketPrices.length > 0 && (
          <section className="pma-panel pma-comparison-panel">
            <div className="pma-section-heading">
              <div className="pma-heading-icon"><FiBarChart2 /></div>
              <div>
                <h2>Market Comparison</h2>
                <p>Loaded records ke andar price comparison.</p>
              </div>
            </div>
            <div className="pma-comparison-grid">
              <article className="pma-comparison-card">
                <span>Highest listed price</span>
                <strong>{highestMarket ? formatINR(highestMarket.price) : "—"}</strong>
                <p>{highestMarket ? `${highestMarket.market}, ${highestMarket.state}` : "No matching market"}</p>
              </article>
              <article className="pma-comparison-card">
                <span>Lowest listed price</span>
                <strong>{lowestMarket ? formatINR(lowestMarket.price) : "—"}</strong>
                <p>{lowestMarket ? `${lowestMarket.market}, ${lowestMarket.state}` : "No matching market"}</p>
              </article>
              <article className="pma-comparison-card">
                <span>Price difference</span>
                <strong>
                  {highestMarket && lowestMarket
                    ? formatINR(highestMarket.price - lowestMarket.price)
                    : "—"}
                </strong>
                <p>Highest minus lowest in the filtered records.</p>
              </article>
            </div>
          </section>
        )}

        <footer className="pma-disclaimer">
          <FiInfo size={18} />
          <p>
            <strong>Planning estimate, not a guaranteed return.</strong> Profit
            results depend on your inputs and exclude any expense you have not
            entered. Actual yield, quality, transport, commission, taxes and
            mandi rates may change the final result. Verify market data before
            making a selling decision.
          </p>
        </footer>
      </main>
    </AppLayout>
  );
}

export default ProfitMarketAnalyzer;
