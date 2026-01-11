import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { campaignsAPI } from '../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Contacts.css';

export default function Analytics() {
      const [campaigns, setCampaigns] = useState([]);
      const [selectedCampaign, setSelectedCampaign] = useState(null);
      const [analytics, setAnalytics] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            loadCampaigns();
      }, []);

      useEffect(() => {
            if (selectedCampaign) {
                  loadAnalytics(selectedCampaign);
            }
      }, [selectedCampaign]);

      const loadCampaigns = async () => {
            try {
                  const response = await campaignsAPI.getAll();
                  setCampaigns(response.data);
                  if (response.data.length > 0) {
                        setSelectedCampaign(response.data[0].id);
                  }
            } catch (error) {
                  console.error('Failed to load campaigns:', error);
            } finally {
                  setLoading(false);
            }
      };

      const loadAnalytics = async (campaignId) => {
            try {
                  const response = await campaignsAPI.getAnalytics(campaignId);
                  setAnalytics(response.data);
            } catch (error) {
                  console.error('Failed to load analytics:', error);
            }
      };

      const chartData = analytics ? [
            { name: 'Sent', value: analytics.sent_count },
            { name: 'Delivered', value: analytics.delivered_count },
            { name: 'Opened', value: analytics.opened_count },
            { name: 'Clicked', value: analytics.clicked_count },
            { name: 'Failed', value: analytics.failed_count },
      ] : [];

      return (
            <div className="app-container">
                  <Navbar />

                  <main className="page-content">
                        <div className="page-header">
                              <div>
                                    <h1>Analytics</h1>
                                    <p className="subtitle">Track your campaign performance</p>
                              </div>
                        </div>

                        {loading ? (
                              <div className="loading-container"><div className="spinner"></div></div>
                        ) : campaigns.length === 0 ? (
                              <div className="empty-state glass-card">
                                    <p>No campaigns to analyze yet.</p>
                              </div>
                        ) : (
                              <>
                                    <div className="analytics-selector glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
                                          <label className="form-label">Select Campaign</label>
                                          <select
                                                className="form-select"
                                                value={selectedCampaign || ''}
                                                onChange={(e) => setSelectedCampaign(parseInt(e.target.value))}
                                          >
                                                {campaigns.map((c) => (
                                                      <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                          </select>
                                    </div>

                                    {analytics && (
                                          <>
                                                <div className="analytics-stats grid grid-4" style={{ marginBottom: '2rem' }}>
                                                      <div className="stat-card glass-card">
                                                            <div className="stat-value">{analytics.total_recipients}</div>
                                                            <div className="stat-label">Total Recipients</div>
                                                      </div>
                                                      <div className="stat-card glass-card">
                                                            <div className="stat-value">{analytics.open_rate}%</div>
                                                            <div className="stat-label">Open Rate</div>
                                                      </div>
                                                      <div className="stat-card glass-card">
                                                            <div className="stat-value">{analytics.click_rate}%</div>
                                                            <div className="stat-label">Click Rate</div>
                                                      </div>
                                                      <div className="stat-card glass-card">
                                                            <div className="stat-value">{analytics.delivery_rate}%</div>
                                                            <div className="stat-label">Delivery Rate</div>
                                                      </div>
                                                </div>

                                                <div className="analytics-chart glass-card" style={{ padding: '2rem' }}>
                                                      <h2 style={{ marginBottom: '2rem' }}>Campaign Performance</h2>
                                                      <ResponsiveContainer width="100%" height={400}>
                                                            <BarChart data={chartData}>
                                                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                                                  <XAxis dataKey="name" stroke="var(--text-secondary)" />
                                                                  <YAxis stroke="var(--text-secondary)" />
                                                                  <Tooltip
                                                                        contentStyle={{
                                                                              background: 'var(--bg-tertiary)',
                                                                              border: '1px solid rgba(255,255,255,0.1)',
                                                                              borderRadius: 'var(--radius-sm)'
                                                                        }}
                                                                  />
                                                                  <Legend />
                                                                  <Bar dataKey="value" fill="url(#colorGradient)" />
                                                                  <defs>
                                                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                                                              <stop offset="5%" stopColor="var(--primary-start)" stopOpacity={0.8} />
                                                                              <stop offset="95%" stopColor="var(--primary-end)" stopOpacity={0.8} />
                                                                        </linearGradient>
                                                                  </defs>
                                                            </BarChart>
                                                      </ResponsiveContainer>
                                                </div>
                                          </>
                                    )}
                              </>
                        )}
                  </main>
            </div>
      );
}
