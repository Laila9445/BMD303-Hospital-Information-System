import { useState } from 'react';
import { Search, Plus, FileText, X } from 'lucide-react';
import Sidebar from '../../components/radiology/Sidebar';

interface Report {
    reportId: string;
    patientName: string;
    studyType: 'CT' | 'MRI' | 'X-Ray' | 'US';
    status: 'final' | 'draft' | 'review' | 'rejected';
    radiologist: string;
    date: string;
    findings: string;
}

const initialReports: Report[] = [
    { reportId: 'RPT-001', patientName: 'Ahmed Hassan', studyType: 'CT', status: 'final', radiologist: 'Dr. Mona', date: '2024-04-20', findings: 'Normal chest CT scan. No abnormalities detected.' },
    { reportId: 'RPT-002', patientName: 'Sara Mohamed', studyType: 'MRI', status: 'review', radiologist: 'Dr. Youssef', date: '2024-04-21', findings: 'Brain MRI shows minor abnormalities in left hemisphere.' },
    { reportId: 'RPT-003', patientName: 'Omar Ali', studyType: 'X-Ray', status: 'final', radiologist: 'Dr. Amira', date: '2024-04-19', findings: 'Chest X-ray clear. Lungs normal.' },
    { reportId: 'RPT-004', patientName: 'Fatma Khaled', studyType: 'US', status: 'draft', radiologist: 'Dr. Mona', date: '2024-04-22', findings: 'Abdominal ultrasound - pending review.' },
    { reportId: 'RPT-005', patientName: 'Youssef Ahmed', studyType: 'CT', status: 'final', radiologist: 'Dr. Youssef', date: '2024-04-18', findings: 'CT Abdomen - Normal findings.' },
    { reportId: 'RPT-006', patientName: 'Maria Saad', studyType: 'MRI', status: 'review', radiologist: 'Dr. Amira', date: '2024-04-21', findings: 'Spine MRI - Requires further analysis.' },
    { reportId: 'RPT-007', patientName: 'Karim Mostafa', studyType: 'X-Ray', status: 'rejected', radiologist: 'Dr. Mona', date: '2024-04-17', findings: 'Image quality insufficient - retake required.' },
    { reportId: 'RPT-008', patientName: 'Nour El-Din', studyType: 'CT', status: 'final', radiologist: 'Dr. Youssef', date: '2024-04-20', findings: 'CT Head - No acute findings.' },
    { reportId: 'RPT-009', patientName: 'Laila Mahmoud', studyType: 'US', status: 'draft', radiologist: 'Dr. Amira', date: '2024-04-23', findings: 'Pelvic ultrasound - draft pending.' },
    { reportId: 'RPT-010', patientName: 'Hassan Ibrahim', studyType: 'MRI', status: 'final', radiologist: 'Dr. Mona', date: '2024-04-19', findings: 'Brain MRI - Normal study.' },
];

export default function Reports() {
    const [reports] = useState<Report[]>(initialReports);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'final' | 'review' | 'draft' | 'rejected'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'CT' | 'MRI' | 'X-Ray' | 'US'>('all');
    const [showModal, setShowModal] = useState(false);

    const filteredReports = reports.filter(report => {
        const matchesSearch =
            report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reportId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
        const matchesType = typeFilter === 'all' || report.studyType === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const stats = {
        final: reports.filter(r => r.status === 'final').length,
        review: reports.filter(r => r.status === 'review').length,
        draft: reports.filter(r => r.status === 'draft').length,
        rejected: reports.filter(r => r.status === 'rejected').length,
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'final':
                return <span className="badge badge-final">Finalized</span>;
            case 'draft':
                return <span className="badge badge-draft">Draft</span>;
            case 'review':
                return <span className="badge badge-review">Under Review</span>;
            case 'rejected':
                return <span className="badge badge-rejected">Rejected</span>;
            default:
                return null;
        }
    };

    const getTypeBadge = (type: string) => {
        switch (type) {
            case 'CT':
                return <span className="type-badge type-ct">CT Scan</span>;
            case 'MRI':
                return <span className="type-badge type-mri">MRI</span>;
            case 'X-Ray':
                return <span className="type-badge type-xray">X-Ray</span>;
            case 'US':
                return <span className="type-badge type-us">Ultrasound</span>;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen" style={{ background: '#f4f5f7', fontFamily: "'Sora', sans-serif" }}>
            <Sidebar />

            <div className="flex-1 p-6 overflow-auto" style={{ marginLeft: '200px' }}>
                {/* Page Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-gray-800" style={{ fontSize: '18px', fontWeight: 600, color: '#1a1a2e' }}>Reports</h1>
                        <p className="mt-1" style={{ fontSize: '12px', color: '#666' }}>
                            {filteredReports.length} reports found
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-white rounded-md transition-all"
                        style={{ fontSize: '12px', fontWeight: 500, background: '#378ADD' }}
                    >
                        <Plus size={14} />
                        New Report
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-2.5 mb-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#639922' }}></div>
                        <div>
                            <div className="text-xs" style={{ color: '#888' }}>Finalized</div>
                            <div className="text-base font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1a1a2e' }}>{stats.final}</div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#378ADD' }}></div>
                        <div>
                            <div className="text-xs" style={{ color: '#888' }}>Under Review</div>
                            <div className="text-base font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1a1a2e' }}>{stats.review}</div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#BA7517' }}></div>
                        <div>
                            <div className="text-xs" style={{ color: '#888' }}>Draft</div>
                            <div className="text-base font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1a1a2e' }}>{stats.draft}</div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#A32D2D' }}></div>
                        <div>
                            <div className="text-xs" style={{ color: '#888' }}>Rejected</div>
                            <div className="text-base font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1a1a2e' }}>{stats.rejected}</div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex gap-2 mb-3.5 items-center flex-wrap">
                    <div className="flex-1 min-w-[160px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ fill: '#888' }} />
                        <input
                            type="text"
                            placeholder="Search patient or report ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border rounded-md outline-none transition-all"
                            style={{
                                fontSize: '12px',
                                borderColor: '#ddd',
                                background: '#fff',
                                fontFamily: "'Sora', sans-serif"
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#378ADD';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#ddd';
                            }}
                        />
                    </div>

                    <div className="flex gap-1">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-all ${statusFilter === 'all' ? 'bg-[#0c2340] text-white border-[#0c2340]' : 'border-gray-300 text-gray-500 bg-white'
                                }`}
                            style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter('final')}
                            className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-all ${statusFilter === 'final' ? 'bg-[#0c2340] text-white border-[#0c2340]' : 'border-gray-300 text-gray-500 bg-white'
                                }`}
                            style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                            Finalized
                        </button>
                        <button
                            onClick={() => setStatusFilter('review')}
                            className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-all ${statusFilter === 'review' ? 'bg-[#0c2340] text-white border-[#0c2340]' : 'border-gray-300 text-gray-500 bg-white'
                                }`}
                            style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                            Review
                        </button>
                        <button
                            onClick={() => setStatusFilter('draft')}
                            className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-all ${statusFilter === 'draft' ? 'bg-[#0c2340] text-white border-[#0c2340]' : 'border-gray-300 text-gray-500 bg-white'
                                }`}
                            style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                            Draft
                        </button>
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="px-2.5 py-1.5 text-sm border border-gray-300 rounded-md outline-none cursor-pointer bg-white"
                        style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                        <option value="all">All types</option>
                        <option value="CT">CT Scan</option>
                        <option value="MRI">MRI</option>
                        <option value="X-Ray">X-Ray</option>
                        <option value="US">Ultrasound</option>
                    </select>
                </div>

                {/* Table */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-4">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium border-b border-gray-200" style={{ width: '90px', color: '#888' }}>Report ID</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium border-b border-gray-200" style={{ width: '140px', color: '#888' }}>Patient</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium border-b border-gray-200" style={{ width: '80px', color: '#888' }}>Type</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium border-b border-gray-200" style={{ width: '90px', color: '#888' }}>Status</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium border-b border-gray-200" style={{ width: '130px', color: '#888' }}>Radiologist</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium border-b border-gray-200" style={{ width: '100px', color: '#888' }}>Date</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium border-b border-gray-200" style={{ width: '150px', color: '#888' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredReports.map((report) => (
                                    <tr key={report.reportId} className="cursor-pointer transition-all hover:bg-gray-50">
                                        <td className="py-2.5 px-3.5 border-b border-gray-200" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#888' }}>
                                            {report.reportId}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-sm border-b border-gray-200 font-medium" style={{ color: '#1a1a2e' }}>
                                            {report.patientName}
                                        </td>
                                        <td className="py-2.5 px-3.5 border-b border-gray-200">
                                            {getTypeBadge(report.studyType)}
                                        </td>
                                        <td className="py-2.5 px-3.5 border-b border-gray-200">
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-sm border-b border-gray-200" style={{ color: '#1a1a2e' }}>
                                            {report.radiologist}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-sm border-b border-gray-200" style={{ color: '#1a1a2e' }}>
                                            {report.date}
                                        </td>
                                        <td className="py-2.5 px-3.5 border-b border-gray-200">
                                            <button className="px-2.5 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-100 transition-all mr-1" style={{ color: '#666' }}>
                                                View
                                            </button>
                                            <button className="px-2.5 py-1 text-xs text-white rounded-md transition-all" style={{ background: '#378ADD', border: 'none' }}>
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredReports.length === 0 && (
                        <div className="text-center py-10" style={{ fontSize: '13px', color: '#888' }}>
                            <FileText size={48} className="mx-auto mb-3 opacity-30" />
                            No reports found.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div style={{ fontSize: '12px', color: '#888' }}>
                        Showing {filteredReports.length} of {reports.length} reports
                    </div>
                    <div className="flex gap-1">
                        <button className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 transition-all" style={{ fontSize: '12px', color: '#666', background: '#fff' }}>
                            ←
                        </button>
                        <button className="w-7 h-7 border border-blue-500 rounded-md flex items-center justify-center text-white" style={{ fontSize: '12px', background: '#378ADD' }}>
                            1
                        </button>
                        <button className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 transition-all" style={{ fontSize: '12px', color: '#666', background: '#fff' }}>
                            2
                        </button>
                        <button className="w-7 h-7 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 transition-all" style={{ fontSize: '12px', color: '#666', background: '#fff' }}>
                            →
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        className="bg-white rounded-lg p-7"
                        style={{ width: '480px', maxWidth: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-base font-semibold" style={{ color: '#1a1a2e' }}>Create New Report</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-7 h-7 border-none bg-gray-100 rounded-md cursor-pointer flex items-center justify-center text-base"
                                style={{ color: '#666', lineHeight: 1 }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: '#888', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>Patient Name</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 text-sm border rounded-md outline-none transition-all"
                                    style={{ borderColor: '#ddd', fontFamily: "'Sora', sans-serif" }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#378ADD';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(55,138,221,0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#ddd';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: '#888', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>Study Type</label>
                                <select
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md outline-none bg-white"
                                    style={{ fontFamily: "'Sora', sans-serif" }}
                                >
                                    <option value="CT">CT Scan</option>
                                    <option value="MRI">MRI</option>
                                    <option value="X-Ray">X-Ray</option>
                                    <option value="US">Ultrasound</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3.5 mb-3.5">
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: '#888', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>Radiologist</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 text-sm border rounded-md outline-none transition-all"
                                    style={{ borderColor: '#ddd', fontFamily: "'Sora', sans-serif" }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#378ADD';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(55,138,221,0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#ddd';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium mb-1.5" style={{ color: '#888', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>Status</label>
                                <select
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md outline-none bg-white"
                                    style={{ fontFamily: "'Sora', sans-serif" }}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="review">Under Review</option>
                                    <option value="final">Finalized</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-3.5">
                            <label className="block text-xs font-medium mb-1.5" style={{ color: '#888', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em', textTransform: 'uppercase' }}>Findings</label>
                            <textarea
                                className="w-full px-3 py-2 text-sm border rounded-md outline-none transition-all"
                                rows={4}
                                style={{ borderColor: '#ddd', fontFamily: "'Sora', sans-serif", lineHeight: 1.6, resize: 'vertical' }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#378ADD';
                                    e.target.style.boxShadow = '0 0 0 3px rgba(55,138,221,0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#ddd';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>

                        <div className="flex gap-2 justify-end pt-4" style={{ borderTop: '1px solid #eee' }}>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-md hover:bg-gray-50 transition-all"
                                style={{ color: '#666', fontFamily: "'Sora', sans-serif" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-5 py-2 text-sm font-semibold text-white rounded-md transition-all hover:bg-blue-600"
                                style={{ background: '#378ADD', fontFamily: "'Sora', sans-serif" }}
                            >
                                Save Report
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .badge {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 10px;
          font-weight: 500;
          display: inline-block;
        }
        .badge-final {
          background: #EAF3DE;
          color: #27500A;
        }
        .badge-draft {
          background: #FAEEDA;
          color: #633806;
        }
        .badge-review {
          background: #E6F1FB;
          color: #0C447C;
        }
        .badge-rejected {
          background: #FCEBEB;
          color: #791F1F;
        }
        
        .type-badge {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 6px;
          font-weight: 500;
          display: inline-block;
        }
        .type-ct {
          background: #E6F1FB;
          color: #185FA5;
        }
        .type-mri {
          background: #FBEAF0;
          color: #72243E;
        }
        .type-xray {
          background: #EAF3DE;
          color: #3B6D11;
        }
        .type-us {
          background: #FAEEDA;
          color: #854F0B;
        }
      `}</style>
        </div>
    );
}
