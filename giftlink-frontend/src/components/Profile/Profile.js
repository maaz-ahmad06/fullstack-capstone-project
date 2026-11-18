import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config';
import './Profile.css';

const CATEGORIES = ['Living', 'Bedroom', 'Kitchen', 'Electronics', 'Books', 'Toys', 'Music', 'Sports', 'Home Decor'];
const CONDITIONS = ['Like New', 'Good', 'Fair'];
const STATUSES = ['Available', 'Pending', 'Claimed'];

function Profile() {
  const { isLoggedIn, userEmail, userName, login } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('details');

  // Personal Details state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // My Listed Gifts state
  const [myGifts, setMyGifts] = useState([]);
  const [giftsLoading, setGiftsLoading] = useState(false);
  const [giftsMsg, setGiftsMsg] = useState('');
  const [giftsError, setGiftsError] = useState('');

  // Edit Gift Modal state
  const [editingGift, setEditingGift] = useState(null);
  const [editSaving, setEditSaving] = useState(false);

  // Requests state (Incoming & Sent)
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestsMsg, setRequestsMsg] = useState('');
  const [requestsError, setRequestsError] = useState('');
  const [updatingReqId, setUpdatingReqId] = useState(null);

  useEffect(() => {
    setEmail(userEmail || sessionStorage.getItem('email') || '');
    if (userName) {
      const parts = userName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [userEmail, userName]);

  useEffect(() => {
    if (isLoggedIn) {
      fetchMyGifts();
      fetchRequests();
    }
  }, [isLoggedIn]);

  const fetchMyGifts = async () => {
    setGiftsLoading(true);
    setGiftsError('');
    try {
      const token = sessionStorage.getItem('auth-token');
      const res = await fetch(`${API_BASE_URL}/api/gifts/my-gifts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setMyGifts(data);
      } else {
        const errData = await res.json();
        setGiftsError(errData.error || 'Could not load your listed gifts.');
      }
    } catch (err) {
      setGiftsError('Network error while loading your gifts.');
    } finally {
      setGiftsLoading(false);
    }
  };

  const fetchRequests = async () => {
    setRequestsLoading(true);
    setRequestsError('');
    try {
      const token = sessionStorage.getItem('auth-token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [recvRes, sentRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/requests/received`, { headers }),
        fetch(`${API_BASE_URL}/api/requests/sent`, { headers })
      ]);

      if (recvRes.ok) {
        setReceivedRequests(await recvRes.json());
      }
      if (sentRes.ok) {
        setSentRequests(await sentRes.json());
      }
    } catch (err) {
      setRequestsError('Network error while loading gift requests.');
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleRequestAction = async (reqId, newStatus) => {
    setUpdatingReqId(reqId);
    setRequestsError('');
    setRequestsMsg('');

    try {
      const token = sessionStorage.getItem('auth-token');
      const res = await fetch(`${API_BASE_URL}/api/requests/${reqId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update request status.');
      }

      setRequestsMsg(`Request ${newStatus.toLowerCase()} successfully!`);
      // Refresh both incoming requests and listed gifts so statuses stay synced
      await Promise.all([fetchRequests(), fetchMyGifts()]);
    } catch (err) {
      setRequestsError(err.message || 'Could not update request.');
    } finally {
      setUpdatingReqId(null);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    setErrorMsg('');

    try {
      const token = sessionStorage.getItem('auth-token');
      const res = await fetch(`${API_BASE_URL}/api/auth/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          address: address.trim()
        })
      });

      const data = await res.json();
      if (res.ok) {
        const updatedFullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        if (updatedFullName && token) {
          login(token, email, updatedFullName);
        }
        setMsg('Profile updated successfully!');
      } else {
        setErrorMsg(data.error || 'Failed to update profile');
      }
    } catch (err) {
      setErrorMsg('Network error while updating profile.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (gift) => {
    setGiftsMsg('');
    setGiftsError('');
    setEditingGift({
      id: gift.id || gift._id,
      name: gift.name || '',
      category: gift.category || 'Living',
      condition: gift.condition || 'Good',
      age_years: gift.age_years ?? 1,
      zipcode: gift.zipcode || '',
      image: gift.image || '',
      description: gift.description || '',
      status: gift.status || 'Available'
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingGift) return;
    setEditSaving(true);
    setGiftsError('');
    setGiftsMsg('');

    try {
      const token = sessionStorage.getItem('auth-token');
      const res = await fetch(`${API_BASE_URL}/api/gifts/${editingGift.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingGift)
      });

      const data = await res.json();
      if (res.ok) {
        setMyGifts(prev =>
          prev.map(item =>
            (item.id === editingGift.id || item._id === editingGift.id) ? data.gift : item
          )
        );
        setGiftsMsg(`"${data.gift.name}" updated successfully.`);
        setEditingGift(null);
      } else {
        setGiftsError(data.error || 'Failed to update listing.');
      }
    } catch (err) {
      setGiftsError('Error communicating with server while saving changes.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteGift = async (gift) => {
    const giftId = gift.id || gift._id;
    const confirmed = window.confirm(`Are you sure you want to delete "${gift.name}"? This action cannot be undone.`);
    if (!confirmed) return;

    setGiftsError('');
    setGiftsMsg('');

    try {
      const token = sessionStorage.getItem('auth-token');
      const res = await fetch(`${API_BASE_URL}/api/gifts/${giftId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setMyGifts(prev => prev.filter(item => (item.id || item._id) !== giftId));
        setGiftsMsg(`"${gift.name}" has been deleted.`);
      } else {
        setGiftsError(data.error || 'Failed to delete listing.');
      }
    } catch (err) {
      setGiftsError('Network error while deleting listing.');
    }
  };

  const pendingIncomingCount = receivedRequests.filter(r => r.status === 'Pending').length;

  if (!isLoggedIn) {
    return (
      <div className="profile-wrapper">
        <div className="container">
          <div className="profile-dashboard">
            <div className="profile-card" style={{ textAlign: 'center' }}>
              <div className="profile-avatar"><i className="bi bi-lock-fill"></i></div>
              <h2>Sign In Required</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Please log in to manage your profile details, donated gifts, and pickup requests.
              </p>
              <Link to="/app/login" className="btn-primary-custom">
                <i className="bi bi-box-arrow-in-right"></i> Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      <div className="container">
        <div className="profile-dashboard">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar"><i className="bi bi-person-fill"></i></div>
              <h2>{userName || 'My Profile'}</h2>
              <p>Manage your account details, donated listings, and community requests.</p>
            </div>

            {/* Dashboard Tabs */}
            <div className="profile-tabs" role="tablist">
              <button
                type="button"
                className={`profile-tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
                id="tab-personal-details"
              >
                <i className="bi bi-person-vcard"></i> Personal Details
              </button>
              <button
                type="button"
                className={`profile-tab-btn ${activeTab === 'gifts' ? 'active' : ''}`}
                onClick={() => { setActiveTab('gifts'); fetchMyGifts(); }}
                id="tab-my-gifts"
              >
                <i className="bi bi-gift"></i> My Listed Gifts
                <span className="tab-count-badge">{myGifts.length}</span>
              </button>
              <button
                type="button"
                className={`profile-tab-btn ${activeTab === 'incoming' ? 'active' : ''}`}
                onClick={() => { setActiveTab('incoming'); fetchRequests(); }}
                id="tab-incoming-requests"
              >
                <i className="bi bi-inbox"></i> Incoming Requests
                <span className={`tab-count-badge ${pendingIncomingCount > 0 ? 'tab-count-alert' : ''}`}>
                  {pendingIncomingCount > 0 ? `${pendingIncomingCount} new` : receivedRequests.length}
                </span>
              </button>
              <button
                type="button"
                className={`profile-tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
                onClick={() => { setActiveTab('sent'); fetchRequests(); }}
                id="tab-sent-requests"
              >
                <i className="bi bi-send"></i> My Requests
                <span className="tab-count-badge">{sentRequests.length}</span>
              </button>
            </div>

            {/* Tab 1: Personal Details */}
            {activeTab === 'details' && (
              <div>
                {msg && <div className="alert-info"><i className="bi bi-check-circle-fill"></i> {msg}</div>}
                {errorMsg && <div className="alert-error-box"><i className="bi bi-exclamation-triangle-fill"></i> {errorMsg}</div>}

                <form onSubmit={handleUpdate} className="profile-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First Name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last Name"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={email}
                      readOnly
                      className="input-disabled"
                    />
                  </div>

                  <div className="form-group">
                    <label>Street Address / Zip Code</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 123 Main St, New York, NY 10001"
                    />
                  </div>

                  <button type="submit" className="btn-primary-custom" disabled={loading}>
                    {loading ? 'Saving Changes...' : 'Save Profile Details'}
                  </button>
                </form>
              </div>
            )}

            {/* Tab 2: My Listed Gifts */}
            {activeTab === 'gifts' && (
              <div>
                <div className="my-gifts-header">
                  <h3>Your Donated Items ({myGifts.length})</h3>
                  <Link to="/app/add-gift" className="btn-primary-custom">
                    <i className="bi bi-plus-circle-fill"></i> Donate New Item
                  </Link>
                </div>

                {giftsMsg && <div className="alert-info"><i className="bi bi-check-circle-fill"></i> {giftsMsg}</div>}
                {giftsError && <div className="alert-error-box"><i className="bi bi-exclamation-triangle-fill"></i> {giftsError}</div>}

                {giftsLoading ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                    Loading your gift listings...
                  </p>
                ) : myGifts.length === 0 ? (
                  <div className="empty-my-gifts">
                    <i className="bi bi-box2-heart"></i>
                    <h4>You haven't listed any items yet</h4>
                    <p>Share pre-loved household items with your community for free.</p>
                    <Link to="/app/add-gift" className="btn-primary-custom" style={{ marginTop: '1rem' }}>
                      <i className="bi bi-plus-circle"></i> Donate Your First Item
                    </Link>
                  </div>
                ) : (
                  <div className="my-gifts-list">
                    {myGifts.map((gift) => {
                      const giftId = gift.id || gift._id;
                      const status = gift.status || 'Available';
                      const statusClass = `status-${status.toLowerCase()}`;
                      return (
                        <div key={giftId} className="my-gift-row">
                          <img
                            src={gift.image}
                            alt={gift.name}
                            className="my-gift-thumb"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <div className="my-gift-info">
                            <div className="my-gift-title-row">
                              <h4>{gift.name}</h4>
                              <span className={`status-pill ${statusClass}`}>{status}</span>
                            </div>
                            <div className="my-gift-meta">
                              <span><i className="bi bi-tag"></i> {gift.category}</span>
                              <span><i className="bi bi-stars"></i> {gift.condition}</span>
                              <span><i className="bi bi-geo-alt"></i> Zip {gift.zipcode}</span>
                            </div>
                            <p className="my-gift-desc">{gift.description}</p>
                          </div>
                          <div className="my-gift-actions">
                            <Link to={`/app/product/${giftId}`} className="btn-action-sm" title="View Listing">
                              <i className="bi bi-eye"></i> View
                            </Link>
                            <button
                              type="button"
                              className="btn-action-sm btn-action-edit"
                              onClick={() => openEditModal(gift)}
                            >
                              <i className="bi bi-pencil-square"></i> Edit
                            </button>
                            <button
                              type="button"
                              className="btn-action-sm btn-action-delete"
                              onClick={() => handleDeleteGift(gift)}
                            >
                              <i className="bi bi-trash3"></i> Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Incoming Requests (Donor Management) */}
            {activeTab === 'incoming' && (
              <div>
                <div className="my-gifts-header">
                  <h3>Incoming Pickup Requests ({receivedRequests.length})</h3>
                </div>

                {requestsMsg && <div className="alert-info"><i className="bi bi-check-circle-fill"></i> {requestsMsg}</div>}
                {requestsError && <div className="alert-error-box"><i className="bi bi-exclamation-triangle-fill"></i> {requestsError}</div>}

                {requestsLoading ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                    Loading incoming requests...
                  </p>
                ) : receivedRequests.length === 0 ? (
                  <div className="empty-my-gifts">
                    <i className="bi bi-inbox"></i>
                    <h4>No incoming requests yet</h4>
                    <p>When community members request one of your donated items, you can review and accept them here.</p>
                  </div>
                ) : (
                  <div className="my-gifts-list">
                    {receivedRequests.map((reqItem) => {
                      const reqId = reqItem.id || reqItem._id;
                      const statusClass = `status-${(reqItem.status || 'Pending').toLowerCase()}`;
                      return (
                        <div key={reqId} className="my-gift-row">
                          <img
                            src={reqItem.giftImage}
                            alt={reqItem.giftName}
                            className="my-gift-thumb"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <div className="my-gift-info">
                            <div className="my-gift-title-row">
                              <h4>{reqItem.giftName}</h4>
                              <span className={`status-pill ${statusClass}`}>{reqItem.status}</span>
                            </div>
                            <div className="my-gift-meta">
                              <span><i className="bi bi-person"></i> From: <strong>{reqItem.requesterName}</strong></span>
                              <span><i className="bi bi-envelope"></i> Contact: {reqItem.requesterContact}</span>
                            </div>
                            <div className="request-message-quote">
                              "{reqItem.message}"
                            </div>
                          </div>
                          <div className="my-gift-actions">
                            {reqItem.status === 'Pending' ? (
                              <>
                                <button
                                  type="button"
                                  className="btn-action-sm btn-action-accept"
                                  disabled={updatingReqId === reqId}
                                  onClick={() => handleRequestAction(reqId, 'Accepted')}
                                >
                                  <i className="bi bi-check-lg"></i> Accept
                                </button>
                                <button
                                  type="button"
                                  className="btn-action-sm btn-action-reject"
                                  disabled={updatingReqId === reqId}
                                  onClick={() => handleRequestAction(reqId, 'Rejected')}
                                >
                                  <i className="bi bi-x-lg"></i> Reject
                                </button>
                              </>
                            ) : (
                              <Link to={`/app/product/${reqItem.giftId}`} className="btn-action-sm">
                                <i className="bi bi-eye"></i> View Item
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: My Sent Requests */}
            {activeTab === 'sent' && (
              <div>
                <div className="my-gifts-header">
                  <h3>Gifts I Requested ({sentRequests.length})</h3>
                  <Link to="/app" className="btn-secondary-custom">
                    <i className="bi bi-grid-fill"></i> Browse More Gifts
                  </Link>
                </div>

                {requestsError && <div className="alert-error-box"><i className="bi bi-exclamation-triangle-fill"></i> {requestsError}</div>}

                {requestsLoading ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
                    Loading your requests...
                  </p>
                ) : sentRequests.length === 0 ? (
                  <div className="empty-my-gifts">
                    <i className="bi bi-send-check"></i>
                    <h4>You haven't requested any gifts yet</h4>
                    <p>Explore available community gifts and submit a pickup request.</p>
                    <Link to="/app" className="btn-primary-custom" style={{ marginTop: '1rem' }}>
                      <i className="bi bi-search"></i> Explore Gifts
                    </Link>
                  </div>
                ) : (
                  <div className="my-gifts-list">
                    {sentRequests.map((reqItem) => {
                      const reqId = reqItem.id || reqItem._id;
                      const statusClass = `status-${(reqItem.status || 'Pending').toLowerCase()}`;
                      return (
                        <div key={reqId} className="my-gift-row">
                          <img
                            src={reqItem.giftImage}
                            alt={reqItem.giftName}
                            className="my-gift-thumb"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80';
                            }}
                          />
                          <div className="my-gift-info">
                            <div className="my-gift-title-row">
                              <h4>{reqItem.giftName}</h4>
                              <span className={`status-pill ${statusClass}`}>{reqItem.status}</span>
                            </div>
                            <div className="my-gift-meta">
                              <span><i className="bi bi-person-heart"></i> Donor: {reqItem.donorName}</span>
                              <span><i className="bi bi-geo-alt"></i> Zip {reqItem.giftZipcode}</span>
                            </div>
                            <div className="request-message-quote">
                              "{reqItem.message}"
                            </div>
                          </div>
                          <div className="my-gift-actions">
                            <Link to={`/app/product/${reqItem.giftId}`} className="btn-action-sm">
                              <i className="bi bi-eye"></i> View Item
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Gift Modal */}
      {editingGift && (
        <div className="edit-modal-overlay" onClick={() => setEditingGift(null)}>
          <div className="edit-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3><i className="bi bi-pencil-square"></i> Edit Gift Listing</h3>
              <button
                type="button"
                className="btn-close-edit"
                onClick={() => setEditingGift(null)}
                aria-label="Close edit modal"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="edit-modal-form">
              <div className="form-group">
                <label>Item Name</label>
                <input
                  type="text"
                  value={editingGift.name}
                  onChange={(e) => setEditingGift({ ...editingGift, name: e.target.value })}
                  required
                />
              </div>

              <div className="edit-modal-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editingGift.category}
                    onChange={(e) => setEditingGift({ ...editingGift, category: e.target.value })}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Condition</label>
                  <select
                    value={editingGift.condition}
                    onChange={(e) => setEditingGift({ ...editingGift, condition: e.target.value })}
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>{cond}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="edit-modal-row">
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={editingGift.status}
                    onChange={(e) => setEditingGift({ ...editingGift, status: e.target.value })}
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Item Age (Years)</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={editingGift.age_years}
                    onChange={(e) => setEditingGift({ ...editingGift, age_years: e.target.value })}
                  />
                </div>
              </div>

              <div className="edit-modal-row">
                <div className="form-group">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    value={editingGift.zipcode}
                    onChange={(e) => setEditingGift({ ...editingGift, zipcode: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="text"
                    value={editingGift.image}
                    onChange={(e) => setEditingGift({ ...editingGift, image: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={editingGift.description}
                  onChange={(e) => setEditingGift({ ...editingGift, description: e.target.value })}
                  required
                />
              </div>

              <div className="edit-modal-actions">
                <button
                  type="button"
                  className="btn-secondary-custom"
                  onClick={() => setEditingGift(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-custom"
                  disabled={editSaving}
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
