import { useEffect, useState } from 'react'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import AppLayout from '../components/AppLayout'
import AdvisoryMarkdown from '../components/AdvisoryMarkdown'
import { FiUploadCloud, FiActivity, FiClock, FiRefreshCw } from 'react-icons/fi'
import './SoilHealthFresh.css'

const INITIAL_FORM = {
  soil_type: '',
  nitrogen: '',
  phosphorus: '',
  potassium: '',
  ph: '',
  organic_matter: '',
  location: ''
}

const SOIL_TYPES = [
  'Clay', 'Sandy', 'Loamy', 'Silty',
  'Black Soil', 'Red Soil', 'Alluvial'
]

function SoilAnalysis({ user, onLogout, onUserUpdate }) {
  const { i18n } = useTranslation()
  const [form, setForm] = useState(INITIAL_FORM)
  const [report, setReport] = useState(null)
  const [history, setHistory] = useState([])
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const language = i18n.language || 'en'

  const loadHistory = async () => {
    if (!user?.id) return

    setHistoryLoading(true)
    try {
      const response = await axios.get(`/api/soil/history/${user.id}`)
      const data = response.data
      setHistory(Array.isArray(data) ? data : (data?.analyses || []))
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [user?.id])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
  }

  const handleManualAnalysis = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setReport(null)

    if (!user?.id) {
      setError('User session is unavailable. Please sign in again.')
      return
    }

    const required = ['nitrogen', 'phosphorus', 'potassium', 'ph']
    const invalid = required.some(key =>
      form[key] === '' || !Number.isFinite(Number(form[key]))
    )

    if (invalid) {
      setError('Enter valid values for Nitrogen, Phosphorus, Potassium and pH.')
      return
    }

    const numeric = {
      nitrogen: Number(form.nitrogen),
      phosphorus: Number(form.phosphorus),
      potassium: Number(form.potassium),
      ph: Number(form.ph)
    }

    if (Object.values(numeric).some(value => value < 0) ||
        numeric.ph < 0 || numeric.ph > 14) {
      setError('NPK values cannot be negative. Soil pH must be between 0 and 14.')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/soil/analyze', {
        user_id: user.id,
        soil_type: form.soil_type || null,
        nitrogen: numeric.nitrogen,
        phosphorus: numeric.phosphorus,
        potassium: numeric.potassium,
        ph: numeric.ph,
        organic_matter: form.organic_matter === ''
          ? null
          : Number(form.organic_matter),
        location: form.location.trim() || null,
        language
      })

      setReport(response.data)
      setNotice('Soil analysis completed.')
      await loadHistory()
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Soil analysis failed. Check the backend connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleImageAnalysis = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setReport(null)

    if (!image) {
      setError('Choose a soil report image first.')
      return
    }

    if (!user?.id) {
      setError('User session is unavailable. Please sign in again.')
      return
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(image.type)) {
      setError('Upload a JPG, PNG or WebP image.')
      return
    }

    const payload = new FormData()
    payload.append('image', image)
    payload.append('user_id', String(user.id))
    payload.append('language', language)

    if (form.location.trim()) {
      payload.append('location', form.location.trim())
    }

    setLoading(true)
    try {
      const response = await axios.post(
        '/api/soil/detect-from-image',
        payload
      )
      setReport(response.data)
      setNotice('Image processed. Review the result before relying on it.')
      await loadHistory()
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Could not process this image. Check the backend and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  const recommendations = report?.fertilizer_recommendations ||
    report?.recommendations || []

  return (
    <AppLayout user={user} onLogout={onLogout} onUserUpdate={onUserUpdate}>
      <main className="soil-fresh">
        <header className="soil-fresh__hero">
          <div className="soil-fresh__hero-icon"><FiActivity /></div>
          <div>
            <p className="soil-fresh__eyebrow">CROP &amp; SOIL ADVISOR</p>
            <h1>Soil Health Analysis</h1>
            <p>Upload a soil report or enter your soil parameters manually.</p>
          </div>
        </header>

        {error && <div className="soil-fresh__alert soil-fresh__alert--error" role="alert">{error}</div>}
        {notice && <div className="soil-fresh__alert soil-fresh__alert--success" role="status">{notice}</div>}

        <section className="soil-fresh__grid">
          <article className="soil-fresh__card">
            <h2><FiUploadCloud /> Upload soil report</h2>
            <p className="soil-fresh__muted">Select a clear JPG, PNG or WebP image of your soil report.</p>

            <form onSubmit={handleImageAnalysis}>
              <label className="soil-fresh__upload">
                <FiUploadCloud size={28} />
                <span>{image ? image.name : 'Choose report image'}</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={event => setImage(event.target.files?.[0] || null)}
                />
              </label>
              <label className="soil-fresh__field">
                Location (optional)
                <input name="location" value={form.location} onChange={handleChange} placeholder="Village, district or city" />
              </label>
              <button className="soil-fresh__button" disabled={loading} type="submit">
                {loading ? 'Processing…' : 'Analyze report image'}
              </button>
            </form>
          </article>

          <article className="soil-fresh__card">
            <h2><FiActivity /> Enter soil parameters</h2>
            <p className="soil-fresh__muted">Use values from a soil test report. Do not guess laboratory readings.</p>

            <form onSubmit={handleManualAnalysis}>
              <label className="soil-fresh__field">
                Soil type
                <select name="soil_type" value={form.soil_type} onChange={handleChange}>
                  <option value="">Select if known</option>
                  {SOIL_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </label>

              <div className="soil-fresh__fields">
                {[
                  ['nitrogen', 'Nitrogen (N)'],
                  ['phosphorus', 'Phosphorus (P)'],
                  ['potassium', 'Potassium (K)'],
                  ['ph', 'Soil pH'],
                  ['organic_matter', 'Organic matter (%)']
                ].map(([name, label]) => (
                  <label className="soil-fresh__field" key={name}>
                    {label}{name !== 'organic_matter' && <span aria-hidden="true"> *</span>}
                    <input
                      name={name}
                      type="number"
                      step="any"
                      min="0"
                      max={name === 'ph' ? 14 : undefined}
                      required={name !== 'organic_matter'}
                      value={form[name]}
                      onChange={handleChange}
                      placeholder={name === 'ph' ? 'e.g. 6.5' : 'Enter test value'}
                    />
                  </label>
                ))}
              </div>

              <button className="soil-fresh__button" disabled={loading} type="submit">
                {loading ? 'Analyzing…' : 'Analyze soil health'}
              </button>
            </form>
          </article>
        </section>

        {report && (
          <section className="soil-fresh__card soil-fresh__result" aria-live="polite">
            <h2>Analysis results</h2>

            {report.soil_health && (
              <div className="soil-fresh__health">
                <span>Soil health</span>
                <strong>{String(report.soil_health).replaceAll('_', ' ')}</strong>
              </div>
            )}

            {report.soil_type && <p><strong>Detected/selected soil type:</strong> {report.soil_type}</p>}

            {report.soil_parameters && (
              <div className="soil-fresh__fields">
                {Object.entries(report.soil_parameters).map(([key, value]) => (
                  <div className="soil-fresh__metric" key={key}>
                    <span>{key.replaceAll('_', ' ')}</span>
                    <strong>{String(value ?? '—')}</strong>
                  </div>
                ))}
              </div>
            )}

            {report.explanation && (
              <div className="soil-fresh__explanation">
                <h3>Explanation</h3>
                <AdvisoryMarkdown content={String(report.explanation)} />
              </div>
            )}

            {recommendations.length > 0 && (
              <div className="soil-fresh__explanation">
                <h3>Fertilizer recommendations</h3>
                <ul>
                  {recommendations.map((item, index) => (
                    <li key={index}>
                      {typeof item === 'string' ? item : JSON.stringify(item)}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="soil-fresh__disclaimer">
              Treat automated results as guidance, not a substitute for a verified soil laboratory report.
              Confirm fertilizer type and dosage with local agricultural experts.
            </p>
          </section>
        )}

        <section className="soil-fresh__card soil-fresh__history">
          <div className="soil-fresh__history-heading">
            <h2><FiClock /> Recent analyses</h2>
            <button type="button" className="soil-fresh__refresh" onClick={loadHistory} disabled={historyLoading}>
              <FiRefreshCw /> Refresh
            </button>
          </div>

          {historyLoading ? (
            <p className="soil-fresh__muted">Loading history…</p>
          ) : history.length === 0 ? (
            <p className="soil-fresh__muted">No previous analyses available.</p>
          ) : (
            <div className="soil-fresh__history-list">
              {history.map((item, index) => (
                <article className="soil-fresh__history-item" key={item.analysis_id || item.id || index}>
                  <div>
                    <strong>{item.soil_health || item.soil_type || 'Soil analysis'}</strong>
                    <p>{item.location || 'Location not provided'}</p>
                  </div>
                  <span>{item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}</span>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  )
}

export default SoilAnalysis
