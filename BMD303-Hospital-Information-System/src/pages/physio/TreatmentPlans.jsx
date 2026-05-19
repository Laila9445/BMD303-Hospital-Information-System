import React, { useState, useEffect } from 'react';
import './TreatmentPlans.css';

const PLANS_KEY = 'treatmentPlans';

const DEFAULT_STAFF = [
    { id: '1', first_name: 'Clinic', last_name: 'Physiotherapist', role: 'Physiotherapist' },
];

function readPlans() {
    try {
        const raw = localStorage.getItem(PLANS_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function writePlans(list) {
    localStorage.setItem(PLANS_KEY, JSON.stringify(list));
}

function getPhysioReferralPatients() {
    try {
        const raw = localStorage.getItem('referrals');
        if (!raw) return [];
        const all = JSON.parse(raw);
        const physio = Array.isArray(all) ? all.filter((r) => r.type === 'Physiotherapy') : [];
        const seen = new Set();
        const out = [];
        physio.forEach((r) => {
            const id = String(r.patientId ?? r.id);
            if (seen.has(id)) return;
            seen.add(id);
            const name = (r.patientName || '').trim();
            const parts = name.split(/\s+/).filter(Boolean);
            out.push({
                id,
                first_name: parts[0] || 'Patient',
                last_name: parts.slice(1).join(' ') || '',
            });
        });
        return out;
    } catch {
        return [];
    }
}

const TreatmentPlans = () => {
    const [plans, setPlans] = useState([]);
    const [patients, setPatients] = useState([]);
    const [staff] = useState(DEFAULT_STAFF);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        patient_id: '',
        staff_id: '',
        diagnosis: '',
        goals: '',
        interventions: '',
        frequency: '',
        start_date: '',
        end_date: '',
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setPlans(readPlans());
        setPatients(getPhysioReferralPatients());
        setLoading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            const list = readPlans();
            const newPlan = {
                id: Date.now(),
                patient_id: formData.patient_id,
                staff_id: formData.staff_id,
                diagnosis: formData.diagnosis,
                goals: formData.goals,
                interventions: formData.interventions,
                frequency: formData.frequency,
                start_date: formData.start_date,
                end_date: formData.end_date || null,
                notes: formData.notes,
                status: 'active',
                created_at: new Date().toISOString(),
            };
            list.push(newPlan);
            writePlans(list);
            setShowModal(false);
            loadData();
            setFormData({
                patient_id: '',
                staff_id: '',
                diagnosis: '',
                goals: '',
                interventions: '',
                frequency: '',
                start_date: '',
                end_date: '',
                notes: ''
            });
        } catch (error) {
            console.error('Failed to create treatment plan:', error);
            alert('Failed to create treatment plan. Please try again.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div><p>Loading treatment plans...</p></div>;
    }

    return (
        <div className="treatment-plans-page">
            <div className="page-header">
                <div>
                    <h1>Treatment Plans</h1>
                    <p>Create and manage patient treatment plans</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Create New Plan
                </button>
            </div>

            <div className="plans-grid">
                {plans.map(plan => (
                    <div key={plan.id} className="plan-card">
                        <div className="plan-header">
                            <div className="plan-info">
                                <h3>{plan.diagnosis}</h3>
                                <p className="plan-id">Patient #{plan.patient_id} | Staff #{plan.staff_id}</p>
                            </div>
                            <span className={`status-badge status-${plan.status}`}>
                                {plan.status}
                            </span>
                        </div>

                        <div className="plan-content">
                            <div className="plan-section">
                                <h4>Goals</h4>
                                <p>{plan.goals}</p>
                            </div>

                            <div className="plan-section">
                                <h4>Interventions</h4>
                                <p>{plan.interventions}</p>
                            </div>

                            <div className="plan-details-grid">
                                <div className="detail-item">
                                    <span className="label">Frequency:</span>
                                    <span className="value">{plan.frequency}</span>
                                </div>
                                <div className="detail-item">
                                    <span className="label">Start Date:</span>
                                    <span className="value">{new Date(plan.start_date).toLocaleDateString()}</span>
                                </div>
                                {plan.end_date && (
                                    <div className="detail-item">
                                        <span className="label">End Date:</span>
                                        <span className="value">{new Date(plan.end_date).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>

                            {plan.notes && (
                                <div className="plan-section">
                                    <h4>Notes</h4>
                                    <p>{plan.notes}</p>
                                </div>
                            )}
                        </div>

                        <div className="plan-footer">
                            <small className="created-date">
                                Created: {plan.created_at ? new Date(plan.created_at).toLocaleDateString() : '—'}
                            </small>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Create Treatment Plan</h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Patient *</label>
                                    <select
                                        name="patient_id"
                                        value={formData.patient_id}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    >
                                        <option value="">Select Patient</option>
                                        {patients.map(patient => (
                                            <option key={patient.id} value={patient.id}>
                                                {patient.first_name} {patient.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Staff Member *</label>
                                    <select
                                        name="staff_id"
                                        value={formData.staff_id}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    >
                                        <option value="">Select Staff</option>
                                        {staff.map(member => (
                                            <option key={member.id} value={member.id}>
                                                {member.first_name} {member.last_name} ({member.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Diagnosis *</label>
                                <input
                                    type="text"
                                    name="diagnosis"
                                    value={formData.diagnosis}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                    placeholder="e.g., Lower back pain, Post-surgical knee rehabilitation"
                                />
                            </div>

                            <div className="form-group">
                                <label>Goals *</label>
                                <textarea
                                    name="goals"
                                    value={formData.goals}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="form-control"
                                    placeholder="Treatment goals and objectives..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Interventions *</label>
                                <textarea
                                    name="interventions"
                                    value={formData.interventions}
                                    onChange={handleChange}
                                    required
                                    rows="3"
                                    className="form-control"
                                    placeholder="Planned interventions and therapies..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Frequency *</label>
                                    <input
                                        type="text"
                                        name="frequency"
                                        value={formData.frequency}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                        placeholder="e.g., 2x per week for 4 weeks"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Start Date *</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>End Date</label>
                                <input
                                    type="date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="form-control"
                                    placeholder="Additional notes or considerations..."
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Create Plan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TreatmentPlans;
