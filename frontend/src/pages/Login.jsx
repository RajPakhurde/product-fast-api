import { useEffect, useRef, useState } from 'react'
import api from '../api/axios'

function Login({ onLoggedIn, onShowRegister, notice }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const googleButtonRef = useRef(null)

  // Load and initialize Google Identity Services
  useEffect(() => {
    const initializeGoogle = () => {
      if (!window.google || !googleButtonRef.current) {
        return
      }

      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      })

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          theme: 'outline',
          size: 'large',
          width: 300,
          text: 'signin_with',
          shape: 'rectangular',
        }
      )
    }

    // If Google script is already loaded
    if (window.google) {
      initializeGoogle()
      return
    }

    // Load Google Identity Services script
    const script = document.createElement('script')

    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogle

    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  async function handleGoogleLogin(response) {
    setError('')
    setGoogleLoading(true)

    try {
      // response.credential is Google's ID token
      const { data } = await api.post('/auth/google', {
        credential: response.credential,
      })

      // Backend has already set the HTTP-only auth cookie
      onLoggedIn?.(data)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          'Google sign in failed'
      )
    } finally {
      setGoogleLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Backend sets the HTTP-only cookie.
      // There is no token for us to store.
      const { data } = await api.post('/auth/login', {
        email,
        password,
      })

      onLoggedIn?.(data)
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="login" onSubmit={handleSubmit}>
      <h1>Login</h1>

      {notice && (
        <p className="login__notice">
          {notice}
        </p>
      )}

      <label>
        Email
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </label>

      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>

      {error && (
        <p className="login__error">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || googleLoading}
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>

      {/* Google Login */}
      <div className="login__divider">
        <span>OR</span>
      </div>

      <div
        ref={googleButtonRef}
        className="login__google"
      />

      {googleLoading && (
        <p>Signing in with Google…</p>
      )}

      <p className="login__switch">
        Don&apos;t have an account?{' '}
        <button
          type="button"
          className="link"
          onClick={onShowRegister}
        >
          Create new account
        </button>
      </p>
    </form>
  )
}

export default Login