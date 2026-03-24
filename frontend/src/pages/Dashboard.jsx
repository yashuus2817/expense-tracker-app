import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, Mic, MessageSquare, Trash2, TrendingUp, Target } from 'lucide-react';

const COLORS = ['#1e3a8a', '#4c1d95', '#831843', '#78350f', '#064e3b', '#7f1d1d', '#164e63'];

const Dashboard = () => {
    const { api } = useContext(AuthContext);
    const [stats, setStats] = useState(null);
    const [expenses, setExpenses] = useState([]);
    const [goals, setGoals] = useState([]);
    const [aiInsight, setAiInsight] = useState('');
    const [showSmsModal, setShowSmsModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showGoalModal, setShowGoalModal] = useState(false);
    
    // New Expense Form State
    const [form, setForm] = useState({ amount: '', category: 'Food', notes: '', date: new Date().toISOString().split('T')[0], isRecurring: false });
    const [goalForm, setGoalForm] = useState({ title: '', targetAmount: '', deadline: new Date().toISOString().split('T')[0] });
    const [smsText, setSmsText] = useState('');
    const [loadingSms, setLoadingSms] = useState(false);
    const [isListening, setIsListening] = useState(false);

    useEffect(() => {
        fetchData();
        fetchAiInsights();
    }, []);

    const fetchData = async () => {
        try {
            const [statsRes, expensesRes, goalsRes] = await Promise.all([
                api.get('/expenses/stats'),
                api.get('/expenses'),
                api.get('/goals')
            ]);
            setStats(statsRes.data.data);
            setExpenses(expensesRes.data.data);
            setGoals(goalsRes.data.data);
        } catch (error) {
            console.error('Error fetching data', error);
        }
    };

    const fetchAiInsights = async () => {
        try {
            const res = await api.get('/ai/insights');
            setAiInsight(res.data.data);
        } catch (error) {
            console.error('AI insight failed', error);
        }
    };

    const handleDelete = async (id) => {
        await api.delete(`/expenses/${id}`);
        fetchData();
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        await api.post('/expenses', form);
        setShowAddModal(false);
        fetchData();
        setForm({ amount: '', category: 'Food', notes: '', date: new Date().toISOString().split('T')[0], isRecurring: false });
    };

    const handleAddGoal = async (e) => {
        e.preventDefault();
        await api.post('/goals', goalForm);
        setShowGoalModal(false);
        fetchData();
        setGoalForm({ title: '', targetAmount: '', deadline: new Date().toISOString().split('T')[0] });
    };

    const handleSmsSubmit = async (e) => {
        e.preventDefault();
        setLoadingSms(true);
        try {
            const res = await api.post('/ai/parse-sms', { smsText });
            setForm(res.data.data);
            setShowSmsModal(false);
            setShowAddModal(true);
        } catch (err) {
            console.error('SMS parse failed');
        } finally {
            setLoadingSms(false);
        }
    };

    const startVoiceInput = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert("Your browser does not support speech recognition.");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.start();
        setIsListening(true);

        recognition.onresult = (event) => {
            const speechResult = event.results[0][0].transcript;
            setForm({ ...form, notes: speechResult });
            setIsListening(false);
            setShowAddModal(true);
        };

        recognition.onspeechend = () => {
            recognition.stop();
            setIsListening(false);
        };
    };

    // Prepare chart data
    const pieData = stats?.categoryTotals ? Object.keys(stats.categoryTotals).map((key) => ({
        name: key, value: stats.categoryTotals[key]
    })) : [];

    return (
        <div>
            <div className="flex justify-between align-center mb-4">
                <h1>Overview</h1>
                <div className="flex gap-4">
                    <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><Plus size={18}/> Add</button>
                    <button className="btn btn-outline" onClick={() => setShowSmsModal(true)}><MessageSquare size={18}/> SMS Parse</button>
                    <button className={`btn ${isListening ? 'btn-danger' : 'btn-outline'}`} onClick={startVoiceInput}><Mic size={18}/> {isListening ? 'Listening...' : 'Voice'}</button>
                </div>
            </div>

            {aiInsight && (
                <div className="glass-panel mb-4" style={{ borderColor: 'var(--accent-main)', borderLeftWidth: '4px' }}>
                    <div className="flex align-center gap-2 mb-2">
                        <TrendingUp className="text-accent" />
                        <h4 style={{ margin: 0 }}>AI Spending Advisor</h4>
                    </div>
                    <p style={{ margin: 0, color: 'var(--text-primary)' }}>{aiInsight}</p>
                </div>
            )}

            <div className="flex gap-4 mb-4">
                <div className="glass-panel" style={{ flex: 1 }}>
                    <h3>This Month</h3>
                    <h2 className="text-accent">₹ {stats?.totalAmount || 0}</h2>
                </div>
                <div className="glass-panel" style={{ flex: 2, height: '300px' }}>
                    <h3>Expenses by Category</h3>
                    {pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" stroke="none">
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : <p>No data yet</p>}
                </div>
            </div>

            <div className="flex gap-4 mb-4">
                <div className="glass-panel" style={{ flex: 2 }}>
                    <h3>Recent Transactions</h3>
                    {expenses.length === 0 ? <p>No expenses added.</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {expenses.slice(0, 5).map(exp => (
                                <div key={exp._id} className="flex justify-between align-center p-3" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '16px' }}>
                                    <div>
                                        <h4 style={{ margin: 0 }}>{exp.category} {exp.isRecurring && <span className="text-warning text-xs ml-2">(Auto/Recur)</span>}</h4>
                                        <small style={{ color: 'var(--text-secondary)' }}>{exp.notes} • {new Date(exp.date).toLocaleDateString()}</small>
                                    </div>
                                    <div className="flex align-center gap-4">
                                        <h3 style={{ margin: 0 }}>₹{exp.amount}</h3>
                                        <button className="btn btn-danger" style={{ padding: '8px' }} onClick={() => handleDelete(exp._id)}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="glass-panel" style={{ flex: 1 }}>
                    <div className="flex justify-between align-center mb-4">
                        <h3 style={{ margin: 0 }}>Saving Goals</h3>
                        <div className="flex gap-2">
                            <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => setShowGoalModal(true)}><Plus size={16} /></button>
                            <Target className="text-accent" />
                        </div>
                    </div>
                    {goals.length === 0 ? <p>No active goals.</p> : goals.map(g => {
                        const percent = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
                        return (
                            <div key={g._id} className="mb-4">
                                <div className="flex justify-between">
                                    <span style={{ fontWeight: 600 }}>{g.title}</span>
                                    <span>₹{g.currentAmount} / ₹{g.targetAmount}</span>
                                </div>
                                <div className="progress-bg">
                                    <div className="progress-fill" style={{ width: `${percent}%` }}></div>
                                </div>
                                <small style={{ color: 'var(--text-secondary)' }}>Due: {new Date(g.deadline).toLocaleDateString()}</small>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Modals Overlay */}
            {(showAddModal || showSmsModal || showGoalModal) && (
                <div className="modal-overlay" onClick={() => {setShowAddModal(false); setShowSmsModal(false); setShowGoalModal(false);}}>
                    <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
                        
                        {showGoalModal && (
                            <form onSubmit={handleAddGoal}>
                                <h2 className="mb-4">Add Saving Goal</h2>
                                <div className="form-group">
                                    <label className="form-label">Goal Title (e.g., iPhone)</label>
                                    <input className="form-control" type="text" required value={goalForm.title} onChange={e => setGoalForm({...goalForm, title: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Target Amount (₹)</label>
                                    <input className="form-control" type="number" required value={goalForm.targetAmount} onChange={e => setGoalForm({...goalForm, targetAmount: Number(e.target.value)})} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Deadline</label>
                                    <input className="form-control" type="date" required value={goalForm.deadline} onChange={e => setGoalForm({...goalForm, deadline: e.target.value})} />
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={() => setShowGoalModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{flex: 1}}>Save</button>
                                </div>
                            </form>
                        )}
                        
                        {showAddModal && (
                            <form onSubmit={handleAddExpense}>
                                <h2 className="mb-4">Add Expense</h2>
                                <div className="form-group">
                                    <label className="form-label">Amount (₹)</label>
                                    <input className="form-control" type="number" required value={form.amount} onChange={e => setForm({...form, amount: Number(e.target.value)})} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category</label>
                                    <select className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                        <option>Food</option>
                                        <option>Travel</option>
                                        <option>Books</option>
                                        <option>Shopping</option>
                                        <option>Others</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Date</label>
                                    <input className="form-control" type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Notes</label>
                                    <input className="form-control" type="text" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                                </div>
                                <div className="flex justify-between align-center mb-4">
                                    <label className="form-label" style={{margin:0}}>Recurring Auto-Detect flag</label>
                                    <input type="checkbox" style={{width: '20px', height: '20px'}} checked={form.isRecurring} onChange={e => setForm({...form, isRecurring: e.target.checked})} />
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={() => setShowAddModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{flex: 1}}>Save</button>
                                </div>
                            </form>
                        )}

                        {showSmsModal && (
                            <form onSubmit={handleSmsSubmit}>
                                <h2 className="mb-4 text-accent">AI SMS Scanner</h2>
                                <p className="mb-4">Paste your bank SMS here. AI will extract merchant, amount, category and date automatically.</p>
                                <div className="form-group">
                                    <textarea className="form-control" rows="5" placeholder="E.g. Spent ₹500 at Zomato using card XX89..." value={smsText} onChange={e => setSmsText(e.target.value)} required></textarea>
                                </div>
                                <div className="flex gap-4 mt-4">
                                    <button type="button" className="btn btn-outline" style={{flex: 1}} onClick={() => setShowSmsModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" style={{flex: 1}} disabled={loadingSms}>
                                        {loadingSms ? 'Analyzing...' : 'Parse & Add'}
                                    </button>
                                </div>
                            </form>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
