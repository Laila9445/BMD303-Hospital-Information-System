import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Calendar, Plus, Users, FileText, Clock, AlertCircle } from 'lucide-react';
import Sidebar from '../../components/radiology/Sidebar';

const chartData = [
  { day: 'Mon', 'CT Scan': 35, 'X-Ray': 40, MRI: 25 },
  { day: 'Tue', 'CT Scan': 42, 'X-Ray': 38, MRI: 30 },
  { day: 'Wed', 'CT Scan': 38, 'X-Ray': 45, MRI: 28 },
  { day: 'Thu', 'CT Scan': 45, 'X-Ray': 42, MRI: 32 },
  { day: 'Fri', 'CT Scan': 40, 'X-Ray': 48, MRI: 35 },
  { day: 'Sat', 'CT Scan': 32, 'X-Ray': 35, MRI: 22 },
  { day: 'Sun', 'CT Scan': 28, 'X-Ray': 30, MRI: 20 },
];

const recentActivities = [
  { text: 'New patient registered — Ahmed Hossam', time: '2m ago', doctor: 'CT Exam / Dr. Mona', type: 'new' },
  { text: 'Study completed — Sara Ali', time: '15m ago', doctor: 'MRI Brain', type: 'completed' },
  { text: 'Report finalized — Omar Khaled', time: '25m ago', doctor: 'X-Ray Chest / Dr. Amira', type: 'report' },
  { text: 'Unusual contrast — Maria...', time: '1h ago', doctor: 'MRI / Dr. Youssef M', type: 'alert' },
  { text: 'New patient registered — Yo...', time: '2h ago', doctor: 'MRI Scan', type: 'new' },
];

const todayAppointments = [
  { time: '08:00', patient: 'Ahmed Hassan', type: 'X-Ray', status: 'Confirmed' },
  { time: '09:30', patient: 'Sara Mohamed', type: 'CT Scan', status: 'Confirmed' },
  { time: '10:45', patient: 'Dana Ali', type: 'MRI Brain', status: 'In progress' },
  { time: '11:00', patient: 'Omar Ahmed', type: 'X-Ray Chest', status: 'Waiting' },
  { time: '13:00', patient: 'Maria Saad', type: 'MRI Spine', status: 'Waiting' },
  { time: '14:30', patient: 'Karim Mostafa', type: 'CT Abdomen', status: 'Cancelled' },
];

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-800" style={{ fontSize: '24px', fontWeight: 700 }}>
                Dashboard
              </h1>
              <p className="text-gray-500 mt-0.5" style={{ fontSize: '13px' }}>
                Today - 21 APR 2026
              </p>
            </div>
            <button className="h-10 px-5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg text-white flex items-center gap-2 transition-all shadow-md hover:shadow-lg" style={{ fontSize: '14px', fontWeight: 600 }}>
              <Plus size={16} />
              New Patient
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500" style={{ fontSize: '13px', fontWeight: 600 }}>Total Patients</span>
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Users size={16} className="text-blue-600" />
                </div>
              </div>
              <div className="text-gray-800" style={{ fontSize: '28px', fontWeight: 700 }}>2,840</div>
              <div className="text-green-600 mt-1" style={{ fontSize: '12px', fontWeight: 500 }}>+8.2% Inc</div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500" style={{ fontSize: '13px', fontWeight: 600 }}>Studies</span>
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                  <FileText size={16} className="text-green-600" />
                </div>
              </div>
              <div className="text-gray-800" style={{ fontSize: '28px', fontWeight: 700 }}>47</div>
              <div className="text-green-600 mt-1" style={{ fontSize: '12px', fontWeight: 500 }}>yesterday</div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500" style={{ fontSize: '13px', fontWeight: 600 }}>Pending</span>
                <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Clock size={16} className="text-orange-600" />
                </div>
              </div>
              <div className="text-gray-800" style={{ fontSize: '28px', fontWeight: 700 }}>13</div>
              <div className="text-orange-600 mt-1" style={{ fontSize: '12px', fontWeight: 500 }}>In process</div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500" style={{ fontSize: '13px', fontWeight: 600 }}>Appointments</span>
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Calendar size={16} className="text-purple-600" />
                </div>
              </div>
              <div className="text-gray-800" style={{ fontSize: '28px', fontWeight: 700 }}>28</div>
              <div className="text-green-600 mt-1" style={{ fontSize: '12px', fontWeight: 500 }}>Scheduled</div>
            </div>
          </div>

          {/* Charts and Study Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Studies Chart */}
            <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-gray-800" style={{ fontSize: '16px', fontWeight: 700 }}>
                  Studies this week
                </h3>
                <button className="text-blue-600 hover:text-blue-700" style={{ fontSize: '13px', fontWeight: 600 }}>
                  View all
                </button>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 500 }} />
                  <Bar dataKey="CT Scan" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="X-Ray" stackId="a" fill="#f97316" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="MRI" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Study Status */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-gray-800 mb-6" style={{ fontSize: '16px', fontWeight: 700 }}>
                Study status
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>Completed</span>
                    <span className="text-gray-800" style={{ fontSize: '13px', fontWeight: 700 }}>73%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '73%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>In review</span>
                    <span className="text-gray-800" style={{ fontSize: '13px', fontWeight: 700 }}>18%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 500 }}>Cancelled</span>
                    <span className="text-gray-800" style={{ fontSize: '13px', fontWeight: 700 }}>4%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '4%' }}></div>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700" style={{ fontSize: '13px', fontWeight: 600 }}>Total this month</span>
                    <span className="text-gray-800" style={{ fontSize: '16px', fontWeight: 700 }}>1,248</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity and Today's Appointments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-gray-800" style={{ fontSize: '16px', fontWeight: 700 }}>
                  Recent activity
                </h3>
                <button className="text-blue-600 hover:text-blue-700" style={{ fontSize: '13px', fontWeight: 600 }}>
                  See all
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'new' ? 'bg-blue-500' :
                      activity.type === 'completed' ? 'bg-green-500' :
                      activity.type === 'report' ? 'bg-purple-500' :
                      'bg-red-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800" style={{ fontSize: '13px', fontWeight: 600 }}>
                        {activity.text}
                      </p>
                      <p className="text-gray-500 mt-0.5" style={{ fontSize: '12px' }}>
                        {activity.doctor}
                      </p>
                    </div>
                    <span className="text-gray-400 text-nowrap" style={{ fontSize: '12px' }}>
                      {activity.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Appointments */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-gray-800" style={{ fontSize: '16px', fontWeight: 700 }}>
                  Today's appointments
                </h3>
                <button className="text-blue-600 hover:text-blue-700" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Manage
                </button>
              </div>
              <div className="space-y-3">
                {todayAppointments.map((appointment, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="text-center min-w-[50px]">
                      <div className="text-gray-800" style={{ fontSize: '13px', fontWeight: 700 }}>
                        {appointment.time}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 truncate" style={{ fontSize: '13px', fontWeight: 600 }}>
                        {appointment.patient}
                      </p>
                      <p className="text-gray-500" style={{ fontSize: '12px' }}>
                        {appointment.type}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-nowrap ${
                      appointment.status === 'Confirmed' ? 'bg-green-50 text-green-700' :
                      appointment.status === 'In progress' ? 'bg-blue-50 text-blue-700' :
                      appointment.status === 'Waiting' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-red-50 text-red-700'
                    }`} style={{ fontSize: '11px', fontWeight: 600 }}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
