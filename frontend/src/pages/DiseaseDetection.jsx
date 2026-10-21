import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getEffectiveLanguage } from '../i18n'
import { useDropzone } from 'react-dropzone'
import axios from 'axios'
import { motion } from 'framer-motion'
import AppLayout from '../components/AppLayout'
import AdvisoryMarkdown from '../components/AdvisoryMarkdown'
import { FiArrowLeft } from 'react-icons/fi'
import './FeaturePage.css'

function DiseaseDetection({ user, onLogout, onUserUpdate }) {
  const { t } = useTranslation()
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 1,
    onDrop: (files) => {
      const f = files[0]
      setImage(f)
      setPreview(f ? URL.createObjectURL(f) : null)
      setResult(null)
      setError('')
    }
  })

  const handleAnalyze = async () => {
    if (!image) { setError(t('disease.uploadFirst')); return }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('image', image)
      fd.append('user_id', user?.id || '')
      fd.append('language', getEffectiveLanguage(user))
      fd.append('send_email', 'true')
      const res = await axios.post('/api/disease/detect', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppLayout user={user} onLogout={onLogout} onUserUpdate={onUserUpdate}>
      <div className="feature-page">
        <div className="container">
          <Link to="/dashboard" className="back-link"><FiArrowLeft size={16} /> {t('common.back')}</Link>
          <div className="page-header">
            <h1 className="page-title">{t('disease.title')}</h1>
            <p className="page-subtitle">{t('disease.subtitle')}</p>
          </div>

          <div className="feature-content disease-scan-content">
            <div className="disease-scan-layout">
              <motion.div
                className={`disease-scan-upload ${isDragActive ? 'is-dragging' : ''}`}
                {...getRootProps()}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
              >
                <input {...getInputProps()} />

                <div className="disease-scan-panel-top">
                  <span className="disease-scan-eyebrow">
                    <span className="disease-scan-live-dot"></span>
                    IMAGE INPUT
                  </span>
                  <span className="disease-scan-step">01 / UPLOAD</span>
                </div>

                <div className={`disease-scan-dropzone ${isDragActive ? 'active' : ''} ${preview ? 'has-preview' : ''}`}>
                  {preview ? (
                    <div className="disease-scan-preview-wrap">
                      <img src={preview} alt="Selected crop for disease analysis" className="disease-scan-preview" />
                      <div className="disease-scan-preview-overlay">
                        <span className="disease-scan-preview-tag">IMAGE LOADED</span>
                        <span className="disease-scan-scanline"></span>
                      </div>
                      <p className="disease-scan-drop-text">{t('disease.clickReplace')}</p>
                    </div>
                  ) : (
                    <div className="disease-scan-empty">
                      <div className="disease-scan-upload-icon">
                        <span>↑</span>
                      </div>
                      <span className="disease-scan-mini-label">CROP IMAGE SCANNER</span>
                      <p className="disease-scan-drop-text">
                        {isDragActive ? t('disease.dropHere') : t('disease.dragDrop')}
                      </p>
                      <p className="disease-scan-drop-hint">{t('disease.jpgPng')}</p>
                      <span className="disease-scan-browse">Click here or drop your image</span>
                    </div>
                  )}
                </div>

                <div className="disease-scan-upload-footer">
                  <span><span className="disease-scan-check">✓</span> JPG / PNG</span>
                  <span>SECURE IMAGE INPUT</span>
                </div>
              </motion.div>

              <motion.aside
                className="disease-scan-analyze"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 }}
              >
                <div className="disease-scan-panel-top">
                  <span className="disease-scan-eyebrow">AI DIAGNOSTICS</span>
                  <span className="disease-scan-status">● SYSTEM READY</span>
                </div>

                <div className="disease-scan-orb-wrap" aria-hidden="true">
                  <div className="disease-scan-orb-ring disease-scan-orb-ring-one"></div>
                  <div className="disease-scan-orb-ring disease-scan-orb-ring-two"></div>
                  <div className="disease-scan-orb">
                    <span>✳</span>
                  </div>
                </div>

                <span className="disease-scan-mini-label">INTELLIGENT CROP CARE</span>
                <h2 className="disease-scan-heading">AI Crop Doctor</h2>
                <p className="disease-scan-description">
                  Upload a crop image to begin an AI-powered disease examination and receive a crop health advisory.
                </p>

                <div className="disease-scan-divider"></div>

                <div className="disease-scan-ready-row">
                  <span className="disease-scan-ready-icon">⌁</span>
                  <span>{image ? 'Image ready for analysis' : 'Waiting for crop image'}</span>
                  <span className={`disease-scan-ready-indicator ${image ? 'is-ready' : ''}`}></span>
                </div>

                <button
                  type="button"
                  onClick={handleAnalyze}
                  className="disease-scan-analyze-button"
                  disabled={!image || loading || !!result}
                >
                  <span>{loading ? t('disease.analyzing') : t('disease.analyze')}</span>
                  <span className="disease-scan-button-arrow">{loading ? '◌' : '↗'}</span>
                </button>

                <p className="disease-scan-button-note">
                  {loading ? 'Examining your crop image…' : 'AI-assisted crop health examination'}
                </p>

                {error && <div className="alert alert-danger disease-scan-error">{error}</div>}
              </motion.aside>
            </div>
            {result && (
              <motion.div className="result-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <div className={`result-header ${result.is_healthy ? 'healthy' : 'diseased'}`}>
                  <h2>{result.is_healthy ? t('disease.healthyCrop') : t('disease.diseaseDetected')}</h2>
                  <span className="btn btn-secondary" style={{ border: 'none' }}>{(result.confidence * 100).toFixed(1)}% {t('common.confidence')}</span>
                </div>
                <div className="param-item" style={{ marginBottom: 'var(--space-4)' }}>
                  <span className="param-label">{t('disease.detectedCrop')}</span>
                  <span className="param-value">{result.crop_name || '—'}</span>
                </div>
                {!result.is_healthy && (
                  <div className="param-item" style={{ marginBottom: 'var(--space-4)' }}>
                    <span className="param-label">{t('disease.identifiedCondition')}</span>
                    <span className="param-value">{result.disease_name}</span>
                  </div>
                )}
                <div className="param-item" style={{ marginBottom: 'var(--space-4)' }}>
                  <span className="param-label">{t('disease.predictionAccuracy')}</span>
                  <span className="param-value">{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="advisory-section">
                  <h3>{t('common.aiAdvisory')}</h3>
                  <AdvisoryMarkdown content={result.advisory} className="advisory-content" language={getEffectiveLanguage(user)} />
                </div>
                <button onClick={() => { setResult(null); setImage(null); setPreview(null); }} className="btn btn-outline" style={{ marginTop: 'var(--space-6)' }}>
                  {t('disease.analyzeAnother')}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default DiseaseDetection


