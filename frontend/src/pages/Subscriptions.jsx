import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { CreditCard, Check, Clock, AlertTriangle } from 'lucide-react';

// Plans ki details — frontend pe bhi define karo display ke liye
const PLANS = {
  basic: {
    name: 'Basic',
    price: 500,
    color: 'blue',
    features: ['Gym Access', 'Locker'],
    icon: '🥉'
  },
  standard: {
    name: 'Standard',
    price: 1000,
    color: 'orange',
    features: ['Gym Access', 'Locker', 'Trainer Session x4'],
    icon: '🥈'
  },
  premium: {
    name: 'Premium',
    price: 2000,
    color: 'purple',
    features: ['Gym Access', 'Locker', 'Unlimited Trainer', 'Diet Plan'],
    icon: '🥇'
  }
};

export default function Subscriptions() {
  const { user } = useAuth();
  const [mySubscription, setMySubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);

  // Admin ke liye assign form
  const [assignData, setAssignData] = useState({
    member_id: '',
    plan: 'basic',
    duration_months: 1
  });

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const res = await API.get('/subscriptions/my-subscription');
      setMySubscription(res.data);
    } catch (err) {
      // No subscription — that's okay
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSubscription = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/subscriptions/create', assignData);
      toast.success(`Subscription assigned! Valid till ${res.data.valid_till}`);
      setShowAssignModal(false);
      fetchSubscription();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error assigning subscription!');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Subscriptions 💳</h1>
        {user?.role === 'admin' && (
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <CreditCard size={18} />
            Assign Plan
          </button>
        )}
      </div>

      {/* ─── MY SUBSCRIPTION CARD ─── */}
      {loading ? (
        <div className="text-center text-orange-400 py-20">Loading... ⏳</div>
      ) : mySubscription?.plan ? (
        <div className="bg-gym-card rounded-2xl p-6 border border-gray-700 mb-8">
          <h2 className="text-lg font-semibold text-gray-300 mb-4">Your Current Plan</h2>

          <div className={`bg-gradient-to-r ${
            mySubscription.plan === 'premium' ? 'from-purple-600 to-purple-800' :
            mySubscription.plan === 'standard' ? 'from-orange-500 to-orange-700' :
            'from-blue-600 to-blue-800'
          } rounded-2xl p-6`}>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white/80 text-sm">Active Plan</p>
                <h2 className="text-3xl font-bold text-white capitalize">
                  {PLANS[mySubscription.plan]?.icon} {mySubscription.plan}
                </h2>
              </div>
              {/* Days remaining badge */}
              <div className={`text-center px-4 py-2 rounded-xl ${
                mySubscription.days_left <= 7
                  ? 'bg-red-500/30 border border-red-400'
                  : 'bg-white/20'
              }`}>
                <p className="text-2xl font-bold text-white">{mySubscription.days_left}</p>
                <p className="text-white/70 text-xs">days left</p>
              </div>
            </div>

            {/* Valid till */}
            <div className="flex items-center gap-2 text-white/80 text-sm mb-4">
              <Clock size={14} />
              Valid till: {mySubscription.valid_till}
            </div>

            {/* Warning agar 7 din se kam hain */}
            {mySubscription.days_left <= 7 && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-400/30 rounded-xl p-3 mb-4">
                <AlertTriangle size={16} className="text-red-400" />
                <p className="text-red-300 text-sm">Subscription expire hone wala hai! Admin se renew karwao.</p>
              </div>
            )}

            {/* Features list */}
            <div className="space-y-2">
              {mySubscription.features?.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-white/90 text-sm">
                  <Check size={14} className="text-green-300" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* No subscription */
        <div className="bg-gym-card rounded-2xl p-8 border border-gray-700 mb-8 text-center">
          <CreditCard size={48} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No active subscription found</p>
          <p className="text-gray-500 text-sm mt-1">Contact your admin to get a subscription plan</p>
        </div>
      )}

      {/* ─── ALL PLANS DISPLAY ─── */}
      <h2 className="text-lg font-semibold text-white mb-4">Available Plans</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(PLANS).map(([key, plan]) => (
          <div
            key={key}
            className={`bg-gym-card rounded-2xl p-5 border ${
              mySubscription?.plan === key
                ? 'border-orange-500 shadow-lg shadow-orange-500/10'
                : 'border-gray-700'
            }`}
          >
            {/* Active badge */}
            {mySubscription?.plan === key && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full mb-3 inline-block">
                ✓ Current Plan
              </span>
            )}

            <div className="text-3xl mb-2">{plan.icon}</div>
            <h3 className="text-white font-bold text-xl mb-1">{plan.name}</h3>
            <p className="text-orange-400 text-2xl font-bold mb-4">
              ₹{plan.price}<span className="text-gray-500 text-sm font-normal">/month</span>
            </p>

            {/* Features */}
            <div className="space-y-2">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                  <Check size={14} className="text-green-400 flex-shrink-0" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ─── ASSIGN MODAL (Admin only) ─── */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gym-card rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-5">Assign Subscription</h2>

            <form onSubmit={handleAssignSubscription} className="space-y-4">
              {/* Member ID */}
              <div>
                <label className="text-gray-400 text-sm block mb-1">Member ID</label>
                <input
                  type="text"
                  placeholder="Members page se ID copy karo"
                  value={assignData.member_id}
                  onChange={(e) => setAssignData({...assignData, member_id: e.target.value})}
                  required
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 
                             focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* Plan selection */}
              <div>
                <label className="text-gray-400 text-sm block mb-2">Select Plan</label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(PLANS).map(([key, plan]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setAssignData({...assignData, plan: key})}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        assignData.plan === key
                          ? 'border-orange-500 bg-orange-500/10'
                          : 'border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      <div className="text-xl mb-1">{plan.icon}</div>
                      <p className="text-white text-xs font-medium">{plan.name}</p>
                      <p className="text-orange-400 text-xs">₹{plan.price}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-gray-400 text-sm block mb-1">Duration</label>
                <select
                  value={assignData.duration_months}
                  onChange={(e) => setAssignData({...assignData, duration_months: Number(e.target.value)})}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 
                             focus:outline-none focus:border-orange-500"
                >
                  <option value={1}>1 Month — ₹{PLANS[assignData.plan]?.price}</option>
                  <option value={3}>3 Months — ₹{PLANS[assignData.plan]?.price * 3}</option>
                  <option value={6}>6 Months — ₹{PLANS[assignData.plan]?.price * 6}</option>
                  <option value={12}>12 Months — ₹{PLANS[assignData.plan]?.price * 12}</option>
                </select>
              </div>

              {/* Total price */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 text-center">
                <p className="text-gray-400 text-sm">Total Amount</p>
                <p className="text-orange-400 text-2xl font-bold">
                  ₹{PLANS[assignData.plan]?.price * assignData.duration_months}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
                >
                  Assign Plan ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
