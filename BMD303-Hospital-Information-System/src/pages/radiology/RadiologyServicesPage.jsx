import "../physio/ServicesPage.css";
import { useNavigate } from "react-router-dom";
import {
    Scan,
    Bone,
    Activity,
    HeartPulse,
    Eye,
    Baby,
    Phone,
    ArrowRight,
} from "lucide-react";

const services = [
    {
        id: "mri",
        icon: <Scan size={20} />,
        title: "MRI Imaging",
        description: "High-resolution magnetic resonance imaging for soft tissue, joints, and neurological evaluation.",
        image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600",
    },
    {
        id: "ct",
        icon: <Bone size={20} />,
        title: "CT Scan",
        description: "Computed tomography for detailed cross-sectional views of bones, chest, and abdomen.",
        image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600",
    },
    {
        id: "ultrasound",
        icon: <Activity size={20} />,
        title: "Ultrasound",
        description: "Non-invasive imaging for musculoskeletal, abdominal, and vascular studies.",
        image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600",
    },
    {
        id: "xray",
        icon: <HeartPulse size={20} />,
        title: "Digital X-Ray",
        description: "Fast plain radiography for fractures, chest, and spine assessments.",
        image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600",
    },
    {
        id: "mammography",
        icon: <Eye size={20} />,
        title: "Mammography",
        description: "Breast imaging for screening and diagnostic evaluation.",
        image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600",
    },
    {
        id: "dexa",
        icon: <Baby size={20} />,
        title: "DEXA Bone Density",
        description: "Bone mineral density measurement for osteoporosis screening.",
        image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600",
    },
];

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
                    type="button"
                    onClick={() => navigate(`/radiology/booking?service=${serviceId}`)}
                >
                    Book Now
                </button>
            </div>
        </div>
    );
}

export default function RadiologyServicesPage() {
    const navigate = useNavigate();

    return (
        <div className="svc-page">
            <section className="svc-hero">
                <div className="svc-hero-overlay" />
                <div className="svc-hero-content">
                    <h1>Radiology & Imaging Services</h1>
                    <p>Advanced diagnostic imaging with experienced radiologists.</p>
                    <button type="button" className="svc-hero-btn" onClick={() => navigate("/radiology/booking")}>
                        Book Appointment
                    </button>
                </div>
            </section>

            <section className="svc-section">
                <div className="svc-container">
                    <div className="svc-section-header">
                        <h2>Our Imaging Modalities</h2>
                        <p>Schedule your study through our orthopaedic clinic radiology department</p>
                    </div>
                    <div className="svc-grid">
                        {services.map((s) => (
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

            <section className="svc-cta">
                <div className="svc-cta-content">
                    <h2>Questions about preparation or contrast?</h2>
                    <p>Our radiology desk can guide you before your appointment.</p>
                    <button type="button" className="svc-cta-btn" onClick={() => navigate("/radiology/booking")}>
                        Book Your Appointment
                    </button>
                </div>
            </section>

            <section className="mt-16 text-center px-4">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8 md:p-12 max-w-7xl mx-auto">
                    <Phone className="w-12 h-12 text-primary mx-auto mb-4" style={{ color: "var(--primary)" }} />
                    <h2 className="text-3xl font-bold mb-3" style={{ color: "var(--text-dark)", fontSize: "clamp(28px, 4vw, 38px)" }}>
                        Have Questions?
                    </h2>
                    <p className="text-muted-foreground mb-6 max-w-2xl mx-auto" style={{ color: "#64748b", fontSize: "16px", lineHeight: "1.6" }}>
                        Contact our radiology team for preparation instructions or appointment changes.
                    </p>
                    <button type="button" className="contact-section-btn" onClick={() => navigate("/contact")}>
                        Contact Support
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </section>

            <footer className="svc-footer">
                <p>© {new Date().getFullYear()} Orthopedic Clinic — Radiology</p>
            </footer>
        </div>
    );
}
