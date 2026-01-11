import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
      const [formData, setFormData] = useState({ email: '', password: '' });
      const [error, setError] = useState('');
      const [loading, setLoading] = useState(false);
      const { login } = useAuth();
      const navigate = useNavigate();

      const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            setLoading(true);

            try {
                  await login(formData.email, formData.password);
                  navigate('/dashboard');
            } catch (err) {
                  setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
            } finally {
                  setLoading(false);
            }
      };

      const handleChange = (e) => {
            setFormData({ ...formData, [e.target.name]: e.target.value });
      };

      return (
            <div className="auth-container">
                  <div className="auth-background"></div>

                  <div className="auth-card glass-card fade-in">
                        <div className="auth-header">
                              <div className="auth-icon">✉️</div>
                              <h1>Welcome Back</h1>
                              <p>Sign in to your email automation dashboard</p>
                        </div>

                        {error && (
                              <div className="error-message">
                                    {error}
                              </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                              <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                          type="email"
                                          name="email"
                                          className="form-input"
                                          placeholder="you@example.com"
                                          required
                                          value={formData.email}
                                          onChange={handleChange}
                                    />
                              </div>

                              <div className="form-group">
                                    <label className="form-label">Password</label>
                                    <input
                                          type="password"
                                          name="password"
                                          className="form-input"
                                          placeholder="••••••••"
                                          required
                                          value={formData.password}
                                          onChange={handleChange}
                                    />
                              </div>

                              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                    {loading ? 'Signing in...' : 'Sign In'}
                              </button>
                        </form>

                        <div className="auth-footer">
                              <p>Don't have an account? <Link to="/register" className="auth-link">Sign up</Link></p>
                        </div>
                  </div>
            </div>
      );
}
