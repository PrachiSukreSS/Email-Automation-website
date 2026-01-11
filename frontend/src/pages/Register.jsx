import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
      const [formData, setFormData] = useState({
            email: '',
            password: '',
            full_name: '',
            confirmPassword: ''
      });
      const [error, setError] = useState('');
      const [loading, setLoading] = useState(false);
      const { register } = useAuth();
      const navigate = useNavigate();

      const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');

            if (formData.password !== formData.confirmPassword) {
                  setError('Passwords do not match');
                  return;
            }

            if (formData.password.length < 6) {
                  setError('Password must be at least 6 characters');
                  return;
            }

            setLoading(true);

            try {
                  await register(formData.email, formData.password, formData.full_name);
                  navigate('/login');
            } catch (err) {
                  setError(err.response?.data?.detail || 'Registration failed. Please try again.');
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
                              <div className="auth-icon">🚀</div>
                              <h1>Get Started</h1>
                              <p>Create your email automation account</p>
                        </div>

                        {error && (
                              <div className="error-message">
                                    {error}
                              </div>
                        )}

                        <form onSubmit={handleSubmit} className="auth-form">
                              <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                          type="text"
                                          name="full_name"
                                          className="form-input"
                                          placeholder="John Doe"
                                          required
                                          value={formData.full_name}
                                          onChange={handleChange}
                                    />
                              </div>

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

                              <div className="form-group">
                                    <label className="form-label">Confirm Password</label>
                                    <input
                                          type="password"
                                          name="confirmPassword"
                                          className="form-input"
                                          placeholder="••••••••"
                                          required
                                          value={formData.confirmPassword}
                                          onChange={handleChange}
                                    />
                              </div>

                              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                                    {loading ? 'Creating account...' : 'Create Account'}
                              </button>
                        </form>

                        <div className="auth-footer">
                              <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
                        </div>
                  </div>
            </div>
      );
}
