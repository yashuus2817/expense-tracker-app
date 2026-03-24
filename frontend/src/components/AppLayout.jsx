import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Target, PieChart, Power, Settings, Sun, Moon } from 'lucide-react';

const AppLayout = ({ children }) => {
  const { user, login, logout, toggleTheme } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <div>
          <h2 style={{ marginBottom: '32px' }}>Smart<span className="text-accent">Expense+</span></h2>
          <div className="flex align-center gap-4 mb-4">
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent-main), var(--warning))' }}></div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>{user?.email}</p>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, marginTop: '24px' }}>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Link to="/" className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none', textAlign: 'left' }}>
              <LayoutDashboard size={20} /> Dashboard
            </Link>
            <button className="btn btn-outline" style={{ justifyContent: 'flex-start', border: 'none', textAlign: 'left', width: '100%' }} onClick={() => setShowProfile(true)}>
              <Settings size={20} /> Profile
            </button>
          </nav>
        </div>

        <div>
          <button className="btn btn-outline w-full mb-4" onClick={toggleTheme} style={{ display: 'flex', justifyContent: 'space-between' }}>
            {user?.theme === 'light' ? (
              <><Moon size={20} /> Dark Mode</>
            ) : (
              <><Sun size={20} /> Light Mode</>
            )}
          </button>
          <button className="btn btn-danger w-full" onClick={handleLogout}>
            <Power size={20} /> Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        {children}
      </div>

      {showProfile && (
        <div className="modal-overlay" onClick={() => setShowProfile(false)}>
          <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="text-accent mb-4">Personal Profile</h2>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-control" type="text" value={user?.name || ''} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-control" type="email" value={user?.email || ''} readOnly />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number</label>
              <input className="form-control" type="text" value={user?.mobileNumber || ''} readOnly />
            </div>
            <button className="btn btn-outline w-full mt-4" onClick={() => setShowProfile(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
