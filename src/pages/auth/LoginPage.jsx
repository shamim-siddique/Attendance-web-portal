import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GoogleLogin } from '@react-oauth/google'
import { Building2, ShieldCheck, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { googleLogin } from '../../api/services/auth.service'
import { Spinner } from '../../components/ui/Spinner'

export function LoginPage() {
  const navigate = useNavigate()
  const { login, isAdminOrManager, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (isAdminOrManager) navigate('/dashboard')
  }, [authLoading, isAdminOrManager, navigate])

  const handleSuccess = async (credentialResponse) => {
    const google_token = credentialResponse.credential
    setLoading(true)
    setError('')
    try {
      const { data } = await googleLogin(google_token)
      login(data.access_token, data.refresh_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleError = () => {
    setError('Google sign-in failed. Please try again.')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div
        className="absolute top-1/4 -left-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/4 -right-20 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(30,41,59,.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30,41,59,.15) 1px, transparent 1px)`,
          backgroundSize: '24px 24px'
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AttendanceOS</h2>
            <p className="text-slate-400 text-sm">Management Portal</p>
          </div>
        </div>

        <div className="border-t border-slate-800 my-6" />

        <div>
          <p className="text-slate-400 text-sm mb-5">
            Sign in with your company Google account
          </p>

          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-slate-900/80 rounded-xl flex items-center justify-center z-10">
                <Spinner size="lg" />
              </div>
            )}
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap={false}
              theme="filled_black"
              size="large"
              text="continue_with"
              shape="rectangular"
              width="320"
            />
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-2 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span>Access restricted to Admins and Managers only</span>
        </div>
      </div>
    </div>
  )
}
