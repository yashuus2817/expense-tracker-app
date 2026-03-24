import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPwd, setShowPwd] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-panel" style={{ width: '400px' }}>
                <div className="text-center mb-4">
                    <h2 className="text-accent">Welcome Back</h2>
                    <p>Login to SmartExpense+</p>
                </div>
                {error && <div className="text-danger mb-4 text-center">{error}</div>}
                
                <form onSubmit={onSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input 
                            className="form-control" 
                            type="email" 
                            required 
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input 
                            className="form-control" 
                            type={showPwd ? "text" : "password"} 
                            required 
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                        />
                        <div className="pwd-toggle" onClick={() => setShowPwd(!showPwd)}>
                            {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-full mt-4">
                        <LogIn size={20} /> Login
                    </button>
                    
                    <div className="text-center mt-4">
                        <p>Don't have an account? <Link to="/register" className="text-accent" style={{textDecoration: 'none'}}>Register</Link></p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
