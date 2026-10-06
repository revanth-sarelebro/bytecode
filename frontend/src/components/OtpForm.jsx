import { useEffect, useState } from 'react'
import { errorMessage } from '../services/api'
import { otpSchema, validate } from '../lib/schemas'

const RESEND_WAIT = 30

function mmss(total) {
  const m = Math.floor(total / 60)
  const s = String(total % 60).padStart(2, '0')
  return `${m}:${s}`
}

function otpError(err) {
  if (err.userMessage) return err.userMessage
  const status = err.response?.status
  if (status === 400 || status === 401 || status === 422) return 'That code is incorrect or has expired.'
  if (status === 429) return 'Too many wrong codes. Go back and sign in again.'
  return errorMessage(err)
}

export default function OtpForm({ email, challenge, onVerify, onResend, onBack, buttonClass = '' }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(challenge.expiresInSeconds ?? 300)
  const [resendIn, setResendIn] = useState(RESEND_WAIT)

  // restart the clocks whenever a fresh code is issued
  useEffect(() => {
    setSecondsLeft(challenge.expiresInSeconds ?? 300)
    setResendIn(RESEND_WAIT)
  }, [challenge.challengeId, challenge.devCode, challenge.expiresInSeconds])

  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((n) => Math.max(0, n - 1))
      setResendIn((n) => Math.max(0, n - 1))
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const expired = secondsLeft === 0

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const { data, errors } = validate(otpSchema, { code })
    if (!data) return setError(errors.code)
    setBusy(true)
    try {
      await onVerify(data.code)
    } catch (err) {
      setError(otpError(err))
      setCode('')
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    setError('')
    try {
      await onResend()
      setCode('')
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <p className="text-muted">
        We sent a 6-digit code to <span className="font-semibold text-ink">{email}</span>. Enter it to finish signing in.
      </p>

      {challenge.devCode && (
        <p className="rounded bg-clinic-soft px-3 py-2 text-sm text-clinic-dark">
          Mock mode: your code is <span className="font-bold tracking-widest">{challenge.devCode}</span>
        </p>
      )}

      <div>
        <label htmlFor="otp" className="label">Verification code</label>
        <input
          id="otp" className="input text-center font-display text-2xl tracking-[0.5em]"
          inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus
          value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          aria-invalid={Boolean(error)} aria-describedby={error ? 'otp-err' : undefined}
        />
        {error && <p id="otp-err" role="alert" className="field-error">{error}</p>}
      </div>

      <p className="text-sm text-muted" aria-live="off">
        {expired ? 'This code has expired. Send a new one.' : `Code expires in ${mmss(secondsLeft)}`}
      </p>

      <button className={`btn w-full ${buttonClass}`} disabled={busy || expired}>{busy ? 'Checking…' : 'Verify and sign in'}</button>

      <div className="flex justify-between text-sm">
        <button type="button" onClick={onBack} className="underline">Use a different account</button>
        <button type="button" onClick={resend} disabled={resendIn > 0} className="font-semibold underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50">
          {resendIn > 0 ? `Send a new code in ${resendIn}s` : 'Send a new code'}
        </button>
      </div>
    </form>
  )
}
