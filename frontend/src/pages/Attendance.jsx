import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Calendar, Clock, LogIn, LogOut } from 'lucide-react';

export default function Attendance() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today'); // 'today' ya 'history'
  const [memberId, setMemberId] = useState('');        // Admin ke liye specific member search

  useEffect(() => {
    fetchAttendance();
  }, [activeTab]);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      let res;

      if (user?.role === 'member') {
        // Member apni khud ki attendance dekhega
        res = await API.get(`/attendance/member/${user.id}`);
      } else {
        // Admin/Trainer aaj ki sab attendance dekhega
        res = await API.get('/attendance/today');
      }

      setRecords(res.data);
    } catch (err) {
      toast.error('Attendance load nahi hua!');
    } finally {
      setLoading(false);
    }
  };

  // Admin kisi bhi member ki history dekh sakta hai
  const fetchMemberHistory = async () => {
    if (!memberId.trim()) return toast.error('Member ID daalo!');
    try {
      const res = await API.get(`/attendance/member/${memberId}`);
      setRecords(res.data);
      toast.success('History loaded!');
    } catch (err) {
      toast.error('Member nahi mila!');
    }
  };

  // Check-out karo (Admin/Trainer ke liye)
  const handleCheckOut = async (attendanceId) => {
    try {
      await API.post(`/attendance/checkout/${attendanceId}`);
      toast.success('Check-out ho gaya!');
      fetchAttendance();
    } catch (err) {
      toast.error('Check-out failed!');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Attendance 📋</h1>

        {/* Tab switcher — sirf admin/trainer ke liye */}
        {user?.role !== 'member' && (
          <div className="flex bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'today' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'history' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Search History
            </button>
          </div>
        )}
      </div>

      {/* Member History Search — sirf admin/trainer ke liye */}
      {user?.role !== 'member' && activeTab === 'history' && (
        <div className="bg-gym-card rounded-xl p-4 border border-gray-700 mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Member ID paste karo..."
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-2.5 
                       focus:outline-none focus:border-orange-500 text-sm"
          />
          <button
            onClick={fetchMemberHistory}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            Search
          </button>
        </div>
      )}

      {/* Stats Row — aaj ke totals */}
      {user?.role !== 'member' && activeTab === 'today' && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gym-card rounded-xl p-4 border border-gray-700 text-center">
            <p className="text-3xl font-bold text-orange-400">{records.length}</p>
            <p className="text-gray-400 text-sm mt-1">Total Check-ins</p>
          </div>
          <div className="bg-gym-card rounded-xl p-4 border border-gray-700 text-center">
            <p className="text-3xl font-bold text-green-400">
              {records.filter(r => r.check_out_time === 'Still Inside').length}
            </p>
            <p className="text-gray-400 text-sm mt-1">Currently Inside</p>
          </div>
          <div className="bg-gym-card rounded-xl p-4 border border-gray-700 text-center">
            <p className="text-3xl font-bold text-blue-400">
              {records.filter(r => r.check_out_time !== 'Still Inside').length}
            </p>
            <p className="text-gray-400 text-sm mt-1">Checked Out</p>
          </div>
        </div>
      )}

      {/* Attendance Records */}
      {loading ? (
        <div className="text-center text-orange-400 py-20">Loading... ⏳</div>
      ) : records.length === 0 ? (
        <div className="text-center py-20">
          <Calendar size={64} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Koi attendance record nahi mila</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((record, index) => (
            <div
              key={record.id || index}
              className="bg-gym-card rounded-xl p-4 border border-gray-700 flex items-center justify-between"
            >
              {/* Left side — naam + date */}
              <div className="flex items-center gap-4">
                {/* Color dot — inside hai ya nahi */}
                <div className={`w-3 h-3 rounded-full ${
                  record.check_out_time === 'Still Inside' || record.check_out === 'N/A'
                    ? 'bg-green-400 animate-pulse'  // Green blink = abhi andar hai
                    : 'bg-gray-500'                  // Gray = chala gaya
                }`} />

                <div>
                  {/* Admin/Trainer view mein member naam */}
                  {user?.role !== 'member' && record.member_name && (
                    <p className="text-white font-semibold">{record.member_name}</p>
                  )}
                  <p className="text-gray-400 text-sm flex items-center gap-1">
                    <Calendar size={12} />
                    {record.date}
                  </p>
                </div>
              </div>

              {/* Right side — time + checkout button */}
              <div className="flex items-center gap-4">
                {/* Check-in time */}
                <div className="text-right">
                  <p className="text-green-400 text-sm flex items-center gap-1">
                    <LogIn size={12} />
                    {record.check_in_time || record.check_in}
                  </p>
                  <p className={`text-sm flex items-center gap-1 ${
                    record.check_out_time === 'Still Inside' || record.check_out === 'N/A'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }`}>
                    <LogOut size={12} />
                    {record.check_out_time || record.check_out}
                  </p>
                </div>

                {/* Checkout button — sirf "Still Inside" records ke liye */}
                {user?.role !== 'member' && record.check_out_time === 'Still Inside' && (
                  <button
                    onClick={() => handleCheckOut(record.id)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 
                               px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                  >
                    Check Out
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}