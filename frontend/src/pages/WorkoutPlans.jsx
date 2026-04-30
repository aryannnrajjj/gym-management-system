import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { Dumbbell, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function WorkoutPlans() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null); // Kaun sa plan expand hai

  // Naya plan form ka state
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    days_per_week: 3,
    assigned_to: '',
    exercises: [{ name: '', sets: 3, reps: '10-12', rest_seconds: 60, notes: '' }]
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      // Member ke liye sirf apna plan, trainer/admin ke liye sab
      const endpoint = user?.role === 'member' ? '/workouts/my-plan' : '/workouts/all';
      const res = await API.get(endpoint);

      // Member ka response ek object hota hai, admin ka array
      if (user?.role === 'member') {
        setPlans(res.data.id ? [res.data] : []);
      } else {
        setPlans(res.data);
      }
    } catch (err) {
      toast.error('Workout plans load nahi hue!');
    } finally {
      setLoading(false);
    }
  };

  // Exercise row add karo form mein
  const addExercise = () => {
    setNewPlan({
      ...newPlan,
      exercises: [...newPlan.exercises, { name: '', sets: 3, reps: '10-12', rest_seconds: 60, notes: '' }]
    });
  };

  // Exercise row hatao
  const removeExercise = (index) => {
    const updated = newPlan.exercises.filter((_, i) => i !== index);
    setNewPlan({ ...newPlan, exercises: updated });
  };

  // Exercise field update karo
  const updateExercise = (index, field, value) => {
    const updated = [...newPlan.exercises];
    updated[index][field] = value;
    setNewPlan({ ...newPlan, exercises: updated });
  };

  // Workout plan submit karo
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/workouts/create', newPlan);
      toast.success('Workout plan create ho gaya! 💪');
      setShowForm(false);
      fetchPlans();
      // Form reset karo
      setNewPlan({
        title: '', description: '', days_per_week: 3, assigned_to: '',
        exercises: [{ name: '', sets: 3, reps: '10-12', rest_seconds: 60, notes: '' }]
      });
    }  catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' 
        ? detail 
        : 'Error creating plan! Check all fields.';
      toast.error(msg);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Workout Plans 🏋️</h1>

        {/* Sirf Trainer/Admin plan bana sakta hai */}
        {user?.role !== 'member' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <Plus size={18} />
            Create Plan
          </button>
        )}
      </div>

      {/* ─── CREATE PLAN FORM ─── */}
      {showForm && (
        <div className="bg-gym-card rounded-2xl p-6 border border-orange-500/30 mb-6">
          <h2 className="text-lg font-bold text-white mb-5">New Workout Plan</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Plan Title */}
            <input
              type="text"
              placeholder="Plan Title (e.g., Beginner Full Body)"
              value={newPlan.title}
              onChange={(e) => setNewPlan({...newPlan, title: e.target.value})}
              required
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 
                         focus:outline-none focus:border-orange-500"
            />

            {/* Description */}
            <textarea
              placeholder="Description (e.g., This plan is for beginners...)"
              value={newPlan.description}
              onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 
                         focus:outline-none focus:border-orange-500 resize-none"
            />

            {/* Days per week + Assign to */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm block mb-1">Days per week</label>
                <select
                  value={newPlan.days_per_week}
                  onChange={(e) => setNewPlan({...newPlan, days_per_week: Number(e.target.value)})}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 
                             focus:outline-none focus:border-orange-500"
                >
                  {[2,3,4,5,6].map(d => (
                    <option key={d} value={d}>{d} days</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-sm block mb-1">Assign to (Member ID)</label>
                <input
                  type="text"
                  placeholder="Optional"
                  value={newPlan.assigned_to}
                  onChange={(e) => setNewPlan({...newPlan, assigned_to: e.target.value})}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 
                             focus:outline-none focus:border-orange-500"
                />
              </div>
            </div>

            {/* ─── Exercises ─── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-white font-medium">Exercises</label>
                <button
                  type="button"
                  onClick={addExercise}
                  className="flex items-center gap-1 text-orange-400 hover:text-orange-300 text-sm"
                >
                  <Plus size={14} /> Add Exercise
                </button>
              </div>

              <div className="space-y-3">
                {newPlan.exercises.map((ex, index) => (
                  <div key={index} className="bg-gray-800 rounded-xl p-4 space-y-3">
                    {/* Exercise name */}
                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder={`Exercise ${index + 1} name`}
                        value={ex.name}
                        onChange={(e) => updateExercise(index, 'name', e.target.value)}
                        required
                        className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 
                                   focus:outline-none focus:border-orange-500 text-sm"
                      />
                      {/* Delete button — agar 1 se zyada exercises hain */}
                      {newPlan.exercises.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExercise(index)}
                          className="text-red-400 hover:text-red-300 p-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    {/* Sets, Reps, Rest */}
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-gray-500 text-xs">Sets</label>
                        <input
                          type="number"
                          value={ex.sets}
                          onChange={(e) => updateExercise(index, 'sets', Number(e.target.value))}
                          min={1} max={10}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 
                                     focus:outline-none focus:border-orange-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs">Reps</label>
                        <input
                          type="text"
                          placeholder="10-12"
                          value={ex.reps}
                          onChange={(e) => updateExercise(index, 'reps', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 
                                     focus:outline-none focus:border-orange-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-gray-500 text-xs">Rest (sec)</label>
                        <input
                          type="number"
                          value={ex.rest_seconds}
                          onChange={(e) => updateExercise(index, 'rest_seconds', Number(e.target.value))}
                          min={0}
                          className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 
                                     focus:outline-none focus:border-orange-500 text-sm"
                        />
                      </div>
                    </div>

                    {/* Notes */}
                    <input
                      type="text"
                      placeholder="Notes (optional)"
                      value={ex.notes}
                      onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 
                                 focus:outline-none focus:border-orange-500 text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Create Plan 💪
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── PLANS LIST ─── */}
      {loading ? (
        <div className="text-center text-orange-400 py-20">Loading plans... ⏳</div>
      ) : plans.length === 0 ? (
        <div className="text-center py-20">
          <Dumbbell size={64} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            {user?.role === 'member' ? "No plans assigned yet" : "Haven't created any plans yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-gym-card rounded-2xl border border-gray-700 overflow-hidden">
              
              {/* Plan Header — click karne pe expand hoga */}
              <button
                onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-800/50 transition-colors"
              >
                <div className="text-left">
                  <h3 className="text-white font-bold text-lg">{plan.title}</h3>
                  <p className="text-gray-400 text-sm mt-0.5">
                    {plan.days_per_week} days/week • {plan.exercises?.length || 0} exercises
                    {plan.trainer_name && ` • By ${plan.trainer_name}`}
                  </p>
                </div>
                {expandedPlan === plan.id
                  ? <ChevronUp className="text-orange-400" size={20} />
                  : <ChevronDown className="text-gray-400" size={20} />
                }
              </button>

              {/* Expanded — exercises list */}
              {expandedPlan === plan.id && (
                <div className="px-5 pb-5 border-t border-gray-700">
                  <p className="text-gray-400 text-sm my-4">{plan.description}</p>

                  <div className="space-y-2">
                    {plan.exercises?.map((ex, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3">
                        <div>
                          <p className="text-white font-medium text-sm">{ex.name}</p>
                          {ex.notes && <p className="text-gray-500 text-xs mt-0.5">{ex.notes}</p>}
                        </div>
                        <div className="flex gap-4 text-xs text-right">
                          <div>
                            <p className="text-orange-400 font-bold">{ex.sets}</p>
                            <p className="text-gray-500">sets</p>
                          </div>
                          <div>
                            <p className="text-orange-400 font-bold">{ex.reps}</p>
                            <p className="text-gray-500">reps</p>
                          </div>
                          <div>
                            <p className="text-orange-400 font-bold">{ex.rest_seconds}s</p>
                            <p className="text-gray-500">rest</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}