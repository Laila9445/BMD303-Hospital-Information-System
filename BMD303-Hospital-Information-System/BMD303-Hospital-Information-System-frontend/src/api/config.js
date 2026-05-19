export const USE_MOCK = false;
import { mockAppointments } from "./mockData";
import axios from "axios";

export const getTodayAppointments = async () => {
  if (USE_MOCK) {
    return mockAppointments;
  }

  const response = await axios.get(
    "http://localhost:5000/api/Doctors/appointments/today",
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    }
  );

  return response.data;
};