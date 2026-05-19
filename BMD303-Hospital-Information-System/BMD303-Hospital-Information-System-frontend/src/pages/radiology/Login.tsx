import { useState } from 'react';
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const bgImage =
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1920&q=80';
const logoImage =
  'https://images.unsplash.com/photo-1631549916766-7a2d31a3e9dc?auto=format&fit=crop&w=128&q=80';

export default function RadiologyOsLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = () => {
    navigate('/radiology/panel');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/75 via-blue-50/70 to-indigo-50/75" />
      </div>

      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-300/10 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-[420px]">
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-3 overflow-hidden">
            <img src={logoImage} alt="RadiologyOS Logo" className="w-14 h-14 object-contain" />
          </div>
          <div className="text-gray-800" style={{ fontSize: '26px', fontWeight: 700 }}>
            RadiologyOS
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-2xl rounded-2xl shadow-xl border border-white/60 overflow-hidden">
          <div className="p-10">
            <div className="text-center mb-8">
              <h2 className="text-gray-800" style={{ fontSize: '28px', fontWeight: 700 }}>
                Welcome Back
              </h2>
              <p className="text-gray-500 mt-2" style={{ fontSize: '14px' }}>
                Sign in to continue
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  placeholder="doctor@hospital.com"
                  className="w-full h-12 bg-white/90 border border-gray-200 rounded-lg pl-11 pr-4 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  style={{ fontSize: '14px' }}
                />
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 mb-2" style={{ fontSize: '13px', fontWeight: 600 }}>
                Password
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  className="w-full h-12 bg-white/90 border border-gray-200 rounded-lg pl-11 pr-11 text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                  style={{ fontSize: '14px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-7">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
                    rememberMe
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-white border-gray-300 group-hover:border-blue-400'
                  }`}
                >
                  {rememberMe && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-gray-600" style={{ fontSize: '13px', fontWeight: 500 }}>
                  Remember me
                </span>
              </label>
              <button className="text-blue-600 hover:text-blue-700 transition-colors" style={{ fontSize: '13px', fontWeight: 600 }}>
                Forgot password?
              </button>
            </div>

            <button
              onClick={handleSignIn}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg group"
              style={{ fontSize: '15px', fontWeight: 600 }}
            >
              Sign In
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-gray-400" style={{ fontSize: '12px', fontWeight: 500 }}>
                or
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              className="w-full h-12 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 rounded-lg text-gray-700 transition-all flex items-center justify-center gap-2"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                  fill="currentColor"
                />
              </svg>
              Hospital SSO
            </button>

            <p className="text-center text-gray-400 mt-6" style={{ fontSize: '11px' }}>
              Protected by 256-bit encryption · HIPAA Compliant
            </p>
          </div>
        </div>

        <p className="text-center text-gray-500 mt-6" style={{ fontSize: '12px' }}>
          © 2026 RadiologyOS · v2.4.1
        </p>
      </div>
    </div>
  );
}
