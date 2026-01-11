import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
      const { user, logout } = useAuth();
      const location = useLocation();
      const navigate = useNavigate();

      const handleLogout = () => {
            logout();
            navigate('/login');
      };

      return (
            <nav className="navbar">
                  <div className="navbar-container">
                        <Link to="/dashboard" className="navbar-brand">
                              <span className="brand-icon">✉️</span>
                              <span className="brand-text">Email Automation</span>
                        </Link>

                        <div className="navbar-links">
                              <Link
                                    to="/dashboard"
                                    className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                              >
                                    Dashboard
                              </Link>
                              <Link
                                    to="/contacts"
                                    className={`nav-link ${location.pathname === '/contacts' ? 'active' : ''}`}
                              >
                                    Contacts
                              </Link>
                              <Link
                                    to="/templates"
                                    className={`nav-link ${location.pathname === '/templates' ? 'active' : ''}`}
                              >
                                    Templates
                              </Link>
                              <Link
                                    to="/campaigns"
                                    className={`nav-link ${location.pathname === '/campaigns' ? 'active' : ''}`}
                              >
                                    Campaigns
                              </Link>
                              <Link
                                    to="/analytics"
                                    className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}
                              >
                                    Analytics
                              </Link>
                        </div>

                        <div className="navbar-user">
                              <div className="user-info">
                                    <div className="user-avatar">{user?.full_name?.charAt(0) || 'U'}</div>
                                    <span className="user-name">{user?.full_name}</span>
                              </div>
                              <button onClick={handleLogout} className="btn-logout">
                                    Logout
                              </button>
                        </div>
                  </div>
            </nav>
      );
}
