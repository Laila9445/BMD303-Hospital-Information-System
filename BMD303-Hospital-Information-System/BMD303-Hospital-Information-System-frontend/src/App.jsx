import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ReferralProvider } from './context/ReferralContext';
import { BillingProvider } from './billing';
import ProtectedRoute from './components/ProtectedRoute';
import DoctorLayout from './components/layout/DoctorLayout';
import PatientLayout from './components/layout/PatientLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Services from './pages/Services';
import About from './pages/About';
import PatientsInfo from './pages/Patients';
import Contact from './pages/Contact';
import PhysioDashboard from './pages/physio/PhysioDashboard';
import RadiologyDashboard from './pages/radiology/RadiologyDashboard';
import RadiologyOsLogin from './pages/radiology/Login';
import RadiologyOsDashboard from './pages/radiology/Dashboard';
import RadiologyPatients from './pages/radiology/Patients';
import RadiologyStudies from './pages/radiology/Studies';
import RadiologyReports from './pages/radiology/Reports';
import RadiologyPlaceholder from './pages/radiology/RadiologyPlaceholder';
import RadiologyLayout from './components/layout/RadiologyLayout';
import RadiologyStaffDashboard from './pages/radiology/RadiologyStaffDashboard';
import RadiologyServicesPage from './pages/radiology/RadiologyServicesPage';
import RadiologyBookingPage from './pages/radiology/RadiologyBookingPage';
import RadiologySuccessPage from './pages/radiology/SuccessPage';
import RadiologyAppointmentsPage from './pages/radiology/Appointments';
import { PhysioAuthProvider } from './pages/physio/contexts';
import PhysioServicesPage from './pages/physio/ServicesPage';
import PhysioBookingPage from './pages/physio/BookingPage';
import PhysioSuccessPage from './pages/physio/SuccessPage';
import PhysioContactPage from './pages/physio/Contactpage';
import PhysioAppDashboard from './pages/physio/PhysioAppDashboard';
import PhysioStaffDashboard from './pages/physio/PhysioStaffDashboard';
import PhysioPatientsPage from './pages/physio/Patients';
import PhysioAppointmentsPage from './pages/physio/Appointments';
import PhysioTreatmentPlansPage from './pages/physio/TreatmentPlans';
import PhysioPatientDetail from './pages/physio/PhysioPatientDetail';

// Create a smart redirect component
const DashboardRedirect = () => {
  const { isDoctor, isPatient, isNurse } = useAuth();
  
  if (isDoctor) return <Navigate to="/doctor/dashboard" replace />;
  if (isPatient) return <Navigate to="/patient/dashboard" replace />;
  if (isNurse) return <Navigate to="/nurse/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

const PhysioPortalShell = () => (
  <PhysioAuthProvider>
    <Outlet />
  </PhysioAuthProvider>
);

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import Appointments from './pages/doctor/Appointments';
import Patients from './pages/doctor/Patients';
import PatientDetails from './pages/doctor/PatientDetails';
import Schedule from './pages/doctor/Schedule';
import Profile from './pages/doctor/Profile';
import Consultations from './pages/doctor/Consultations';
import Imaging from './pages/doctor/Imaging';
import Referrals from './pages/doctor/Referrals';
import DoctorPrescriptions from './pages/doctor/DoctorPrescriptions';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientAppointments from './pages/patient/PatientAppointments';
import PatientMedicalRecords from './pages/patient/PatientMedicalRecords';
import PatientProfile from './pages/patient/PatientProfile';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';

// Nurse Pages
import NurseDashboard from './pages/nurse/NurseDashboard';
import NurseAppointments from './pages/nurse/NurseAppointments';
import NursePatients from './pages/nurse/NursePatients';
import NurseSchedule from './pages/nurse/NurseSchedule';
import NurseProfile from './pages/nurse/NurseProfile';
import NurseLayout from './components/layout/NurseLayout';
import PhysioLayout from './components/layout/PhysioLayout';
import BillingDashboard from './pages/nurse/billing/BillingDashboard';
import BillingInvoices from './pages/nurse/billing/BillingInvoices';
import BillingPayments from './pages/nurse/billing/BillingPayments';
import BillingServices from './pages/nurse/billing/BillingServices';
import BillingReports from './pages/nurse/billing/BillingReports';
import InvoiceDetails from './pages/nurse/billing/InvoiceDetails';
import PatientBilling from './pages/patient/billing/PatientBilling';
import PatientInvoices from './pages/patient/billing/PatientInvoices';
import PatientPayments from './pages/patient/billing/PatientPayments';

function App() {
  return (
    <AuthProvider>
      <ReferralProvider>
      <BillingProvider>
      <Router>
        <Toaster position="top-right" rtl={true} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/patients" element={<PatientsInfo />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/physio/dashboard"
            element={
              <ProtectedRoute>
                <DoctorLayout>
                  <PhysioDashboard />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route path="/physio" element={<PhysioPortalShell />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="services" element={<PhysioServicesPage />} />
            <Route path="booking" element={<PhysioBookingPage />} />
            <Route path="success" element={<PhysioSuccessPage />} />
            <Route
              path="contact"
              element={
                <PhysioLayout>
                  <PhysioContactPage />
                </PhysioLayout>
              }
            />
            <Route
              path="panel"
              element={
                <PhysioLayout>
                  <PhysioAppDashboard />
                </PhysioLayout>
              }
            />
            <Route
              path="staff"
              element={
                <PhysioLayout>
                  <PhysioStaffDashboard />
                </PhysioLayout>
              }
            />
            <Route
              path="patients"
              element={
                <PhysioLayout>
                  <PhysioPatientsPage />
                </PhysioLayout>
              }
            />
            <Route
              path="patients/:patientId"
              element={
                <PhysioLayout>
                  <PhysioPatientDetail />
                </PhysioLayout>
              }
            />
            <Route path="appointments" element={<PhysioAppointmentsPage />} />
            <Route
              path="treatment-plans"
              element={
                <PhysioLayout>
                  <PhysioTreatmentPlansPage />
                </PhysioLayout>
              }
            />
          </Route>
          <Route path="/radiology/login" element={<RadiologyOsLogin />} />
          <Route path="/radiology/panel" element={<RadiologyOsDashboard />} />
          <Route path="/radiology/patients" element={<RadiologyPatients />} />
          <Route path="/radiology/studies" element={<RadiologyStudies />} />
          <Route path="/radiology/reports" element={<RadiologyReports />} />
          <Route path="/radiology/billing" element={<RadiologyPlaceholder title="Billing" />} />
          <Route
            path="/radiology/staff"
            element={
              <RadiologyLayout>
                <RadiologyStaffDashboard />
              </RadiologyLayout>
            }
          />
          <Route path="/radiology/services" element={<RadiologyServicesPage />} />
          <Route path="/radiology/booking" element={<RadiologyBookingPage />} />
          <Route path="/radiology/success" element={<RadiologySuccessPage />} />
          <Route path="/radiology/appointments" element={<RadiologyAppointmentsPage />} />
          <Route
            path="/radiology/dashboard"
            element={
              <RadiologyLayout>
                <RadiologyDashboard />
              </RadiologyLayout>
            }
          />
          
          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute requireDoctor>
                <DoctorLayout>
                  <DoctorDashboard />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute requireDoctor>
                <DoctorLayout>
                  <Appointments />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients"
            element={
              <ProtectedRoute requireDoctor>
                <DoctorLayout>
                  <Patients />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/patients/:patientId"
            element={
              <ProtectedRoute requireDoctor>
                <DoctorLayout>
                  <PatientDetails />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/schedule"
            element={
              <ProtectedRoute requireDoctor>
                <DoctorLayout>
                  <Schedule />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute requireDoctor>
                <DoctorLayout>
                  <Profile />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/consultations"
            element={
              <ProtectedRoute requireDoctor>
                <DoctorLayout>
                  <Consultations />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/imaging"
            element={
              <ProtectedRoute requireDoctor>
                <DoctorLayout>
                  <Imaging />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/referrals"
            element={
              <ProtectedRoute requireDoctor>
                <DoctorLayout>
                  <Referrals />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/prescriptions"
            element={
              <ProtectedRoute requireDoctor>
                <DoctorLayout>
                  <DoctorPrescriptions />
                </DoctorLayout>
              </ProtectedRoute>
            }
          />
                    
          {/* Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute requirePatient>
                <PatientLayout>
                  <PatientDashboard />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/appointments"
            element={
              <ProtectedRoute requirePatient>
                <PatientLayout>
                  <PatientAppointments />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/medical-records"
            element={
              <ProtectedRoute requirePatient>
                <PatientLayout>
                  <PatientMedicalRecords />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute requirePatient>
                <PatientLayout>
                  <PatientProfile />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <ProtectedRoute requirePatient>
                <PatientLayout>
                  <PatientPrescriptions />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/billing"
            element={
              <ProtectedRoute requirePatient>
                <PatientLayout>
                  <PatientBilling />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/invoices"
            element={
              <ProtectedRoute requirePatient>
                <PatientLayout>
                  <PatientInvoices />
                </PatientLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/payments"
            element={
              <ProtectedRoute requirePatient>
                <PatientLayout>
                  <PatientPayments />
                </PatientLayout>
              </ProtectedRoute>
            }
          />

          {/* Nurse Routes */}
          <Route
            path="/nurse/dashboard"
            element={
              <ProtectedRoute requireNurse>
                <NurseLayout>
                  <NurseDashboard />
                </NurseLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse/appointments"
            element={
              <ProtectedRoute requireNurse>
                <NurseLayout>
                  <ErrorBoundary>
                    <NurseAppointments />
                  </ErrorBoundary>
                </NurseLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse/patients"
            element={
              <ProtectedRoute requireNurse>
                <NurseLayout>
                  <NursePatients />
                </NurseLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse/schedule"
            element={
              <ProtectedRoute requireNurse>
                <NurseLayout>
                  <NurseSchedule />
                </NurseLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse/profile"
            element={
              <ProtectedRoute requireNurse>
                <NurseLayout>
                  <NurseProfile />
                </NurseLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse/billing/dashboard"
            element={
              <ProtectedRoute requireNurse>
                <NurseLayout>
                  <BillingDashboard />
                </NurseLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse/billing/invoices"
            element={
              <ProtectedRoute requireNurse>
                <NurseLayout>
                  <BillingInvoices />
                </NurseLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse/billing/payments"
            element={
              <ProtectedRoute requireNurse>
                <NurseLayout>
                  <BillingPayments />
                </NurseLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse/billing/services"
            element={
              <ProtectedRoute requireNurse>
                <NurseLayout>
                  <BillingServices />
                </NurseLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse/billing/reports"
            element={
              <ProtectedRoute requireNurse>
                <NurseLayout>
                  <BillingReports />
                </NurseLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nurse/billing/invoice/:id"
            element={
              <ProtectedRoute requireNurse>
                <NurseLayout>
                  <InvoiceDetails />
                </NurseLayout>
              </ProtectedRoute>
            }
          />

          {/* Test Route - Remove after testing */}
          <Route path="/test-nurse" element={
            <div style={{padding: '40px'}}>
              <h1>Nurse Route Test SUCCESS!</h1>
              <p>If you see this, nurse routes are working!</p>
              <a href="/nurse/dashboard">Go to Nurse Dashboard</a>
            </div>
          } />

          {/* Unauthorized Route */}
          <Route path="/unauthorized" element={<div style={{ padding: '40px', textAlign: 'center' }}><h1>Unauthorized Access</h1><p>You don't have permission to access this page.</p></div>} replace />
                    
          {/* Default redirect */}
          <Route path="/dashboard" element={<DashboardRedirect />} replace />
          
          {/* Home page - catch all other routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      </BillingProvider>
      </ReferralProvider>
    </AuthProvider>
  );
}

export default App;
