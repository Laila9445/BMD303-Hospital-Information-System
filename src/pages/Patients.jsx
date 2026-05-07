import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientService } from '../../services/index';
import './Patients.css';

const Patients = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        date_of_birth: '',
        gender: '',
        phone: '',
        email: '',
        address: '',
        medical_history: ''
    });

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            const data = await patientService.getAllPatients();
            setPatients(data);
        } catch (error) {
            console.error('Failed to load patients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await patientService.createPatient(formData);
            setShowModal(false);
            loadPatients();
            setFormData({
                first_name: '',
                last_name: '',
                date_of_birth: '',
                gender: '',
                phone: '',
                email: '',
                address: '',
                medical_history: ''
            });
        } catch (error) {
            console.error('Failed to create patient:', error);
            alert('Failed to create patient. Please try again.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Add New Patient
                </button>
            </div>

            <div className="patients-grid">
                {patients.map(patient => (
                    <div key={patient.id} className="patient-card">
                        <div className="patient-header">
                            <div className="patient-avatar">
                                {patient.first_name.charAt(0)}{patient.last_name.charAt(0)}
                            </div>
                            <div className="patient-info">
                                <h3>{patient.first_name} {patient.last_name}</h3>
                                <p className="patient-id">ID: #{patient.id}</p>
                            </div>
                        </div>

                        <div className="patient-details">
                            <div className="detail-row">
                                <span className="label">Date of Birth:</span>
                                <span className="value">{new Date(patient.date_of_birth).toLocaleDateString()}</span>
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
                            <Link to={`/patients/${patient.id}`} className="btn btn-secondary">View Details</Link>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add New Patient</h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input
                                        type="text"
                                        name="first_name"
                                        value={formData.first_name}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name *</label>
                                    <input
                                        type="text"
                                        name="last_name"
                                        value={formData.last_name}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Date of Birth *</label>
                                    <input
                                        type="date"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="form-control"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="2"
                                    className="form-control"
                                />
                            </div>

                            <div className="form-group">
                                <label>Medical History</label>
                                <textarea
                                    name="medical_history"
                                    value={formData.medical_history}
                                    onChange={handleChange}
                                    rows="3"
                                    className="form-control"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Add Patient
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Patients;
