require("dotenv").config();
const axios = require("axios");

const API_URL = process.env.API_URL;
const FHIR_URL = process.env.FHIR_URL;

let token = "";

async function login() {
  const res = await axios.post(`${API_URL}/Auth/login`, {
    email: "dr.ahmed@hospital.com",
    password: "Hospital@123!"
  });

  token = res.data.token;
  console.log("✅ Login success");
  console.log("Role:", res.data.user.role);
}

async function getDoctors() {
  try {
    const res = await axios.get(`${API_URL}/Doctors`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Doctors:", res.data);
  } catch (err) {
    console.log("❌ Doctors error:", err.response?.data || err.message);
  }
}

async function getPatientsProfile() {
  try {
    const res = await axios.get(`${API_URL}/Patients/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Patient profile:", res.data);
  } catch (err) {
    console.log("❌ Patient error:", err.response?.data || err.message);
  }
}

async function createReferral() {
  try {
    const res = await axios.post(
      `${API_URL}/Referrals`,
      {
        patientId: 1,
        doctorId: 1,
        referralType: "radiology-xray",
        urgency: "Urgent",
        reason: "Chest pain",
        notes: "Test referral"
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log("✅ Referral created:", res.data);
  } catch (err) {
    console.log("❌ Referral error:", err.response?.data || err.message);
  }
}

async function runTests() {
  console.log("🚀 Starting API tests...\n");

  await login();
  await getDoctors();
  await getPatientsProfile();
  await createReferral();

  console.log("\n🏁 Tests finished");
}

runTests();