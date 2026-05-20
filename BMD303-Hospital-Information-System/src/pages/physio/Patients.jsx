import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import patientService from '../../api/patientService';
import { getApiErrorMessage } from '../../api/apiUtils';
import './Patients.css';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            setLoading(true);
            const data = await patientService.getAllPatients('physio');
            const list = (Array.isArray(data) ? data : []).map((p) => ({
                id: String(p.patientId ?? p.userId),
                first_name: p.firstName ?? '',
                last_name: p.lastName ?? '',
                date_of_birth: p.dateOfBirth ?? null,
                gender: p.gender ?? null,
                phone: p.phoneNumber ?? '',
                email: p.email ?? '',
            }));
            setPatients(list);
        } catch (error) {
            console.error('Failed to load patients:', error);
            toast.error(getApiErrorMessage(error, 'Failed to load patients'));
            setPatients([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
                <p>Loading patients...</p>
            </div>
        );
    }

    return (
        <div className="patients-page">
            <div className="page-header">
                <div>
                    <h1>Patient Management</h1>
                    <p>Clinic patients — Egyptian records from hospital system</p>
                </div>
            </div>

            <div className="patients-grid">
                {patients.map((patient) => (
                    <div key={patient.id} className="patient-card">
                        <div className="patient-header">
                            <div className="patient-avatar">
                                {patient.first_name.charAt(0)}
                                {patient.last_name ? patient.last_name.charAt(0) : ''}
                            </div>
                            <div className="patient-info">
                                <h3>
                                    {patient.first_name} {patient.last_name}
                                </h3>
                                <p className="patient-id">ID: #{patient.id}</p>
                            </div>
                        </div>

                        <div className="patient-details">
                            <div className="detail-row">
                                <span className="label">Date of Birth:</span>
                                <span className="value">
                                    {patient.date_of_birth
                                        ? new Date(patient.date_of_birth).toLocaleDateString('en-GB')
                                        : 'N/A'}
                                </span>
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
                            <Link to={`/physio/patients/${patient.id}`} className="btn btn-secondary">
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>

            {!loading && patients.length === 0 && (
                <p style={{ textAlign: 'center', color: '#6b7280', padding: 48 }}>
                    No patients in the system yet. Restart the backend to run seed data.
                </p>
            )}
        </div>
    );
};

export default Patients;
