import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FiMenu,
  FiX,
  FiLogOut,
  FiHome,
  FiBookOpen,
  FiMessageCircle,
  FiLayers,
  FiCloud,
  FiActivity,
  FiDroplet,
  FiTrendingUp,
  FiGlobe,
  FiChevronDown,
  FiActivity as FiSprout,
} from 'react-icons/fi'
import axios from 'axios'
import i18n, {
  SUPPORTED_LANGS,
  setStoredLanguage,
  getStoredLanguage,
} from '../i18n'
import './AppLayout.css'

const NAVIGATION = [
  {
    labelKey: 'sidebar.governmentSchemes',
    path: '/government-schemes',
    icon: FiBookOpen,
  },
  {
    labelKey: 'sidebar.farmingAssistant',
    path: '/farming-assistant',
    icon: FiMessageCircle,
  },
  {
    labelKey: 'sidebar.cropSoilAdvisor',
    path: '/crop-recommendation',
    icon: FiLayers,
  },
  {
    labelKey: 'sidebar.smartIrrigation',
    path: '/irrigation',
    icon: FiDroplet,
  },
  {
    labelKey: 'sidebar.weatherIntelligence',
    path: '/weather',
    icon: FiCloud,
  },
  {
    labelKey: 'sidebar.pestDisease',
    path: '/disease-detection',
    icon: FiActivity,
  },
{
    labelKey: 'sidebar.profitMarket',
    path: '/market-prices',
    icon: FiTrendingUp,
  },
]

function AppLayout({ children, user, onLogout, onUserUpdate }) {
  const { t } = useTranslation()
  const location = useLocation()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const currentLang =
    i18n.language ||
    user?.language ||
    (typeof window !== 'undefined'
      ? getStoredLanguage() || 'en'
      : 'en')

  const handleLanguageChange = async (lang) => {
    if (!SUPPORTED_LANGS.some((language) => language.code === lang)) return;

    // Apply the selected language immediately.
    setStoredLanguage(lang);
    await i18n.changeLanguage(lang);

    const updatedUser = user ? { ...user, language: lang } : null;

    if (updatedUser) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (onUserUpdate) onUserUpdate(updatedUser);
    }

    setLanguageOpen(false);

    // Sync preference to the backend without allowing stale data to override the UI.
    if (user?.id) {
      try {
        const { data } = await axios.put(
          `/api/auth/user/${user.id}?language=${lang}`
        );

        const syncedUser = { ...data, language: lang };
        localStorage.setItem("user", JSON.stringify(syncedUser));
        if (onUserUpdate) onUserUpdate(syncedUser);
      } catch (error) {
        console.error("Could not sync language preference to server:", error);
      }
    }
  }

  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }

    return location.pathname === path
  }

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const renderNavigationItem = (item) => {
    const Icon = item.icon
    const active = isActive(item.path)

    return (
      <Link
        key={t(item.labelKey)}
        to={item.path}
        onClick={closeMobileMenu}
        className={`sidebar-link ${active ? 'active' : ''}`}
        aria-current={active ? 'page' : undefined}
      >
        <Icon className="sidebar-link-icon" size={19} />

        <span className="sidebar-link-label">
          {t(item.labelKey)}
        </span>

        {active && <span className="sidebar-active-indicator" />}
      </Link>
    )
  }

  return (
    <div className={`app-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Desktop sidebar */}
      <aside className="app-sidebar">
       <button
  className="sidebar-collapse-button"
  onClick={() => setSidebarCollapsed((prev) => !prev)}
  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
>
  <FiMenu size={22} />
</button>
        <Link to="/dashboard" className="sidebar-brand">
          <span className="sidebar-brand-icon">
            <FiSprout size={25} />
          </span>

          <span className="sidebar-brand-text">
            <strong>{t("sidebar.brand")}</strong>
            <small>{t("sidebar.tagline")}</small>
          </span>
        </Link>

        <div className="sidebar-section-label">
          {t("sidebar.mainMenu")}
        </div>

        <nav className="sidebar-navigation" aria-label="Main navigation">
          <Link
            to="/dashboard"
            className={`sidebar-link ${
              isActive('/dashboard') ? 'active' : ''
            }`}
          >
            <FiHome className="sidebar-link-icon" size={19} />
            <span className="sidebar-link-label">{t("sidebar.dashboard")}</span>

            {isActive('/dashboard') && (
              <span className="sidebar-active-indicator" />
            )}
          </Link>

          {NAVIGATION.map(renderNavigationItem)}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help-card">
            <div className="sidebar-help-icon">
              <FiSprout size={21} />
            </div>

            <strong>{t("sidebar.growSmarter")}</strong>

            <p>
              {t("sidebar.growDescription")}
            </p>
          </div>

          <div className="sidebar-version">
            <span className="sidebar-status-dot" />
            {t("sidebar.footerBrand")}
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.button
              className="sidebar-overlay"
              aria-label="Close navigation menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMobileMenu}
            />

            <motion.aside
              className="app-sidebar mobile-sidebar"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25 }}
            >
              <div className="mobile-sidebar-heading">
                <Link
                  to="/dashboard"
                  className="sidebar-brand"
                  onClick={closeMobileMenu}
                >
                  <span className="sidebar-brand-icon">
                    <FiSprout size={25} />
                  </span>

                  <span className="sidebar-brand-text">
                    <strong>{t("sidebar.brand")}</strong>
                    <small>{t("sidebar.tagline")}</small>
                  </span>
                </Link>

                <button
                  className="sidebar-close-button"
                  onClick={closeMobileMenu}
                  aria-label="Close menu"
                >
                  <FiX size={22} />
                </button>
              </div>

              <div className="sidebar-section-label">
                {t("sidebar.mainMenu")}
              </div>

              <nav className="sidebar-navigation" aria-label="Mobile navigation">
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className={`sidebar-link ${
                    isActive('/dashboard') ? 'active' : ''
                  }`}
                >
                  <FiHome className="sidebar-link-icon" size={19} />
                  <span className="sidebar-link-label">{t("sidebar.dashboard")}</span>

                  {isActive('/dashboard') && (
                    <span className="sidebar-active-indicator" />
                  )}
                </Link>

                {NAVIGATION.map(renderNavigationItem)}
              </nav>

              <div className="sidebar-bottom">
                <div className="sidebar-help-card">
                  <div className="sidebar-help-icon">
                    <FiSprout size={21} />
                  </div>

                  <strong>{t("sidebar.growSmarter")}</strong>

                  <p>
                    {t("sidebar.growDescription")}
                  </p>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main application area */}
      <div className="app-main-area">
        <header className="app-topbar">
          <div className="topbar-left">
          
            <button
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <FiMenu size={23} />
            </button>

            <div className="topbar-page-info">
              <span className="topbar-eyebrow">
                {t("sidebar.navbarBrand")}
              </span>

              <h2 className="topbar-title">
                {location.pathname === '/dashboard'
                  ? t("sidebar.dashboard")
                  : NAVIGATION.find(
                      (item) => item.path === location.pathname
                    )?.label || t("sidebar.farmIntelligence")}
              </h2>
            </div>
          </div>

          <div className="topbar-actions">
            <div className="topbar-language">
              <FiGlobe size={17} />

              <select
                className="topbar-language-select"
                value={currentLang}
                onChange={(event) =>
                  handleLanguageChange(event.target.value)
                }
                aria-label={t('common.languageLabel')}
                title={t('common.languageLabel')}
              >
                {SUPPORTED_LANGS.map((language) => (
                  <option
                    key={language.code}
                    value={language.code}
                  >
                    {language.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="topbar-divider" />

            <div className="topbar-user">
              <div className="topbar-avatar">
                {(user?.name || 'F').trim().charAt(0).toUpperCase()}
              </div>

              <div className="topbar-user-details">
                <strong>{user?.name || 'Farmer'}</strong>
                <span>{t("sidebar.farmerAccount")}</span>
              </div>
            </div>

            <button
              className="topbar-logout"
              onClick={onLogout}
              aria-label={t('common.logout')}
              title={t('common.logout')}
            >
              <FiLogOut size={19} />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </header>

        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout



