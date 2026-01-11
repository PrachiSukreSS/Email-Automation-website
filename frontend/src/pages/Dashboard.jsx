import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { dashboardAPI } from '../utils/api';
import './Dashboard.css';

export default function Dashboard() {
      const [stats, setStats] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            loadStats();
      }, []);

      const loadStats = async () => {
            try {
                  const response = await dashboardAPI.getStats();
                  setStats(response.data);
            } catch (error) {
                  console.error('Failed to load stats:', error);
            } finally {
                  setLoading(false);
            }
      };

      if (loading) {
            return (
                  <div className="app-container">
                        <Navbar />
                        <div className="loading-container">
                              <div className="spinner"></div>
                        </div>
                  </div>
            );
      }

      return (
            <div className="app-container">
                  <Navbar />

                  <main className="dashboard-content">
                        <div className="dashboard-header fade-in">
                              <h1>Dashboard</h1>
                              <p className="subtitle">Welcome to your email automation platform</p>
                        </div>

                        <div className="stats-grid grid grid-3 fade-in">
                              <div className="stat-card glass-card">
                                    <div className="stat-icon">👥</div>
                                    <div className="stat-info">
                                          <div className="stat-value">{stats?.total_contacts || 0}</div>
                                          <div className="stat-label">Total Contacts</div>
                                    </div>
                              </div>

                              <div className="stat-card glass-card">
                                    <div className="stat-icon">📧</div>
                                    <div className="stat-info">
                                          <div className="stat-value">{stats?.total_campaigns || 0}</div>
                                          <div className="stat-label">Campaigns</div>
                                    </div>
                              </div>

                              <div className="stat-card glass-card">
                                    <div className="stat-icon">📤</div>
                                    <div className="stat-info">
                                          <div className="stat-value">{stats?.total_emails_sent || 0}</div>
                                          <div className="stat-label">Emails Sent</div>
                                    </div>
                              </div>
                        </div>

                        <div className="recent-campaigns fade-in">
                              <h2>Recent Campaigns</h2>
                              {stats?.recent_campaigns && stats.recent_campaigns.length > 0 ? (
                                    <div className="campaigns-list">
                                          {stats.recent_campaigns.map((campaign) => (
                                                <div key={campaign.id} className="campaign-card glass-card">
                                                      <div className="campaign-header">
                                                            <h3>{campaign.name}</h3>
                                                            <span className={`badge badge-${campaign.status === 'completed' ? 'success' : campaign.status === 'failed' ? 'error' : 'info'}`}>
                                                                  {campaign.status}
                                                            </span>
                                                      </div>
                                                      <div className="campaign-stats">
                                                            <div className="campaign-stat">
                                                                  <span className="label">Recipients:</span>
                                                                  <span className="value">{campaign.recipient_count}</span>
                                                            </div>
                                                            <div className="campaign-stat">
                                                                  <span className="label">Sent:</span>
                                                                  <span className="value">{campaign.sent_count}</span>
                                                            </div>
                                                            <div className="campaign-stat">
                                                                  <span className="label">Opened:</span>
                                                                  <span className="value">{campaign.opened_count}</span>
                                                            </div>
                                                      </div>
                                                      <div className="campaign-date">
                                                            Created: {new Date(campaign.created_at).toLocaleDateString()}
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              ) : (
                                    <div className="empty-state glass-card">
                                          <p>No campaigns yet. Create your first campaign to get started!</p>
                                    </div>
                              )}
                        </div>
                  </main>
            </div>
      );
}
