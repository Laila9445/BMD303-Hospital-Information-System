import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, Check } from "lucide-react";
import toast from "react-hot-toast";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfToday } from "date-fns";
import {
    getTakenTimesForDate,
    isSlotTaken,
    tryReserveDepartmentSlot,
} from "../../utils/bookingSlotUtils";
import "./BookingPage.css";

const DEPARTMENT = "physio";

const services = [
    { id: "orthopedic", name: "Orthopedic Physical Therapy" },
    { id: "post-surgical", name: "Post-Surgical Rehabilitation" },
    { id: "sports-injury", name: "Sports Injury Rehabilitation" },
    { id: "back-neck-pain", name: "Back and Neck Pain Treatment" },
    { id: "osteoarthritis", name: "Osteoarthritis Treatment" },
    { id: "manual-therapy", name: "Manual Therapy" },
    { id: "electrotherapy", name: "Electrotherapy" },
];

const timeSlots = ["10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "04:00 PM", "06:00 PM"];
const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function BookingPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [step, setStep] = useState(1);

    const [selectedService, setSelectedService] = useState("");
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState("");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [notes, setNotes] = useState("");
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const today = startOfToday();

    useEffect(() => {
        const s = searchParams.get("service");
        if (s) {
            setSelectedService(s);
            // Service is pre-selected, but stay on step 1 so user can see it
            setStep(1);
        }
    }, [searchParams]);

    const monthDays = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth),
    });

    // pad to start on correct weekday
    const firstDayOfWeek = startOfMonth(currentMonth).getDay();

    const isDisabled = (d) => isBefore(d, today) && !isToday(d);

    const canNext =
        (step === 1 && selectedService) ||
        (step === 2 && selectedDate && selectedTime) ||
        (step === 3 && fullName && phone && email);

    const handleNext = () => { if (canNext && step < 4) setStep(s => s + 1); };
    const handleBack = () => {
        if (step > 1) {
            setStep(s => s - 1);
        } else {
            // Always go back to services page from step 1
            navigate("/physio/services");
        }
    };

    const selectedDateIso = selectedDate ? format(selectedDate, "yyyy-MM-dd") : "";
    const takenTimes = useMemo(
        () => (selectedDateIso ? getTakenTimesForDate(DEPARTMENT, selectedDateIso) : []),
        [selectedDateIso]
    );

    useEffect(() => {
        if (selectedTime && takenTimes.includes(selectedTime)) {
            setSelectedTime("");
        }
    }, [selectedTime, takenTimes]);

    const handleConfirm = () => {
        if (!selectedDate || !selectedTime) return;

        if (isSlotTaken(DEPARTMENT, selectedDateIso, selectedTime)) {
            toast.error("This time slot is already booked. Please choose another time.");
            return;
        }

        const data = {
            id: `physio-${Date.now()}`,
            service: services.find(s => s.id === selectedService)?.name,
            date: format(selectedDate, "dd MMMM yyyy"),
            dateIso: selectedDateIso,
            time: selectedTime,
            name: fullName,
            patient: fullName,
            phone,
            email,
            notes,
        };
        sessionStorage.setItem("bookingData", JSON.stringify(data));

        if (!tryReserveDepartmentSlot(DEPARTMENT, data)) {
            toast.error("This time slot is already booked. Please choose another time.");
            return;
        }

        navigate("/physio/success");
    };

    const steps = [
        { n: 1, label: "Select Service" },
        { n: 2, label: "Date & Time" },
        { n: 3, label: "Your Details" },
        { n: 4, label: "Confirm" },
    ];

    return (
        <div className="bk-page">
            <div className="bk-container">

                {/* ── Header ── */}
                <div className="bk-header">
                    <h1>Book Your Appointment</h1>
                    <p>Schedule your physical therapy session with our specialists.</p>
                    <button className="bk-back-link" onClick={() => navigate("/physio/services")}>
                        <ArrowLeft size={16} /> Back to Services
                    </button>
                </div>

                {/* ── Step Indicator ── */}
                <div className="bk-steps">
                    {steps.map((s, i) => (
                        <div key={s.n} className="bk-step-wrap">
                            <div className={`bk-step-circle ${step >= s.n ? "active" : ""}`}>
                                {step > s.n ? <Check size={18} /> : s.n}
                            </div>
                            <span className="bk-step-label">{s.label}</span>
                            {i < steps.length - 1 && (
                                <div className={`bk-step-line ${step > s.n ? "active" : ""}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* ── Form Card ── */}
                <div className="bk-card">

                    {/* Step 1 — Service */}
                    {step === 1 && (
                        <div>
                            <div className="bk-step-title">
                                <Calendar size={22} className="bk-icon" />
                                <h2>Select Your Service</h2>
                            </div>
                            <div className="bk-service-list">
                                {services.map(s => (
                                    <label key={s.id} className={`bk-service-item ${selectedService === s.id ? "selected" : ""}`}>
                                        <input type="radio" name="service" value={s.id}
                                            checked={selectedService === s.id}
                                            onChange={e => setSelectedService(e.target.value)}
                                        />
                                        {s.name}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2 — Date & Time */}
                    {step === 2 && (
                        <div>
                            <div className="bk-step-title">
                                <Clock size={22} className="bk-icon" />
                                <h2>Select Date & Time</h2>
                            </div>

                            {/* Calendar */}
                            <h3 className="bk-sub-title">📅 Select Appointment Date</h3>
                            <div className="bk-calendar">
                                <div className="bk-cal-nav">
                                    <button onClick={() => setCurrentMonth(m => addMonths(m, -1))}>←</button>
                                    <span>{format(currentMonth, "MMMM yyyy")}</span>
                                    <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}>→</button>
                                </div>
                                <div className="bk-cal-grid">
                                    {WEEK_DAYS.map(d => <div key={d} className="bk-cal-day-name">{d}</div>)}
                                    {Array(firstDayOfWeek).fill(null).map((_, i) => <div key={`e${i}`} />)}
                                    {monthDays.map((day, i) => {
                                        const disabled = isDisabled(day);
                                        const selected = selectedDate && isSameDay(day, selectedDate);
                                        return (
                                            <button key={i}
                                                className={`bk-cal-day ${disabled ? "disabled" : ""} ${selected ? "selected" : ""} ${isToday(day) ? "today" : ""}`}
                                                onClick={() => !disabled && setSelectedDate(day)}
                                                disabled={disabled}
                                            >
                                                {format(day, "d")}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Time slots */}
                            <h3 className="bk-sub-title" style={{ marginTop: 24 }}>🕐 Available Time</h3>
                            <div className="bk-time-grid">
                                {timeSlots.map((t) => {
                                    const booked = takenTimes.includes(t);
                                    return (
                                        <button
                                            key={t}
                                            type="button"
                                            disabled={booked}
                                            title={booked ? "Already booked" : ""}
                                            className={`bk-time-slot ${selectedTime === t ? "selected" : ""} ${booked ? "disabled" : ""}`}
                                            onClick={() => !booked && setSelectedTime(t)}
                                        >
                                            {t}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Step 3 — Details */}
                    {step === 3 && (
                        <div>
                            <div className="bk-step-title">
                                <User size={22} className="bk-icon" />
                                <h2>Your Details</h2>
                            </div>
                            <div className="bk-form">
                                <div className="bk-field">
                                    <label>Full Name *</label>
                                    <input type="text" placeholder="Enter your full name"
                                        value={fullName} onChange={e => setFullName(e.target.value)} />
                                </div>
                                <div className="bk-field">
                                    <label>Phone Number *</label>
                                    <input type="tel" placeholder="Enter your phone number"
                                        value={phone} onChange={e => setPhone(e.target.value)} />
                                </div>
                                <div className="bk-field">
                                    <label>Email Address *</label>
                                    <input type="email" placeholder="Enter your email"
                                        value={email} onChange={e => setEmail(e.target.value)} />
                                </div>
                                <div className="bk-field">
                                    <label>Notes (optional)</label>
                                    <textarea rows={3} placeholder="Any additional information"
                                        value={notes} onChange={e => setNotes(e.target.value)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 4 — Confirm */}
                    {step === 4 && (
                        <div>
                            <div className="bk-step-title">
                                <Check size={22} className="bk-icon" />
                                <h2>Appointment Summary</h2>
                            </div>
                            <div className="bk-summary">
                                {[
                                    { label: "Service", value: services.find(s => s.id === selectedService)?.name },
                                    { label: "Date", value: selectedDate ? format(selectedDate, "dd MMMM yyyy") : "" },
                                    { label: "Time", value: selectedTime },
                                    { label: "Name", value: fullName },
                                    { label: "Phone", value: phone },
                                    { label: "Email", value: email },
                                    ...(notes ? [{ label: "Notes", value: notes }] : []),
                                ].map(row => (
                                    <div key={row.label} className="bk-summary-row">
                                        <span className="bk-summary-label">{row.label}:</span>
                                        <span className="bk-summary-value">{row.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Nav Buttons ── */}
                    <div className="bk-nav-btns">
                        <button className="bk-btn-back" onClick={handleBack}>Back</button>
                        {step < 4
                            ? <button className={`bk-btn-next ${!canNext ? "disabled" : ""}`}
                                onClick={handleNext} disabled={!canNext}>Next</button>
                            : <button className="bk-btn-next" onClick={handleConfirm}>Confirm Booking</button>
                        }
                    </div>
                </div>
            </div>

            {/* ── Floating Help ── */}
            <button className="bk-help-btn" onClick={() => alert("Need help? Call us: +201005577889")}>
                Need Help?
            </button>
        </div>
    );
}
