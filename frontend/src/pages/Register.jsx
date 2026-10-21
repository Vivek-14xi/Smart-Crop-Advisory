import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import i18n, { setStoredLanguage } from '../i18n'
import axios from 'axios'
import { motion } from 'framer-motion'
import './Auth.css'

function Register() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: 'Andhra Pradesh',
    language: 'en'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((previous) => ({ ...previous, [name]: value }))

    if (name === 'language') {
      setStoredLanguage(value)
      i18n.changeLanguage(value)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setStoredLanguage(formData.language)
    await i18n.changeLanguage(formData.language)
    try {
      await axios.post('/api/auth/register', formData)
      alert('Registration successful! Please sign in.')
      navigate('/login')
    } catch (err) {
      const detail = err.response?.data?.detail
      const message = typeof detail === 'string'
        ? detail
        : Array.isArray(detail) && detail[0]?.msg
          ? detail[0].msg
          : 'Registration failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <motion.div
        className="auth-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="auth-card">
          <h1 className="auth-title">{t('auth.createAccountTitle')}</h1>
          <p className="auth-subtitle">{t('auth.createAccountSubtitle')}</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">{t('auth.fullName')}</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('auth.namePlaceholder')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.emailAddress')}</label>
              <input
                type="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('auth.emailPlaceholder')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.phoneNumber')}</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('auth.phonePlaceholder')}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.locationLabel')}</label>
              <select
                name="location"
                className="form-select"
                value={formData.location}
                onChange={handleChange}
                required
              >
                <option value="">Select your State / Union Territory</option>
                <optgroup label="States">
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                  <option value="Assam">Assam</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Chhattisgarh">Chhattisgarh</option>
                  <option value="Goa">Goa</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Himachal Pradesh">Himachal Pradesh</option>
                  <option value="Jharkhand">Jharkhand</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Manipur">Manipur</option>
                  <option value="Meghalaya">Meghalaya</option>
                  <option value="Mizoram">Mizoram</option>
                  <option value="Nagaland">Nagaland</option>
                  <option value="Odisha">Odisha</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Sikkim">Sikkim</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Telangana">Telangana</option>
                  <option value="Tripura">Tripura</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Uttarakhand">Uttarakhand</option>
                  <option value="West Bengal">West Bengal</option>
                </optgroup>
                <optgroup label="Union Territories">
                  <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                  <option value="Chandigarh">Chandigarh</option>
                  <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                  <option value="Ladakh">Ladakh</option>
                  <option value="Lakshadweep">Lakshadweep</option>
                  <option value="Puducherry">Puducherry</option>
                </optgroup>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t('auth.languageLabel')}</label>
              <select
                name="language"
                className="form-select"
                value={formData.language}
                onChange={handleChange}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="gu">ગુજરાતી (Gujarati)</option>
                <option value="pa">ਪੰਜਾਬੀ (Punjabi)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
            </button>
          </form>

          <div className="auth-footer">
            <p>{t('auth.alreadyHaveAccount')} <Link to="/login">{t('auth.signIn')}</Link></p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Register



