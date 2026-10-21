import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import {
FiArrowLeft,
FiSend,
FiMessageCircle,
FiUser,
FiLoader,
FiTrash2,
} from 'react-icons/fi'

import AppLayout from '../components/AppLayout'
import { getEffectiveLanguage } from '../i18n'
import AdvisoryMarkdown from '../components/AdvisoryMarkdown'
import './FeaturePage.css'
import './FarmingAssistant.css'

function FarmingAssistant({ user, onLogout, onUserUpdate }) {
const { t } = useTranslation()

const [messages, setMessages] = useState([])
const [input, setInput] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

const messagesEndRef = useRef(null)
const inputRef = useRef(null)

useEffect(() => {
messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
}, [messages, loading])

const [language, setLanguage] = useState(() => {
  const saved = localStorage.getItem('farming_assistant_language')
  return ['hi', 'en', 'mr', 'gu', 'bn'].includes(saved) ? saved : 'hi'
})

const changeFarmingLanguage = (event) => {
  const nextLanguage = event.target.value
  setLanguage(nextLanguage)
  localStorage.setItem('farming_assistant_language', nextLanguage)
}

const suggestions = [
'Help me choose a crop for my soil',
'How can I improve soil health?',
'Help me identify and manage crop pests',
'Suggest an irrigation strategy for my farm',
]

const sendMessage = async (text = input) => {
const message = text.trim()


if (!message || loading) return

const updatedMessages = [
  ...messages,
  { role: 'user', content: message },
]

setMessages(updatedMessages)
setInput('')
setError('')
setLoading(true)

try {
  const response = await axios.post(
    '/api/farming-assistant/chat',
    {
      message,
      language,
      history: messages.slice(-10),
    }
  )

  setMessages((previous) => [
    ...previous,
    {
      role: 'assistant',
      content: response.data.reply,
    },
  ])
} catch (err) {
  const detail = err.response?.data?.detail

  setError(
    typeof detail === 'string'
      ? detail
      : 'Unable to get a response. Please try again.'
  )
} finally {
  setLoading(false)
  inputRef.current?.focus()
}


}

const clearChat = () => {
if (loading) return

setMessages([])
setInput('')
setError('')
inputRef.current?.focus()


}

return ( <AppLayout
   user={user}
   onLogout={onLogout}
   onUserUpdate={onUserUpdate}
 > <div className="feature-page farming-assistant-page"> <div className="container farming-assistant-container"> <Link to="/dashboard" className="back-link"> <FiArrowLeft size={16} />
{t('common.backToDashboard')} </Link>


      <motion.div
        className="page-header farming-assistant-header"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="farming-assistant-heading-icon">
          <FiMessageCircle size={25} />
        </div>

        <div>
          <h1 className="page-title">Farming Assistant</h1>
          <p className="page-subtitle">
            Your AI companion for crop, soil, irrigation, and farming
            questions.
          </p>
        </div>
      </motion.div>

      <section className="farming-chat-card">
        <div className="farming-chat-topbar">
          <div className="farming-chat-status">
            <span className="farming-status-dot" />
            <div>
              <strong>AI Farming Advisor</strong>
              <span>Ask your farming questions</span>
            </div>
          </div>

          <div className="farming-chat-actions">
            <label className="farming-language-control">
              <span>Language</span>
              <select
                className="farming-language-select"
                value={language}
                onChange={changeFarmingLanguage}
                aria-label="Farming Assistant response language"
                disabled={loading}
              >
                <option value="hi">??????</option>
                <option value="en">English</option>
                <option value="mr">?????</option>
                <option value="gu">???????</option>
                <option value="bn">?????</option>
              </select>
            </label>

          <button
            type="button"
            className="farming-clear-button"
            onClick={clearChat}
            disabled={loading || messages.length === 0}
            title="Clear conversation"
            aria-label="Clear conversation"
          >
            <FiTrash2 size={17} />
            <span>Clear chat</span>
          </button>
          </div>
        </div>

        <div className="farming-chat-messages">
          {messages.length === 0 ? (
            <div className="farming-chat-welcome">
              <div className="farming-welcome-icon">
                <FiMessageCircle size={30} />
              </div>

              <h2>Smarter decisions start in your field.</h2>

              <p>
                Ask me about crops, soil health, irrigation, pests,
                fertilizers, or farming practices.
              </p>

              <div className="farming-suggestions">
                {suggestions.map((suggestion) => (
                  <button
                    type="button"
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    disabled={loading}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <motion.div
                key={`${index}-${message.role}`}
                className={`farming-message ${
                  message.role === 'user'
                    ? 'farming-message-user'
                    : 'farming-message-assistant'
                }`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="farming-message-avatar">
                  {message.role === 'user' ? (
                    <FiUser size={17} />
                  ) : (
                    <FiMessageCircle size={17} />
                  )}
                </div>

                <div className="farming-message-content">
                  <span className="farming-message-label">
                    {message.role === 'user' ? 'You' : 'Farming Assistant'}
                  </span>

                  <div className="farming-message-bubble">
                    {message.role === 'assistant' ? (
                      <AdvisoryMarkdown content={message.content} />
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {loading && (
            <div className="farming-message farming-message-assistant">
              <div className="farming-message-avatar">
                <FiMessageCircle size={17} />
              </div>

              <div className="farming-message-content">
                <span className="farming-message-label">
                  Farming Assistant
                </span>

                <div className="farming-message-bubble farming-typing">
                  <FiLoader className="farming-spinner" size={17} />
                  <span>Preparing your answer...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="farming-chat-error" role="alert">
              <span>{error}</span>
              <button
                type="button"
                onClick={() => sendMessage(messages.at(-1)?.content || '')}
                disabled={loading}
              >
                Retry
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form
          className="farming-chat-composer"
          onSubmit={(event) => {
            event.preventDefault()
            sendMessage()
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask anything about farming..."
            aria-label="Your farming question"
            maxLength={4000}
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            aria-label="Send message"
          >
            {loading ? (
              <FiLoader className="farming-spinner" size={19} />
            ) : (
              <FiSend size={19} />
            )}
            <span>Send</span>
          </button>
        </form>

        <p className="farming-chat-disclaimer">
          AI-generated advice can be imperfect. Verify important
          crop-protection and fertilizer decisions with a local
          agricultural expert.
        </p>
      </section>
    </div>
  </div>
</AppLayout>


)
}

export default FarmingAssistant


