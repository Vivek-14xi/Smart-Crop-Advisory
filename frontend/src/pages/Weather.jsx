import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import {
  FiArrowLeft, FiMapPin, FiRefreshCw, FiSun, FiCloud,
  FiCloudRain, FiWind, FiDroplet, FiThermometer,
  FiAlertTriangle, FiMessageCircle, FiSend, FiCalendar,
  FiClock, FiActivity, FiUmbrella
} from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, BarElement, Tooltip, Legend, Filler
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import AppLayout from '../components/AppLayout'
import './Weather.css'

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Tooltip, Legend, Filler
)

const weatherIcon = (condition = '') => {
  const value = condition.toLowerCase()
  if (value.includes('rain') || value.includes('drizzle')) return FiCloudRain
  if (value.includes('cloud') || value.includes('overcast')) return FiCloud
  if (value.includes('wind')) return FiWind
  return FiSun
}

const formatDay = (value) => {
  if (!value) return '--'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-IN', { weekday: 'short' })
}

function Weather({ user, onLogout, onUserUpdate }) {
  const { t } = useTranslation()

  const [states, setStates] = useState(['Madhya Pradesh'])
  const [cities, setCities] = useState([])
  const [selectedState, setSelectedState] = useState('Madhya Pradesh')
  const [selectedCity, setSelectedCity] = useState('')
  const [weather, setWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [dataMode, setDataMode] = useState('unknown')
  const [lastUpdated, setLastUpdated] = useState(null)

  const location = selectedCity || cities[0] || selectedState

  useEffect(() => {
    axios.get('/api/market/states')
      .then((res) => {
        const list = res.data?.states || []
        if (list.length) setStates(list)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedState) return

    setSelectedCity('')
    setCities([])

    axios.get(`/api/market/cities/${encodeURIComponent(selectedState)}`)
      .then((res) => setCities(res.data?.cities || []))
      .catch(() => setCities([]))
  }, [selectedState])

  const loadWeather = useCallback(async () => {
    if (!location) return

    setLoading(!weather)
    setRefreshing(true)
    setError('')

    try {
      const [currentResult, forecastResult, alertResult] = await Promise.all([
        axios.post('/api/weather/current', { location }),
        axios.post('/api/weather/forecast?days=7', { location }),
        user?.id
          ? axios.post('/api/weather/check-alerts', { location })
              .catch(() => ({ data: { alerts: [] } }))
          : Promise.resolve({ data: { alerts: [] } })
      ])

      const currentData = currentResult.data
      const forecastData = forecastResult.data

      if (!currentData?.main) {
        throw new Error('The weather service did not return usable current weather data.')
      }

      setWeather(currentData)
      setForecast(Array.isArray(forecastData?.list) ? forecastData.list : [])
      setAlerts(Array.isArray(alertResult.data?.alerts) ? alertResult.data.alerts : [])

      const isMock = currentData?.data_source === 'mock' ||
        currentData?.is_mock === true ||
        forecastData?.data_source === 'mock' ||
        forecastData?.is_mock === true

      setDataMode(isMock ? 'demo' : 'unverified')
      setLastUpdated(new Date())
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        err.message ||
        'Unable to load weather information.'
      )
      setAlerts([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [location, user?.id])

  useEffect(() => {
    loadWeather()
  }, [loadWeather])

  const currentCondition = weather?.weather?.[0]?.description || 'Condition unavailable'
  const CurrentIcon = weatherIcon(currentCondition)

  const temperatures = useMemo(
    () => forecast.map((item) => Number(item?.main?.temp)).filter(Number.isFinite),
    [forecast]
  )

  const labels = useMemo(
    () => forecast.map((item) => formatDay(item?.dt_txt)),
    [forecast]
  )

  const temperatureChart = {
    labels,
    datasets: [
      {
        label: 'Temperature (°C)',
        data: temperatures,
        borderColor: '#6759e8',
        backgroundColor: 'rgba(103,89,232,0.12)',
        fill: true,
        tension: 0.38,
        pointRadius: 3
      }
    ]
  }

  const rainfallValues = useMemo(
    () => forecast.map((item) => {
      const rain = Number(item?.rain?.['3h'] ?? item?.rain?.['1h'] ?? 0)
      return Number.isFinite(rain) ? rain : 0
    }),
    [forecast]
  )

  const rainfallChart = {
    labels,
    datasets: [
      {
        label: 'Reported rainfall (mm)',
        data: rainfallValues,
        backgroundColor: '#45a7df',
        borderRadius: 6
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#8992a5' }
      },
      y: {
        beginAtZero: false,
        grid: { color: 'rgba(145,155,180,0.13)' },
        ticks: { color: '#8992a5' }
      }
    }
  }

  const farmingRecommendations = useMemo(() => {
    if (!weather?.main) return []

    const items = []
    const temp = Number(weather.main.temp)
    const humidity = Number(weather.main.humidity)
    const windKmh = Number(weather.wind?.speed) * 3.6
    const condition = String(weather.weather?.[0]?.description || '').toLowerCase()
    const hasTemp = Number.isFinite(temp)
    const hasHumidity = Number.isFinite(humidity)
    const hasWind = Number.isFinite(windKmh)
    const forecastRain = forecast.some((item) => {
      const rain = Number(item?.rain?.['3h'] ?? item?.rain?.['1h'] ?? 0)
      return Number.isFinite(rain) && rain > 0
    })

    if (hasTemp && temp >= 35) items.push({ priority: 'High', title: 'Heat stress watch', reason: "Temperature is around ${Math.round(temp)}°C.", action: 'Check soil moisture and crop water needs. Irrigate according to crop stage and local soil conditions.' })
    else if (hasTemp && temp >= 30) items.push({ priority: 'Medium', title: 'Monitor crop moisture', reason: "Temperature is around ${Math.round(temp)}°C.", action: 'Check soil moisture during the day and plan irrigation according to crop requirements.' })

    if (hasHumidity && humidity >= 80) items.push({ priority: 'Medium', title: 'High humidity watch', reason: "Relative humidity is ${Math.round(humidity)}%.", action: 'Inspect crops for disease symptoms and avoid unnecessary leaf wetness where practical.' })
    if (hasWind && windKmh >= 25) items.push({ priority: 'Medium', title: 'Wind conditions', reason: "Reported wind speed is ${Math.round(windKmh)} km/h.", action: 'Check local wind conditions before spraying or applying products that may drift.' })
    if (condition.includes('rain') || forecastRain) items.push({ priority: 'Medium', title: 'Rainfall planning', reason: 'Rain is mentioned in the current condition or available forecast records.', action: 'Check the local forecast and soil moisture before irrigation. Do not assume rainfall amount without verified precipitation data.' })

    if (!items.length) items.push({ priority: 'Low', title: 'Continue field monitoring', reason: 'No threshold-based weather concern was identified from the available readings.', action: 'Check soil moisture and crop condition before irrigation or spraying. This is not a guarantee of safe conditions.' })
    return items
  }, [weather, forecast])

  return (
    <AppLayout user={user} onLogout={onLogout} onUserUpdate={onUserUpdate}>
      <main className="weather-dashboard">
        <div className="weather-topbar">
          <div>
            <Link to="/dashboard" className="weather-back">
              <FiArrowLeft /> {t('common.backToDashboard')}
            </Link>
            <div className="weather-eyebrow">FARMING CLIMATE CENTER</div>
            <h1>Weather Intelligence</h1>
            <p>Understand the weather. Make better farming decisions.</p>
          </div>

          <button
            type="button"
            className="weather-refresh"
            onClick={loadWeather}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? 'weather-spin' : ''} />
            {refreshing ? 'Updating…' : 'Refresh'}
          </button>
        </div>

        <section className="weather-controls">
          <div className="weather-location-title">
            <FiMapPin />
            <div>
              <span>Selected location</span>
              <strong>{location || 'Choose a location'}</strong>
            </div>
          </div>

          <label>
            <span>State</span>
            <select
              value={selectedState}
              onChange={(event) => setSelectedState(event.target.value)}
            >
              {states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </label>

          <label>
            <span>City / District</span>
            <select
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
              disabled={!cities.length}
            >
              <option value="">Select city</option>
              {cities.map((city) => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </label>
        </section>

        {dataMode === 'demo' && (
          <div className="weather-notice demo-notice">
            Demo data is being displayed. These readings are not a confirmed live forecast.
          </div>
        )}

        {dataMode === 'unverified' && weather && (
          <div className="weather-notice">
            Data source could not be verified by the current API response. Confirm the backend provenance before relying on these readings.
          </div>
        )}

        {error && (
          <div className="weather-notice error-notice">
            <FiAlertTriangle />
            <span>{error}</span>
            <button type="button" onClick={loadWeather}>Retry</button>
          </div>
        )}

        {loading && !weather ? (
          <div className="weather-loading">
            <div className="weather-loader" />
            <p>Loading weather information…</p>
          </div>
        ) : (
          <>
            <section className="weather-hero-grid">
              <motion.article
                className="weather-current-card"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="weather-current-heading">
                  <div>
                    <span className="weather-label">CURRENT CONDITIONS</span>
                    <h2>{location}</h2>
                  </div>
                  <CurrentIcon className="weather-hero-icon" />
                </div>

                <div className="weather-current-main">
                  <div className="weather-temperature">
                    {Number.isFinite(Number(weather?.main?.temp))
                      ? Math.round(weather.main.temp)
                      : '--'}<span>°C</span>
                  </div>
                  <div className="weather-current-condition">
                    <strong>{currentCondition}</strong>
                    <span>
                      Feels like {Number.isFinite(Number(weather?.main?.feels_like))
                        ? `${Math.round(weather.main.feels_like)}°C`
                        : 'unavailable'}
                    </span>
                  </div>
                </div>

                <div className="weather-current-footer">
                  <span><FiClock /> Updated {lastUpdated?.toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  }) || '—'}</span>
                  <span>{dataMode === 'demo' ? 'Demo data' : 'Source verification pending'}</span>
                </div>
              </motion.article>

              <div className="weather-metrics-grid">
                <article className="weather-metric-card">
                  <span className="weather-metric-icon humidity"><FiDroplet /></span>
                  <span className="weather-label">HUMIDITY</span>
                  <strong>{weather?.main?.humidity ?? '--'}<small>%</small></strong>
                  <span className="weather-metric-caption">Relative humidity</span>
                </article>

                <article className="weather-metric-card">
                  <span className="weather-metric-icon wind"><FiWind /></span>
                  <span className="weather-label">WIND SPEED</span>
                  <strong>{Number.isFinite(Number(weather?.wind?.speed))
                    ? (weather.wind.speed * 3.6).toFixed(1)
                    : '--'}<small> km/h</small></strong>
                  <span className="weather-metric-caption">Near-surface wind</span>
                </article>

                <article className="weather-metric-card">
                  <span className="weather-metric-icon temperature"><FiThermometer /></span>
                  <span className="weather-label">FEELS LIKE</span>
                  <strong>{Number.isFinite(Number(weather?.main?.feels_like))
                    ? Math.round(weather.main.feels_like)
                    : '--'}<small>°C</small></strong>
                  <span className="weather-metric-caption">Apparent temperature</span>
                </article>

                <article className="weather-metric-card">
                  <span className="weather-metric-icon rain"><FiUmbrella /></span>
                  <span className="weather-label">FORECAST DAYS</span>
                  <strong>{forecast.length}<small> days</small></strong>
                  <span className="weather-metric-caption">Returned by API</span>
                </article>
              </div>
            </section>

            <section className="weather-section">
              <div className="weather-section-heading">
                <div>
                  <span className="weather-label">PLAN AHEAD</span>
                  <h2><FiCalendar /> Weather Forecast</h2>
                  <p>Forecast entries returned by the weather service.</p>
                </div>
              </div>

              {forecast.length ? (
                <div className="weather-forecast-grid">
                  {forecast.map((item, index) => {
                    const condition = item.weather?.[0]?.description || 'Condition unavailable'
                    const Icon = weatherIcon(condition)
                    const temp = Number(item.main?.temp)
                    return (
                      <motion.article
                        key={`${item.dt_txt || 'forecast'}-${index}`}
                        className="weather-forecast-card"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04 }}
                      >
                        <span>{formatDay(item.dt_txt)}</span>
                        <Icon className="weather-forecast-icon" />
                        <strong>{Number.isFinite(temp) ? `${Math.round(temp)}°` : '--'}</strong>
                        <small>{condition}</small>
                        <div className="forecast-rain">
                          <FiDroplet />
                          {Number(item.rain?.['3h'] ?? item.rain?.['1h'] ?? 0).toFixed(1)} mm
                        </div>
                      </motion.article>
                    )
                  })}
                </div>
              ) : (
                <div className="weather-empty">
                  No forecast entries are currently available for this location.
                </div>
              )}
            </section>

            {/* <section className="weather-section">
              <div className="weather-section-heading">
                <div>
                  <span className="weather-label">WEATHER TRENDS</span>
                  <h2><FiActivity /> Weather Analytics</h2>
                  <p>Visual summaries of the data returned by the forecast API.</p>
                </div>
              </div>

              <div className="weather-charts-grid">
                <article className="weather-chart-card">
                  <h3>Temperature trend</h3>
                  <p>Temperature values returned for each forecast entry.</p>
                  {temperatures.length ? (
                    <div className="weather-chart-container">
                      <Line data={temperatureChart} options={chartOptions} />
                    </div>
                  ) : <div className="weather-empty">Temperature data unavailable.</div>}
                </article>

                <article className="weather-chart-card">
                  <h3>Reported rainfall</h3>
                  <p>Values supplied by the current forecast response; period depends on the provider.</p>
                  {forecast.length ? (
                    <div className="weather-chart-container">
                      <Bar data={rainfallChart} options={chartOptions} />
                    </div>
                  ) : <div className="weather-empty">Rainfall data unavailable.</div>}
                </article>
              </div>
            </section> */}

            <section className="weather-section">
              <div className="weather-section-heading">
                <div>
                  <span className="weather-label">RISK MONITORING</span>
                  <h2><FiAlertTriangle /> Weather Alerts</h2>
                  <p>Alerts returned by the backend alert service.</p>
                </div>
              </div>

              {alerts.length ? (
                <div className="weather-alerts-grid">
                  {alerts.map((alert, index) => (
                    <article
                      className={`weather-alert-card severity-${String(alert.severity || 'medium').toLowerCase()}`}
                      key={alert.id || `${alert.title}-${index}`}
                    >
                      <FiAlertTriangle />
                      <div>
                        <span className="weather-alert-severity">{alert.severity || 'Notice'}</span>
                        <h3>{alert.title || 'Weather alert'}</h3>
                        <p>{alert.description || 'Follow local weather guidance.'}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="weather-empty weather-safe">
                  <FiSun />
                  <div>
                    <strong>No active alerts returned</strong>
                    <p>This means the alert service returned no active alerts. It is not a guarantee of safe conditions.</p>
                  </div>
                </div>
              )}
            </section>

            <section className="weather-recommendations">
              <div className="weather-section-heading">
                <div>
                  <span className="weather-label">WEATHER-AWARE FARMING</span>
                  <h2><FiSun /> Farming Recommendations</h2>
                  <p>Suggestions based on the available weather readings for {location}.</p>
                </div>
                <span className="weather-auto-badge">Automatic analysis</span>
              </div>

              {!weather ? (
                <div className="weather-empty">Recommendations will appear when weather data is available.</div>
              ) : (
                <div className="weather-recommendations-grid">
                  {farmingRecommendations.map((item, index) => (
                    <article className="weather-recommendation-card" key={`${item.title}-${index}`}>
                      <div className="weather-recommendation-top">
                        <span className={`weather-priority priority-${item.priority.toLowerCase()}`}>
                          {item.priority} priority
                        </span>
                        <FiActivity />
                      </div>
                      <h3>{item.title}</h3>
                      <p className="weather-recommendation-reason">{item.reason}</p>
                      <div className="weather-recommendation-action">
                        <strong>Recommended action</strong>
                        <p>{item.action}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* <p className="weather-recommendations-note">
                These are automatic threshold-based suggestions, not a diagnosis or a verified AI-generated agronomic assessment.
                Consider crop type, growth stage, soil conditions and local agricultural guidance before acting.
              </p> */}
            </section>
          </>
        )}
      </main>
    </AppLayout>
  )
}

export default Weather

