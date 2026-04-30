import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { UserPlus, QrCode, Search, CheckCircle, XCircle } from 'lucide-react';

export default function Members() {
  const [members, setMembers] = useState([]);         // Members ki list
  const [loading, setLoading] = useState(true);       // Loading state
  const [searchTerm, setSearchTerm] = useState('');   // Search box ka text
  const [showAddModal, setShowAddModal] = useState(false); // Add member popup
  const [selectedQR, setSelectedQR] = useState(null); // QR popup ke liye

  // Form state — naya member add karne ke liye
  const [newMember, setNewMember] = useState({
    name: '', email: '', password: '', phone: '', role: 'member'
  });

  // Page load hote hi members fetch karo
  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await API.get('/members/all');
      setMembers(res.data);
    } catch (err) {
      toast.error('Members load nahi hue!');
    } finally {
      setLoading(false);
    }
  };

  // Naya member register karo
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', newMember);
      toast.success('Member add ho gaya! 🎉');
      setShowAddModal(false);
      setNewMember({ name: '', email: '', password: '', phone: '', role: 'member' });
      fetchMembers(); // List refresh karo
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error adding member!');
    }
  };

  // Member ka QR Code generate karo
  const handleGenerateQR = async (memberId) => {
    try {
      const res = await API.post(`/members/generate-qr/${memberId}`);
      toast.success('QR Code generate ho gaya!');
      fetchMembers(); // List refresh karo taaki QR dikhaye
      setSelectedQR(res.data.qr_code); // QR popup mein dikhao
    } catch (err) {
      toast.error('QR generate nahi hua!');
    }
  };

  // Search filter — naam ya email se dhundho
  const filteredMembers = members.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Members 👥</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <UserPlus size={18} />
          Add Member
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gym-card border border-gray-700 text-white rounded-xl pl-10 pr-4 py-3 
                     focus:outline-none focus:border-orange-500 transition-colors"
        />
      </div>

      {/* Members Table */}
      {loading ? (
        <div className="text-center text-orange-400 py-20 text-lg">Loading members... ⏳</div>
      ) : (
        <div className="bg-gym-card rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-800 text-gray-400 text-sm">
                <th className="text-left px-6 py-4">Name</th>
                <th className="text-left px-6 py-4">Email</th>
                <th className="text-left px-6 py-4">Phone</th>
                <th className="text-left px-6 py-4">Status</th>
                <th className="text-left px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-12">
                    No members found 😕
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member.id} className="border-t border-gray-700 hover:bg-gray-800/50 transition-colors">
                    
                    {/* Name + Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white font-medium">{member.name}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-gray-400">{member.email}</td>
                    <td className="px-6 py-4 text-gray-400">{member.phone}</td>

                    {/* Active / Inactive badge */}
                    <td className="px-6 py-4">
                      {member.is_active ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <CheckCircle size={14} /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-400 text-sm">
                          <XCircle size={14} /> Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {/* QR Code button */}
                        <button
                          onClick={() => member.qr_code ? setSelectedQR(member.qr_code) : handleGenerateQR(member.id)}
                          className="flex items-center gap-1 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 
                                     px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                        >
                          <QrCode size={14} />
                          {member.qr_code ? 'View QR' : 'Gen QR'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ─── ADD MEMBER MODAL ─── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-card rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-5">Add New Member</h2>

            <form onSubmit={handleAddMember} className="space-y-4">
              {/* Name */}
              <input
                type="text"
                placeholder="Full Name"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 
                           focus:outline-none focus:border-orange-500"
              />
              {/* Email */}
              <input
                type="email"
                placeholder="Email Address"
                value={newMember.email}
                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 
                           focus:outline-none focus:border-orange-500"
              />
              {/* Password */}
              <input
                type="password"
                placeholder="Password"
                value={newMember.password}
                onChange={(e) => setNewMember({...newMember, password: e.target.value})}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 
                           focus:outline-none focus:border-orange-500"
              />
              {/* Phone */}
              <input
                type="text"
                placeholder="Phone Number"
                value={newMember.phone}
                onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 
                           focus:outline-none focus:border-orange-500"
              />
              {/* Role */}
              <select
                value={newMember.role}
                onChange={(e) => setNewMember({...newMember, role: e.target.value})}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 
                           focus:outline-none focus:border-orange-500"
              >
                <option value="member">Member</option>
                <option value="trainer">Trainer</option>
                <option value="admin">Admin</option>
              </select>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── QR CODE MODAL ─── */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-card rounded-2xl p-6 text-center border border-gray-700 max-w-sm w-full">
            <h2 className="text-xl font-bold text-white mb-4">Member QR Code</h2>
            <img src={selectedQR} alt="QR Code" className="mx-auto rounded-xl mb-4 w-56 h-56" />
            <p className="text-gray-400 text-sm mb-5">
              Show this QR code at the gym entrance for attendance check-in
            </p>
            <button
              onClick={() => setSelectedQR(null)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}