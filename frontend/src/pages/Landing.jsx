import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Globe, ArrowRight, Leaf } from 'lucide-react'
import i18n, { SUPPORTED_LANGS, setStoredLanguage } from '../i18n'
import './Landing.css'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1598519102179-6547728a67b1?auto=format&fit=crop&w=1920&q=75'

function Landing() {
  const { t } = useTranslation()
  const currentLang = i18n.language?.split('-')[0] || 'en'

  const handleLanguageChange = (lang) => {
    setStoredLanguage(lang)
    i18n.changeLanguage(lang)
  }

  return (
    <main className="landing-new">
      <header className="landing-navbar">
        <div className="landing-brand">
          <span className="landing-brand-icon">
            <Leaf size={25} />
          </span>
          <span>{t('brand')}</span>
        </div>

        <nav className="landing-navigation" aria-label="Main navigation">
          <div className="landing-language">
            <Globe size={17} />
            <select
              value={currentLang}
              onChange={(e) => handleLanguageChange(e.target.value)}
              aria-label={t('common.language')}
            >
              {SUPPORTED_LANGS.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>

          <Link to="/credit" className="landing-nav-link">
            Credit
          </Link>

          <Link to="/login" className="landing-nav-link">
            {t('nav.login')}
          </Link>

          <Link to="/register" className="landing-nav-button">
            {t('nav.getStarted')}
            <ArrowRight size={16} />
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <img
          className="landing-hero-image"
          src={HERO_IMAGE}
          alt="Green agricultural fields in India"
          fetchPriority="high"
        />

        <div className="landing-hero-overlay" />

        <div className="landing-hero-content">
          <p className="landing-eyebrow">
            <span />
            {t('landing.eyebrow', {
              defaultValue: 'Krishi Mitra SYSTEM',
            })}
          </p>

          <h1>
            {t('landing.heroTitle', {
              defaultValue: 'Grow Smarter.',
            })}
            <br />
            <span>
              {t('landing.heroSecondLine', {
                defaultValue: 'Farm Better.',
              })}
            </span>
          </h1>

          <p className="landing-hero-description">
            {t('landing.subtitle')}
          </p>

          <div className="landing-hero-actions">
            <Link to="/register" className="landing-primary-button">
              {t('landing.startFree')}
              <ArrowRight size={19} />
            </Link>

            <Link to="/login" className="landing-secondary-button">
              {t('landing.signIn')}
            </Link>
          </div>

          <div className="landing-trust-note">
            <Leaf size={17} />
            <span>
              {t('landing.trustNote', {
                defaultValue: 'Smarter decisions for healthier crops',
              })}
            </span>
          </div>
        </div>

        <div className="landing-image-caption">
          <span className="landing-caption-dot" />
          {t('landing.imageCaption', {
            defaultValue: 'Growing a greener tomorrow',
          })}
        </div>
      </section>

      <section className="landing-features">
        <div className="landing-features-heading">
          <p className="landing-section-eyebrow">
            {t('landing.eyebrow', {
              defaultValue: 'Krishi Mitra SYSTEM',
            })}
          </p>

          <h2>{t('landing.everythingYouNeed')}</h2>
          <p>{t('landing.subtitle')}</p>
        </div>

        <div className="landing-feature-grid">
          <article className="landing-feature-card">
            <div className="landing-feature-icon">
              <Globe size={23} />
            </div>
            <h3>{t('landing.apLiveWeather')}</h3>
            <p>{t('landing.apLiveWeatherDesc')}</p>
          </article>

          <article className="landing-feature-card">
            <div className="landing-feature-icon">
              <Leaf size={23} />
            </div>
            <h3>{t('landing.soilAnalysis')}</h3>
            <p>{t('landing.soilAnalysisDesc')}</p>
          </article>

          <article className="landing-feature-card">
            <div className="landing-feature-icon">
              <ArrowRight size={23} />
            </div>
            <h3>{t('landing.cropRecommendations')}</h3>
            <p>{t('landing.cropRecommendationsDesc')}</p>
          </article>
        </div>

        <div className="landing-features-cta">
          <h2>{t('landing.ctaTitle')}</h2>
          <p>{t('landing.ctaSubtitle')}</p>
          <Link to="/register" className="landing-primary-button">
            {t('landing.createAccount')}
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <footer className="landing-new-footer">
        <p>{t('landing.copyright')}</p>
      </footer>
    </main>
  )
}

export default Landing
