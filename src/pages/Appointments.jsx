import React, { useState, useEffect } from 'react';
import { appointmentService, patientService, staffService } from '../../services/index';
import './Appointments.css';

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        patient_id: '',
        staff_id: '',
        appointment_date: '',
        duration_minutes: 30,
        appointment_type: '',
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [appointmentsData, patientsData, staffData] = await Promise.all([
                appointmentService.getAllAppointments(),
                patientService.getAllPatients(),
                staffService.getAllStaff()
            ]);
            setAppointments(appointmentsData);
            setPatients(patientsData);
            setStaff(staffData);
        } catch (error) {
            console.error('Failed to load data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await appointmentService.createAppointment(formData);
            setShowModal(false);
            loadData();
            setFormData({
                patient_id: '',
                staff_id: '',
                appointment_date: '',
                duration_minutes: 30,
                appointment_type: '',
                notes: ''
            });
        } catch (error) {
            console.error('Failed to create appointment:', error);
            alert('Failed to create appointment. Please try again.');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStatusChange = async (appointmentId, newStatus) => {
        try {
            await appointmentService.updateAppointmentStatus(appointmentId, newStatus);
            loadData();
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update appointment status.');
        }
    };

    if (loading) {
        return <div className="loading-container"><div className="spinner"></div><p>Loading appointments...</p></div>;
    }

    return (
        <div className="appointments-page">
            <div className="page-header">
                <div>
                    <h1>Appointment Scheduling</h1>
                    <p>Manage and schedule patient appointments</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    + Schedule Appointment
                </button>
            </div>

            <div className="appointments-table-container">
                <table className="appointments-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Patient</th>
                            <th>Staff</th>
                            <th>Date & Time</th>
                            <th>Type</th>
                            <th>Duration</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map(apt => (
                            <tr key={apt.id}>
                                <td>#{apt.id}</td>
                                <td>Patient #{apt.patient_id}</td>
                                <td>Staff #{apt.staff_id}</td>
                                <td>{new Date(apt.appointment_date).toLocaleString()}</td>
                                <td>{apt.appointment_type}</td>
                                <td>{apt.duration_minutes} min</td>
                                <td>
                                    <span className={`status-badge status-${apt.status}`}>
                                        {apt.status}
                                    </span>
                                </td>
                                <td>
                                    <select
                                        value={apt.status}
                                        onChange={(e) => handleStatusChange(apt.id, e.target.value)}
                                        className="status-select"
                                    >
                                        <option value="scheduled">Scheduled</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                        <option value="no_show">No Show</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Schedule New Appointment</h2>
                            <button className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
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

                            <div className="form-group">
                                <label>Appointment Date & Time *</label>
                                <input
                                    type="datetime-local"
                                    name="appointment_date"
                                    value={formData.appointment_date}
                                    onChange={handleChange}
                                    required
                                    className="form-control"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Duration (minutes) *</label>
                                    <select
                                        name="duration_minutes"
                                        value={formData.duration_minutes}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    >
                                        <option value="15">15 minutes</option>
                                        <option value="30">30 minutes</option>
                                        <option value="45">45 minutes</option>
                                        <option value="60">60 minutes</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Appointment Type *</label>
                                    <select
                                        name="appointment_type"
                                        value={formData.appointment_type}
                                        onChange={handleChange}
                                        required
                                        className="form-control"
                                    >
                                        <option value="">Select Type</option>
                                        <option value="initial_assessment">Initial Assessment</option>
                                        <option value="follow_up">Follow-up</option>
                                        <option value="manual_therapy">Manual Therapy</option>
                                        <option value="exercise_therapy">Exercise Therapy</option>
                                        <option value="electrotherapy">Electrotherapy</option>
                                        <option value="consultation">Consultation</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Notes</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="form-control"
                                    placeholder="Additional notes or instructions..."
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    Schedule Appointment
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Appointments;
