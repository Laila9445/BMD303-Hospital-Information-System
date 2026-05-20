import { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/radiology/Sidebar';
import patientService from '../../api/patientService';
import { getApiErrorMessage } from '../../api/apiUtils';

interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    status: 'active' | 'inactive' | 'critical';
    lastVisit: string;
    avatarColor: string;
}

const avatarColors = ['#378ADD', '#E74C3C', '#27AE60', '#F39C12', '#9B59B6', '#1ABC9C', '#E67E22', '#3498DB', '#E91E63', '#00BCD4'];

function mapApiPatient(p: Record<string, unknown>, index: number): Patient {
    const first = String(p.firstName ?? '');
    const last = String(p.lastName ?? '');
    const dob = p.dateOfBirth ? new Date(String(p.dateOfBirth)) : null;
    const age = dob && !Number.isNaN(dob.getTime())
        ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
        : 0;
    return {
        id: String(p.externalPatientId ?? p.patientId ?? index),
        name: `${first} ${last}`.trim() || String(p.fullName ?? 'Patient'),
        age,
        gender: String(p.gender ?? '—'),
        phone: String(p.phoneNumber ?? ''),
        status: 'active',
        lastVisit: new Date().toISOString().split('T')[0],
        avatarColor: avatarColors[index % avatarColors.length],
    };
}

export default function Patients() {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const data = await patientService.getAllPatients('radiology');
                const list = (Array.isArray(data) ? data : []).map((p, i) =>
                    mapApiPatient(p as Record<string, unknown>, i)
                );
                setPatients(list);
            } catch (error) {
                toast.error(getApiErrorMessage(error, 'Failed to load patients'));
                setPatients([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'critical'>('all');
    const [currentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);

    const filteredPatients = patients.filter(patient => {
        const matchesSearch =
            patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.includes(searchTerm);

        const matchesFilter =
            filter === 'all' ||
            patient.status === filter;

        return matchesSearch && matchesFilter;
    });

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="badge badge-active">Active</span>;
            case 'inactive':
                return <span className="badge badge-inactive">Inactive</span>;
            case 'critical':
                return <span className="badge badge-critical">Critical</span>;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen" style={{ background: 'var(--color-background-tertiary)', fontFamily: "'Sora', sans-serif" }}>
            <Sidebar />

            <div className="flex-1 p-6 overflow-auto" style={{ position: 'relative' }}>
                {/* Page Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-gray-800" style={{ fontSize: '18px', fontWeight: 600 }}>Patients</h1>
                        <p className="text-gray-500 mt-1" style={{ fontSize: '12px' }}>
                            {filteredPatients.length} patients found
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-white rounded-md transition-all"
                        style={{ fontSize: '12px', fontWeight: 500, background: '#378ADD' }}
                    >
                        <UserPlus size={14} />
                        Add Patient
                    </button>
                </div>

                {/* Toolbar */}
                <div className="flex gap-2.5 mb-4 items-center">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ fill: 'var(--color-text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search by name, ID, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 text-sm border rounded-md outline-none transition-all"
                            style={{
                                borderColor: 'var(--color-border-secondary)',
                                background: 'var(--color-background-primary)',
                                color: 'var(--color-text-primary)',
                                fontFamily: "'Sora', sans-serif"
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#378ADD';
                                e.target.style.boxShadow = '0 0 0 3px rgba(55,138,221,0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--color-border-secondary)';
                                e.target.style.boxShadow = 'none';
                            }}
                        />
                    </div>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-3 py-2 text-xs border rounded-md flex items-center gap-1.5 transition-all ${filter === 'all' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'border-gray-200 text-gray-500 bg-white'
                            }`}
                        style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                        <Filter size={12} />
                        All
                    </button>
                    <button
                        onClick={() => setFilter('active')}
                        className={`px-3 py-2 text-xs border rounded-md transition-all ${filter === 'active' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'border-gray-200 text-gray-500 bg-white'
                            }`}
                        style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setFilter('critical')}
                        className={`px-3 py-2 text-xs border rounded-md transition-all ${filter === 'critical' ? 'bg-blue-50 text-blue-700 border-blue-300' : 'border-gray-200 text-gray-500 bg-white'
                            }`}
                        style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                        Critical
                    </button>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '36px' }}></th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '160px' }}>Patient</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '80px' }}>ID</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '60px' }}>Age</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '70px' }}>Gender</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '110px' }}>Phone</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '80px' }}>Status</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '120px' }}>Last visit</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '80px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map((patient) => (
                                    <tr key={patient.id} className="cursor-pointer transition-all hover:bg-gray-50">
                                        <td className="py-2.5 px-3.5 text-sm border-b border-gray-200">
                                            <div
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                                                style={{ background: patient.avatarColor }}
                                            >
                                                {getInitials(patient.name)}
                                            </div>
                                        </td>
                                        <td className="py-2.5 px-3.5 text-sm text-gray-800 border-b border-gray-200 font-medium">
                                            {patient.name}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-xs text-gray-500 border-b border-gray-200" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                            {patient.id}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-sm text-gray-700 border-b border-gray-200">
                                            {patient.age}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-sm text-gray-700 border-b border-gray-200">
                                            {patient.gender}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-sm text-gray-700 border-b border-gray-200">
                                            {patient.phone}
                                        </td>
                                        <td className="py-2.5 px-3.5 border-b border-gray-200">
                                            {getStatusBadge(patient.status)}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-sm text-gray-500 border-b border-gray-200">
                                            {patient.lastVisit}
                                        </td>
                                        <td className="py-2.5 px-3.5 border-b border-gray-200">
                                            <button className="px-2.5 py-1 text-xs border border-gray-200 rounded-md hover:bg-gray-50 transition-all">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredPatients.length === 0 && (
                        <div className="text-center py-10 text-gray-500" style={{ fontSize: '13px' }}>
                            <Users size={48} className="mx-auto mb-3 opacity-30" />
                            No patients found.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div className="text-gray-500" style={{ fontSize: '12px' }}>
                        Showing {filteredPatients.length} of {patients.length} patients
                    </div>
                    <div className="flex gap-1">
                        <button className="w-7 h-7 border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-50 transition-all">
                            <ChevronLeft size={14} />
                        </button>
                        <button className="w-7 h-7 border border-blue-500 bg-blue-500 text-white rounded-md flex items-center justify-center">
                            1
                        </button>
                        <button className="w-7 h-7 border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-50 transition-all text-gray-500">
                            2
                        </button>
                        <button className="w-7 h-7 border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-50 transition-all">
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>

                {/* Modal */}
                {showModal && (
                    <div
                        className="fixed inset-0 z-10 flex items-center justify-center"
                        style={{ background: 'rgba(0,0,0,0.35)' }}
                        onClick={() => setShowModal(false)}
                    >
                        <div
                            className="bg-white rounded-lg border border-gray-200 p-6"
                            style={{ width: '340px' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-gray-800 mb-1" style={{ fontSize: '15px', fontWeight: 600 }}>Add New Patient</h2>
                            <p className="text-gray-500 mb-5" style={{ fontSize: '12px' }}>Fill in the patient information</p>

                            <div className="mb-3.5">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    className="w-full px-2.5 py-2 text-sm border rounded-md outline-none"
                                    style={{
                                        borderColor: 'var(--color-border-secondary)',
                                        background: 'var(--color-background-secondary)',
                                        fontFamily: "'Sora', sans-serif"
                                    }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2.5 mb-3.5">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Age</label>
                                    <input
                                        type="number"
                                        className="w-full px-2.5 py-2 text-sm border rounded-md outline-none"
                                        style={{
                                            borderColor: 'var(--color-border-secondary)',
                                            background: 'var(--color-background-secondary)',
                                            fontFamily: "'Sora', sans-serif"
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Gender</label>
                                    <select
                                        className="w-full px-2.5 py-2 text-sm border rounded-md outline-none"
                                        style={{
                                            borderColor: 'var(--color-border-secondary)',
                                            background: 'var(--color-background-secondary)',
                                            fontFamily: "'Sora', sans-serif"
                                        }}
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mb-3.5">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    className="w-full px-2.5 py-2 text-sm border rounded-md outline-none"
                                    style={{
                                        borderColor: 'var(--color-border-secondary)',
                                        background: 'var(--color-background-secondary)',
                                        fontFamily: "'Sora', sans-serif"
                                    }}
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
                                <select
                                    className="w-full px-2.5 py-2 text-sm border rounded-md outline-none"
                                    style={{
                                        borderColor: 'var(--color-border-secondary)',
                                        background: 'var(--color-background-secondary)',
                                        fontFamily: "'Sora', sans-serif"
                                    }}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-xs border border-gray-200 rounded-md hover:bg-gray-50 transition-all text-gray-500"
                                    style={{ fontFamily: "'Sora', sans-serif" }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-xs text-white rounded-md transition-all"
                                    style={{ fontFamily: "'Sora', sans-serif", background: '#378ADD', fontWeight: 500 }}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        
        .badge {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 10px;
          font-weight: 500;
          white-space: nowrap;
          display: inline-block;
        }
        .badge-active {
          background: #EAF3DE;
          color: #27500A;
        }
        .badge-inactive {
          background: #F1EFE8;
          color: #444441;
        }
        .badge-critical {
          background: #FCEBEB;
          color: #791F1F;
        }
      `}</style>
        </div>
    );
}
