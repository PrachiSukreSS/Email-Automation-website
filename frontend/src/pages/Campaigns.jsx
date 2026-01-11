import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { campaignsAPI, templatesAPI, contactsAPI } from '../utils/api';
import './Contacts.css';

export default function Campaigns() {
      const [campaigns, setCampaigns] = useState([]);
      const [templates, setTemplates] = useState([]);
      const [contacts, setContacts] = useState([]);
      const [loading, setLoading] = useState(true);
      const [showModal, setShowModal] = useState(false);
      const [formData, setFormData] = useState({
            name: '',
            template_id: '',
            contact_ids: [],
            scheduled_at: ''
      });

      useEffect(() => {
            loadData();
      }, []);

      const loadData = async () => {
            try {
                  const [campaignsRes, templatesRes, contactsRes] = await Promise.all([
                        campaignsAPI.getAll(),
                        templatesAPI.getAll(),
                        contactsAPI.getAll()
                  ]);
                  setCampaigns(campaignsRes.data);
                  setTemplates(templatesRes.data);
                  setContacts(contactsRes.data);
            } catch (error) {
                  console.error('Failed to load data:', error);
            } finally {
                  setLoading(false);
            }
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                  await campaignsAPI.create(formData);
                  setFormData({ name: '', template_id: '', contact_ids: [], scheduled_at: '' });
                  setShowModal(false);
                  loadData();
            } catch (error) {
                  console.error('Failed to create campaign:', error);
                  alert('Failed to create campaign');
            }
      };

      const handleSend = async (id) => {
            if (!confirm('Are you sure you want to send this campaign now?')) return;

            try {
                  await campaignsAPI.send(id);
                  alert('Campaign is being sent!');
                  loadData();
            } catch (error) {
                  console.error('Failed to send campaign:', error);
                  alert('Failed to send campaign');
            }
      };

      const handleDelete = async (id) => {
            if (!confirm('Are you sure you want to delete this campaign?')) return;

            try {
                  await campaignsAPI.delete(id);
                  loadData();
            } catch (error) {
                  console.error('Failed to delete campaign:', error);
            }
      };

      return (
            <div className="app-container">
                  <Navbar />

                  <main className="page-content">
                        <div className="page-header">
                              <div>
                                    <h1>Campaigns</h1>
                                    <p className="subtitle">Create and manage your email campaigns</p>
                              </div>
                              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                    ➕ Create Campaign
                              </button>
                        </div>

                        {loading ? (
                              <div className="loading-container"><div className="spinner"></div></div>
                        ) : (
                              <div className="campaigns-container">
                                    {campaigns.map((campaign) => (
                                          <div key={campaign.id} className="campaign-card glass-card">
                                                <div className="campaign-header">
                                                      <h3>{campaign.name}</h3>
                                                      <span className={`badge badge-${campaign.status === 'completed' ? 'success' :
                                                                  campaign.status === 'failed' ? 'error' :
                                                                        campaign.status === 'sending' ? 'warning' : 'info'
                                                            }`}>
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
                                                      <div className="campaign-stat">
                                                            <span className="label">Clicked:</span>
                                                            <span className="value">{campaign.clicked_count}</span>
                                                      </div>
                                                </div>
                                                <div className="campaign-actions">
                                                      {campaign.status === 'draft' && (
                                                            <button className="btn btn-success" onClick={() => handleSend(campaign.id)}>
                                                                  📤 Send Now
                                                            </button>
                                                      )}
                                                      <button className="btn-delete" onClick={() => handleDelete(campaign.id)}>
                                                            🗑️ Delete
                                                      </button>
                                                </div>
                                          </div>
                                    ))}
                                    {campaigns.length === 0 && (
                                          <div className="empty-state glass-card">
                                                <p>No campaigns yet. Create your first campaign!</p>
                                          </div>
                                    )}
                              </div>
                        )}

                        {showModal && (
                              <div className="modal-overlay" onClick={() => setShowModal(false)}>
                                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                                          <h2>Create Campaign</h2>
                                          <form onSubmit={handleSubmit}>
                                                <div className="form-group">
                                                      <label className="form-label">Campaign Name *</label>
                                                      <input
                                                            type="text"
                                                            className="form-input"
                                                            required
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                      />
                                                </div>
                                                <div className="form-group">
                                                      <label className="form-label">Select Template *</label>
                                                      <select
                                                            className="form-select"
                                                            required
                                                            value={formData.template_id}
                                                            onChange={(e) => setFormData({ ...formData, template_id: parseInt(e.target.value) })}
                                                      >
                                                            <option value="">Choose a template...</option>
                                                            {templates.map((t) => (
                                                                  <option key={t.id} value={t.id}>{t.name}</option>
                                                            ))}
                                                      </select>
                                                </div>
                                                <div className="form-group">
                                                      <label className="form-label">Send to (leave empty for all contacts)</label>
                                                      <select
                                                            className="form-select"
                                                            multiple
                                                            value={formData.contact_ids}
                                                            onChange={(e) => setFormData({
                                                                  ...formData,
                                                                  contact_ids: Array.from(e.target.selectedOptions, opt => parseInt(opt.value))
                                                            })}
                                                            style={{ height: '150px' }}
                                                      >
                                                            {contacts.map((c) => (
                                                                  <option key={c.id} value={c.id}>{c.email}</option>
                                                            ))}
                                                      </select>
                                                      <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                                                            Hold Ctrl/Cmd to select multiple contacts
                                                      </small>
                                                </div>
                                                <div className="modal-actions">
                                                      <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                                            Cancel
                                                      </button>
                                                      <button type="submit" className="btn btn-primary">
                                                            Create Campaign
                                                      </button>
                                                </div>
                                          </form>
                                    </div>
                              </div>
                        )}
                  </main>
            </div>
      );
}
