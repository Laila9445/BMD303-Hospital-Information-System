import "./ServicesPage.css";
import { useNavigate } from "react-router-dom";
import {
    Bone, Stethoscope, Activity, Backpack,
    PersonStanding, Hand, Zap, Phone, ArrowRight
} from "lucide-react";

const services = [
    {
        id: "orthopedic",
        icon: <Bone size={20} />,
        title: "Orthopedic Physical Therapy",
        description: "Treatment focused on bones, joints, and muscles to restore mobility and reduce pain.",
        image: "https://images.unsplash.com/photo-1746806942507-a7e93fdd6dd4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
        id: "post-surgical",
        icon: <Stethoscope size={20} />,
        title: "Post-Surgical Rehabilitation",
        description: "Recovery programs after surgeries like ACL repair, fractures, or joint replacement.",
        image: "https://images.unsplash.com/photo-1768508236664-3f294aaf7d41?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
        id: "sports-injury",
        icon: <Activity size={20} />,
        title: "Sports Injury Rehabilitation",
        description: "Treatment for sports injuries including ligament sprains and muscle strains.",
        image: "https://images.unsplash.com/photo-1600642597492-2ccee7ff872a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
        id: "back-neck-pain",
        icon: <Backpack size={20} />,
        title: "Back and Neck Pain Treatment",
        description: "Programs designed to relieve chronic back and neck pain and improve posture.",
        image: "https://images.unsplash.com/photo-1768507423533-b87b62769758?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
        id: "osteoarthritis",
        icon: <PersonStanding size={20} />,
        title: "Osteoarthritis Treatment",
        description: "Therapy to reduce joint stiffness and improve flexibility for arthritis patients.",
        image: "https://images.unsplash.com/photo-1693821193050-c12fffcabe27?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
        id: "manual-therapy",
        icon: <Hand size={20} />,
        title: "Manual Therapy",
        description: "Hands-on techniques used to mobilize joints and relax tight muscles.",
        image: "https://images.unsplash.com/photo-1611073615830-9f76902c10fe?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    },
    {
        id: "electrotherapy",
        icon: <Zap size={20} />,
        title: "Electrotherapy",
        description: "Pain relief and muscle stimulation using devices like TENS and Ultrasound.",
        image: "https://images.unsplash.com/photo-1764314399496-aa49b4e4d127?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600"
    }
];

/* ── Service Card ── */
function ServiceCard({ icon, title, description, image, serviceId }) {
    const navigate = useNavigate();

    return (
        <div className="svc-card">
            <div className="svc-card-img">
                <img src={image} alt={title} />
            </div>
            <div className="svc-card-body">
                <div className="svc-card-header">
                    <span className="svc-card-icon">{icon}</span>
                    <h3>{title}</h3>
                </div>
                <p className="svc-card-desc">{description}</p>
                <button
                    className="svc-book-btn"
                    onClick={() => navigate(`/booking?service=${serviceId}`)}
                >
                    Book Now
                </button>
            </div>
        </div>
    );
}

/* ── Services Page ── */
export default function ServicesPage() {
    const navigate = useNavigate();

    // Debug: log when component renders
    console.log("ServicesPage rendered, navigate function available:", typeof navigate === 'function');

    return (
        <div className="svc-page">

            {/* ── Hero ── */}
            <section className="svc-hero">
                <div className="svc-hero-overlay" />
                <div className="svc-hero-content">
                    <h1>Our Physical Therapy Services</h1>
                    <p>Helping you recover, move better, and live pain-free.</p>
                    <button className="svc-hero-btn">Book Appointment</button>
                </div>
            </section>

            {/* ── Services Grid ── */}
            <section className="svc-section">
                <div className="svc-container">
                    <div className="svc-section-header">
                        <h2>Comprehensive Physical Therapy Services</h2>
                        <p>Our expert therapists offer specialized treatments tailored to your recovery needs</p>
                    </div>
                    <div className="svc-grid">
                        {services.map(s => (
                            <ServiceCard
                                key={s.id}
                                serviceId={s.id}
                                icon={s.icon}
                                title={s.title}
                                description={s.description}
                                image={s.image}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA ── */}
            <section className="svc-cta">
                <div className="svc-cta-content">
                    <h2>Need Help Choosing the Right Treatment?</h2>
                    <p>Our specialists are ready to help you recover.</p>
                    <button className="svc-cta-btn">Book Your Appointment</button>
                </div>
            </section>

            {/* ── Contact Section ── */}
            <section className="mt-16 text-center px-4">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 md:p-12 max-w-7xl mx-auto">
                    <Phone className="w-12 h-12 text-primary mx-auto mb-4" style={{ color: 'var(--primary)' }} />
                    <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-dark)', fontSize: 'clamp(28px, 4vw, 38px)' }}>Have Questions?</h2>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto" style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6' }}>
                        Our team is ready to help you with any questions about our services or booking process.
                    </p>
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            console.log("Contact Support button clicked!");
                            console.log("Navigate function type:", typeof navigate);

                            if (typeof navigate !== 'function') {
                                console.error("ERROR: navigate is not a function!");
                                alert("Error: Navigation not available. Please check console.");
                                return;
                            }

                            alert("Navigating to Contact page...");
                            navigate("/contact");
                        }}
                        className="contact-section-btn"
                    >
                        Contact Support
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="svc-footer">
                <p>© 2026 PhysioFit Egypt. Professional care for your recovery.</p>
            </footer>

        </div>
    );
}
