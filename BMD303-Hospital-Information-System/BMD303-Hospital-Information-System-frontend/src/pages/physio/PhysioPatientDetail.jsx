import { Link, useParams } from 'react-router-dom';

export default function PhysioPatientDetail() {
  const { patientId } = useParams();
  return (
    <div style={{ padding: '40px' }}>
      <Link to="/physio/patients">← Back to patients</Link>
      <h1 style={{ marginTop: '16px' }}>Patient #{patientId}</h1>
      <p style={{ color: '#6b7280' }}>Detail view placeholder (merged physio portal).</p>
    </div>
  );
}
