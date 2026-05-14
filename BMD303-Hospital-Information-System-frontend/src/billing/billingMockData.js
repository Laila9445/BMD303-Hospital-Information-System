export const mockInsurancePlans = [
  { id: 'INS-001', name: 'Bupa Egypt – Gold',         coverage: 30 },
  { id: 'INS-002', name: 'AXA Egypt – Premium',       coverage: 25 },
  { id: 'INS-003', name: 'MetLife Egypt – Standard',  coverage: 20 },
  { id: 'INS-004', name: 'Allianz – Basic',            coverage: 15 },
  { id: 'INS-005', name: 'Orient Takaful – Silver',   coverage: 10 },
];

export const mockPatients = [
  { id: 'PAT-1001', name: 'Ahmed Hassan',   email: 'ahmed.hassan@email.com',   phone: '+20 10 1234 5678', gender: 'Male'   },
  { id: 'PAT-1002', name: 'Sara Mohamed',   email: 'sara.mohamed@email.com',    phone: '+20 11 2345 6789', gender: 'Female' },
  { id: 'PAT-1003', name: 'Omar Ali',       email: 'omar.ali@email.com',        phone: '+20 12 3456 7890', gender: 'Male'   },
  { id: 'PAT-1004', name: 'Mona Khaled',    email: 'mona.khaled@email.com',     phone: '+20 10 9988 7766', gender: 'Female' },
  { id: 'PAT-1005', name: 'Laila Hassan',   email: 'laila.hassan@email.com',    phone: '+20 11 8877 6655', gender: 'Female' },
  { id: 'PAT-1006', name: 'Karim Nasser',   email: 'karim.nasser@email.com',    phone: '+20 12 7766 5544', gender: 'Male'   },
  { id: 'PAT-1007', name: 'Hana Mostafa',   email: 'hana.mostafa@email.com',    phone: '+20 10 6655 4433', gender: 'Female' },
];

export const mockServices = [
  // Doctor
  { id: 'SRV-1001', serviceName: 'Orthopedic Consultation',    department: 'Doctor',        price: 350,  description: 'Initial orthopedic consultation and assessment.',          status: 'Active'   },
  { id: 'SRV-1002', serviceName: 'Follow-up Consultation',     department: 'Doctor',        price: 250,  description: 'Follow-up consultation for ongoing care.',                status: 'Active'   },
  { id: 'SRV-1003', serviceName: 'Sports Injury Assessment',   department: 'Doctor',        price: 400,  description: 'Comprehensive sports injury evaluation.',                  status: 'Active'   },
  { id: 'SRV-1004', serviceName: 'Joint Injection',            department: 'Doctor',        price: 800,  description: 'Intra-articular corticosteroid injection.',                status: 'Active'   },
  { id: 'SRV-1005', serviceName: 'Bone Density Scan',          department: 'Doctor',        price: 600,  description: 'DEXA scan for osteoporosis screening.',                   status: 'Active'   },
  // Radiology
  { id: 'SRV-2001', serviceName: 'MRI – Full Body',            department: 'Radiology',     price: 1500, description: 'Full-body MRI imaging study.',                            status: 'Active'   },
  { id: 'SRV-2002', serviceName: 'X-Ray',                      department: 'Radiology',     price: 400,  description: 'Digital X-Ray imaging.',                                  status: 'Active'   },
  { id: 'SRV-2003', serviceName: 'CT Scan',                    department: 'Radiology',     price: 1200, description: 'CT Scan imaging study.',                                  status: 'Active'   },
  { id: 'SRV-2004', serviceName: 'Ultrasound',                 department: 'Radiology',     price: 600,  description: 'Diagnostic ultrasound imaging.',                          status: 'Active'   },
  { id: 'SRV-2005', serviceName: 'MRI – Knee',                 department: 'Radiology',     price: 1100, description: 'MRI specifically for knee joint.',                        status: 'Active'   },
  { id: 'SRV-2006', serviceName: 'MRI – Spine',                department: 'Radiology',     price: 1300, description: 'MRI of the cervical/lumbar spine.',                       status: 'Active'   },
  { id: 'SRV-2007', serviceName: 'Bone Scintigraphy',          department: 'Radiology',     price: 900,  description: 'Nuclear medicine bone scan.',                             status: 'Active'   },
  // Physiotherapy
  { id: 'SRV-3001', serviceName: 'Physiotherapy Session',      department: 'Physiotherapy', price: 300,  description: 'Standard physiotherapy session.',                         status: 'Active'   },
  { id: 'SRV-3002', serviceName: 'Rehabilitation Program',     department: 'Physiotherapy', price: 900,  description: 'Multi-session rehabilitation program.',                   status: 'Active'   },
  { id: 'SRV-3003', serviceName: 'Dry Needling',               department: 'Physiotherapy', price: 450,  description: 'Therapeutic dry needling for muscle pain.',               status: 'Active'   },
  { id: 'SRV-3004', serviceName: 'Hydrotherapy',               department: 'Physiotherapy', price: 500,  description: 'Aquatic therapy session.',                                status: 'Active'   },
  { id: 'SRV-3005', serviceName: 'Manual Therapy',             department: 'Physiotherapy', price: 380,  description: 'Hands-on joint and soft tissue mobilisation.',             status: 'Active'   },
  { id: 'SRV-3006', serviceName: 'TENS / Electrotherapy',      department: 'Physiotherapy', price: 250,  description: 'Transcutaneous electrical nerve stimulation session.',     status: 'Inactive' },
];

export const mockInvoices = [
  { id: 'INV-1201', patientId: 'PAT-1001', patientName: 'Ahmed Hassan', department: 'Doctor',        serviceId: 'SRV-1001', serviceName: 'Orthopedic Consultation', amount: 350,  type: 'Consultation',           status: 'Pending',   date: '2026-05-14', cancellationReason: null },
  { id: 'INV-1202', patientId: 'PAT-1002', patientName: 'Sara Mohamed', department: 'Radiology',     serviceId: 'SRV-2001', serviceName: 'MRI – Full Body',         amount: 1500, type: 'Radiology Referral',     status: 'Pending',   date: '2026-05-13', cancellationReason: null },
  { id: 'INV-1203', patientId: 'PAT-1003', patientName: 'Omar Ali',     department: 'Physiotherapy', serviceId: 'SRV-3001', serviceName: 'Physiotherapy Session',   amount: 300,  type: 'Physiotherapy Referral', status: 'Paid',      date: '2026-05-12', cancellationReason: null },
  { id: 'INV-1204', patientId: 'PAT-1004', patientName: 'Mona Khaled',  department: 'Radiology',     serviceId: 'SRV-2002', serviceName: 'X-Ray',                   amount: 400,  type: 'Radiology Referral',     status: 'Cancelled', date: '2026-05-11', cancellationReason: 'Patient refused service' },
  { id: 'INV-1205', patientId: 'PAT-1001', patientName: 'Ahmed Hassan', department: 'Doctor',        serviceId: 'SRV-1002', serviceName: 'Follow-up Consultation',  amount: 250,  type: 'Consultation',           status: 'Paid',      date: '2026-05-10', cancellationReason: null },
];

export const mockPayments = [
  { id: 'PAY-9001', invoiceId: 'INV-1203', patientId: 'PAT-1003', patientName: 'Omar Ali',     amount: 300, method: 'Cash',     date: '2026-05-12' },
  { id: 'PAY-9002', invoiceId: 'INV-1205', patientId: 'PAT-1001', patientName: 'Ahmed Hassan', amount: 250, method: 'InstaPay', date: '2026-05-10' },
];
