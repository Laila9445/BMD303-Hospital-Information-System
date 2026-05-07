import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Calendar, Clock, Home, Plus, Download } from "lucide-react";
import "./SuccessPage.css";

export default function SuccessPage() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);

    useEffect(() => {
        const d = sessionStorage.getItem("bookingData");
        if (d) setData(JSON.parse(d));
        else navigate("/");
    }, [navigate]);

    if (!data) return null;

    const handleCalendar = () => {
        alert(
            `Your appointment:\n\nService: ${data.service}\nDate: ${data.date}\nTime: ${data.time}`
        );
    };

    return (
        <div className="sc-page">
            <div className="sc-card">

                {/* ── Icon ── */}
                <div className="sc-icon-wrap">
                    <CheckCircle size={52} className="sc-check" />
                </div>

                <h1>Booking Confirmed!</h1>
                <p className="sc-sub">Your appointment has been scheduled successfully.</p>

                {/* ── Summary ── */}
                <div className="sc-summary">
                    <div className="sc-row">
                        <Calendar size={18} className="sc-row-icon" />
                        <div>
                            <span className="sc-row-label">Service</span>
                            <span className="sc-row-value">{data.service}</span>
                        </div>
                    </div>
                    <div className="sc-row">
                        <Calendar size={18} className="sc-row-icon" />
                        <div>
                            <span className="sc-row-label">Date</span>
                            <span className="sc-row-value">{data.date}</span>
                        </div>
                    </div>
                    <div className="sc-row">
                        <Clock size={18} className="sc-row-icon" />
                        <div>
                            <span className="sc-row-label">Time</span>
                            <span className="sc-row-value">{data.time}</span>
                        </div>
                    </div>
                </div>

                {/* ── Actions ── */}
                <div className="sc-actions">
                    <button className="sc-btn-primary" onClick={handleCalendar}>
                        <Download size={18} /> Add to Calendar
                    </button>
                    <div className="sc-btn-row">
                        <button className="sc-btn-outline" onClick={() => navigate("/")}>
                            <Home size={18} /> Back to Home
                        </button>
                        <button className="sc-btn-secondary" onClick={() => {
                            sessionStorage.removeItem("bookingData");
                            navigate("/booking");
                        }}>
                            <Plus size={18} /> Book Another
                        </button>
                    </div>
                </div>

                {/* ── Email note ── */}
                <p className="sc-email-note">
                    A confirmation email has been sent to <strong>{data.email}</strong>
                </p>

            </div>

            {/* ── Floating Help ── */}
            <button className="bk-help-btn" onClick={() => alert("Need help? Call us: +201005577889")}>
                Need Help?
            </button>
        </div>
    );
}
