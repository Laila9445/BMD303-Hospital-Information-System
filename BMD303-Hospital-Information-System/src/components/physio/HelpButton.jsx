import { useState } from "react";
import { Phone, Mail, MapPin, Clock, X, MessageCircle } from "lucide-react";
import "./HelpButton.css";

export function HelpButton() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* ── Popup ── */}
            {open && (
                <div className="help-popup">
                    <div className="help-popup-header">
                        <h3>Contact Support</h3>
                        <button className="help-close-btn" onClick={() => setOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <p className="help-popup-sub">
                        Need help booking an appointment?<br />
                        Our support team is ready to assist you.
                    </p>

                    <div className="help-popup-items">
                        <a href="tel:+201001234567" className="help-popup-item">
                            <div className="help-popup-icon">
                                <Phone size={18} />
                            </div>
                            <div>
                                <span className="help-popup-label">Phone</span>
                                <span className="help-popup-value">+20 100 123 4567</span>
                            </div>
                        </a>

                        <a href="mailto:support@clinic.com" className="help-popup-item">
                            <div className="help-popup-icon">
                                <Mail size={18} />
                            </div>
                            <div>
                                <span className="help-popup-label">Email Support</span>
                                <span className="help-popup-value">support@clinic.com</span>
                            </div>
                        </a>

                        <div className="help-popup-item">
                            <div className="help-popup-icon">
                                <MapPin size={18} />
                            </div>
                            <div>
                                <span className="help-popup-label">Location</span>
                                <span className="help-popup-value">Giza</span>
                            </div>
                        </div>

                        <div className="help-popup-item">
                            <div className="help-popup-icon">
                                <Clock size={18} />
                            </div>
                            <div>
                                <span className="help-popup-label">Working Hours</span>
                                <span className="help-popup-value">Sat – Thu: 10:00 AM – 8:00 PM</span>
                                <span className="help-popup-closed">Friday: Closed</span>
                            </div>
                        </div>
                    </div>

                    <button className="help-popup-close-btn" onClick={() => setOpen(false)}>
                        Close
                    </button>
                </div>
            )}

            {/* ── Floating Button ── */}
            <button
                className={`help-float-btn ${open ? "active" : ""}`}
                onClick={() => setOpen(v => !v)}
            >
                <MessageCircle size={20} />
                <div className="help-float-text">
                    <span className="help-float-title">Need Help?</span>
                    <span className="help-float-sub">Contact Support</span>
                </div>
            </button>
        </>
    );
}
