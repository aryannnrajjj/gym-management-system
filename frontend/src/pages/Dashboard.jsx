import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import StatCard from '../components/ui/StatCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { Users, Calendar, CreditCard, Dumbbell, 
         TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats]         = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [myPlan, setMyPlan]       = useState(null);
  const [mySub, setMySub]         = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      if (user?.role !== 'member') {
        // Admin / Trainer dashboard
        const [membersRes, attendanceRes] = await Promise.all([
          API.get('/members/all'),
          API.get('/attendance/today'),
        ]);

        const totalMembers     = membersRes.data.length;
        const todayAttendance  = attendanceRes.data.length;
        const insideNow        = attendanceRes.data.filter(
          r => r.check_out_time === 'Still Inside'
        ).length;

        setStats({ totalMembers, todayAttendance, insideNow });
        setRecentActivity(attendanceRes.data.slice(0, 5));

      } else {
        // Member dashboard
        const [planRes, subRes] = await Promise.all([
          API.get('/workouts/my-plan').catch(() => ({ data: null })),
          API.get('/subscriptions/my-subscription').catch(() => ({ data: null })),
        ]);
        setMyPlan(planRes.data?.id ? planRes.data : null);
        setMySub(subRes.data?.plan ? subRes.data : null);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  // ── ADMIN / TRAINER VIEW ──
  if (user?.role !== 'member') {
    return (
      <div className="p-6 space-y-6">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', year: 'numeric', 
              month: 'long', day: 'numeric' 
            })}
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Members"    value={stats?.totalMembers}    icon={Users}       color="blue"   />
          <StatCard title="Today's Check-ins"value={stats?.todayAttendance} icon={Calendar}    color="green"  />
          <StatCard title="Inside Right Now" value={stats?.insideNow}       icon={TrendingUp}  color="orange" />
          <StatCard title="Workout Plans"    value="—"                      icon={Dumbbell}    color="purple" />
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Clock size={18} className="text-orange-400" />
              Today's Activity
            </h2>
            <span className="text-gray-500 text-sm">{stats?.todayAttendance} check-ins</span>
          </div>

          {recentActivity.length === 0 ? (
            <p className="text-gray-600 text-center py-6">Aaj koi attendance nahi</p>
          ) : (
            <div className="space-y-2">
              {recentActivity.map((record, i) => (
                <div key={i} className="flex items-center justify-between 
                                        bg-dark-bg rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-full 
                                    flex items-center justify-center">
                      <span className="text-orange-400 text-sm font-bold">
                        {record.member_name?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{record.member_name}</p>
                      <p className="text-gray-500 text-xs">Check-in: {record.check_in_time}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${
                    record.check_out_time === 'Still Inside'
                      ? 'bg-green-500/10 text-green-400 border-green-500/20'
                      : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                  }`}>
                    {record.check_out_time === 'Still Inside' ? '● Inside' : '✓ Left'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── MEMBER VIEW ──
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Hey, {user?.name?.split(' ')[0]}! 💪
        </h1>
        <p className="text-gray-500 mt-1">Here's your fitness overview</p>
      </div>

      {/* Subscription Status */}
      <div className={`card p-5 border ${
        mySub 
          ? mySub.days_left <= 7 
            ? 'border-red-500/30' 
            : 'border-green-500/30'
          : 'border-yellow-500/30'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-2.5 rounded-xl ${
            mySub ? 'bg-green-500/10' : 'bg-yellow-500/10'
          }`}>
            {mySub 
              ? <CheckCircle size={22} className={mySub.days_left <= 7 ? 'text-red-400' : 'text-green-400'} />
              : <AlertCircle size={22} className="text-yellow-400" />
            }
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold">
              {mySub ? `${mySub.plan.charAt(0).toUpperCase() + mySub.plan.slice(1)} Plan` : 'No Subscription'}
            </h3>
            {mySub ? (
              <p className={`text-sm mt-0.5 ${mySub.days_left <= 7 ? 'text-red-400' : 'text-gray-400'}`}>
                {mySub.days_left <= 7 
                  ? `⚠️ Only ${mySub.days_left} days left! Admin se contact karo.`
                  : `Valid till ${mySub.valid_till} (${mySub.days_left} days left)`
                }
              </p>
            ) : (
              <p className="text-yellow-400 text-sm mt-0.5">
                Admin se subscription lene ke liye contact karo
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'My Attendance', icon: Calendar, href: '/attendance', color: 'orange' },
          { label: 'Workout Plan',  icon: Dumbbell, href: '/workout',    color: 'purple' },
        ].map(item => (
          <a key={item.label} href={item.href}
             className="card p-5 flex flex-col items-center text-center gap-3 
                        hover:border-orange-500/40 hover:shadow-glow-sm group">
            <div className={`p-3 rounded-xl ${
              item.color === 'orange' ? 'bg-orange-500/10 group-hover:bg-orange-500/20' 
                                     : 'bg-purple-500/10 group-hover:bg-purple-500/20'
            } transition-colors`}>
              <item.icon size={24} className={
                item.color === 'orange' ? 'text-orange-400' : 'text-purple-400'
              } />
            </div>
            <p className="text-white font-medium text-sm">{item.label}</p>
          </a>
        ))}
      </div>

      {/* My Workout Plan Preview */}
      {myPlan && (
        <div className="card p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Dumbbell size={16} className="text-purple-400" />
            Your Workout Plan
          </h3>
          <p className="text-gray-400 font-medium">{myPlan.title}</p>
          <p className="text-gray-500 text-sm mt-1">
            {myPlan.exercises?.length} exercises • {myPlan.days_per_week} days/week
          </p>
          <a href="/workout"
             className="inline-block mt-3 text-orange-400 hover:text-orange-300 text-sm font-medium">
            View Full Plan →
          </a>
        </div>
      )}
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  if (h < 21) return 'Evening';
  return 'Night';   
}