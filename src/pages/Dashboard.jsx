import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts';
import { patientService, appointmentService, treatmentPlanService } from '../../services/index';
import './Dashboard.css';

const Dashboard = () => {
    const { currentUser, logout } = useAuth();
    const [stats, setStats] = useState({
        totalPatients: 0,
        todayAppointments: 0,
        activeTreatmentPlans: 0
    });
    const [recentAppointments, setRecentAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [patients, appointments, treatmentPlans] = await Promise.all([
                patientService.getAllPatients(),
                appointmentService.getAllAppointments(),
                treatmentPlanService.getAllTreatmentPlans()
            ]);

            // Calculate statistics
            const today = new Date().toISOString().split('T')[0];
            const todayAppointmentsCount = appointments.filter(apt =>
                apt.appointment_date.startsWith(today) && apt.status === 'scheduled'
            ).length;

            const activePlans = treatmentPlans.filter(plan => plan.status === 'active').length;

            setStats({
                totalPatients: patients.length,
                todayAppointments: todayAppointmentsCount,
                activeTreatmentPlans: activePlans
            });

            // Get recent appointments
            const sortedAppointments = appointments.sort((a, b) =>
                new Date(b.appointment_date) - new Date(a.appointment_date)
            ).slice(0, 5);

            setRecentAppointments(sortedAppointments);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'status-scheduled';
            case 'completed': return 'status-completed';
            case 'cancelled': return 'status-cancelled';
            default: return '';
        }
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner-large"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <nav className="sidebar">
                <div className="sidebar-header">
                    <div className="logo-small">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                        </svg>
                    </div>
                    <h3>PhysioClinic</h3>
                </div>

                <ul className="nav-menu">
                    <li className="nav-item active">
                        <Link to="/dashboard">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                            </svg>
                            Dashboard
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/patients">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            Patients
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/appointments">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            Appointments
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="/treatment-plans">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                            Treatment Plans
                        </Link>
                    </li>
                </ul>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">
                            {currentUser?.first_name?.charAt(0)}{currentUser?.last_name?.charAt(0)}
                        </div>
                        <div className="user-details">
                            <p className="user-name">{currentUser?.first_name} {currentUser?.last_name}</p>
                            <p className="user-role">{currentUser?.role}</p>
                        </div>
                    </div>
                    <button onClick={logout} className="btn-logout">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                            <polyline points="16 17 21 12 16 7" />
                            <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Logout
                    </button>
                </div>
            </nav>

            <main className="main-content">
                <header className="top-bar">
                    <h1>Dashboard</h1>
                    <p className="welcome-text">Welcome back, {currentUser?.first_name}!</p>
                </header>

                <div className="dashboard-content">
                    {/* Statistics Cards */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon stat-icon-patients">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <div className="stat-details">
                                <h3>{stats.totalPatients}</h3>
                                <p>Total Patients</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon stat-icon-appointments">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                            </div>
                            <div className="stat-details">
                                <h3>{stats.todayAppointments}</h3>
                                <p>Today's Appointments</p>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon stat-icon-treatment">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                            </div>
                            <div className="stat-details">
                                <h3>{stats.activeTreatmentPlans}</h3>
                                <p>Active Treatment Plans</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Appointments */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">Recent Appointments</h2>
                            <Link to="/appointments" className="btn btn-secondary">View All</Link>
                        </div>
                        <div className="appointments-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Patient</th>
                                        <th>Date & Time</th>
                                        <th>Type</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentAppointments.map(apt => (
                                        <tr key={apt.id}>
                                            <td>Patient #{apt.patient_id}</td>
                                            <td>{new Date(apt.appointment_date).toLocaleString()}</td>
                                            <td>{apt.appointment_type}</td>
                                            <td>
                                                <span className={`status-badge ${getStatusColor(apt.status)}`}>
                                                    {apt.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
