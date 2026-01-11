import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { contactsAPI } from '../utils/api';
import './Contacts.css';

export default function Contacts() {
      const [contacts, setContacts] = useState([]);
      const [loading, setLoading] = useState(true);
      const [showModal, setShowModal] = useState(false);
      const [formData, setFormData] = useState({ email: '', first_name: '', last_name: '', company: '' });
      const fileInputRef = useRef(null);

      useEffect(() => {
            loadContacts();
      }, []);

      const loadContacts = async () => {
            try {
                  const response = await contactsAPI.getAll();
                  setContacts(response.data);
            } catch (error) {
                  console.error('Failed to load contacts:', error);
            } finally {
                  setLoading(false);
            }
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                  await contactsAPI.create(formData);
                  setFormData({ email: '', first_name: '', last_name: '', company: '' });
                  setShowModal(false);
                  loadContacts();
            } catch (error) {
                  console.error('Failed to create contact:', error);
                  alert('Failed to create contact');
            }
      };

      const handleFileUpload = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                  const response = await contactsAPI.bulkImport(file);
                  alert(`Imported ${response.data.imported} contacts, skipped ${response.data.skipped}`);
                  loadContacts();
            } catch (error) {
                  console.error('Failed to import contacts:', error);
                  alert('Failed to import contacts');
            }
      };

      const handleDelete = async (id) => {
            if (!confirm('Are you sure you want to delete this contact?')) return;

            try {
                  await contactsAPI.delete(id);
                  loadContacts();
            } catch (error) {
                  console.error('Failed to delete contact:', error);
            }
      };

      return (
            <div className="app-container">
                  <Navbar />

                  <main className="page-content">
                        <div className="page-header">
                              <div>
                                    <h1>Contacts</h1>
                                    <p className="subtitle">Manage your email recipients</p>
                              </div>
                              <div className="page-actions">
                                    <button
                                          className="btn btn-secondary"
                                          onClick={() => fileInputRef.current?.click()}
                                    >
                                          📥 Import CSV/Excel
                                    </button>
                                    <button
                                          className="btn btn-primary"
                                          onClick={() => setShowModal(true)}
                                    >
                                          ➕ Add Contact
                                    </button>
                                    <input
                                          ref={fileInputRef}
                                          type="file"
                                          accept=".csv,.xlsx,.xls"
                                          style={{ display: 'none' }}
                                          onChange={handleFileUpload}
                                    />
                              </div>
                        </div>

                        {loading ? (
                              <div className="loading-container"><div className="spinner"></div></div>
                        ) : (
                              <div className="table-container glass-card">
                                    <table className="table">
                                          <thead>
                                                <tr>
                                                      <th>Email</th>
                                                      <th>Name</th>
                                                      <th>Company</th>
                                                      <th>Created</th>
                                                      <th>Actions</th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {contacts.map((contact) => (
                                                      <tr key={contact.id}>
                                                            <td>{contact.email}</td>
                                                            <td>{`${contact.first_name || ''} ${contact.last_name || ''}`.trim() || '-'}</td>
                                                            <td>{contact.company || '-'}</td>
                                                            <td>{new Date(contact.created_at).toLocaleDateString()}</td>
                                                            <td>
                                                                  <button
                                                                        className="btn-delete"
                                                                        onClick={() => handleDelete(contact.id)}
                                                                  >
                                                                        🗑️
                                                                  </button>
                                                            </td>
                                                      </tr>
                                                ))}
                                          </tbody>
                                    </table>
                                    {contacts.length === 0 && (
                                          <div className="empty-table">
                                                <p>No contacts yet. Add your first contact to get started!</p>
                                          </div>
                                    )}
                              </div>
                        )}

                        {showModal && (
                              <div className="modal-overlay" onClick={() => setShowModal(false)}>
                                    <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                                          <h2>Add New Contact</h2>
                                          <form onSubmit={handleSubmit}>
                                                <div className="form-group">
                                                      <label className="form-label">Email *</label>
                                                      <input
                                                            type="email"
                                                            className="form-input"
                                                            required
                                                            value={formData.email}
                                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                      />
                                                </div>
                                                <div className="form-group">
                                                      <label className="form-label">First Name</label>
                                                      <input
                                                            type="text"
                                                            className="form-input"
                                                            value={formData.first_name}
                                                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                                      />
                                                </div>
                                                <div className="form-group">
                                                      <label className="form-label">Last Name</label>
                                                      <input
                                                            type="text"
                                                            className="form-input"
                                                            value={formData.last_name}
                                                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                                      />
                                                </div>
                                                <div className="form-group">
                                                      <label className="form-label">Company</label>
                                                      <input
                                                            type="text"
                                                            className="form-input"
                                                            value={formData.company}
                                                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                                      />
                                                </div>
                                                <div className="modal-actions">
                                                      <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                                            Cancel
                                                      </button>
                                                      <button type="submit" className="btn btn-primary">
                                                            Create Contact
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
