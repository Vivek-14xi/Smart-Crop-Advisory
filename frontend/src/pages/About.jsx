import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import {
  FiTarget,
  FiUsers,
  FiCpu,
  FiHeart,
  FiAward,
  FiArrowUpRight,
  FiCheckCircle,
  FiCode,
  FiZap,
  FiGlobe,
  FiShield
} from 'react-icons/fi'
import i18n, { SUPPORTED_LANGS, setStoredLanguage } from '../i18n'
import './Landing.css'
import './About.css'

const teamMembers = [
  {
    name: 'Vansh Tripathi',
    initials: 'VT',
    number: '01',
    linkedin: 'https://www.linkedin.com/in/vansh-tripathi-1615a6315/'
  },
  {
    name: 'Vikram Goutam',
    initials: 'VG',
    number: '02',
    linkedin: 'https://www.linkedin.com/in/vikram-goutam01/'
  },
  {
    name: 'Sandeep Pal',
    initials: 'SP',
    number: '03',
    linkedin: ''
  },
  {
    name: 'Zaid Siddiqui',
    initials: 'ZS',
    number: '04',
    linkedin: 'https://www.linkedin.com/in/zaid-siddiqui-6b31573b9/'
  },
  {
    name: 'Arya Navrang',
    initials: 'AN',
    number: '05',
    linkedin: 'https://www.linkedin.com/in/arya-navrang/'
  }
]

const technologies = [
  'React',
  'FastAPI',
  'Python',
  'PyTorch',
  'Machine Learning',
  'Google Gemini AI',
  'SQLite',
  'REST APIs'
]

function About() {
  const { t } = useTranslation()

  const currentLang =
    typeof window !== 'undefined'
      ? localStorage.getItem('app_language') || 'en'
      : 'en'

  return (
    <div className="landing premium-about">
      <div className="landing-bg" aria-hidden="true" />
      <div className="premium-orb premium-orb-one" aria-hidden="true" />
      <div className="premium-orb premium-orb-two" aria-hidden="true" />

      <header className="landing-header">
        <div className="container">
          <div className="header-inner">
            <Link to="/" className="logo">
              🌾 {t('brand')}
            </Link>

            <nav className="header-nav">
<Link to="/" className="btn btn-secondary">
                {t('nav.home')}
              </Link>

              <Link to="/login" className="btn btn-secondary">
                {t('nav.login')}
              </Link>

              <Link to="/register" className="btn btn-primary">
                {t('nav.getStarted')}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="premium-about-main">
        <div className="container">

          {/* HERO */}
          <motion.section
            className="premium-hero"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="premium-status">
              <span className="premium-status-dot" />
              BUILT FOR A GREENER TOMORROW
            </div>

            <p className="premium-overline">
              <FiCheckCircle aria-hidden="true" />
              SMART AGRICULTURE · REAL-WORLD IMPACT
            </p>

            <h1 className="premium-title">
              Meet the minds
              <br />
              behind <span>smarter farming.</span>
            </h1>

            <p className="premium-description">
              Great ideas grow when great people work together. Meet the team
              behind Smart Crop Advisory — a technology-driven initiative
              focused on helping farmers make smarter, more informed decisions.
            </p>

            <a href="#our-team" className="premium-explore-link">
              Meet the people behind the project
              <FiArrowUpRight aria-hidden="true" />
            </a>

            <div className="premium-stats">
              <div className="premium-stat">
                <span className="premium-stat-number">06</span>
                <span className="premium-stat-label">Team Contributors</span>
              </div>

              <div className="premium-stat-divider" />

              <div className="premium-stat">
                <span className="premium-stat-number">AI +</span>
                <span className="premium-stat-label">Smart Technology</span>
              </div>

              <div className="premium-stat-divider" />

              <div className="premium-stat">
                <span className="premium-stat-number">01</span>
                <span className="premium-stat-label">Shared Mission</span>
              </div>
            </div>
          </motion.section>

          {/* TEAM */}
          <section className="premium-team" id="our-team">
            <div className="premium-section-heading">
              <div>
                <p className="premium-overline">
                  <FiUsers aria-hidden="true" />
                  THE PEOPLE BEHIND THE CODE
                </p>

                <h2>
                  The team that
                  <br />
                  <span>makes it happen.</span>
                </h2>
              </div>

              <p className="premium-heading-copy">
                Every contribution matters. Every idea moves us forward.
                Together, we are exploring how technology can make agriculture
                smarter and more accessible.
              </p>
            </div>

            {/* FEATURED TEAM LEADER */}
            <motion.article
              className="premium-leader-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.55 }}
            >
              <div className="premium-leader-glow" aria-hidden="true" />

              <div className="premium-leader-visual">
                <div className="premium-leader-ring premium-ring-outer" />
                <div className="premium-leader-ring premium-ring-inner" />

                <div className="premium-leader-avatar">
                  VD
                </div>

                <div className="premium-avatar-spark premium-spark-one">✦</div>
                <div className="premium-avatar-spark premium-spark-two">✧</div>

                <div className="premium-leader-crown">
                  <FiAward aria-hidden="true" />
                  TEAM LEADER
                </div>
              </div>

              <div className="premium-leader-info">
                <p className="premium-leader-kicker">
                  <FiZap aria-hidden="true" />
                  PROJECT LEADERSHIP
                </p>

                <h3>Vivek Dashariye</h3>

                <p className="premium-leader-role">
                  Team Leader · Krishi Astra
                </p>

                <a
                  className="premium-linkedin-link"
                  href="https://www.linkedin.com/in/vivekdashariye/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open Vivek Dashariye's LinkedIn profile"
                >
                  <span className="premium-linkedin-mark" aria-hidden="true">in</span>
                  <span>Connect on LinkedIn</span>
                  <FiArrowUpRight aria-hidden="true" />
                </a>

                <p className="premium-leader-bio">
                  Leading the team’s journey toward a smarter agricultural
                  future through collaboration, technology, and a shared
                  commitment to farmer-focused innovation.
                </p>

                <div className="premium-leader-tags">
                  <span><FiTarget aria-hidden="true" /> Team Leadership</span>
                  <span><FiCode aria-hidden="true" /> Innovation</span>
                  <span><FiUsers aria-hidden="true" /> Collaboration</span>
                </div>

                <div className="premium-leader-signature">
                  <span className="premium-signature-line" />
                  <span>Leading with purpose. Building for impact.</span>
                </div>
              </div>

              <div className="premium-leader-index">LEAD / 01</div>
            </motion.article>

            {/* TEAM MEMBERS */}
            <div className="premium-members-heading">
              <div>
                <p className="premium-overline">THE CORE TEAM</p>
                <h3>Meet our contributors<span>.</span></h3>
              </div>

              <span className="premium-member-count">
                05 MEMBERS
              </span>
            </div>

            <div className="premium-members-grid">
              {teamMembers.map((member, index) => (
                <motion.article
                  className="premium-member-card"
                  key={member.name}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.08
                  }}
                >
                  <div className="premium-member-top">
                    <span className="premium-member-number">
                      {member.number} / TEAM
                    </span>

                    <FiArrowUpRight
                      className="premium-member-arrow"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="premium-member-avatar">
                    {member.initials}
                    <span className="premium-avatar-online" />
                  </div>

                  <h4>{member.name}</h4>

                  <p className="premium-member-role">
                    Core Team Member
                  </p>

                  {member.linkedin !== undefined && (
                    <a
                      className="premium-linkedin-link"
                      href={member.linkedin || undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${member.name}'s LinkedIn profile`}
                    >
                      <span className="premium-linkedin-mark" aria-hidden="true">
                        in
                      </span>
                      <span>Connect on LinkedIn</span>
                      <FiArrowUpRight aria-hidden="true" />
                    </a>
                  )}

                  <div className="premium-member-footer">
                    <span className="premium-member-check">
                      <FiCheckCircle aria-hidden="true" />
                      PROJECT CONTRIBUTOR
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>

            {/* TEAM CREDIT */}
            <motion.div
              className="premium-credit-banner"
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="premium-credit-icon">
                <FiHeart aria-hidden="true" />
              </div>

              <div className="premium-credit-copy">
                <p className="premium-overline">MORE THAN A PROJECT</p>

                <h3>Six minds. One vision. A smarter future.</h3>

                <p>
                  Krishi Astra is a team effort built around a shared
                  idea: technology should help solve real problems. We are
                  proud to present our collective work toward smarter and
                  more sustainable agriculture.
                </p>
              </div>

              <div className="premium-credit-decoration" aria-hidden="true">
                🌱
              </div>
            </motion.div>
          </section>

          {/* PROJECT PURPOSE */}
          <section className="premium-project-section">
            <div className="premium-project-heading">
              <p className="premium-overline">
                <FiGlobe aria-hidden="true" />
                OUR PROJECT, OUR PURPOSE
              </p>

              <h2>
                Technology with
                <br />
                <span>a purpose.</span>
              </h2>

              <p>
                Krishi Astra brings agricultural information and
                technology together to support better-informed farming
                decisions.
              </p>
            </div>

            <div className="premium-feature-grid">
              <article className="premium-feature-card">
                <div className="premium-feature-icon">
                  <FiTarget aria-hidden="true" />
                </div>

                <h3>Our Mission</h3>

                <p>
                  Make useful agricultural insights more accessible to farmers
                  through a unified digital platform.
                </p>
              </article>

              <article className="premium-feature-card">
                <div className="premium-feature-icon">
                  <FiCpu aria-hidden="true" />
                </div>

                <h3>Our Technology</h3>

                <p>
                  Combine web technologies, AI-assisted analysis, weather
                  information, and agricultural data.
                </p>
              </article>

              <article className="premium-feature-card">
                <div className="premium-feature-icon">
                  <FiShield aria-hidden="true" />
                </div>

                <h3>Our Commitment</h3>

                <p>
                  Keep improving the platform with a focus on usability,
                  responsible innovation, and farmer needs.
                </p>
              </article>
            </div>
          </section>

          {/* TECHNOLOGIES */}
          <section className="premium-tech-section">
            <div>
              <p className="premium-overline">
                <FiCode aria-hidden="true" />
                UNDER THE HOOD
              </p>

              <h2>Powered by technology<span>.</span></h2>

              <p>
                A modern technology stack supporting the Krishi Astra
                experience.
              </p>
            </div>

            <div className="premium-tech-list">
              {technologies.map((technology) => (
                <span className="premium-tech-pill" key={technology}>
                  <FiCheckCircle aria-hidden="true" />
                  {technology}
                </span>
              ))}
            </div>
          </section>

          {/* CTA */}
          <motion.section
            className="premium-final-cta"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
          >
            <span className="premium-cta-icon">🌾</span>

            <p className="premium-overline">THE FUTURE STARTS HERE</p>

            <h2>
              Let's grow a
              <br />
              <span>smarter tomorrow.</span>
            </h2>

            <p>
              Explore Smart Crop Advisory and discover our vision for
              technology-enabled agriculture.
            </p>

            <Link to="/register" className="btn btn-primary btn-lg">
              {t('landing.createAccount')}
              <FiArrowUpRight aria-hidden="true" />
            </Link>
          </motion.section>
        </div>
      </main>

      <footer className="landing-footer premium-about-footer">
        <div className="container">
          <p>{t('landing.copyright')}</p>
          <p className="premium-footer-credit">
            Crafted with purpose by the Krishi Astra team.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default About







