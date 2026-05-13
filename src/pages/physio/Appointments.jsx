import React, { useState, useEffect, useCallback } from 'react';
import './Appointments.css';

const STORAGE_KEY = 'physioAppointments';

function readAppointments() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function formatDisplayDate(apt) {
    if (apt.date) return apt.date;
    if (apt.appointment_date) {
        try {
            return new Date(apt.appointment_date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        } catch {
            return String(apt.appointment_date);
        }
    }
    return '—';
}

function formatDisplayTime(apt) {
    if (apt.time) return apt.time;
    if (apt.appointment_date) {
        try {
            return new Date(apt.appointment_date).toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
            });
        } catch {
            return '—';
        }
    }
    return '—';
}

function displayPatient(apt) {
    if (apt.patient != null && apt.patient !== '') return apt.patient;
    return apt.patient_id != null ? `Patient #${apt.patient_id}` : '—';
}

function displayService(apt) {
    if (apt.service != null && apt.service !== '') return apt.service;
    return apt.appointment_type || '—';
}

function displayStatus(apt) {
    const s = apt.status;
    if (s == null || s === '') return '—';
    return typeof s === 'string' ? s.charAt(0).toUpperCase() + s.slice(1) : String(s);
}

const Appointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = useCallback(() => {
        setAppointments(readAppointments());
        setLoading(false);
    }, []);

    useEffect(() => {
        loadData();
        const onUpdated = () => loadData();
        const onStorage = (e) => {
            if (e.key === STORAGE_KEY || e.key === null) loadData();
        };
        window.addEventListener('physio-appointments-updated', onUpdated);
        window.addEventListener('storage', onStorage);
        window.addEventListener('focus', loadData);
        return () => {
            window.removeEventListener('physio-appointments-updated', onUpdated);
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('focus', loadData);
        };
    }, [loadData]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading appointments...</p>
            </div>
        );
    }

    return (
        <div className="appointments-page">
            <div className="page-header">
                <div>
                    <h1>Appointments</h1>
                    <p>Scheduled sessions from bookings and the clinic</p>
                </div>
            </div>

            <div className="appointments-table-container">
                <table className="appointments-table">
                    <thead>
                        <tr>
                            <th>Patient</th>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                                    No appointments yet.
                                </td>
                            </tr>
                        ) : (
                            appointments.map((apt) => (
                                <tr key={apt.id}>
                                    <td>{displayPatient(apt)}</td>
                                    <td>{displayService(apt)}</td>
                                    <td>{formatDisplayDate(apt)}</td>
                                    <td>{formatDisplayTime(apt)}</td>
                                    <td>
                                        <span className={`status-badge status-${String(apt.status || '').toLowerCase().replace(/\s+/g, '-')}`}>
                                            {displayStatus(apt)}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Appointments;
