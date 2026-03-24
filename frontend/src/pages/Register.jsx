import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

const Register = () => {
    const { register } = useContext(AuthContext);
    const [formData, setFormData] = useState({ name: '', mobileNumber: '', email: '', password: '', confirmPassword: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div className="glass-panel" style={{ width: '450px' }}>
                <div className="text-center mb-4">
                    <h2 className="text-accent">Create Account</h2>
                    <p>Join SmartExpense+ and save smartly</p>
                </div>
                {error && <div className="text-danger mb-4 text-center">{error}</div>}
                
                <form onSubmit={onSubmit}>
                    <div className="form-group mb-4">
                        <label className="form-label">Full Name</label>
                        <input className="form-control" type="text" required onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Mobile Number</label>
                        <input className="form-control" type="text" pattern="\d{10}" title="10 digit number" required onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})} />
                    </div>

                    <div className="form-group mb-4">
                        <label className="form-label">Email Address</label>
                        <input className="form-control" type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    
                    <div className="flex gap-4 mb-4">
                        <div className="form-group" style={{ flex: 1, margin: 0 }}>
                            <label className="form-label">Password</label>
                            <input className="form-control" type={showPwd ? "text" : "password"} required onChange={(e) => setFormData({...formData, password: e.target.value})} />
                            <div className="pwd-toggle" onClick={() => setShowPwd(!showPwd)} style={{ top: '35px' }}>
                                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                            </div>
                        </div>

                        <div className="form-group" style={{ flex: 1, margin: 0 }}>
                            <label className="form-label">Confirm Password</label>
                            <input className="form-control" type={showPwd ? "text" : "password"} required onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4">
                        <UserPlus size={20} /> Register
                    </button>
                    
                    <div className="text-center mt-4">
                        <p>Already have an account? <Link to="/login" className="text-accent" style={{textDecoration: 'none'}}>Login</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
