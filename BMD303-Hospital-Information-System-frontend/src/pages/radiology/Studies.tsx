import { useEffect, useMemo, useState } from 'react';
import { Search, Plus, FileText } from 'lucide-react';
import Sidebar from '../../components/radiology/Sidebar';
import { useBilling } from '../../billing';
import { formatCurrency } from '../../billing/billingUtils';
import toast from 'react-hot-toast';

interface Study {
    studyId: string;
    patientName: string;
    type: 'CT' | 'MRI' | 'X-Ray' | 'US';
    status: 'completed' | 'pending' | 'inprogress' | 'cancelled';
    radiologist: string;
    date: string;
}

const initialStudies: Study[] = [
    { studyId: 'ST-001', patientName: 'Ahmed Hassan', type: 'CT', status: 'completed', radiologist: 'Dr. Mona', date: '2024-04-20' },
    { studyId: 'ST-002', patientName: 'Sara Mohamed', type: 'MRI', status: 'inprogress', radiologist: 'Dr. Youssef', date: '2024-04-21' },
    { studyId: 'ST-003', patientName: 'Omar Ali', type: 'X-Ray', status: 'completed', radiologist: 'Dr. Amira', date: '2024-04-19' },
    { studyId: 'ST-004', patientName: 'Fatma Khaled', type: 'US', status: 'pending', radiologist: 'Dr. Mona', date: '2024-04-22' },
    { studyId: 'ST-005', patientName: 'Youssef Ahmed', type: 'CT', status: 'completed', radiologist: 'Dr. Youssef', date: '2024-04-18' },
    { studyId: 'ST-006', patientName: 'Maria Saad', type: 'MRI', status: 'inprogress', radiologist: 'Dr. Amira', date: '2024-04-21' },
    { studyId: 'ST-007', patientName: 'Karim Mostafa', type: 'X-Ray', status: 'cancelled', radiologist: 'Dr. Mona', date: '2024-04-17' },
    { studyId: 'ST-008', patientName: 'Nour El-Din', type: 'CT', status: 'completed', radiologist: 'Dr. Youssef', date: '2024-04-20' },
    { studyId: 'ST-009', patientName: 'Laila Mahmoud', type: 'US', status: 'pending', radiologist: 'Dr. Amira', date: '2024-04-23' },
    { studyId: 'ST-010', patientName: 'Hassan Ibrahim', type: 'MRI', status: 'completed', radiologist: 'Dr. Mona', date: '2024-04-19' },
    { studyId: 'ST-011', patientName: 'Dina Salah', type: 'X-Ray', status: 'inprogress', radiologist: 'Dr. Youssef', date: '2024-04-21' },
    { studyId: 'ST-012', patientName: 'Mahmoud Adel', type: 'CT', status: 'pending', radiologist: 'Dr. Amira', date: '2024-04-22' },
];

export default function Studies() {
    const [studies] = useState<Study[]>(initialStudies);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'inprogress' | 'pending' | 'cancelled'>('all');
    const [typeFilter, setTypeFilter] = useState<'all' | 'CT' | 'MRI' | 'X-Ray' | 'US'>('all');
    const { servicesState, createInvoice } = useBilling();
    const [billedStudyIds, setBilledStudyIds] = useState<string[]>(() => {
        try {
            const raw = localStorage.getItem('radiologyBilledStudies');
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    });

    const serviceMap: Record<Study['type'], string> = {
        CT: 'CT Scan',
        MRI: 'MRI',
        'X-Ray': 'X-Ray',
        US: 'Ultrasound',
    };

    const getServiceForStudy = (type: Study['type']) => {
        return (servicesState.items || []).find((service) => service.serviceName === serviceMap[type]);
    };

    const billedSet = useMemo(() => new Set(billedStudyIds), [billedStudyIds]);

    useEffect(() => {
        if (!(servicesState.items || []).length) return;
        let isCancelled = false;

        const autoBillCompleted = async () => {
            const newlyBilled: string[] = [];
            for (const study of studies) {
                if (study.status !== 'completed') continue;
                if (billedSet.has(study.studyId)) continue;
                const service = getServiceForStudy(study.type);
                if (!service) continue;

                const invoice = await createInvoice({
                    patientId: `RAD-${study.studyId}`,
                    patientName: study.patientName,
                    department: service.department,
                    serviceId: service.id,
                    serviceName: service.serviceName,
                    price: service.price,
                });

                if (invoice) {
                    newlyBilled.push(study.studyId);
                    toast.success('Billing record created successfully');
                }
            }

            if (!isCancelled && newlyBilled.length) {
                const next = Array.from(new Set([...billedStudyIds, ...newlyBilled]));
                setBilledStudyIds(next);
                localStorage.setItem('radiologyBilledStudies', JSON.stringify(next));
            }
        };

        autoBillCompleted();
        return () => {
            isCancelled = true;
        };
    }, [studies, servicesState.items, createInvoice, billedSet, billedStudyIds]);

    const handleBilling = async (study: Study) => {
        const service = getServiceForStudy(study.type);
        if (!service) return;
        await createInvoice({
            patientId: `RAD-${study.studyId}`,
            patientName: study.patientName,
            department: service.department,
            serviceId: service.id,
            serviceName: service.serviceName,
            price: service.price,
        });
        toast.success('Billing record created successfully');
        const next = Array.from(new Set([...billedStudyIds, study.studyId]));
        setBilledStudyIds(next);
        localStorage.setItem('radiologyBilledStudies', JSON.stringify(next));
    };

    const filteredStudies = studies.filter(study => {
        const matchesSearch =
            study.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            study.studyId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || study.status === statusFilter;
        const matchesType = typeFilter === 'all' || study.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
    });

    const stats = {
        completed: studies.filter(s => s.status === 'completed').length,
        inprogress: studies.filter(s => s.status === 'inprogress').length,
        pending: studies.filter(s => s.status === 'pending').length,
        cancelled: studies.filter(s => s.status === 'cancelled').length,
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <span className="badge badge-completed">Completed</span>;
            case 'pending':
                return <span className="badge badge-pending">Pending</span>;
            case 'inprogress':
                return <span className="badge badge-inprogress">In progress</span>;
            case 'cancelled':
                return <span className="badge badge-cancelled">Cancelled</span>;
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
        <div className="flex h-screen" style={{ background: 'var(--color-background-tertiary)', fontFamily: "'Sora', sans-serif" }}>
            <Sidebar />

            <div className="flex-1 p-6 overflow-auto">
                {/* Page Header */}
                <div className="flex items-center justify-between mb-5">
                    <div>
                        <h1 className="text-gray-800" style={{ fontSize: '18px', fontWeight: 600 }}>Studies</h1>
                        <p className="text-gray-500 mt-1" style={{ fontSize: '12px' }}>
                            {filteredStudies.length} studies found
                        </p>
                    </div>
                    <button
                        className="flex items-center gap-2 px-4 py-2 text-white rounded-md transition-all"
                        style={{ fontSize: '12px', fontWeight: 500, background: '#378ADD' }}
                    >
                        <Plus size={14} />
                        New Study
                    </button>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-4 gap-2.5 mb-4">
                    <div className="bg-white border border-gray-200 rounded-md p-3 flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#639922' }}></div>
                        <div>
                            <div className="text-xs text-gray-500">Completed</div>
                            <div className="text-base font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stats.completed}</div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-md p-3 flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#378ADD' }}></div>
                        <div>
                            <div className="text-xs text-gray-500">In progress</div>
                            <div className="text-base font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stats.inprogress}</div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-md p-3 flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#EF9F27' }}></div>
                        <div>
                            <div className="text-xs text-gray-500">Pending</div>
                            <div className="text-base font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stats.pending}</div>
                        </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-md p-3 flex items-center gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#E24B4A' }}></div>
                        <div>
                            <div className="text-xs text-gray-500">Cancelled</div>
                            <div className="text-base font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{stats.cancelled}</div>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex gap-2 mb-3.5 items-center flex-wrap">
                    <div className="flex-1 min-w-[160px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={14} style={{ fill: 'var(--color-text-secondary)' }} />
                        <input
                            type="text"
                            placeholder="Search patient or study ID..."
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
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'var(--color-border-secondary)';
                            }}
                        />
                    </div>

                    <div className="flex gap-1">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-all ${statusFilter === 'all' ? 'bg-[#0c2340] text-white border-[#0c2340]' : 'border-gray-200 text-gray-500 bg-white'
                                }`}
                            style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter('completed')}
                            className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-all ${statusFilter === 'completed' ? 'bg-[#0c2340] text-white border-[#0c2340]' : 'border-gray-200 text-gray-500 bg-white'
                                }`}
                            style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => setStatusFilter('inprogress')}
                            className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-all ${statusFilter === 'inprogress' ? 'bg-[#0c2340] text-white border-[#0c2340]' : 'border-gray-200 text-gray-500 bg-white'
                                }`}
                            style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                            In progress
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending')}
                            className={`px-3 py-1.5 text-xs font-medium border rounded-md transition-all ${statusFilter === 'pending' ? 'bg-[#0c2340] text-white border-[#0c2340]' : 'border-gray-200 text-gray-500 bg-white'
                                }`}
                            style={{ fontFamily: "'Sora', sans-serif" }}
                        >
                            Pending
                        </button>
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="px-2.5 py-1.5 text-sm border rounded-md outline-none cursor-pointer"
                        style={{
                            borderColor: 'var(--color-border-secondary)',
                            background: 'var(--color-background-primary)',
                            color: 'var(--color-text-primary)',
                            fontFamily: "'Sora', sans-serif"
                        }}
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
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '90px' }}>Study ID</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '140px' }}>Patient</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '80px' }}>Type</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '90px' }}>Status</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '130px' }}>Radiologist</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '100px' }}>Date</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '110px' }}>Price</th>
                                    <th className="text-left py-2.5 px-3.5 text-xs font-medium text-gray-500 border-b border-gray-200" style={{ width: '110px' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStudies.map((study) => (
                                    <tr key={study.studyId} className="cursor-pointer transition-all hover:bg-gray-50">
                                        <td className="py-2.5 px-3.5 border-b border-gray-200" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                                            {study.studyId}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-sm text-gray-800 border-b border-gray-200 font-medium">
                                            {study.patientName}
                                        </td>
                                        <td className="py-2.5 px-3.5 border-b border-gray-200">
                                            {getTypeBadge(study.type)}
                                        </td>
                                        <td className="py-2.5 px-3.5 border-b border-gray-200">
                                            {getStatusBadge(study.status)}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-sm text-gray-700 border-b border-gray-200">
                                            {study.radiologist}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-sm text-gray-500 border-b border-gray-200">
                                            {study.date}
                                        </td>
                                        <td className="py-2.5 px-3.5 text-sm text-gray-700 border-b border-gray-200">
                                            {formatCurrency(getServiceForStudy(study.type)?.price || 0)}
                                        </td>
                                        <td className="py-2.5 px-3.5 border-b border-gray-200">
                                            <button className="px-2.5 py-1 text-xs border border-gray-200 rounded-md hover:bg-gray-50 transition-all mr-1">
                                                View
                                            </button>
                                            <button className="px-2.5 py-1 text-xs text-white rounded-md transition-all" style={{ background: '#378ADD', border: 'none' }}>
                                                Edit
                                            </button>
                                            {study.status === 'completed' && !billedSet.has(study.studyId) && (
                                                <button
                                                    onClick={() => handleBilling(study)}
                                                    className="px-2.5 py-1 text-xs text-white rounded-md transition-all ml-1"
                                                    style={{ background: '#16a34a', border: 'none' }}
                                                >
                                                    Complete & Bill
                                                </button>
                                            )}
                                            {study.status === 'completed' && billedSet.has(study.studyId) && (
                                                <span className="px-2.5 py-1 text-xs rounded-md ml-1" style={{ background: '#dcfce7', color: '#15803d' }}>
                                                    Billed
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredStudies.length === 0 && (
                        <div className="text-center py-10 text-gray-500" style={{ fontSize: '13px' }}>
                            <FileText size={48} className="mx-auto mb-3 opacity-30" />
                            No studies found.
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div className="text-gray-500" style={{ fontSize: '12px' }}>
                        Showing {filteredStudies.length} of {studies.length} studies
                    </div>
                    <div className="flex gap-1">
                        <button className="w-7 h-7 border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-50 transition-all text-gray-500">
                            ←
                        </button>
                        <button className="w-7 h-7 border border-blue-500 bg-blue-500 text-white rounded-md flex items-center justify-center">
                            1
                        </button>
                        <button className="w-7 h-7 border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-50 transition-all text-gray-500">
                            2
                        </button>
                        <button className="w-7 h-7 border border-gray-200 rounded-md flex items-center justify-center hover:bg-gray-50 transition-all text-gray-500">
                            →
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        
        .badge {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 10px;
          font-weight: 500;
          display: inline-block;
        }
        .badge-completed {
          background: #EAF3DE;
          color: #27500A;
        }
        .badge-pending {
          background: #FAEEDA;
          color: #633806;
        }
        .badge-inprogress {
          background: #E6F1FB;
          color: #0C447C;
        }
        .badge-cancelled {
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
