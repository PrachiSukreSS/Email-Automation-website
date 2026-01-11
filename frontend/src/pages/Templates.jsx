import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { templatesAPI } from '../utils/api';
import './Contacts.css';

export default function Templates() {
      const [templates, setTemplates] = useState([]);
      const [loading, setLoading] = useState(true);
      const [showModal, setShowModal] = useState(false);
      const [formData, setFormData] = useState({
            name: '',
            subject: '',
            body: '',
            placeholders: []
      });

      useEffect(() => {
            loadTemplates();
      }, []);

      const loadTemplates = async () => {
            try {
                  const response = await templatesAPI.getAll();
                  setTemplates(response.data);
            } catch (error) {
                  console.error('Failed to load templates:', error);
            } finally {
                  setLoading(false);
            }
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                  await templatesAPI.create(formData);
                  setFormData({ name: '', subject: '', body: '', placeholders: [] });
                  setShowModal(false);
                  loadTemplates();
            } catch (error) {
                  console.error('Failed to create template:', error);
                  alert('Failed to create template');
            }
      };

      const handleDelete = async (id) => {
            if (!confirm('Are you sure you want to delete this template?')) return;

            try {
                  await templatesAPI.delete(id);
                  loadTemplates();
            } catch (error) {
                  console.error('Failed to delete template:', error);
            }
      };

      return (
            <div className="app-container">
                  <Navbar />

                  <main className="page-content">
                        <div className="page-header">
                              <div>
                                    <h1>Email Templates</h1>
                                    <p className="subtitle">Create reusable email templates with placeholders</p>
                              </div>
                              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                                    ➕ Create Template
                              </button>
                        </div>

                        {loading ? (
                              <div className="loading-container"><div className="spinner"></div></div>
                        ) : (
                              <div className="template-grid grid grid-2">
                                    {templates.map((template) => (
                                          <div key={template.id} className="template-card glass-card">
                                                <div className="template-header">
                                                      <h3>{template.name}</h3>
                                                      <button className="btn-delete" onClick={() => handleDelete(template.id)}>
                                                            🗑️
                                                      </button>
                                                </div>
                                                <div className="template-subject">
                                                      <strong>Subject:</strong> {template.subject}
                                                </div>
                                                <div className="template-body">
                                                      {template.body.substring(0, 200)}
                                                      {template.body.length > 200 && '...'}
                                                </div>
                                                {template.placeholders && template.placeholders.length > 0 && (
                                                      <div className="template-placeholders">
                                                            <strong>Placeholders:</strong> {template.placeholders.join(', ')}
                                                      </div>
                                                )}
                                                <div className="template-date">
                                                      Created: {new Date(template.created_at).toLocaleDateString()}
                                                </div>
                                          </div>
                                    ))}
                                    {templates.length === 0 && (
                                          <div className="empty-state glass-card" style={{ gridColumn: '1 / -1' }}>
                                                <p>No templates yet. Create your first template!</p>
                                          </div>
                                    )}
                              </div>
                        )}

                        {showModal && (
                              <div className="modal-overlay" onClick={() => setShowModal(false)}>
                                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                                          <h2>Create Email Template</h2>
                                          <form onSubmit={handleSubmit}>
                                                <div className="form-group">
                                                      <label className="form-label">Template Name *</label>
                                                      <input
                                                            type="text"
                                                            className="form-input"
                                                            required
                                                            value={formData.name}
                                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                      />
                                                </div>
                                                <div className="form-group">
                                                      <label className="form-label">Subject *</label>
                                                      <input
                                                            type="text"
                                                            className="form-input"
                                                            required
                                                            placeholder="Use {{name}} for placeholders"
                                                            value={formData.subject}
                                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                      />
                                                </div>
                                                <div className="form-group">
                                                      <label className="form-label">Email Body *</label>
                                                      <textarea
                                                            className="form-textarea"
                                                            required
                                                            placeholder="Use {{name}}, {{email}} for placeholders"
                                                            value={formData.body}
                                                            onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                                                      />
                                                </div>
                                                <div className="form-group">
                                                      <label className="form-label">Placeholders (comma-separated)</label>
                                                      <input
                                                            type="text"
                                                            className="form-input"
                                                            placeholder="name, email, company"
                                                            value={formData.placeholders.join(', ')}
                                                            onChange={(e) => setFormData({
                                                                  ...formData,
                                                                  placeholders: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                                            })}
                                                      />
                                                </div>
                                                <div className="modal-actions">
                                                      <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                                            Cancel
                                                      </button>
                                                      <button type="submit" className="btn btn-primary">
                                                            Create Template
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
