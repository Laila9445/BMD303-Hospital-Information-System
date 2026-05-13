import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import "./Contactpage.css";

export default function ContactPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", subject: "", message: ""
    });
    const [submitted, setSubmitted] = useState(false);

    const handleBack = () => {
        // Always go back to services page
        navigate("/physio/services");
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Contact form submitted:", formData);
        setSubmitted(true);
        setTimeout(() => {
            setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
            setSubmitted(false);
        }, 3000);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const infoCards = [
        {
            icon: <Phone size={24} />,
            title: "Phone",
            sub: "Call us for immediate assistance",
            content: <a href="tel:+201001234567" className="ct-link">+20 100 123 4567</a>
        },
        {
            icon: <Mail size={24} />,
            title: "Email",
            sub: "Send us an email anytime",
            content: <a href="mailto:support@clinic.com" className="ct-link">support@clinic.com</a>
        },
        {
            icon: <MapPin size={24} />,
            title: "Location",
            sub: "Visit our clinic",
            content: <span>Giza</span>
        },
    ];

    const faqs = [
        { q: "How do I reschedule my appointment?", a: "You can reschedule by calling us at least 24 hours before your appointment." },
        { q: "Do you accept insurance?", a: "Yes, we accept most major insurance plans. Contact us to verify your specific coverage." },
        { q: "What should I bring to my first appointment?", a: "Please bring your ID, insurance card, and any relevant medical records or imaging results." },
        { q: "How long is each session?", a: "Initial evaluations typically last 60 minutes, while follow-up sessions are usually 45 minutes." },
    ];

    return (
        <div className="ct-page">
            {/* Header with Back Button */}
            <header className="ct-header">
                <button className="ct-back-btn" onClick={handleBack}>
                    ← Select Your Service
                </button>
                <h1>Contact Support</h1>
                <p className="ct-subtitle">Have questions or need assistance? We're here to help!</p>
            </header>

            {/* Main Content - Two Columns */}
            <div className="ct-container">
                <div className="ct-content-grid">

                    {/* Left Column - Get in Touch */}
                    <div className="ct-info-column">
                        <h2 className="ct-section-title">Get in Touch</h2>
                        <div className="ct-info-list">
                            {infoCards.map((card, index) => (
                                <div key={index} className="ct-info-card">
                                    <div className="ct-info-icon-circle">
                                        {card.icon}
                                    </div>
                                    <div className="ct-info-body">
                                        <h3>{card.title}</h3>
                                        <p className="ct-info-sub">{card.sub}</p>
                                        <div className="ct-info-content">{card.content}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Contact Form */}
                    <div className="ct-form-column">
                        <div className="ct-form-card">
                            <h2 className="ct-form-title">Send us a Message</h2>

                            {submitted ? (
                                <div className="ct-success">
                                    <div className="ct-success-icon">
                                        <Send size={40} />
                                    </div>
                                    <h3>Message Sent!</h3>
                                    <p>Thank you for contacting us. We'll get back to you as soon as possible.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="ct-form">
                                    <div className="ct-field">
                                        <label>Your Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Enter your name"
                                        />
                                    </div>

                                    <div className="ct-field">
                                        <label>Email Address *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="your.email@example.com"
                                        />
                                    </div>

                                    <div className="ct-field">
                                        <label>Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+20 100 000 0000"
                                        />
                                    </div>

                                    <div className="ct-field">
                                        <label>Subject *</label>
                                        <select
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select a subject</option>
                                            <option value="booking">Booking Inquiry</option>
                                            <option value="reschedule">Reschedule Appointment</option>
                                            <option value="cancel">Cancel Appointment</option>
                                            <option value="insurance">Insurance Questions</option>
                                            <option value="services">Services Information</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="ct-field ct-field-full">
                                        <label>Message *</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={5}
                                            placeholder="How can we help you?"
                                        />
                                    </div>

                                    <button type="submit" className="ct-submit-btn">
                                        <Send size={18} /> Send Message
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Action Button */}
            <button className="ct-floating-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                Need Help? Contact Support
            </button>
        </div>
    );
}
