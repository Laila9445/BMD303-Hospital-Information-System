import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Patients.css';

function getPhysioReferrals() {
    try {
        const raw = localStorage.getItem('referrals');
        if (!raw) return [];
        const all = JSON.parse(raw);
        return Array.isArray(all) ? all.filter((r) => r.type === 'Physiotherapy') : [];
    } catch {
        return [];
    }
}

function referralToPatientCard(referral) {
    const name = (referral.patientName || '').trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const id = String(referral.patientId ?? referral.id);
    return {
        id,
        first_name: parts[0] || 'Patient',
        last_name: parts.slice(1).join(' ') || '',
        date_of_birth: null,
        gender: null,
        phone: null,
        email: null,
    };
}

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = () => {
        try {
            const refs = getPhysioReferrals();
            const seen = new Set();
            const list = [];
            refs.forEach((r) => {
                const p = referralToPatientCard(r);
                if (!seen.has(p.id)) {
                    seen.add(p.id);
                    list.push(p);
                }
            });
            setPatients(list);
        } catch (error) {
            console.error('Failed to load patients:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div><p>Loading patients...</p></div>;
    }

    return (
        <div className="patients-page">
            <div className="page-header">
                <div>
                    <h1>Patient Management</h1>
                    <p>View and manage all patients</p>
                </div>
            </div>

            <div className="patients-grid">
                {patients.map(patient => (
                    <div key={patient.id} className="patient-card">
                        <div className="patient-header">
                            <div className="patient-avatar">
                                {patient.first_name.charAt(0)}{patient.last_name ? patient.last_name.charAt(0) : (patient.first_name.charAt(1) || '?')}
                            </div>
                            <div className="patient-info">
                                <h3>{patient.first_name} {patient.last_name}</h3>
                                <p className="patient-id">ID: #{patient.id}</p>
                            </div>
                        </div>

                        <div className="patient-details">
                            <div className="detail-row">
                                <span className="label">Date of Birth:</span>
                                <span className="value">{patient.date_of_birth ? new Date(patient.date_of_birth).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Gender:</span>
                                <span className="value">{patient.gender || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Phone:</span>
                                <span className="value">{patient.phone || 'N/A'}</span>
                            </div>
                            <div className="detail-row">
                                <span className="label">Email:</span>
                                <span className="value">{patient.email || 'N/A'}</span>
                            </div>
                        </div>

                        <div className="patient-actions">
                            <Link to={`/physio/patients/${patient.id}`} className="btn btn-secondary">View Details</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Patients;
