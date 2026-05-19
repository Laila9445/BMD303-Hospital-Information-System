import { useState } from "react";
import { useNavigate } from "react-router-dom";
import physioImg from "./assets/images/banner-one-img-1.png";
import imgShape1 from "./assets/images/banner-one-img-shape-1.png";
import shape2 from "./assets/images/banner-one-shape-2.png";
import shape4 from "./assets/images/banner-one-shape-4.png";
import "./Login.css";

/* ── tiny SVG icons ── */
const IconMail = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="2" y="4" width="20" height="16" rx="2" /><path d="M2 7l10 7 10-7" />
    </svg>
);
const IconLock = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);
const IconEyeOn = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
);
const IconEyeOff = () => (
    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

/* ── Hotspot / Pain Point Marker ── */
const PainMarker = ({ className }) => (
    <div className={`pain-marker ${className}`}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        <span className="ripple" />
    </div>
);

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [focused, setFocused] = useState(null);

    const validate = () => {
        const e = {};
        if (!email.trim()) e.email = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address.";
        if (!password) e.password = "Password is required.";
        else if (password.length < 6) e.password = "At least 6 characters required.";
        return e;
    };

    const handleSubmit = async () => {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }
        setErrors({});
        setLoading(true);

        // Simulate login for now - will add real API later
        await new Promise(r => setTimeout(r, 1500));

        // Success - redirect to services page
        setLoading(false);
        navigate('/physio/services');
    };

    const onKey = (e) => { if (e.key === "Enter") handleSubmit(); };

    return (
        <div className="login-page">
            <div className="login-card">

                {/* ── LEFT: image panel ── */}
                <div className="login-img-panel">
                    {/* Background shapes */}
                    <img src={shape2} alt="" className="login-shape-2" />
                    <img src={shape4} alt="" className="login-shape-4" />

                    {/* Main physiotherapist image */}
                    <img src={physioImg} alt="Physiotherapist" className="login-hero-img" />

                    {/* Shape on arm */}
                    <img src={imgShape1} alt="" className="login-img-shape-1" />

                    {/* Pain point markers */}
                    <PainMarker className="pain-marker-1" />
                    <PainMarker className="pain-marker-2" />
                    <PainMarker className="pain-marker-3" />

                    <div className="login-img-text">
                        <div className="login-tag">
                            <span className="login-tag-dot" />
                            Staff Portal
                        </div>
                        <h2 className="login-img-title">
                            Restore<br />Movement.<br />Restore Life.
                        </h2>
                        <p className="login-img-sub">Powered by PhysioFit Egypt</p>
                    </div>
                </div>

                {/* ── RIGHT: form panel ── */}
                <div className="login-form-panel">

                    {/* header */}
                    <div className="login-header">
                        <div className="login-icon-wrap">
                            <svg width="26" height="26" fill="none" stroke="#00a850" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                                <path d="M8 14l-2 4M16 14l2 4" />
                            </svg>
                        </div>
                        <h1 className="login-title">Physiotherapy Portal</h1>
                        <p className="login-subtitle">
                            Welcome back — <span>sign in to continue</span>
                        </p>
                    </div>

                    {/* general error */}
                    {errors.general && (
                        <div className="login-error-banner">
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {errors.general}
                        </div>
                    )}

                    {/* email */}
                    <div className="login-group">
                        <label className="login-label">Email Address</label>
                        <div className="login-input-wrap">
                            <span className={`login-input-icon ${focused === "email" ? "focused" : ""}`}>
                                <IconMail />
                            </span>
                            <input
                                type="email"
                                placeholder="you@physiofit.com"
                                value={email}
                                className={`login-input ${focused === "email" ? "focused" : ""} ${errors.email ? "error" : ""}`}
                                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                                onFocus={() => setFocused("email")}
                                onBlur={() => setFocused(null)}
                                onKeyDown={onKey}
                            />
                        </div>
                        {errors.email && <p className="login-error">⚠ {errors.email}</p>}
                    </div>

                    {/* password */}
                    <div className="login-group">
                        <label className="login-label">Password</label>
                        <div className="login-input-wrap">
                            <span className={`login-input-icon ${focused === "password" ? "focused" : ""}`}>
                                <IconLock />
                            </span>
                            <input
                                type={showPw ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                className={`login-input ${focused === "password" ? "focused" : ""} ${errors.password ? "error" : ""}`}
                                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: "" })); }}
                                onFocus={() => setFocused("password")}
                                onBlur={() => setFocused(null)}
                                onKeyDown={onKey}
                            />
                            <button className="login-eye-btn" type="button" onClick={() => setShowPw(v => !v)}>
                                {showPw ? <IconEyeOff /> : <IconEyeOn />}
                            </button>
                        </div>
                        {errors.password && <p className="login-error">⚠ {errors.password}</p>}
                    </div>

                    {/* forgot */}
                    <div className="login-forgot">
                        <button type="button" className="login-forgot-btn">Forgot password?</button>
                    </div>

                    {/* submit */}
                    <button
                        type="button"
                        className={`login-btn ${loading ? "loading" : ""}`}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading
                            ? <span className="login-spinner" />
                            : "Sign In →"
                        }
                    </button>

                    {/* note */}
                    <div className="login-note">
                        🔒 Access restricted to <strong>PhysioFit staff only</strong>
                    </div>

                </div>
            </div>
        </div>
    );
}
